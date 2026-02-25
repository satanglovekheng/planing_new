import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  const files = fs
    .readdirSync(templatesDir)
    .filter((f) => f.endsWith(".xls") || f.endsWith(".xlsx"));

  // zip ลง buffer เพื่อให้รู้ขนาดจริง
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 6 } });

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const file of files) {
      archive.file(path.join(templatesDir, file), { name: file });
    }

    archive.finalize();
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="templates.zip"',
      "Content-Length": String(buffer.byteLength), // ← ขนาดจริง!
    },
  });
}