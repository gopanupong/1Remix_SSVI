import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SUBSTATIONS = [
  { id: "tha-sai-1", name: "สถานีไฟฟ้าท่าทราย 1", lat: 13.5502008590445, lng: 100.2331791670860 },
  { id: "bang-pla", name: "สถานีไฟฟ้าบางปลา", lat: 13.5867410094842, lng: 100.2474295010980 },
  { id: "samut-sakhon-2", name: "สถานีไฟฟ้าสมุทรสาคร 2", lat: 13.5410898206380, lng: 100.2301316622620 },
  { id: "tha-sai-2", name: "สถานีไฟฟ้าท่าทราย 2 (ชั่วคราว)", lat: 13.5594937842840, lng: 100.2296575078180 },
  { id: "samut-sakhon-16", name: "สถานีไฟฟ้าสมุทรสาคร 16", lat: 13.54533360040040, lng: 100.2112418855430 },
  { id: "samut-sakhon-16-temp", name: "สถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว)", lat: 13.5456241, lng: 100.2098699 },
  { id: "krathum-baen-2", name: "สถานีไฟฟ้ากระทุ่มแบน 2", lat: 13.6263381932192, lng: 100.3112976990820 },
  { id: "krathum-baen-1", name: "สถานีไฟฟ้ากระทุ่มแบน 1", lat: 13.6445459138474, lng: 100.2972780417040 },
  { id: "samut-sakhon-10", name: "สถานีไฟฟ้าสมุทรสาคร 10", lat: 13.6254634, lng: 100.2776945 },
  { id: "krathum-baen-6", name: "สถานีไฟฟ้ากระทุ่มแบน 6", lat: 13.6334364868495, lng: 100.3226183328920 },
  { id: "krathum-baen-6-temp", name: "สถานีไฟฟ้ากระทุ่มแบน 6 (ชั่วคราว)", lat: 13.7184839, lng: 100.229482 },
  { id: "samut-sakhon-10-temp", name: "สถานีไฟฟ้าสมุทรสาคร 10 (ชั่วคราว)", lat: 13.6122744, lng: 100.2879348 },
  { id: "samut-sakhon-7", name: "สถานีไฟฟ้าสมุทรสาคร 7", lat: 13.5830586535748, lng: 100.2919760558030 },
  { id: "samut-sakhon-1", name: "สถานีไฟฟ้าสมุทรสาคร 1", lat: 13.5930632217333, lng: 100.2825585588700 },
  { id: "samut-sakhon-9", name: "สถานีไฟฟ้าสมุทรสาคร 9", lat: 13.6243333, lng: 100.3413611 },
  { id: "samut-sakhon-12-temp", name: "สถานีไฟฟ้าสมุทรสาคร 12 (ชั่วคราว)", lat: 13.6020833, lng: 100.3607222 },
  { id: "samut-sakhon-17-temp", name: "สถานีไฟฟ้าสมุทรสาคร 17 (ชั่วคราว)", lat: 13.56442, lng: 100.2582947 },
  { id: "samut-sakhon-3", name: "สถานีไฟฟ้าสมุทรสาคร 3", lat: 13.5968297915659, lng: 100.3323575908130 },
  { id: "sala-ya", name: "สถานีไฟฟ้าศาลายา", lat: 13.8086166713977, lng: 100.3224606158160 },
  { id: "phutthamonthon-2", name: "สถานีไฟฟ้าพุทธมณฑล 2", lat: 13.8028965515010, lng: 100.3024277958970 },
  { id: "phutthamonthon-3", name: "สถานีไฟฟ้าพุทธมณฑล 3", lat: 13.8735490043498, lng: 100.2932140507940 },
  { id: "u-thong-1", name: "สถานีไฟฟ้าอู่ทอง 1", lat: 14.3421253709352, lng: 99.8614367503615 },
  { id: "song-phi-nong-1", name: "สถานีไฟฟ้าสองพี่น้อง 1", lat: 14.1771111, lng: 100.0633611 },
  { id: "song-phi-nong-2", name: "สถานีไฟฟ้าสองพี่น้อง 2", lat: 14.1715278, lng: 99.96 },
  { id: "u-thong-2-temp", name: "สถานีไฟฟ้าอู่ทอง 2 (ชั่วคราว)", lat: 14.4551164, lng: 99.9229395 },
  { id: "suphan-buri-1", name: "สถานีไฟฟ้าสุพรรณบุรี 1", lat: 14.4913333, lng: 100.1308056 },
  { id: "bang-pla-ma", name: "สถานีไฟฟ้าบางปลาม้า", lat: 14.3371667, lng: 100.1978889 },
  { id: "suphan-buri-2", name: "สถานีไฟฟ้าสุพรรณบุรี 2", lat: 14.4514907, lng: 100.0978788 },
  { id: "dan-chang", name: "สถานีไฟฟ้าด่านช้าง", lat: 14.8476944, lng: 99.7874444 },
  { id: "lao-khwan", name: "สถานีไฟฟ้าเลาขวัญ", lat: 14.7028333, lng: 99.7740833 },
  { id: "doem-bang", name: "สถานีไฟฟ้าเดิมบางนางบวช", lat: 14.8041667, lng: 100.1248611 },
  { id: "bang-len-1", name: "สถานีไฟฟ้าบางเลน 1", lat: 14.0389722, lng: 100.1682222 },
  { id: "don-tum", name: "สถานีไฟฟ้าดอนตูม", lat: 13.9782778, lng: 100.09175 },
  { id: "kamphaeng-saen", name: "สถานีไฟฟ้ากำแพงแสน", lat: 13.9878333, lng: 99.9947778 },
  { id: "bang-len-3-temp", name: "สถานีไฟฟ้าบางเลน 3 (ชั่วคราว)", lat: 14.0100287, lng: 100.2312487 },
  { id: "nakhon-chai-si-1", name: "สถานีไฟฟ้านครชัยศรี 1", lat: 13.7498333, lng: 100.188 },
  { id: "nakhon-chai-si-2", name: "สถานีไฟฟ้านครชัยศรี 2", lat: 13.8651111, lng: 100.2075278 },
  { id: "sam-phran-3", name: "สถานีไฟฟ้าสามพราน 3", lat: 13.7817778, lng: 100.2374722 },
  { id: "don-chedi", name: "สถานีไฟฟ้าดอนเจดีย์", lat: 14.6011389, lng: 99.99225 },
  { id: "sam-chuk", name: "สถานีไฟฟ้าสามชุก", lat: 14.689573, lng: 100.108611 },
  { id: "si-prachan-temp", name: "สถานีไฟฟ้าศรีประจันต์ (ชั่วคราว)", lat: 14.6170833, lng: 100.14075 },
  { id: "samut-sakhon-5", name: "สถานีไฟฟ้าสมุทรสาคร 5", lat: 13.5086944, lng: 100.1327778 },
  { id: "ban-phaeo", name: "สถานีไฟฟ้าบ้านแพ้ว", lat: 13.5666111, lng: 100.1166389 },
  { id: "ban-phaeo-2", name: "สถานีไฟฟ้าบ้านแพ้ว 2", lat: 13.6434625, lng: 100.0899844 },
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
