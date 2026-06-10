import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  const files = fs.readdirSync(templatesDir)
    .filter(f => f.endsWith(".xls") || f.endsWith(".xlsx"))
    .map(file => {
      // ใช้ Regex ในการสกัดฟิลด์เพื่อรับรองเครื่องหมายขีดล่างหรือวงเล็บในชื่อหน่วยงาน
      const match = file.match(/^([a-zA-Z0-9]+)_(.+?)_(\d{12,14})_(.+)$/);

      let code = "";
      let timestamp = 0;
      let originalName = "";

      if (match) {
        code = match[1];
        timestamp = parseInt(match[3], 10);
        originalName = match[4];
      } else {
        const parts = file.split("_");
        code = parts[0];
        const timestampStr = parts[2];
        timestamp = parseInt(timestampStr, 10);
        originalName = parts.slice(3).join("_") || parts[1];
      }

      return {
        file,
        code,
        timestamp: isNaN(timestamp) ? 0 : timestamp,
        originalName,
        fullPath: path.join(templatesDir, file)
      };
    });

  // ✅ คัดเฉพาะไฟล์ล่าสุดต่อ หน่วยงาน + ชื่อไฟล์
  const latestMap = new Map<string, any>();

  for (const f of files) {
    const key = `${f.code.toLowerCase()}_${f.originalName.toLowerCase()}`;
    const existing = latestMap.get(key);

    if (!existing || f.timestamp > existing.timestamp) {
      latestMap.set(key, f);
    }
  }

  const latestFiles = Array.from(latestMap.values());

  // zip
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 6 } });

    archive.on("data", chunk => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const f of latestFiles) {
      archive.file(f.fullPath, { name: f.file });
    }

    archive.finalize();
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="templates.zip"',
      "Content-Length": String(buffer.byteLength),
    },
  });
}