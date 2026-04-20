import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;
// Use memoryStorage so files are never written to disk
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL: Supabase environment variables are missing!");
  console.log("Available env keys:", Object.keys(process.env).filter(k => k.includes("SUPABASE")));
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initDb() {
  try {
    console.log("Supabase client initialized.");
    
    // Test connection
    const { data: testData, error: testError } = await supabase.from('inspection_logs').select('id').limit(1);
    if (testError) {
      console.error("Supabase Connection Test Failed:", testError.message);
      if (testError.message.includes("Invalid key")) {
        console.error("ERROR: The SUPABASE_SERVICE_ROLE_KEY is invalid or not authorized for this URL.");
      }
    } else {
      console.log("Supabase Connection Test Successful.");
    }
    
    // Ensure 'INSPECTIONS' bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error("Error listing buckets:", listError);
    } else {
      const exists = buckets?.find(b => b.name === 'INSPECTIONS');
      if (!exists) {
        console.log("Creating 'INSPECTIONS' bucket...");
        const { error: createError } = await supabase.storage.createBucket('INSPECTIONS', {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
        if (createError) {
          console.error("Error creating bucket:", createError);
        } else {
          console.log("'INSPECTIONS' bucket created successfully.");
        }
      } else {
        console.log("'INSPECTIONS' bucket already exists.");
      }
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

const recentSubmissions = new Map<string, number>();

// Helper for Gemini API with retry logic
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 5) {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Gemini API Attempt ${i + 1}/${maxRetries}...`);
      const result = await ai.models.generateContent(params);
      return result;
    } catch (err: any) {
      lastError = err;
      const isRetryable = err.status === 'UNAVAILABLE' || err.code === 503 || err.status === 'RESOURCE_EXHAUSTED' || err.code === 429;
      if (isRetryable && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 3000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Supabase Helpers
async function getAnalysisForFile(fileId: string) {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('file_path', fileId)
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching analysis for file:", error);
    return null;
  }
  return data ? {
    fileId: data.file_path,
    fileName: data.file_name,
    folderId: data.folder_path,
    status: data.status,
    findings: data.findings || [],
    summary: data.summary,
    analyzedAt: data.analyzed_at,
    is_new: false
  } : null;
}

async function getAnalysisForFolder(folderId: string) {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('folder_path', folderId);
  
  if (error) {
    console.error("Error fetching analysis for folder:", error);
    return [];
  }
  return data.map(item => ({
    fileId: item.file_path,
    fileName: item.file_name,
    folderId: item.folder_path,
    status: item.status,
    findings: item.findings || [],
    summary: item.summary,
    analyzedAt: item.analyzed_at,
    is_new: false
  }));
}

async function getAnalysisHistory(limit = 100) {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .order('analyzed_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching analysis history:", error);
    return [];
  }
  return data.map(item => ({
    fileId: item.file_path,
    fileName: item.file_name,
    folderId: item.folder_path,
    status: item.status,
    findings: item.findings || [],
    summary: item.summary,
    analyzedAt: item.analyzed_at,
    is_new: false
  }));
}

async function saveAnalysisResult(result: any) {
  const { error } = await supabase
    .from('analysis_results')
    .upsert([{
      file_path: result.fileId,
      file_name: result.fileName,
      folder_path: result.folderId,
      status: result.status,
      findings: result.findings,
      summary: result.summary,
      analyzed_at: new Date().toISOString()
    }], { onConflict: 'file_path' });
  
  if (error) {
    console.error("Error saving analysis result:", error);
  }
}

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SSVI API is running with Supabase" });
});

// Check Storage connection status
app.get("/api/drive/status", (req, res) => {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  res.json({
    connected: hasUrl && hasKey,
    configured: hasUrl && hasKey,
    missing: { url: !hasUrl, key: !hasKey }
  });
});

// Single file upload to Supabase Storage (used by frontend)
app.post("/api/storage/upload", upload.single("file"), async (req: any, res: any) => {
  const { folderId, filename } = req.body;
  const file = req.file;

  if (!file || !folderId || !filename) {
    return res.status(400).json({ error: "Missing file, folderId, or filename" });
  }

  try {
    const filePath = `${folderId}/${filename}`;
    const { error } = await supabase.storage
      .from('INSPECTIONS')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      if (error.message.includes("Bucket not found")) {
        throw new Error("ไม่พบ Bucket ชื่อ 'INSPECTIONS' ใน Supabase Storage กรุณาสร้าง Bucket นี้ใน Supabase Dashboard (ตั้งค่าเป็น Public) หรือรอระบบสร้างให้อัตโนมัติ");
      }
      if (error.message.includes("Invalid key")) {
        throw new Error("Invalid Key: ตรวจสอบว่า SUPABASE_SERVICE_ROLE_KEY ใน Vercel ถูกต้องและตรงกับโปรเจกต์ Supabase นี้ (ห้ามใช้ Anon Key)");
      }
      throw error;
    }

    res.json({ success: true, path: filePath });
  } catch (error: any) {
    console.error("Storage upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 1. Initialize Upload: Return folder path for Supabase Storage
app.post("/api/init-upload", async (req: any, res: any) => {
  const { substationName, substationId, timestamp } = req.body;
  try {
    const dateObj = timestamp ? new Date(timestamp) : new Date();
    const dateStr = new Intl.DateTimeFormat("th-TH", {
      day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "Asia/Bangkok"
    }).format(dateObj).replace(/\//g, ""); 
    
    // Use substationId for folder path to avoid Thai character issues in Storage keys
    const folderBase = substationId || substationName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const dailyFolderPath = `${folderBase}/${folderBase}_${dateStr}`;
    
    res.json({ accessToken: "supabase-auth", folderId: dailyFolderPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Complete Upload: Log to Supabase DB
app.post("/api/complete-upload", async (req: any, res: any) => {
  const { employeeId, substationName, lat, lng, timestamp, folderId, categories } = req.body;
  try {
    const dateObj = timestamp ? new Date(timestamp) : new Date();
    const { error } = await supabase
      .from('inspection_logs')
      .insert([{
        employee_id: employeeId || "Unknown",
        substation_name: substationName,
        gps_lat: lat,
        gps_lng: lng,
        folder_id: folderId,
        timestamp: dateObj.toISOString(),
        categories: categories ? categories.split(',') : []
      }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload inspection images to Supabase Storage
app.post("/api/upload-inspection", upload.array("photos"), async (req: any, res: any) => {
  const { employeeId, substationName, substationId, lat, lng, timestamp } = req.body;
  const files = req.files as any[];
  try {
    const dateObj = timestamp ? new Date(timestamp) : new Date();
    const dateStr = new Intl.DateTimeFormat("th-TH", {
      day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "Asia/Bangkok"
    }).format(dateObj).replace(/\//g, ""); 
    
    const folderBase = substationId || substationName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const dailyFolderPath = `${folderBase}/${folderBase}_${dateStr}`;

    const uploadPromises = files.map(async (file) => {
      const filePath = `${dailyFolderPath}/${file.originalname}`;
      const { error } = await supabase.storage
        .from('INSPECTIONS')
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });
      if (error) throw error;
      return filePath;
    });
    await Promise.all(uploadPromises);

    const categoriesFromFiles = new Set(files.map(f => {
      const name = f.originalname.toLowerCase();
      const cats = ['yard', 'roof', 'battery', 'security', 'fence', 'checklist'];
      return cats.find(c => name.includes(c));
    }).filter(Boolean));

    const { error: dbError } = await supabase
      .from('inspection_logs')
      .insert([{
        employee_id: employeeId || "Unknown",
        substation_name: substationName,
        gps_lat: lat,
        gps_lng: lng,
        folder_id: dailyFolderPath,
        timestamp: dateObj.toISOString(),
        categories: Array.from(categoriesFromFiles)
      }]);
    if (dbError) throw dbError;
    res.json({ success: true, folderId: dailyFolderPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List images in a folder
app.get("/api/drive/folder/*", async (req: any, res: any) => {
  const folderPath = req.params[0];
  try {
    const { data: files, error } = await supabase.storage.from('INSPECTIONS').list(folderPath);
    if (error) throw error;
    
    // Fetch analysis results specifically for this folder to ensure all cached results are found
    const history = await getAnalysisForFolder(folderPath);
    
    const mergedImages = (files || []).filter(f => f.metadata?.mimetype?.startsWith('image/')).map(img => {
      const filePath = `${folderPath}/${img.name}`;
      const analysis = history.find(h => h.fileId === filePath);
      const { data: { publicUrl } } = supabase.storage.from('INSPECTIONS').getPublicUrl(filePath);
      return {
        id: filePath, name: img.name, mimeType: img.metadata?.mimetype,
        thumbnailLink: publicUrl, webViewLink: publicUrl, analysis: analysis || null
      };
    });
    res.json(mergedImages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze a single image
app.post("/api/analyze-image", async (req: any, res: any) => {
  const { fileId, fileName, folderId, mimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });
  try {
    const existing = await getAnalysisForFile(fileId);
    if (existing) return res.json(existing);

    const { data, error } = await supabase.storage.from('INSPECTIONS').download(fileId);
    if (error) throw error;
    const base64 = Buffer.from(await data.arrayBuffer()).toString('base64');

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `คุณคือผู้เชี่ยวชาญด้านความปลอดภัยและความสะอาดของสถานีไฟฟ้าแรงสูง (Power Substation)
กรุณาวิเคราะห์รูปภาพนี้และตรวจสอบสิ่งต่อไปนี้:
1. ความสะอาดเรียบร้อยโดยรวม
2. วัชพืชหรือหญ้า (Weed): หากพบหญ้าขึ้นสูงเกิน 5 ซม. ให้รายงานว่า "Weed"
3. คราบขี้นกหรือสิ่งแปลกปลอม (Bird Droppings): หากพบคราบสีขาวหรือสิ่งแปลกปลอมบนอุปกรณ์ไฟฟ้า ให้รายงานว่า "Bird Droppings"
ตอบกลับในรูปแบบ JSON: { "status": "Red"|"Green", "findings": [], "summary": "" }`;

    const genResult = await generateContentWithRetry(ai, {
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: prompt }, { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["status", "findings", "summary"]
        }
      }
    }) as any;

    const analysis = JSON.parse(genResult.response.text() || '{}');
    const finalResult = { fileId, fileName, folderId, ...analysis, is_new: true };
    await saveAnalysisResult(finalResult);
    res.json(finalResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dashboard-stats", async (req, res) => {
  const { month, year } = req.query;
  try {
    const targetMonth = parseInt(month as string);
    const targetYear = parseInt(year as string);
    const { data: logs, error } = await supabase.from('inspection_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;

    const filteredLogs = logs.filter(log => {
      const d = new Date(log.timestamp);
      return (!targetMonth || d.getMonth() + 1 === targetMonth) && (!targetYear || d.getFullYear() === targetYear);
    });

    const MANDATORY = ['fence', 'battery', 'checklist'];
    const completion = new Map<string, Set<string>>();
    filteredLogs.forEach(log => {
      if (!completion.has(log.substation_name)) completion.set(log.substation_name, new Set());
      (log.categories || []).forEach((c: string) => completion.get(log.substation_name)?.add(c));
    });

    let completedCount = 0;
    completion.forEach(cats => { 
      if (MANDATORY.every(m => cats.has(m))) completedCount++; 
    });

    res.json({ total: completedCount, totalSubmissions: filteredLogs.length, recent: filteredLogs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analyze-substation", async (req: any, res: any) => {
  const { substationName, substationId, month, year, dryRun, force } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });
  try {
    if (!force && !dryRun) {
      const { data: existing } = await supabase.from('health_index_logs').select('*').eq('substation_name', substationName).eq('month', month).eq('year', year).maybeSingle();
      if (existing) return res.json(existing);
    }
    const dateStr = new Intl.DateTimeFormat("th-TH", {
      month: "2-digit", year: "2-digit", timeZone: "Asia/Bangkok"
    }).format(new Date(year, month - 1)).replace(/\//g, ""); 
    
    // Use substationId for folder path to avoid Thai character issues
    const folderBase = substationId || substationName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    
    // For monthly analysis, we need to find all subfolders that match the month/year
    // Structure: folderBase/folderBase_DDMMYY/
    const { data: subfolders, error: subError } = await supabase.storage.from('INSPECTIONS').list(folderBase);
    if (subError) throw subError;

    const targetFolders = subfolders
      .filter(f => f.name.endsWith(dateStr))
      .map(f => `${folderBase}/${f.name}`);

    if (dryRun) return res.json({ folderId: targetFolders[0] || `${folderBase}/${folderBase}_01${dateStr}` });

    const allImages: any[] = [];
    for (const fPath of targetFolders) {
      const { data: files } = await supabase.storage.from('INSPECTIONS').list(fPath, { limit: 100 });
      if (files) {
        files.filter(f => f.metadata?.mimetype?.startsWith('image/')).forEach(img => {
          allImages.push({ ...img, folderPath: fPath });
        });
      }
    }

    if (allImages.length === 0) {
      const result = { status: 'Green', findings: [], summary: `ไม่พบข้อมูลการถ่ายภาพของเดือน ${month}/${year}`, folderId: targetFolders[0] || `${folderBase}/${folderBase}_01${dateStr}` };
      await supabase.from('health_index_logs').upsert([{ substation_name: substationName, month, year, ...result, analyzed_at: new Date().toISOString() }]);
      return res.json(result);
    }

    // Simplified monthly analysis: use aggregate of individual results if available, or analyze a few
    const history = [];
    for (const fPath of targetFolders) {
      const folderHistory = await getAnalysisForFolder(fPath);
      history.push(...folderHistory);
    }
    
    const individualResults = [];
    for (const img of allImages.slice(0, 10)) {
      const filePath = `${img.folderPath}/${img.name}`;
      let analysis = history.find(h => h.fileId === filePath);
      if (!analysis) {
        const { data } = await supabase.storage.from('INSPECTIONS').download(filePath);
        if (data) {
          const base64 = Buffer.from(await data.arrayBuffer()).toString('base64');
          const ai = new GoogleGenAI({ apiKey });
          const gen = await generateContentWithRetry(ai, {
            model: "gemini-1.5-flash",
            contents: [{ parts: [{ text: "Analyze substation safety: Weed, Bird Droppings. Return JSON {status, findings, summary}" }, { inlineData: { data: base64, mimeType: img.metadata?.mimetype || 'image/jpeg' } }] }],
            config: { responseMimeType: "application/json" }
          }) as any;
          analysis = JSON.parse(gen.response.text() || '{}');
          await saveAnalysisResult({ ...analysis, fileId: filePath, fileName: img.name, folderId: img.folderPath });
        }
      }
      if (analysis) individualResults.push(analysis);
    }

    const isRed = individualResults.some(r => r.status === 'Red');
    const allFindings = Array.from(new Set(individualResults.flatMap(r => r.findings || [])));
    const final = {
      status: isRed ? 'Red' : 'Green',
      findings: allFindings,
      summary: `วิเคราะห์ ${individualResults.length} ภาพ: พบปัญหา ${individualResults.filter(r => r.status === 'Red').length} ภาพ`
    };
    await supabase.from('health_index_logs').upsert([{ substation_name: substationName, month, year, ...final, analyzed_at: new Date().toISOString() }]);
    const firstFolder = targetFolders[0] || `${folderBase}/${folderBase}_01${dateStr}`;
    res.json({ ...final, folderId: firstFolder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health-index", async (req, res) => {
  const { month, year } = req.query;
  try {
    const { data, error } = await supabase.from('health_index_logs').select('*').eq('month', month).eq('year', year);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch health index" });
  }
});

app.get("/api/analysis-results", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  try {
    const history = await getAnalysisHistory(limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug-db", async (req, res) => {
  try {
    const { count } = await supabase.from('inspection_logs').select('*', { count: 'exact', head: true });
    const { data: sample } = await supabase.from('inspection_logs').select('*').order('timestamp', { ascending: false }).limit(5);
    res.json({ connected: true, count, sample });
  } catch (e: any) {
    res.json({ connected: false, error: e.message });
  }
});

async function startServer() {
  await initDb();
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api')) return;
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  }
}

startServer();
export default app;
