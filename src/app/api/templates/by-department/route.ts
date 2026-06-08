import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deptCode = searchParams.get("deptCode");

  if (!deptCode) {
    return NextResponse.json(
      { error: "กรุณาระบุรหัสหน่วยงาน" },
      { status: 400 }
    );
  }

  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  try {
    const files = fs.readdirSync(templatesDir);

    // แปลงชื่อไฟล์ → object
    const parsedFiles = files
      .filter(f => f.endsWith(".xls") || f.endsWith(".xlsx"))
      .map(file => {
        const ext = path.extname(file);
        const nameWithoutExt = path.basename(file, ext);
        
        // ใช้ Regex ในการสกัดฟิลด์เพื่อรับรองเครื่องหมายขีดล่างหรือวงเล็บในชื่อหน่วยงาน
        const match = nameWithoutExt.match(/^([a-zA-Z0-9]+)_(.+?)_(\d{12,14})_(.+)$/);

        let code = "";
        let deptName = "";
        let timestamp = 0;
        let originalName = "";

        if (match) {
          code = match[1];
          deptName = match[2];
          timestamp = parseInt(match[3], 10);
          originalName = match[4];
        } else {
          const parts = nameWithoutExt.split("_");
          code = parts[0];
          const timestampStr = parts[2];
          timestamp = parseInt(timestampStr, 10);
          deptName = parts[1];
          originalName = parts.slice(3).join("_") || parts[1];
        }

        return {
          file,
          code,
          deptName,
          timestamp: isNaN(timestamp) ? 0 : timestamp,
          originalName,
          key: `${code}_${deptName}_${originalName}`,
          url: `/uploads/excel/${file}`,
          size: `${(
            fs.statSync(path.join(templatesDir, file)).size / 1024
          ).toFixed(0)} KB`,
        };
      })
      .filter(
        f => f.code?.toLowerCase() === deptCode.toLowerCase()
      );

    // เก็บเฉพาะไฟล์ล่าสุดของแต่ละ key
    const latestMap = new Map<string, any>();

    for (const f of parsedFiles) {
      const existing = latestMap.get(f.key);
      if (!existing || f.timestamp > existing.timestamp) {
        latestMap.set(f.key, f);
      }
    }

    const result = Array.from(latestMap.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "ไม่สามารถอ่านไฟล์ได้" },
      { status: 500 }
    );
  }
}
