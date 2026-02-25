import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  const files = fs.readdirSync(templatesDir)
    .filter(f => f.endsWith(".xls") || f.endsWith(".xlsx"))
    .map(file => {
      const [code, deptName, timestamp, ...rest] = file.split("_");

      return {
        file,
        code,
        timestamp: Number(timestamp),
        originalName: rest.join("_"),
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