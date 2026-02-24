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
          size: `${(
            fs.statSync(path.join(templatesDir, file)).size / 1024
          ).toFixed(0)} KB`
        };
      });

    // ✅ ไม่ซ้ำทั้งหน่วยงาน + ชื่อไฟล์
    const latestMap = new Map<string, any>();

    for (const f of parsed) {
      const key = `${f.code.toLowerCase()}_${f.originalName.toLowerCase()}`;

      const existing = latestMap.get(key);
      if (!existing || f.timestamp > existing.timestamp) {
        latestMap.set(key, f);
      }
    }

    return NextResponse.json(
      Array.from(latestMap.values()).sort(
        (a, b) => b.timestamp - a.timestamp
      )
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "ไม่สามารถอ่านไฟล์ได้" },
      { status: 500 }
    );
  }
}
