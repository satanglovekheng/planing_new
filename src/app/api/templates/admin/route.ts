import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  try {
    const files = fs.readdirSync(templatesDir);

    const parsed = files
      .filter(f => f.endsWith(".xls") || f.endsWith(".xlsx"))
      .map(file => {
        const [code, deptName, timestamp, ...rest] = file.split("_");

        return {
          file,
          code,
          deptName,
          timestamp: Number(timestamp),
          originalName: rest.join("_"),
          url: `/uploads/excel/${file}`,
          size: `${(fs.statSync(path.join(templatesDir, file)).size / 1024).toFixed(0)} KB`
        };
      });

    // เลือกไฟล์ล่าสุดต่อหน่วยงาน
    const latestByDept: Record<string, any> = {};

    for (const f of parsed) {
      if (!latestByDept[f.code] || f.timestamp > latestByDept[f.code].timestamp) {
        latestByDept[f.code] = f;
      }
    }

    return NextResponse.json(Object.values(latestByDept));
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถอ่านไฟล์ได้" },
      { status: 500 }
    );
  }
}
