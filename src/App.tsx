import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard, 
  ClipboardCheck, 
  Upload,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
  Plus,
  MonitorOff,
  Clock,
  RefreshCw
} from 'lucide-react';
import { cn, SUBSTATIONS, InspectionLog } from './constants';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import imageCompression from 'browser-image-compression';

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }) => {
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900',
    outline: 'border-2 border-slate-200 text-slate-600 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  };
  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn('bg-white rounded-2xl shadow-sm border border-slate-100 p-6', className)}
  >
    {children}
  </div>
);

// --- Pages ---

const CATEGORY_LABELS: {[key: string]: string} = {
  fence: 'รั้วสถานี',
  battery: 'แบตเตอรี่',
  yard: 'ลานไก',
  roof: 'ดาดฟ้า',
  security: 'รปภ.',
  checklist: 'Check List',
};

const LoginPage = ({ onLogin }: { onLogin: (id: string) => void }) => {
  const [id, setId] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.length === 6) {
      onLogin(id);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-200">
            <ClipboardCheck className="text-white w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ระบบตรวจสอบสถานีไฟฟ้า (SSVI)</h1>
        <p className="text-slate-500 mb-8 italic">Smart Substation Visual Inspection</p>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">
                รหัสพนักงาน 6 หลัก
              </label>
              <input
                type="text"
                maxLength={6}
                pattern="\d*"
                inputMode="numeric"
                value={id}
                onChange={(e) => setId(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:ring-0 transition-all font-mono"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={id.length !== 6}
            >
              ยืนยัน <ChevronRight size={20} />
            </Button>
          </form>
        </Card>
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Power Inspection System v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const SelectionPage = ({ onSelect, onLogout }: { onSelect: (sub: typeof SUBSTATIONS[0]) => void; onLogout: () => void }) => {
  const [sortedSubstations, setSortedSubstations] = useState<(typeof SUBSTATIONS[0] & { distance?: number })[]>(SUBSTATIONS);
  const [loading, setLoading] = useState(true);
  const [nearestSub, setNearestSub] = useState<(typeof SUBSTATIONS[0] & { distance?: number }) | null>(null);

  // Haversine formula for accurate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        const withDistance = SUBSTATIONS.map(sub => {
          const km = calculateDistance(latitude, longitude, sub.lat, sub.lng);
          return { ...sub, distance: km };
        });

        const sorted = [...withDistance].sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setSortedSubstations(sorted);
        
        // If the nearest is within 2km, consider it "detected"
        if (sorted[0].distance && sorted[0].distance <= 2) {
          setNearestSub(sorted[0]);
        }
        
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const nearbySubstations = sortedSubstations.filter(sub => sub.distance !== undefined && sub.distance <= 10);
  const displayNearby = nearbySubstations.length > 0 ? nearbySubstations : sortedSubstations.slice(0, 3);
  const otherSubstations = sortedSubstations.filter(sub => !displayNearby.find(n => n.id === sub.id));

  return (
    <div className="min-h-screen bg-violet-50 p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">เลือกสถานีไฟฟ้า</h2>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <AnimatePresence>
          {nearestSub && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-violet-600 text-white border-none shadow-xl shadow-violet-200 overflow-hidden relative p-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MapPin size={100} />
                </div>
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/20 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> ตรวจพบสถานีใกล้เคียง
                    </span>
                    <span className="text-[10px] font-bold opacity-70">ห่างจากคุณ {nearestSub.distance?.toFixed(2)} กม.</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 leading-tight">{nearestSub.name}</h3>
                  <Button 
                    variant="secondary" 
                    onClick={() => onSelect(nearestSub)}
                    className="w-full bg-white text-violet-600 hover:bg-violet-50 border-none h-12"
                  >
                    เริ่มการตรวจสอบทันที <ChevronRight size={18} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">สถานีแนะนำใกล้คุณ</p>
            <div className="space-y-3">
              {displayNearby.map((sub, idx) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(sub)}
                  className={cn(
                    "p-5 rounded-2xl shadow-sm cursor-pointer relative overflow-hidden group transition-all",
                    nearestSub?.id === sub.id ? "bg-violet-50 border-2 border-violet-200" : "bg-white border border-slate-100"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                        nearestSub?.id === sub.id ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600"
                      )}>
                        <MapPin size={24} />
                      </div>
                      <div className="text-left">
                        <p className={cn("font-bold", nearestSub?.id === sub.id ? "text-violet-900" : "text-slate-800")}>{sub.name}</p>
                        {sub.distance !== undefined && (
                          <p className="text-xs text-slate-400 font-medium">ห่างจากคุณ {sub.distance.toFixed(1)} กม.</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className={cn("transition-all", nearestSub?.id === sub.id ? "text-violet-400" : "text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1")} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">สถานีอื่นๆ</p>
            <div className="space-y-3">
              {otherSubstations.map((sub) => (
                <div key={sub.id}>
                  <Card className="p-0 overflow-hidden">
                    <button 
                      onClick={() => onSelect(sub)}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{sub.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">สถานีไฟฟ้าแรงสูง</p>
                          {sub.distance !== undefined && (
                            <>
                              <span className="text-[10px] text-slate-300">•</span>
                              <p className="text-[10px] font-bold text-violet-600">~ {sub.distance.toFixed(1)} กม.</p>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InspectionPage = ({ substation, employeeId, onBack, onComplete }: { substation: typeof SUBSTATIONS[0]; employeeId: string; onBack: () => void; onComplete: () => void }) => {
  const [photos, setPhotos] = useState<{ [key: string]: { file: File; comment: string }[] }>({
    yard: [],
    roof: [],
    battery: [],
    security: [],
    fence: [],
  });
  const [enabledCategories, setEnabledCategories] = useState<{[key: string]: boolean}>({
    yard: true,
    roof: true,
    battery: true,
    security: true,
    fence: true,
    checklist: true,
  });
  const [checklists, setChecklists] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const isSubmitting = useRef(false);
  const [status, setStatus] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์ไม่รองรับ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        console.log("Location captured:", pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let msg = "ไม่สามารถระบุตำแหน่งได้";
        if (err.code === 1) msg = "กรุณาอนุญาตการเข้าถึงตำแหน่ง (GPS)";
        else if (err.code === 2) msg = "ไม่พบสัญญาณ GPS";
        else if (err.code === 3) msg = "หมดเวลาการค้นหาตำแหน่ง";
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const checkDevice = () => {
    const ua = navigator.userAgent;
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(ua);
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const finalIsMobile = isMobileDevice || isIPadOS || hasTouch;
    setIsMobile(finalIsMobile);
  };

  useEffect(() => {
    checkDevice();
    getGeoLocation();
    
    // Check Supabase status
    fetch('/api/drive/status')
      .then(res => res.json())
      .then(data => {
        if (!data.connected) {
          alert("⚠️ คำเตือน: ระบบยังไม่ได้เชื่อมต่อ Supabase กรุณาแจ้งผู้ดูแลระบบให้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ก่อนส่งรายงาน");
        }
      })
      .catch(err => console.error("Failed to fetch storage status:", err));
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    
    if (file && key) {
      const now = Date.now();
      const fileTime = file.lastModified;
      const diffSeconds = Math.abs(now - fileTime) / 1000;
      
      // Strict validation for Live Photo
      // Reduce to 60 seconds (1 minute) to ensure it's a fresh photo taken via camera
      const maxAllowedDiff = 60;

      // Expanded list of patterns that indicate a file from an album/gallery or other apps
      const fileName = file.name.toLowerCase();
      const albumPatterns = [
        'screenshot', 'fb_img', 'line_album', 'save', 'download', 
        'whatsapp', 'telegram', 'facebook', 'messenger', 'instagram',
        'viber', 'wechat', 'snapchat', 'tiktok', 'twitter', 'x_img',
        'image_', 'img_', 'dsc_', 'photo_', 'pixel_', 'samsung_', 'huawei_',
        'oppo_', 'vivo_', 'xiaomi_', 'realme_', 'iphone_', 'apple_',
        'shared_', 'copy_', 'edit_', 'modified_', 'resized_', 'compressed_',
        'gallery', 'album', 'photos', 'camera_roll', 'dcim'
      ];

      const isLikelyAlbum = albumPatterns.some(pattern => fileName.includes(pattern));

      if (diffSeconds > maxAllowedDiff || isLikelyAlbum) {
        let reason = "";
        if (isLikelyAlbum) {
          reason = "ตรวจพบชื่อไฟล์ที่มาจากอัลบั้ม, แกลเลอรี หรือแอปพลิเคชันอื่น";
        } else {
          reason = `รูปภาพนี้ถูกถ่ายไว้นานเกินไป (${Math.round(diffSeconds)} วินาทีที่แล้ว)\nระบบอนุญาตให้ส่งเฉพาะภาพที่ถ่ายสดใหม่ภายใน ${maxAllowedDiff} วินาทีเท่านั้น`;
        }

        alert(`❌ ระบบปิดใช้งานการเลือกรูปจากอัลบั้ม (ทุก Browser)\n\nเหตุผล: ${reason}\n\nคำแนะนำ:\n1. กรุณากดปุ่ม 'ถ่ายภาพ' อีกครั้ง\n2. เลือก 'กล้อง' (Camera) เพื่อถ่ายภาพใหม่ทันที\n3. ห้ามเลือกจาก 'คลังรูปภาพ' (Photo Library) หรือ 'ไฟล์' (Files)`);
        
        e.target.value = '';
        return;
      }

      if (key === 'checklist') {
        setChecklists(prev => [...prev, file]);
      } else {
        setPhotos(prev => ({ ...prev, [key]: [...prev[key], { file, comment: '' }] }));
      }
    }
    e.target.value = '';
  };

  const handleCommentChange = (key: string, index: number, comment: string) => {
    setPhotos(prev => {
      const newPhotos = { ...prev };
      newPhotos[key] = [...newPhotos[key]];
      newPhotos[key][index] = { ...newPhotos[key][index], comment };
      return newPhotos;
    });
  };

  const addTimestampToImage = (file: File, comment: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Could not get canvas context');

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Setup text style
          const fontSize = Math.max(20, Math.floor(canvas.width / 40));
          ctx.font = `bold ${fontSize}px sans-serif`;
          const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: th });
          
          // Draw Timestamp (Bottom Right)
          const tsWidth = ctx.measureText(timestamp).width;
          const tsX = canvas.width - tsWidth - 20;
          const tsY = canvas.height - 20;

          // Draw Comment (Above Timestamp) if exists
          if (comment) {
            const commentText = comment;
            const cWidth = ctx.measureText(commentText).width;
            const cX = canvas.width - cWidth - 20;
            const cY = tsY - fontSize - 8; // Position above timestamp with a small gap

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText(commentText, cX, cY);
            ctx.fillStyle = '#fde047'; // Yellow for comment
            ctx.fillText(commentText, cX, cY);
          }

          // Draw Timestamp
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;
          ctx.strokeText(timestamp, tsX, tsY);
          ctx.fillStyle = 'white';
          ctx.fillText(timestamp, tsX, tsY);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject('Canvas to Blob failed');
          }, 'image/jpeg', 0.9);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    
    if (!employeeId) {
      alert('ไม่พบรหัสพนักงาน กรุณาล็อกอินใหม่');
      isSubmitting.current = false;
      return;
    }

    // Try to get location one last time if missing
    if (!location) {
      setStatus('กำลังระบุตำแหน่ง GPS...');
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setLocation(loc);
              resolve(loc);
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });
      } catch (e) {
        console.warn("Could not get location at submit time", e);
      }
    }
    
    setUploading(true);
    setStatus('กำลังเตรียมการอัปโหลด...');
    
    try {
      const now = new Date();
      const timeStr = format(now, 'HHmm');
      const dateStr = now.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).replace(/\//g, "");
      const nameSuffix = `${timeStr}_${dateStr}`;

      // 1. Initialize Upload (Get Token and Folder ID)
      const initRes = await fetch('/api/init-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          substationName: substation.name, 
          substationId: substation.id,
          timestamp: now.toISOString() 
        })
      });
      
      if (!initRes.ok) {
        const errData = await initRes.json();
        throw new Error(errData.error || 'Failed to initialize upload');
      }
      
      const { accessToken, folderId } = await initRes.json();
      const categoriesInSubmission = new Set<string>();

      // Helper to upload to Supabase via our backend
      const uploadToStorage = async (blob: Blob, filename: string) => {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('folderId', folderId);
        formData.append('filename', filename);

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        return await response.json();
      };

      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true
      };

      // Process and Upload Fixed-Point photos
      const photoEntries = (Object.entries(photos) as [string, {file: File, comment: string}[]][])
        .filter(([key]) => enabledCategories[key]);
      
      let totalPhotos = 0;
      photoEntries.forEach(([_, items]) => totalPhotos += items.length);
      if (enabledCategories.checklist) totalPhotos += checklists.length;
      
      let currentCount = 0;

      for (const [key, items] of photoEntries) {
        if (items.length > 0) categoriesInSubmission.add(key);
        for (let i = 0; i < items.length; i++) {
          currentCount++;
          setStatus(`กำลังประมวลผลรูปที่ ${currentCount}/${totalPhotos}...`);
          
          const processedBlob = await addTimestampToImage(items[i].file, items[i].comment);
          const processedFile = new File([processedBlob], 'temp.jpg', { type: 'image/jpeg' });
          const compressedBlob = await imageCompression(processedFile, compressionOptions);
          
          await uploadToStorage(compressedBlob, `${key}_${i + 1}_${nameSuffix}.jpg`);
        }
      }
      
      // Process and Upload Checklists
      if (enabledCategories.checklist && checklists.length > 0) {
        categoriesInSubmission.add('checklist');
        for (let i = 0; i < checklists.length; i++) {
          currentCount++;
          setStatus(`กำลังประมวลผลรูปที่ ${currentCount}/${totalPhotos}...`);
          
          const processedBlob = await addTimestampToImage(checklists[i], '');
          const processedFile = new File([processedBlob], 'temp.jpg', { type: 'image/jpeg' });
          const compressedBlob = await imageCompression(processedFile, compressionOptions);
          
          await uploadToStorage(compressedBlob, `checklist_${i + 1}_${nameSuffix}.jpg`);
        }
      }

      // 3. Finalize: Log to DB and Sheets
      setStatus('กำลังบันทึกข้อมูลรายงาน...');
      const finalizeRes = await fetch('/api/complete-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          substationName: substation.name,
          lat: location?.lat || 0,
          lng: location?.lng || 0,
          timestamp: now.toISOString(),
          folderId,
          categories: Array.from(categoriesInSubmission).join(',')
        })
      });

      if (finalizeRes.ok) {
        onComplete();
      } else {
        const errData = await finalizeRes.json();
        alert(`บันทึกข้อมูลไม่สำเร็จ: ${errData.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setUploading(false);
      isSubmitting.current = false;
    }
  };

  const isReady = 
    photos.battery.length > 0 && 
    photos.fence.length > 0 && 
    checklists.length > 0;

  return (
    <div className="min-h-screen bg-violet-50 p-6 pb-32">
      {/* Desktop Restriction Overlay */}
      {!isMobile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MonitorOff className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">เข้าใช้งานผ่านคอมพิวเตอร์</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              ขออภัย ระบบรายงานนี้ออกแบบมาเพื่อใช้หน้างานผ่าน <span className="font-bold text-gray-900">โทรศัพท์มือถือ หรือ แท็บเล็ต</span> เท่านั้น เพื่อความถูกต้องของข้อมูล GPS และการถ่ายภาพสด
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm mb-8">
              กรุณาสแกน QR Code หรือเข้าลิงก์เดิมผ่านอุปกรณ์พกพาของคุณ
            </div>
            <button 
              onClick={onBack}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{substation.name}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">รายงานประจำเดือน</p>
              <span className="text-[10px] text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {location ? 'GPS Active' : 'Waiting for GPS...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-3 bg-violet-100 border border-violet-200 rounded-xl flex items-center gap-3 text-violet-700 text-[10px] font-bold uppercase tracking-wider">
            <Camera size={16} className="shrink-0" />
            <p>โหมดถ่ายภาพสดเท่านั้น: ปุ่มเลือกจากอัลบั้มถูกปิดใช้งานโดยระบบ</p>
          </div>

          {locationError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <div className="flex-1">
                <p className="font-bold">คำเตือน: {locationError}</p>
                <p className="opacity-80">พิกัด GPS อาจไม่ถูกบันทึก กรุณาลองเปิด-ปิด GPS ใหม่</p>
              </div>
              <button 
                onClick={getGeoLocation}
                className="bg-amber-200 px-2 py-1 rounded-lg font-bold hover:bg-amber-300 transition-colors"
              >
                ลองใหม่
              </button>
            </div>
          )}
          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">จุดตรวจสอบมาตรฐาน (Fixed-Point)</p>
            <div className="space-y-6">
              {[
                { id: 'fence', label: 'รั้วสถานี', desc: 'ถ่ายภาพ ให้เห็นรั้วทั้ง 4 ด้าน จะมีอย่างน้อย 4 รูป' },
                { id: 'battery', label: 'แบตเตอรี่', desc: 'ถ่ายภาพรวม 1 รูป , ถ่ายเจาะจงให้เห็นระดับสูง-ต่ำ น้ำกลั่น อย่างน้อย 1 รูป' },
                { id: 'yard', label: 'ลานไก', desc: 'ถ่ายภาพรวม , ถ่ายมุมกว้าง ให้เห็นพื้นลานไกทั้งหมด' },
                { id: 'roof', label: 'ดาดฟ้า', desc: 'ถ้าขึ้นได้, ถ่ายภาพรวม , ถ่ายมุมกว้าง ให้เห็นพื้น ท่อระบายน้ำต่างๆ' },
                { id: 'security', label: 'รปภ.', desc: 'ถ้าสฟ. มี รปภ. ให้ถ่ายรูปการแต่งกายของ รปภ. (ถ้าไม่มีให้ปิดหัวข้อไว้ ไม่ต้องถ่าย)' },
              ].map((point) => {
                const isMandatory = ['battery', 'fence'].includes(point.id);
                return (
                  <div key={point.id} className={`p-4 rounded-2xl transition-all duration-300 border ${enabledCategories[point.id] ? 'bg-white border-slate-100 shadow-sm opacity-100' : 'bg-slate-50/50 border-transparent opacity-60'}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {point.label}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight">{point.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {/* Toggle Switch - Only show if not mandatory */}
                        {isMandatory ? (
                          <div className="bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">จำเป็น</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2.5 px-2 py-1 rounded-full border transition-all duration-300 ${enabledCategories[point.id] ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-100 border-slate-200'}`}>
                            <span className={`text-[8px] font-black transition-colors ${enabledCategories[point.id] ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {enabledCategories[point.id] ? 'เปิด' : 'ปิด'}
                            </span>
                            <button 
                              onClick={() => setEnabledCategories(prev => ({ ...prev, [point.id]: !prev[point.id] }))}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${enabledCategories[point.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabledCategories[point.id] ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        )}

                        {enabledCategories[point.id] && (
                          <label className="bg-violet-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-violet-100">
                            <Camera size={14} /> ถ่ายภาพ
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              className="hidden" 
                              onChange={(e) => onFileChange(e, point.id)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {enabledCategories[point.id] && photos[point.id].length > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-4">
                        {photos[point.id].map((item, i) => (
                          <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-2">
                            <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                              <img src={URL.createObjectURL(item.file)} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setPhotos(prev => ({
                                  ...prev,
                                  [point.id]: prev[point.id].filter((_, idx) => idx !== i)
                                }))}
                                className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg text-sm"
                              >
                                ×
                              </button>
                            </div>
                            <input 
                              type="text"
                              placeholder="ระบุรายละเอียดของภาพ..."
                              value={item.comment}
                              onChange={(e) => handleCommentChange(point.id, i, e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">กระดาษ Check List (A4)</p>
                <div className="bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">จำเป็น</span>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                {checklists.length} แผ่น
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-4">ถ่ายกระดาษ Check List ทุกหน้า</p>
            
            <div className="grid grid-cols-4 gap-2">
              {checklists.map((file, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setChecklists(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-violet-500 hover:text-violet-500 hover:bg-violet-50 transition-all cursor-pointer group">
                <Camera size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-bold mt-1">ถ่ายภาพ</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={(e) => onFileChange(e, 'checklist')} 
                />
              </label>
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-2xl">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={() => setShowConfirm(true)} 
              className="w-full h-14 text-lg" 
              disabled={!isReady || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" /> {status || 'กำลังส่งข้อมูล...'}
                </>
              ) : (
                <>
                  <Upload size={20} /> ส่งรายงานประจำเดือน
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
              >
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">ยืนยันการส่งรายงาน</h3>
                <p className="text-slate-500 text-sm mb-8">คุณยืนยันที่จะส่งรายงานประจำเดือนของสถานี {substation.name} หรือไม่?</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    ไม่ใช่
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirm(false);
                      handleSubmit();
                    }}
                    className="py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-colors"
                  >
                    ใช่
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DashboardPage = ({ onBack }: { onBack: () => void }) => {
  const [stats, setStats] = useState<{ total: number; totalSubmissions: number; recent: InspectionLog[] }>({ total: 0, totalSubmissions: 0, recent: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showInspectedModal, setShowInspectedModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'health' | 'history'>('progress');
  const [healthIndex, setHealthIndex] = useState<any[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selectedSubstationForAnalysis, setSelectedSubstationForAnalysis] = useState<string | null>(null);
  const [imagesInFolder, setImagesInFolder] = useState<any[]>([]);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const stopBatchRef = useRef(false);
  const [currentlyAnalyzingId, setCurrentlyAnalyzingId] = useState<string | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState({ total: 0, clean: 0, issues: 0, weeds: 0, birdDroppings: 0 });

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [driveStatus, setDriveStatus] = useState<{ connected: boolean; configured: boolean } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const checkDriveStatus = () => {
    fetch('/api/drive/status')
      .then(res => res.json())
      .then(data => setDriveStatus(data))
      .catch(err => console.error("Failed to fetch drive status:", err));
  };

  useEffect(() => {
    checkDriveStatus();
  }, []);

  const testSupabaseConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/drive/status');
      const data = await res.json();
      if (data.connected) {
        alert("✅ เชื่อมต่อ Supabase สำเร็จ! สามารถอ่านข้อมูลได้ปกติ");
      } else {
        alert(`❌ การเชื่อมต่อล้มเหลว: กรุณาตรวจสอบ Environment Variables`);
      }
    } catch (err) {
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setTestingConnection(false);
      checkDriveStatus();
    }
  };

  const fetchImagesInFolder = async (folderId: string) => {
    setSelectedFolderId(folderId);
    setIsFetchingImages(true);
    try {
      const res = await fetch(`/api/drive/folder/${folderId}`);
      const data = await res.json();
      setImagesInFolder(data);
      updateAnalysisSummary(data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setIsFetchingImages(false);
    }
  };

  const updateAnalysisSummary = (images: any[]) => {
    const summary = images.reduce((acc, img) => {
      acc.total++;
      if (img.analysis && !img.analysis.error) {
        if (img.analysis.status === 'Green') {
          acc.clean++;
        } else if (img.analysis.status === 'Red') {
          acc.issues++;
          if (img.analysis.findings && Array.isArray(img.analysis.findings)) {
            if (img.analysis.findings.includes('Weed')) acc.weeds++;
            if (img.analysis.findings.includes('Bird Droppings')) acc.birdDroppings++;
          }
        }
      }
      return acc;
    }, { total: 0, clean: 0, issues: 0, weeds: 0, birdDroppings: 0 });
    setAnalysisSummary(summary);
  };

  const handleAnalyzeImage = async (image: any, folderId: string, silent = false) => {
    if (image.analysis && !image.analysis.error) {
      return image.analysis;
    }
    setCurrentlyAnalyzingId(image.id);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 second timeout (5 minutes)

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: image.id,
          fileName: image.name,
          folderId: folderId,
          mimeType: image.mimeType
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const result = await res.json();
      
      if (result.error) {
        let errorMessage = result.error;
        if (typeof result.error === 'object' && result.error.code === 503) {
          errorMessage = "ระบบวิเคราะห์ภาพ (Gemini) กำลังทำงานหนักในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Error 503)";
        } else if (typeof result.error === 'string' && result.error.includes("503")) {
          errorMessage = "ระบบวิเคราะห์ภาพ (Gemini) กำลังทำงานหนักในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Error 503)";
        }
        if (!silent) alert(errorMessage);
        
        // Even if error, mark as analyzed with the error so we don't keep retrying it in batch
        setImagesInFolder(prev => {
          const updated = prev.map(img => img.id === image.id ? { ...img, analysis: result } : img);
          updateAnalysisSummary(updated);
          return updated;
        });
        return result;
      }

      setImagesInFolder(prev => {
        const updated = prev.map(img => img.id === image.id ? { ...img, analysis: result } : img);
        updateAnalysisSummary(updated);
        return updated;
      });
      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Failed to analyze image:", err);
      const errorResult = { error: err.name === 'AbortError' ? "หมดเวลาการเชื่อมต่อ (Timeout)" : "เกิดข้อผิดพลาดในการเชื่อมต่อ" };
      
      setImagesInFolder(prev => {
        const updated = prev.map(img => img.id === image.id ? { ...img, analysis: errorResult } : img);
        updateAnalysisSummary(updated);
        return updated;
      });
      
      if (!silent) alert(errorResult.error);
      return errorResult;
    } finally {
      setCurrentlyAnalyzingId(null);
    }
  };

  const handleBatchAnalyze = async (folderId: string) => {
    setIsBatchAnalyzing(true);
    stopBatchRef.current = false;
    const toAnalyze = imagesInFolder.filter(img => !img.analysis || img.analysis.error);
    setBatchProgress({ current: 0, total: toAnalyze.length });
    
    let count = 0;
    for (const img of toAnalyze) {
      if (stopBatchRef.current) break;
      count++;
      setBatchProgress(prev => ({ ...prev, current: count }));
      try {
        await handleAnalyzeImage(img, folderId, true);
        // Wait 2 seconds between images to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error("Batch analysis error for image:", img.name, err);
      }
    }
    
    setIsBatchAnalyzing(false);
    setBatchProgress({ current: 0, total: 0 });
    stopBatchRef.current = false;
    // Refresh health index logs after batch
    fetchHealthIndex();
  };

  const months = [
    { value: 0, label: 'มกราคม' },
    { value: 1, label: 'กุมภาพันธ์' },
    { value: 2, label: 'มีนาคม' },
    { value: 3, label: 'เมษายน' },
    { value: 4, label: 'พฤษภาคม' },
    { value: 5, label: 'มิถุนายน' },
    { value: 6, label: 'กรกฎาคม' },
    { value: 7, label: 'สิงหาคม' },
    { value: 8, label: 'กันยายน' },
    { value: 9, label: 'ตุลาคม' },
    { value: 10, label: 'พฤศจิกายน' },
    { value: 11, label: 'ธันวาคม' },
  ];

  // Show years from 2567 (2024) to 2575 (2032)
  const years = Array.from({ length: 9 }, (_, i) => 2024 + i);

  const fetchHealthIndex = () => {
    fetch(`/api/health-index?month=${selectedMonth + 1}&year=${selectedYear}`)
      .then(res => res.json())
      .then(data => setHealthIndex(data));
  };

  const fetchAnalysisHistory = () => {
    setLoadingHistory(true);
    fetch('/api/analysis-results?limit=100')
      .then(res => res.json())
      .then(data => {
        setAnalysisHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard-stats?month=${selectedMonth + 1}&year=${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
    fetchHealthIndex();
    fetchAnalysisHistory();
  }, [selectedMonth, selectedYear]);

  const handleAnalyze = async (substationName: string, substationId: string, force = false) => {
    setAnalyzing(substationName);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
    
    try {
      const res = await fetch('/api/analyze-substation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ substationName, substationId, month: selectedMonth + 1, year: selectedYear, force }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      console.log("Analysis result:", data);
      if (data.error) {
        let errorMessage = data.error;
        if (typeof data.error === 'object' && data.error.code === 503) {
          errorMessage = "ระบบวิเคราะห์ภาพ (Gemini) กำลังทำงานหนักในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Error 503)";
        } else if (typeof data.error === 'string' && data.error.includes("503")) {
          errorMessage = "ระบบวิเคราะห์ภาพ (Gemini) กำลังทำงานหนักในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Error 503)";
        }
        alert(errorMessage);
      } else {
        if (data.summary) {
          alert(data.summary);
        }
        fetchHealthIndex();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        alert("การวิเคราะห์ใช้เวลานานเกินไป (เกิน 10 นาที) กรุณาตรวจสอบผลลัพธ์ในภายหลัง หรือใช้วิธีวิเคราะห์ทีละภาพ");
      } else {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการวิเคราะห์");
      }
    } finally {
      setAnalyzing(null);
    }
  };

  const MANDATORY_CATEGORIES = ['fence', 'battery', 'checklist'];
  const ALL_CATEGORIES = ['fence', 'battery', 'yard', 'roof', 'security', 'checklist'];

  const substationCompletionMap = new Map<string, Set<string>>();
  stats.recent.forEach(log => {
    const name = (log.substation_name || "").trim();
    if (!substationCompletionMap.has(name)) {
      substationCompletionMap.set(name, new Set());
    }
    (log.categories || []).forEach(cat => {
      if (ALL_CATEGORIES.includes(cat)) {
        substationCompletionMap.get(name)?.add(cat);
      }
    });
  });

  const pendingSubstations = SUBSTATIONS.filter(sub => {
    const name = (sub.name || "").trim();
    const cats = substationCompletionMap.get(name);
    return !cats || !MANDATORY_CATEGORIES.every(cat => cats.has(cat));
  });

  const inspectedSubstations = SUBSTATIONS.filter(sub => {
    const name = (sub.name || "").trim();
    const cats = substationCompletionMap.get(name);
    return cats && MANDATORY_CATEGORIES.every(cat => cats.has(cat));
  }).map(sub => {
    // Find the latest inspection for this sub
    const latestLog = stats.recent.find(log => (log.substation_name || "").trim() === (sub.name || "").trim());
    return { ...sub, latestLog };
  });

  return (
    <div className="min-h-screen bg-violet-50 p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-violet-600" size={40} />
            <p className="text-sm font-bold text-violet-600">...กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">Executive Dashboard</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('progress')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'progress' ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                ความคืบหน้า
              </button>
              <button 
                onClick={() => setActiveTab('health')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'health' ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Health Index
              </button>
              <button 
                onClick={() => {
                  setActiveTab('history');
                  fetchAnalysisHistory();
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'history' ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                ประวัติวิเคราะห์
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลือกเดือนที่ต้องการตรวจสอบ</span>
            <div className="flex gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y + 543}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {activeTab === 'progress' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div key="total" className="cursor-pointer" onClick={() => setShowInspectedModal(true)}>
            <Card className="bg-violet-600 text-white border-none shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-violet-100 text-xs font-bold uppercase tracking-wider mb-1">ตรวจสอบแล้ว ({months[selectedMonth].label})</p>
                  <h3 className="text-4xl font-bold">{stats.total} <span className="text-lg font-normal opacity-70">สถานี</span></h3>
                  <p className="text-[10px] text-violet-100 mt-1 font-bold">รวม {stats.totalSubmissions} รายการส่ง</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
              <p className="text-[10px] text-violet-200 mt-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อดูรายชื่อ</p>
            </Card>
          </div>
          <div key="pending" className="cursor-pointer" onClick={() => setShowPendingModal(true)}>
            <Card className="hover:border-violet-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">รอดำเนินการ</p>
                  <h3 className="text-4xl font-bold text-slate-800">{SUBSTATIONS.length - stats.total} <span className="text-lg font-normal opacity-40">สถานี</span></h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
              <p className="text-[10px] text-violet-600 mt-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อดูรายชื่อ</p>
            </Card>
          </div>
          <div key="coverage">
            <Card>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">ความครอบคลุม</p>
              <h3 className="text-4xl font-bold text-slate-800">
                {((stats.total / SUBSTATIONS.length) * 100).toFixed(1)}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">จากทั้งหมด {SUBSTATIONS.length} สถานี</p>
            </Card>
          </div>
        </div>

        {/* Substation Progress Summary */}
        <Card className="mb-8 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">สรุปความคืบหน้ารายสถานี</h4>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">เดือน{months[selectedMonth].label} {selectedYear + 543}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-3">สถานีไฟฟ้า</th>
                  <th className="px-6 py-3">ความคืบหน้า</th>
                  <th className="px-6 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUBSTATIONS.map(sub => {
                  const name = (sub.name || "").trim();
                  const cats = substationCompletionMap.get(name) || new Set();
                  const mandatoryDone = MANDATORY_CATEGORIES.filter(c => cats.has(c)).length;
                  const isDone = mandatoryDone === MANDATORY_CATEGORIES.length;
                  
                  // Only show stations that have at least one log in the current month
                  if (cats.size === 0 && !stats.recent.some(l => (l.substation_name || "").trim() === name)) return null;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{sub.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[100px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(mandatoryDone / MANDATORY_CATEGORIES.length) * 100}%` }}
                              className={cn(
                                "h-full rounded-full",
                                isDone ? "bg-emerald-500" : "bg-violet-500"
                              )}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{mandatoryDone}/{MANDATORY_CATEGORIES.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          isDone ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {isDone ? "เรียบร้อย" : "กำลังดำเนินการ"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {SUBSTATIONS.every(sub => {
                  const name = (sub.name || "").trim();
                  return !substationCompletionMap.has(name) && !stats.recent.some(l => (l.substation_name || "").trim() === name);
                }) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      ยังไม่มีข้อมูลการตรวจสอบในเดือนนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-bottom border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">ประวัติการตรวจสอบ ({months[selectedMonth].label} {selectedYear + 543})</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">สถานีไฟฟ้า</th>
                  <th className="px-6 py-4">ผู้ปฏิบัติงาน</th>
                  <th className="px-6 py-4">วัน-เวลา</th>
                  <th className="px-6 py-4">สถานะ</th>
                  <th className="px-6 py-4">หลักฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{log.substation_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{log.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(log.timestamp), 'dd/MM/yy HH:mm', { locale: th })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const mandatoryInLog = MANDATORY_CATEGORIES.filter(c => log.categories?.includes(c)).length;
                            const isLogDone = mandatoryInLog === MANDATORY_CATEGORIES.length;
                            return (
                              <>
                                <span className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                                  isLogDone 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : "bg-amber-50 text-amber-600"
                                )}>
                                  <CheckCircle2 size={12} /> {isLogDone ? 'เรียบร้อย' : 'กำลังดำเนินการ'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  ({mandatoryInLog}/{MANDATORY_CATEGORIES.length})
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        {log.categories && MANDATORY_CATEGORIES.filter(c => !log.categories.includes(c)).length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {MANDATORY_CATEGORIES.filter(cat => !log.categories.includes(cat)).map(cat => (
                              <span key={cat} className="text-[7px] text-rose-400 bg-rose-50 px-1 rounded border border-rose-100">
                                {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedSubstationForAnalysis(log.substation_name);
                          setImagesInFolder([]);
                          if (log.folder_id) {
                            fetchImagesInFolder(log.folder_id);
                          }
                        }}
                        className="text-violet-600 hover:text-violet-700 transition-colors"
                        title="ดูหลักฐานรูปภาพ"
                      >
                        <ImageIcon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {stats.recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      ยังไม่มีข้อมูลการตรวจสอบในเดือนนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {SUBSTATIONS.map(sub => {
              const health = healthIndex.find(h => h.substation_name === sub.name);
              const statusColor = health?.status === 'Red' ? 'bg-rose-500' : (health?.status === 'Green' ? 'bg-emerald-500' : 'bg-slate-200');
              const isAnalyzing = analyzing === sub.name;

              return (
                <div key={sub.id}>
                  <Card className="relative overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className={cn("absolute top-0 right-0 w-2 h-full transition-colors", statusColor)} />
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                        <MonitorOff size={20} />
                      </div>
                      {health && (
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          health.status === 'Red' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {health.status === 'Red' ? 'พบปัญหา' : 'ปกติ'}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{sub.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mb-4">Health Index ด้านความสะอาด</p>

                    {health ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {health.findings && health.findings.length > 0 ? (
                            health.findings.map((f: string) => (
                              <span key={f} className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                {f === 'Weed' ? 'หญ้าขึ้นสูง' : (f === 'Bird Droppings' ? 'คราบขี้นก' : f)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">สะอาดเรียบร้อย</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          "{health.summary}"
                        </p>
                        <p className="text-[8px] text-slate-300 text-right">วิเคราะห์เมื่อ: {format(new Date(health.analyzed_at), 'd MMM yy HH:mm', { locale: th })}</p>
                      </div>
                    ) : (
                      <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-4">
                        <p className="text-[10px] text-slate-400 italic">ยังไม่ได้วิเคราะห์ภาพถ่าย</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        onClick={() => handleAnalyze(sub.name, sub.id, !!health)} 
                        disabled={isAnalyzing}
                        className="py-2 text-[10px]"
                        variant={health ? "outline" : "primary"}
                      >
                        {isAnalyzing ? (
                          <><Loader2 className="animate-spin w-3 h-3" /> วิเคราะห์...</>
                        ) : (
                          <><LayoutDashboard size={12} /> {health ? 'วิเคราะห์ใหม่' : 'วิเคราะห์ด่วน'}</>
                        )}
                      </Button>
                      <Button 
                        onClick={async () => {
                          setSelectedSubstationForAnalysis(sub.name);
                          setImagesInFolder([]);
                          // Find the folder ID for this substation/month
                          try {
                            const res = await fetch(`/api/analyze-substation`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ substationName: sub.name, substationId: sub.id, month: selectedMonth + 1, year: selectedYear, dryRun: true })
                            });
                            const data = await res.json();
                            if (data.folderId) {
                              fetchImagesInFolder(data.folderId);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="py-2 text-[10px]"
                        variant="outline"
                      >
                        <ImageIcon size={12} /> ดูรายรูปภาพ
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-slate-900">ประวัติการวิเคราะห์รูปภาพด้วย AI</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAnalysisHistory}
                disabled={loadingHistory}
                className="gap-2"
              >
                <RefreshCw size={14} className={loadingHistory ? "animate-spin" : ""} />
                รีเฟรชข้อมูล
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-3">ภาพ</th>
                    <th className="px-6 py-3">ชื่อสฟ. / โฟลเดอร์</th>
                    <th className="px-6 py-3">วันเวลาที่วิเคราะห์</th>
                    <th className="px-6 py-3">สถานะ AI</th>
                    <th className="px-6 py-3">รายละเอียด (Summary)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingHistory && analysisHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                        กำลังโหลดประวัติ...
                      </td>
                    </tr>
                  ) : analysisHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        ยังไม่มีประวัติการวิเคราะห์รูปภาพ
                      </td>
                    </tr>
                  ) : (
                    analysisHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 relative overflow-hidden">
                            <ImageIcon size={20} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-[200px]">
                            <p className="font-bold text-slate-800 text-sm truncate" title={item.fileName}>
                              {item.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate" title={item.folderId}>
                              {item.folderId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                          {format(new Date(item.analyzedAt), 'dd/MM/yy HH:mm', { locale: th })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                            item.status === 'Red' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          )}>
                            {item.status === 'Red' ? "พบปัญหา" : "ปกติ"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 max-w-[300px]" title={item.summary}>
                            {item.summary}
                          </p>
                          {item.findings && item.findings.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.findings.map((f: string, i: number) => (
                                <span key={i} className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">แสดงผลการวิเคราะห์ล่าสุด {analysisHistory.length} รายการ</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Analysis Detail Modal */}
      <AnimatePresence>
        {selectedSubstationForAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubstationForAnalysis(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">รายละเอียดการวิเคราะห์: {selectedSubstationForAnalysis}</h3>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                    ประจำเดือน {months[selectedMonth].label} {selectedYear + 543}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isBatchAnalyzing && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                      <span className="text-[10px] font-bold text-violet-600">กำลังวิเคราะห์...</span>
                      <span className="text-[10px] text-slate-400">{batchProgress.current} / {batchProgress.total} ภาพ</span>
                    </div>
                  )}
                  {isBatchAnalyzing ? (
                    <Button 
                      onClick={() => stopBatchRef.current = true}
                      variant="destructive"
                      className="hidden md:flex gap-2"
                    >
                      <Loader2 className="animate-spin w-3 h-3" /> หยุดการวิเคราะห์
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => selectedFolderId && handleBatchAnalyze(selectedFolderId)}
                      disabled={imagesInFolder.length === 0 || !selectedFolderId}
                      className="hidden md:flex"
                    >
                      <LayoutDashboard size={14} /> วิเคราะห์ภาพที่เหลือ
                    </Button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedSubstationForAnalysis(null);
                      setSelectedFolderId(null);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {/* Summary Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <Card className="p-4 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">รูปภาพทั้งหมด</p>
                    <h4 className="text-2xl font-bold text-slate-800">{analysisSummary.total}</h4>
                  </Card>
                  <Card className="p-4 text-center border-emerald-100 bg-emerald-50/30">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">สะอาดปกติ</p>
                    <h4 className="text-2xl font-bold text-emerald-600">{analysisSummary.clean}</h4>
                  </Card>
                  <Card className="p-4 text-center border-rose-100 bg-rose-50/30">
                    <p className="text-[10px] text-rose-600 font-bold uppercase mb-1">พบปัญหา</p>
                    <h4 className="text-2xl font-bold text-rose-600">{analysisSummary.issues}</h4>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">หญ้า (Weed)</p>
                    <h4 className="text-2xl font-bold text-amber-600">{analysisSummary.weeds}</h4>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-[10px] text-violet-600 font-bold uppercase mb-1">ขี้นก (Bird)</p>
                    <h4 className="text-2xl font-bold text-violet-600">{analysisSummary.birdDroppings}</h4>
                  </Card>
                </div>

                {isFetchingImages ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-violet-600 w-10 h-10" />
                    <p className="text-slate-400 italic">กำลังดึงข้อมูลรูปภาพจาก Supabase Storage...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagesInFolder.map(img => (
                      <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-100 relative">
                          {img.thumbnailLink ? (
                            <img 
                              src={img.thumbnailLink} 
                              alt={img.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon size={32} />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            {currentlyAnalyzingId === img.id ? (
                              <span className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                                <Loader2 size={14} className="animate-spin" />
                              </span>
                            ) : img.analysis ? (
                              <span className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                                img.analysis.error ? "bg-amber-500 text-white" : (img.analysis.status === 'Green' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")
                              )}>
                                {img.analysis.error ? <AlertCircle size={14} /> : (img.analysis.status === 'Green' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />)}
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shadow-lg">
                                <Clock size={14} />
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-3 flex flex-col h-full">
                          <p className="text-[10px] font-bold text-slate-800 truncate mb-1" title={img.name}>{img.name}</p>
                          
                          {img.analysis && img.analysis.status !== 'Gray' && (
                            <div className="mb-2 space-y-1.5">
                              <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Summary</p>
                                <p className="text-[9px] text-slate-600 leading-tight italic">
                                  {img.analysis.summary || "ไม่มีข้อมูลสรุป"}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {img.analysis.findings && img.analysis.findings.length > 0 ? (
                                  img.analysis.findings.map((f: string) => (
                                    <span key={f} className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-100">
                                      {f === 'Weed' ? 'หญ้า' : (f === 'Bird Droppings' ? 'ขี้นก' : f)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                    สะอาดปกติ
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {img.analysis && img.analysis.status === 'Gray' && (
                            <div className="mb-2 bg-slate-50 p-1.5 rounded border border-amber-100">
                              <p className="text-[8px] font-bold text-amber-500 uppercase mb-0.5">Error</p>
                              <p className="text-[9px] text-slate-500 leading-tight italic">
                                {img.analysis.summary}
                              </p>
                            </div>
                          )}

                          <Button 
                            onClick={() => selectedFolderId && handleAnalyzeImage(img, selectedFolderId)}
                            disabled={isBatchAnalyzing || currentlyAnalyzingId === img.id}
                            className="w-full py-1.5 text-[9px] h-auto font-bold mt-auto"
                            variant={img.analysis?.status === 'Gray' ? "destructive" : (img.analysis ? "ghost" : "outline")}
                          >
                            {currentlyAnalyzingId === img.id ? (
                              <><Loader2 size={10} className="animate-spin mr-1" /> กำลังวิเคราะห์...</>
                            ) : (img.analysis?.status === 'Gray' ? "ลองใหม่อีกครั้ง" : (img.analysis ? "วิเคราะห์ซ้ำ" : "วิเคราะห์ภาพนี้"))}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending Substations Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPendingModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">สถานีที่รอดำเนินการ</h3>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                    ประจำเดือน {months[selectedMonth].label} {selectedYear + 543}
                  </p>
                </div>
                <button 
                  onClick={() => setShowPendingModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingSubstations.map((sub, idx) => {
                    const covered = substationCompletionMap.get(sub.name) || new Set();
                    const missingMandatory = MANDATORY_CATEGORIES.filter(cat => !covered.has(cat));
                    const mandatoryDone = MANDATORY_CATEGORIES.length - missingMandatory.length;
                    
                    return (
                      <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                            {(idx + 1).toString().padStart(2, '0')}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-800 text-sm">{sub.name}</h5>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                              {covered.size === 0 ? 'ยังไม่มีการตรวจสอบ' : `ดำเนินการแล้ว ${mandatoryDone}/${MANDATORY_CATEGORIES.length} หัวข้อหลัก`}
                            </p>
                          </div>
                        </div>
                        
                        {missingMandatory.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <p className="text-[8px] text-slate-400 w-full mb-1">หัวข้อบังคับที่ยังไม่ได้ดำเนินการ:</p>
                            {missingMandatory.map(cat => (
                              <span key={cat} className="text-[8px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded-md border border-rose-100">
                                {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {pendingSubstations.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">ตรวจสอบครบทุกสถานีแล้ว!</h4>
                    <p className="text-sm text-slate-500">ยอดเยี่ยมมาก ทีมงานตรวจสอบครบถ้วน 100%</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
                <Button onClick={() => setShowPendingModal(false)} className="w-full">
                  ปิดหน้าต่าง
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspected Substations Modal */}
      <AnimatePresence>
        {showInspectedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInspectedModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">สถานีที่ตรวจสอบแล้ว</h3>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    ประจำเดือน {months[selectedMonth].label} {selectedYear + 543}
                  </p>
                </div>
                <button 
                  onClick={() => setShowInspectedModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inspectedSubstations.map((sub, idx) => (
                    <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-800 text-sm">{sub.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ล่าสุด: {sub.latestLog ? format(new Date(sub.latestLog.timestamp), 'dd/MM/yy HH:mm', { locale: th }) : '-'}</p>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> ตรวจแล้ว
                          </span>
                        </div>
                      </div>
                      {sub.latestLog && (
                        <button 
                          onClick={() => {
                            setShowInspectedModal(false);
                            setSelectedSubstationForAnalysis(sub.name);
                            setImagesInFolder([]);
                            if (sub.latestLog.folder_id) {
                              fetchImagesInFolder(sub.latestLog.folder_id);
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors"
                          title="ดูหลักฐานรูปภาพ"
                        >
                          <ImageIcon size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {inspectedSubstations.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">ยังไม่มีการตรวจสอบ</h4>
                    <p className="text-sm text-slate-500">เริ่มการตรวจสอบสถานีแรกของเดือนได้เลย!</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
                <Button onClick={() => setShowInspectedModal(false)} className="w-full">
                  ปิดหน้าต่าง
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('ssvi_user'));
  const [view, setView] = useState<'selection' | 'inspection' | 'dashboard' | 'success'>('selection');
  const [selectedSub, setSelectedSub] = useState<typeof SUBSTATIONS[0] | null>(null);

  const handleLogin = (id: string) => {
    localStorage.setItem('ssvi_user', id);
    setUser(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('ssvi_user');
    setUser(null);
    setView('selection');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="font-sans text-slate-900">
      <AnimatePresence mode="wait">
        {view === 'selection' && (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SelectionPage 
              onSelect={(sub) => {
                setSelectedSub(sub);
                setView('inspection');
              }} 
              onLogout={handleLogout}
            />
            {/* Floating Dashboard Button */}
            <button 
              onClick={() => setView('dashboard')}
              className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
            >
              <LayoutDashboard size={24} />
            </button>
          </motion.div>
        )}

        {view === 'inspection' && selectedSub && (
          <motion.div key="inspection" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <InspectionPage 
              substation={selectedSub} 
              employeeId={user}
              onBack={() => setView('selection')}
              onComplete={() => setView('success')}
            />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <DashboardPage onBack={() => setView('selection')} />
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="min-h-screen bg-violet-600 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-2">ส่งรายงานสำเร็จ!</h2>
            <p className="text-violet-100 mb-8">ขอบคุณสำหรับการปฏิบัติงานอย่างเคร่งครัด</p>
            <Button variant="secondary" onClick={() => setView('selection')} className="bg-white text-violet-700 hover:bg-violet-50">
              กลับหน้าหลัก
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
