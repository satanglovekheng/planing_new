// app/api/submissions/plan70/route.ts
// วางไฟล์นี้ที่: app/api/submissions/plan70/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ========== ข้อมูลหน่วยงานทั้งหมด ==========
const DEPARTMENTS: Record<string, string> = {
  g0000: "คลังกลาง รพ.อต.",
  a0100: "ฝ่ายบริหารทั่วไป",
  a0101: "งานยานพาหนะ",
  a0102: "งานธุรการ",
  a0103: "สถานีบ่มเพาะ",
  a0104: "งานประชาสัมพันธ์",
  a0105: "งานรักษาความปลอดภัย",
  a0106: "งานสนาม",
  a0107: "งานซักฟอก",
  a0108: "งานตัดเย็บ",
  a0200: "กลุ่มงานพัสดุ",
  a0201: "สำนักงานพัสดุ",
  a0202: "งานคลังพัสดุ",
  a0300: "กลุ่มงานการเงิน",
  a0301: "สำนักงานการเงิน",
  a0400: "กลุ่มงานบัญชี",
  a0401: "สำนักงานบัญชี",
  a0500: "กลุ่มงานทรัพยากรบุคคล",
  a0501: "งานทรัพยากรบุคคล",
  a0600: "กลุ่มงานโครงสร้างพื้นฐานและวิศวะกรรมทางการแพทย์",
  a0601: "งานโครงสร้างพื้นฐาน",
  a0602: "งานวิศวกรรมทางการแพทย์",
  b2100: "กลุ่มงานผู้ป่วยนอก",
  b2101: "ห้องเฝือก",
  b2128: "ศูนย์บริการแพทย์ทางไกลและคลิคพบหมอออนไลน์",
  b2129: "คลินิกตรวจมวลกระดูก",
  b2200: "กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก (ในรพ.อต.)",
  b2201: "งานแพทย์แผนไทย-ในโรงพยาบาล",
  b2202: "แพทย์แผนไทย อต.1",
  b2300: "กลุ่มงานเวชกรรมสังคม",
  b2301: "กลุ่มงานเวชกรรมสังคม",
  b2302: "คลินิกกามโรค",
  b2303: "งานป้องกันควบคุมโรคและระบาดวิทยา",
  b2304: "งานพัฒนาระบบบริการปฐมภูมิและสนับสนุนเครือข่าย",
  b2305: "งานคุ้มครองผู้บริโภค",
  b2306: "งานส่งเสริมสุขภาพและฟื้นฟู",
  b2307: "งานเวชปฏิบัตจครอบครัวและชุมชนและศูนย์สุขภาพชุมชนเขตเมือง",
  b2308: "สำนักงานประสาน PCU",
  b2400: "กลุ่มงานสุขศึกษา",
  b2401: "สำนักงานสุขศึกษา",
  b2500: "กลุ่มงานอาชีวเวชกรรม",
  b2501: "สำนักงานอาชีวเวชกรรม",
  b2600: "กลุ่มงานการพยาบาลชุมชน",
  b2601: "งานการพยาบาลชุมชนในการบำบัดรักษายาเสพติด",
  b2602: "งานพยาบาลที่บ้านและชุมชน",
  b2603: "งานพยาบาลผู้จัดการสุขภาพชุมชน",
  b2604: "งานพัฒนาคุณภาพการพยาบาลชุมชน",
  c3100: "กลุ่มงานเวชศาสตร์ฉุกเฉิน",
  c3101: "งานเวชศาสตร์ฉุกเฉิน",
  c3200: "กลุ่มงานอายุรกรรม",
  c3201: "สำนักงานภาควิชาอายุรศาสตร์",
  c3300: "กลุ่มงานศัลยกรรม",
  c3400: "กลุ่มงานศัลยกรรมออร์โธปิดิกส์",
  c3401: "กลุ่มงานศัลยกรรมออร์โธปิดิกส์",
  c3500: "กลุ่มงานกุมารเวชกรรม",
  c3501: "งานกุมารเวชกรรม",
  c3600: "กลุ่มงานนิติเวช",
  c3601: "งานนิติเวช",
  c3700: "กลุ่มงานจักษุวิทยา",
  c3701: "สำนักงานจักษุวิทยา",
  c3800: "กลุ่มงานโสต ศอ นาสิก",
  c3801: "งานโสต ศอ นาสิก",
  c3900: "กลุ่มงานโภชนศาสตร์",
  c3901: "สำนักงานโภชนาการ",
  c4100: "กลุ่มงานพยาธิวิทยากายวิภาค",
  c4101: "สำนักงานพยาธิวิทยา",
  c4200: "กลุ่มงานสูติ-นรีเวชกรรม",
  c4201: "กลุ่มงานสูติ - นรีเวชกรรมและวางแผนครอบครัว",
  c4300: "กลุ่มงานวิสัญญีวิทยา",
  c4301: "กลุ่มงานวิสัญญีวิทยา",
  c4400: "กลุ่มงานจิตเวช",
  c4401: "สำนักงานจิตเวช",
  c4500: "กลุ่มงานทันตกรรม",
  c4501: "ทันตกรรม (OPD)",
  c4502: "ทันตกรรม ANC",
  c4503: "ทันตกรรม WBB",
  c4504: "ทันตกรรม อต2",
  c4505: "ทันตกรรมโรงเรียน",
  c4506: "ทันตกรรม อต1",
  c4507: "งานคลังทันตกรรมย่อย",
  c4508: "งานจัดซื้อ",
  c4600: "กลุ่มงานรังสีรักษา",
  c4601: "กลุ่มงานรังสีวิทยา",
  c4700: "กลุ่มงานเทคนิคการแพทย์และพยาธิวิทยาคลินิก",
  c4701: "งานโลหิตวิทยา",
  c4702: "งานจุลทรรศน์ศาสตร์คลีนิค",
  c4703: "งานภูมิคุ้มกันวิทยา",
  c4704: "งานธนาคารโลหิต",
  c4705: "งานจุลชีววิทยา",
  c4706: "งานจัดซื้อ",
  c4707: "งานบริการผู้ป่วยนอก",
  c4708: "ห้องตรวจคลื่นไฟฟ้าสมอง",
  c4800: "กลุ่มงานเวชกรรมฟื้นฟู",
  c4801: "งานกายภาพบำบัด",
  c4802: "งานกิจกรรมบำบัด / งานอาชีวบำบัด",
  c4803: "งานกายอุปกรณ์",
  c4804: "งานเวชกรรมฟื้นฟู",
  c4900: "กลุ่มงานสังคมสงเคราะห์",
  c4901: "งานสังคมสงเคราะห์",
  c5100: "กลุ่มงานเภสัชกรรม",
  c5101: "งานจัดซื้อ-คลังยา",
  c5102: "ห้องจ่ายยาผู้ป่วยนอก",
  c5103: "ห้องจ่ายยา PCU (จิตเวช)",
  c5104: "ห้องจ่ายยา รพ.อต. สาขา1",
  c5105: "ห้องจ่ายยาตึกอุบัติเหตุ",
  c5106: "ห้องจ่ายยาผู้ป่วยในอายุรกรรม",
  c5107: "ห้องจ่ายยาผู้ป่วยในศัลยกรรม",
  c5108: "งานคลังยาย่อย",
  c5109: "งานผลิตยาน้ำทั่วไป",
  c5110: "งานผลิตยาปราศจากเชื้อ",
  c5111: "งานผลิตยาเคมีบำบัด",
  c5112: "งานผลิตยายาสมุนไพร",
  c5113: "งานบริบาลและเภสัชกรรมปฐมภูมิ",
  c5114: "งานธุรการ - กลุ่มงานเภสัชกรรม",
  d6100: "กลุ่มงานพัฒนาทรัพยากรบุคคล",
  d6200: "กลุ่มงานสารสนเทศทางการแพทย์",
  d6201: "กลุ่มงานสารสนเทศทางการแพทย์",
  d6202: "ศูนย์คอมพิวเตอร์",
  d6300: "กลุ่มงานประกันสุขภาพ",
  d6301: "กลุ่มงานประกันสุขภาพ",
  d6400: "กลุ่มงานยุทธศาสตร์และแผนงานโครงการ",
  d6401: "กลุ่มงานยุทธศาสตร์และแผนงานโครงการ",
  d6500: "กลุ่มงานพัฒนาคุณภาพบริการและมาตรฐาน",
  d6501: "สำนักงานศูนย์รับรองคุณภาพการทำงาน",
  d6600: "งานห้องสมุด",
  d6700: "งานเวชนิทัศน์และโสตทัศนศึกษา",
  e7100: "กลุ่มงานการพยาบาล",
  e7101: "หอผู้ป่วย ตา หู คอ จมูก",
  e7102: "หอผู้ป่วยศัลยกรรมประสาท (ศป.)",
  e7103: "ห้องปฏิบัติการตรวจสวนหัวใจ (Cath lab)",
  e7104: "งานห้องคลอด (LR)",
  e7105: "หอผู้ป่วยสูติกรรมหลังคลอด (PP)",
  e7106: "หอผู้ป่วยนรีเวชกรรม (Gyne)",
  e7107: "ห้องตรวจคลื่นสะท้อนหัวใจ (Echo)",
  e7108: "หออภิบาลผู้ป่วยวิกฤตระบบทางเดินหายใจ (RICU)",
  e7109: "หอผู้ป่วยศัลยกรรมกระดูกชาย (ศกช.)",
  e7110: "หออภิบาลผู้ป่วยวิกฤตโรคหัวใจ (CCU)",
  e7111: "หออภิบาลผู้ป่วยวิกฤตกุมารเวชกรรม(NICU)",
  e7112: "หอแยกโรคผู้ป่วยติดเชื้อ",
  e7113: "หอผู้ป่วยกุมารเวชกรรม 2 (เด็ก 2)",
  e7114: "งานห้องผ่าตัด (OR)",
  e7115: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรมอุบัติเหตุ (ICU Trauma.)",
  e7116: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรม (ICU Surg.)",
  e7117: "หออภิบาลผู้ป่วยวิกฤตศัลยกรรมประสาท (ICU Neuro.)",
  e7118: "งานไตเทียม",
  e7119: "หอผู้ป่วยศัลยกรรมอุบัติเหตุ (ศอ.)",
  e7120: "งานส่องตรวจด้วยกล้อง",
  e7121: "หอผู้ป่วยจิตเวช",
  e7122: "หอผู้ป่วยระบบทางเดินหายใจ (RCW)",
  e7123: "หอผู้ป่วยศัลยกรรมหญิง (ศญ.)",
  e7124: "หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (ICU Med.)",
  e7125: "หอผู้ป่วยอายุรกรรมหญิง",
  e7126: "ศูนย์เครื่องมือแพทย์",
  e7127: "หอผู้ป่วยศัลยกรรมกระดูกหญิง (ศกญ.)",
  e7128: "หอผู้ป่วยพิเศษ Premium 1 ชั้น 4 (กลุ่มฯ ศัลยกรรม)",
  e7129: "หอผู้ป่วยพิเศษ Premium 1 ชั้น 5 (กลุ่มฯ สูติ - นรีเวช)",
  e7130: "หอผู้ป่วยพิเศษ 1 ชั้น 2 (กลุ่มฯ อายุรกรรม)",
  e7131: "งานป้องกันและควบคุมโรคติดเชื้อในโรงพยาบาล (IC)",
  e7132: "สำนักงานกลุ่มการพยาบาล",
  e7133: "หอผู้ป่วยกุมารเวชกรรม 3 (เด็ก 3)",
  e7134: "หอผู้ป่วยอายุรกรรมชาย",
  e7135: "งานอุบัติเหตุและฉุกเฉิน (ER)",
  e7136: "ศูนย์ผ่าตัดแบบวันเดียวกลับ (ODS)",
  e7137: "หอผู้ป่วยพิเศษ 1 ชั้น 3 (กลุ่มฯ ออร์โธปิดิกส์)",
  e7138: "ห้องตรวจคลื่นไฟฟ้าสมอง (EEG)",
  e7139: "สำนักงานผู้ป่วยนอก",
  e7140: "ห้องตรวจโสต ศอ นาสิก",
  e7141: "ห้องฉีดยาทำแผล OPD เก่า",
  e7142: "ห้องฉีดยาทำแผล OPD ศัลย์",
  e7143: "หน่วยเคมีบำบัด",
  e7144: "งานฝากครรภ์",
  e7145: "งานล้างไตทางช่องท้อง",
  e7146: "หอผู้ป่วยศัลยกรรมกระดูกชาย (ศกช.)",
  e7147: "งานศูนย์จ่ายกลาง",
  e7148: "งานวิสัญญี",
  e7149: "Pre post cath+พิเศษอายุรกรรม",
  e7150: "หอผู้ป่วยโรคหลอดเลือดสมอง(Stroke Unit) (กลุ่มอายุรกรรม)",
  e7151: "ศูนย์โรคไต ( เรื้อรัง+ คลินิกไต)",
  e7152: "งานศูนย์เปล",
  e7153: "งานรังสีร่วมรักษา",
  e7159: "ศัลยกรรมชาย",
  f0000: "ด้านผลิตบุลากรทางการแพทย์",
  f8100: "ศูนย์แพทยศาสตร์ศึกษาชั้นคลินิก",
  a2601: "กลุ่มงานเทคโนโลยีสารสนเทศ",
  a2602: "กลุ่มงานสุขภาพดิจิทัล",
  a2603: "กลุ่มงานเวรระเบียนและข้อมูลทางการแพทย์",
  h0100: "สำนักงานองค์การแพทย์",
  h0200: "โรงพยาบาลอุตรดิตถ์ สาขา 1",
  h0300: "โรงพยาบาลอุตรดิตถ์ สาขา 2",
  h0400: "ศูนย์การดูแลแบบประคับประคอง",
  h0500: "สภาความปลอดภัย",
};

// ========== Types ==========
interface FileInfo {
  filename: string;
  departmentId: string;
  departmentName: string;
  fileType: string;
  timestamp: number;
  uploadedAt: string;
  sizeMB?: number;
}

interface DepartmentSubmission {
  departmentId: string;
  departmentName: string;
  fileCount: number;
  files: FileInfo[];
  latestUpload: string;
}

// ========== Helper: parse filename ==========
// รูปแบบ: {departmentId}_{deptName}_{timestamp}_{fileType}.xlsx
// ex: 62000_สารสนเทศ_1779286647562_อัตราครองเตียง_ปี2569.xlsx
function parseFilename(filename: string): FileInfo | null {
  const ext = path.extname(filename);
  if (ext !== ".xlsx" && ext !== ".xls") return null;

  const nameWithoutExt = path.basename(filename, ext);
  
  // ใช้ Regex ในการค้นหาโครงสร้างรหัสหน่วยงาน ชื่อหน่วยงาน timestamp และประเภทไฟล์
  // รองรับกรณีที่ชื่อหน่วยงานมีสัญลักษณ์เครื่องหมายวงเล็บหรืออันเดอร์สกอร์ในตัว เช่น e7103_ห้องปฏิบัติการตรวจสวนหัวใจ_(Cath_lab)_
  const match = nameWithoutExt.match(/^([a-zA-Z0-9]+)_(.+?)_(\d{12,14})_(.+)$/);

  let departmentId = "";
  let departmentName = "";
  let timestamp = 0;
  let fileType = "";

  if (match) {
    departmentId = match[1];
    const rawDeptName = match[2];
    timestamp = parseInt(match[3], 10);
    fileType = match[4];
    departmentName = DEPARTMENTS[departmentId] || rawDeptName.replace(/_/g, " ") || "ไม่ระบุหน่วยงาน";
  } else {
    // กรณีที่ไม่ตรง Regex ให้ใช้ split แบบเดิมเป็นทางเลือกสำรอง
    const parts = nameWithoutExt.split("_");
    if (parts.length < 3) return null;
    departmentId = parts[0];
    const timestampStr = parts[2];
    timestamp = parseInt(timestampStr, 10);
    fileType = parts.slice(3).join("_") || parts[1];
    departmentName = DEPARTMENTS[departmentId] || parts[1].replace(/_/g, " ") || "ไม่ระบุหน่วยงาน";
  }

  const uploadedAt = isNaN(timestamp) || timestamp === 0
    ? "ไม่ทราบวันที่"
    : new Date(timestamp).toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return {
    filename,
    departmentId,
    departmentName,
    fileType,
    timestamp: isNaN(timestamp) ? 0 : timestamp,
    uploadedAt,
  };
}

// ========== GET Handler ==========
export async function GET() {
  try {
    // ปรับ path ให้ตรงกับ server ของคุณ
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "excel",
      "plan70"
    );

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ departments: [], totalFiles: 0 });
    }

    // รวมไฟล์จาก subdirectories ด้วย (recursive 1 level)
    let allFiles: string[] = [];

    const topLevel = fs.readdirSync(uploadDir);
    for (const item of topLevel) {
      const itemPath = path.join(uploadDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isFile()) {
        allFiles.push(item);
      } else if (stat.isDirectory()) {
        // ดึงไฟล์ใน subdirectory
        const subFiles = fs.readdirSync(itemPath).map((f) =>
          path.join(item, f)
        );
        allFiles = allFiles.concat(subFiles);
      }
    }

    // Parse แต่ละไฟล์
    const parsed: FileInfo[] = [];
    for (const relPath of allFiles) {
      const filename = path.basename(relPath);
      const info = parseFilename(filename);

      if (info) {
        // ดึงขนาดไฟล์
        try {
          const fullPath = path.join(uploadDir, relPath);
          const stat = fs.statSync(fullPath);
          info.sizeMB = parseFloat((stat.size / (1024 * 1024)).toFixed(2));
        } catch {
          info.sizeMB = 0;
        }
        parsed.push(info);
      }
    }

    // Group by departmentId
    const grouped: Record<string, DepartmentSubmission> = {};

    for (const file of parsed) {
      if (!grouped[file.departmentId]) {
        grouped[file.departmentId] = {
          departmentId: file.departmentId,
          departmentName: file.departmentName,
          fileCount: 0,
          files: [],
          latestUpload: "",
        };
      }
      grouped[file.departmentId].files.push(file);
    }

    // จัดเรียงไฟล์ตามลำดับเวลาล่าสุด และกรองเอาเฉพาะไฟล์ล่าสุดของแต่ละประเภทไฟล์ (Deduplicate)
    let totalDeduplicatedFiles = 0;
    for (const dept of Object.values(grouped)) {
      dept.files.sort((a, b) => b.timestamp - a.timestamp);
      
      const latestFiles: FileInfo[] = [];
      const seenTypes = new Set<string>();
      
      for (const file of dept.files) {
        const typeKey = file.fileType.toLowerCase();
        if (!seenTypes.has(typeKey)) {
          seenTypes.add(typeKey);
          latestFiles.push(file);
        }
      }
      
      dept.files = latestFiles;
      dept.fileCount = latestFiles.length;
      dept.latestUpload = latestFiles[0]?.uploadedAt || "";
      totalDeduplicatedFiles += latestFiles.length;
    }

    // Sort departments by fileCount descending
    const departments = Object.values(grouped).sort(
      (a, b) => b.fileCount - a.fileCount
    );

    return NextResponse.json({
      departments,
      totalFiles: totalDeduplicatedFiles,
      totalDepartments: departments.length,
    });
  } catch (error) {
    console.error("Error reading upload directory:", error);
    return NextResponse.json(
      { error: "Failed to read submissions" },
      { status: 500 }
    );
  }
}