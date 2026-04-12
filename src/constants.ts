import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SUBSTATIONS = [
  { id: "tha-sai-1", name: "สถานีไฟฟ้าท่าทราย 1 (จุดจ่ายไฟชั่วคราว)", lat: 13.565, lng: 100.275 },
  { id: "bang-pla", name: "สถานีไฟฟ้าบางปลา", lat: 13.525, lng: 100.245 },
  { id: "samut-sakhon-2", name: "สถานีไฟฟ้าสมุทรสาคร 2", lat: 13.545, lng: 100.265 },
  { id: "tha-sai-2", name: "สถานีไฟฟ้าท่าทราย 2 (ชั่วคราว)", lat: 13.568, lng: 100.278 },
  { id: "samut-sakhon-16", name: "สถานีไฟฟ้าสมุทรสาคร 16", lat: 13.585, lng: 100.295 },
  { id: "samut-sakhon-16-temp", name: "สถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว)", lat: 13.588, lng: 100.298 },
  { id: "krathum-baen-2", name: "สถานีไฟฟ้ากระทุ่มแบน 2", lat: 13.655, lng: 100.265 },
  { id: "krathum-baen-1", name: "สถานีไฟฟ้ากระทุ่มแบน 1", lat: 13.645, lng: 100.275 },
  { id: "samut-sakhon-10", name: "สถานีไฟฟ้าสมุทรสาคร 10", lat: 13.555, lng: 100.285 },
  { id: "krathum-baen-6", name: "สถานีไฟฟ้ากระทุ่มแบน 6", lat: 13.665, lng: 100.255 },
  { id: "krathum-baen-6-temp", name: "สถานีไฟฟ้ากระทุ่มแบน 6 (ชั่วคราว)", lat: 13.668, lng: 100.258 },
  { id: "samut-sakhon-10-temp", name: "สถานีไฟฟ้าสมุทรสาคร 10 (ชั่วคราว)", lat: 13.558, lng: 100.288 },
  { id: "samut-sakhon-7", name: "สถานีไฟฟ้าสมุทรสาคร 7", lat: 13.535, lng: 100.255 },
  { id: "samut-sakhon-1", name: "สถานีไฟฟ้าสมุทรสาคร 1", lat: 13.548, lng: 100.272 },
  { id: "samut-sakhon-9", name: "สถานีไฟฟ้าสมุทรสาคร 9", lat: 13.562, lng: 100.282 },
  { id: "samut-sakhon-12-temp", name: "สถานีไฟฟ้าสมุทรสาคร 12 (ชั่วคราว)", lat: 13.572, lng: 100.292 },
  { id: "samut-sakhon-17-temp", name: "สถานีไฟฟ้าสมุทรสาคร 17 (ชั่วคราว)", lat: 13.5916, lng: 100.3018 },
  { id: "samut-sakhon-3", name: "สถานีไฟฟ้าสมุทรสาคร 3", lat: 13.552, lng: 100.262 },
  { id: "sala-ya", name: "สถานีไฟฟ้าศาลายา", lat: 13.795, lng: 100.325 },
  { id: "phutthamonthon-2", name: "สถานีไฟฟ้าพุทธมณฑล 2", lat: 13.785, lng: 100.315 },
  { id: "phutthamonthon-3", name: "สถานีไฟฟ้าพุทธมณฑล 3", lat: 13.775, lng: 100.305 },
  { id: "u-thong-1", name: "สถานีไฟฟ้าอู่ทอง 1", lat: 14.375, lng: 99.895 },
  { id: "song-phi-nong-1", name: "สถานีไฟฟ้าสองพี่น้อง 1", lat: 14.225, lng: 100.045 },
  { id: "song-phi-nong-2", name: "สถานีไฟฟ้าสองพี่น้อง 2", lat: 14.235, lng: 100.055 },
  { id: "u-thong-2-temp", name: "สถานีไฟฟ้าอู่ทอง 2 (ชั่วคราว)", lat: 14.385, lng: 99.905 },
  { id: "suphan-buri-1", name: "สถานีไฟฟ้าสุพรรณบุรี 1", lat: 14.475, lng: 100.122 },
  { id: "bang-pla-ma", name: "สถานีไฟฟ้าบางปลาม้า", lat: 14.415, lng: 100.145 },
  { id: "suphan-buri-2", name: "สถานีไฟฟ้าสุพรรณบุรี 2", lat: 14.455, lng: 100.105 },
  { id: "dan-chang", name: "สถานีไฟฟ้าด่านช้าง", lat: 14.838, lng: 99.695 },
  { id: "lao-khwan", name: "สถานีไฟฟ้าเลาขวัญ", lat: 14.595, lng: 99.775 },
  { id: "doem-bang", name: "สถานีไฟฟ้าเดิมบางนางบวช", lat: 14.855, lng: 100.045 },
  { id: "bang-len-1", name: "สถานีไฟฟ้าบางเลน 1", lat: 14.025, lng: 100.165 },
  { id: "don-tum", name: "สถานีไฟฟ้าดอนตูม", lat: 13.955, lng: 100.085 },
  { id: "kamphaeng-saen", name: "สถานีไฟฟ้ากำแพงแสน", lat: 14.005, lng: 99.995 },
  { id: "bang-len-3-temp", name: "สถานีไฟฟ้าบางเลน 3 (ชั่วคราว)", lat: 14.035, lng: 100.175 },
  { id: "nakhon-chai-si-1", name: "สถานีไฟฟ้านครชัยศรี 1", lat: 13.805, lng: 100.185 },
  { id: "nakhon-chai-si-2", name: "สถานีไฟฟ้านครชัยศรี 2", lat: 13.815, lng: 100.195 },
  { id: "sam-phran-3", name: "สถานีไฟฟ้าสามพราน 3", lat: 13.725, lng: 100.215 },
  { id: "don-chedi", name: "สถานีไฟฟ้าดอนเจดีย์", lat: 14.635, lng: 99.915 },
  { id: "sam-chuk", name: "สถานีไฟฟ้าสามชุก", lat: 14.755, lng: 100.095 },
  { id: "si-prachan-temp", name: "สถานีไฟฟ้าศรีประจันต์ (ชั่วคราว)", lat: 14.625, lng: 100.142 },
  { id: "samut-sakhon-5", name: "สถานีไฟฟ้าสมุทรสาคร 5", lat: 13.525, lng: 100.235 },
  { id: "ban-phaeo", name: "สถานีไฟฟ้าบ้านแพ้ว", lat: 13.585, lng: 100.105 },
  { id: "ban-phaeo-2", name: "สถานีไฟฟ้าบ้านแพ้ว 2", lat: 13.595, lng: 100.115 },
  { id: "samut-sakhon-4", name: "สถานีไฟฟ้าสมุทรสาคร 4", lat: 13.515, lng: 100.225 },
  { id: "samut-sakhon-11", name: "สถานีไฟฟ้าสมุทรสาคร 11", lat: 13.575, lng: 100.285 },
  { id: "samut-sakhon-15", name: "สถานีไฟฟ้าสมุทรสาคร 15", lat: 13.595, lng: 100.305 },
  { id: "ekkachai-2", name: "สถานีไฟฟ้าเอกชัย 2", lat: 13.585, lng: 100.325 },
  { id: "ekkachai-1", name: "สถานีไฟฟ้าเอกชัย 1", lat: 13.575, lng: 100.315 },
  { id: "sin-sakhon", name: "สถานีไฟฟ้าสินสาคร", lat: 13.545, lng: 100.345 },
  { id: "samut-sakhon-6", name: "สถานีไฟฟ้าสมุทรสาคร 6", lat: 13.535, lng: 100.245 },
  { id: "samut-sakhon-8-temp", name: "สถานีไฟฟ้าสมุทรสาคร 8 (ชั่วคราว)", lat: 13.555, lng: 100.265 },
  { id: "om-noi-2", name: "สถานีไฟฟ้าอ้อมน้อย 2", lat: 13.705, lng: 100.315 },
  { id: "krathum-baen-4", name: "สถานีไฟฟ้ากระทุ่มแบน 4", lat: 13.675, lng: 100.275 },
  { id: "krathum-baen-5", name: "สถานีไฟฟ้ากระทุ่มแบน 5", lat: 13.685, lng: 100.285 },
  { id: "om-noi-5", name: "สถานีไฟฟ้าอ้อมน้อย 5", lat: 13.715, lng: 100.325 },
  { id: "sam-phran-1", name: "สถานีไฟฟ้าสามพราน 1", lat: 13.705, lng: 100.225 },
  { id: "om-noi-4", name: "สถานีไฟฟ้าอ้อมน้อย 4", lat: 13.725, lng: 100.335 },
  { id: "om-yai-2", name: "สถานีไฟฟ้าอ้อมใหญ่ 2", lat: 13.715, lng: 100.285 },
  { id: "om-noi-1", name: "สถานีไฟฟ้าอ้อมน้อย 1", lat: 13.695, lng: 100.305 },
  { id: "om-noi-3", name: "สถานีไฟฟ้าอ้อมน้อย 3", lat: 13.715, lng: 100.315 },
  { id: "om-noi-1-temp", name: "สถานีไฟฟ้าอ้อมน้อย 1 (ชั่วคราว)", lat: 13.698, lng: 100.308 },
  { id: "om-yai-1", name: "สถานีไฟฟ้าอ้อมใหญ่ 1", lat: 13.705, lng: 100.275 },
  { id: "om-yai-3", name: "สถานีไฟฟ้าอ้อมใหญ่ 3", lat: 13.725, lng: 100.295 },
  { id: "om-yai-4", name: "สถานีไฟฟ้าอ้อมใหญ่ 4", lat: 13.735, lng: 100.305 },
  { id: "sam-phran-4", name: "สถานีไฟฟ้าสามพราน 4", lat: 13.735, lng: 100.235 },
  { id: "sam-phran-2", name: "สถานีไฟฟ้าสามพราน 2", lat: 13.715, lng: 100.215 },
  { id: "nakhon-pathom-1", name: "สถานีไฟฟ้านครปฐม 1", lat: 13.815, lng: 100.045 },
  { id: "nakhon-pathom-2", name: "สถานีไฟฟ้านครปฐม 2", lat: 13.825, lng: 100.055 },
  { id: "nakhon-pathom-3", name: "สถานีไฟฟ้านครปฐม 3", lat: 13.835, lng: 100.065 },
  { id: "nakhon-pathom-4-temp", name: "สถานีไฟฟ้านครปฐม 4 (ชั่วคราว)", lat: 13.845, lng: 100.075 },
  { id: "tha-maka-1", name: "สถานีไฟฟ้าท่ามะกา 1", lat: 13.915, lng: 99.765 },
  { id: "tha-maka-2", name: "สถานีไฟฟ้าท่ามะกา 2", lat: 13.925, lng: 99.775 },
  { id: "ban-pong-1", name: "สถานีไฟฟ้าบ้านโป่ง 1", lat: 13.815, lng: 99.875 },
  { id: "tha-muang-2", name: "สถานีไฟฟ้าท่าม่วง 2", lat: 13.823, lng: 99.635 },
  { id: "tha-muang-1", name: "สถานีไฟฟ้าท่าม่วง 1", lat: 13.975, lng: 99.628 },
  { id: "dan-makham-tia", name: "สถานีไฟฟ้าด่านมะขามเตี้ย", lat: 13.855, lng: 99.415 },
  { id: "sai-yok", name: "สถานีไฟฟ้าไทรโยค", lat: 14.115, lng: 99.145 },
  { id: "kanchanaburi-4-temp", name: "สถานีไฟฟ้ากาญจนบุรี 4 (ชั่วคราว)", lat: 13.888, lng: 99.182 },
  { id: "kanchanaburi-1", name: "สถานีไฟฟ้ากาญจนบุรี 1", lat: 14.015, lng: 99.525 },
  { id: "phanom-thuan", name: "สถานีไฟฟ้าพนมทวน", lat: 14.119, lng: 99.682 },
  { id: "kanchanaburi-3", name: "สถานีไฟฟ้ากาญจนบุรี 3", lat: 14.035, lng: 99.545 },
  { id: "kanchanaburi-2", name: "สถานีไฟฟ้ากาญจนบุรี 2", lat: 14.025, lng: 99.535 },
  { id: "bo-phloi", name: "สถานีไฟฟ้าบ่อพลอย", lat: 14.325, lng: 99.515 },
  { id: "bo-phloi-2-temp", name: "สถานีไฟฟ้าบ่อพลอย 2 (ชั่วคราว)", lat: 14.335, lng: 99.525 },
];

export interface InspectionLog {
  id: number;
  employee_id: string;
  substation_name: string;
  timestamp: string;
  gps_lat: number;
  gps_lng: number;
  folder_id: string;
  status: string;
  categories?: string[];
}
