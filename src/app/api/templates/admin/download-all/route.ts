import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public/uploads/excel");

  const zipPath = path.join(process.cwd(), "tmp");
  const zipFile = path.join(zipPath, "templates.zip");

  if (!fs.existsSync(zipPath)) {
    fs.mkdirSync(zipPath);
  }

  const output = fs.createWriteStream(zipFile);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  const files = fs.readdirSync(templatesDir)
    .filter(f => f.endsWith(".xls") || f.endsWith(".xlsx"));

  for (const file of files) {
    archive.file(
      path.join(templatesDir, file),
      { name: file }
    );
  }

  await archive.finalize();

  const zipBuffer = fs.readFileSync(zipFile);

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="templates.zip"`
    }
  });
}