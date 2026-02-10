import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/templates");

  try {
    const files = fs.readdirSync(templatesDir);

    const templates = files
      .filter(file => file.endsWith(".xls") || file.endsWith(".xlsx"))
      .map((file, index) => ({
        id: index + 1,
        name: file.replace(".xls", "").replace(".xlsx", ""),
        url: `/templates/${file}`,
        size: `${(fs.statSync(path.join(templatesDir, file)).size / 1024).toFixed(0)} KB`,
        folder: "templates"
      }));

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json(
      { error: "ไม่สามารถอ่านไฟล์ได้" },
      { status: 500 }
    );
  }
}
