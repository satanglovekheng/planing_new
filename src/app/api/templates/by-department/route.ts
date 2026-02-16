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
    console.log("Found files:", files);
    const result = files
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
      })
      .filter(f => f.code === deptCode)
      .sort((a, b) => b.timestamp - a.timestamp); // ล่าสุดก่อน
      
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถอ่านไฟล์ได้" },
      { status: 500 }
    );
  }
}
