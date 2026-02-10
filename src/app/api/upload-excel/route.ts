import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const departmentId = formData.get("departmentId") as string;
  const department = formData.get("department") as string;
  const file = formData.get("file") as File;

  if (!department || !file) {
    return NextResponse.json(
      { message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(),"public", "uploads", "excel");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const departmentPart = departmentId ? `${departmentId}` : "dept_unknown";
  const safeDepartment = department.replace(/\s+/g, "_");
  const filename = `${departmentPart}_${safeDepartment}_${Date.now()}_${file.name}`;
  const filepath = path.join(uploadDir, filename);
  console.log("Saving file to:", filepath);
  fs.writeFileSync(filepath, buffer);

  return NextResponse.json({
    message: "อัปโหลดสำเร็จ",
    filename,
  });
}
