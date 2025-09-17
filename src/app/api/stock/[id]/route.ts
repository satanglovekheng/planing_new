// src/app/api/stock/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const pool = getPool();

// ชุดฟิลด์ที่อนุญาตให้แก้ไขเท่านั้น (กัน user ส่งคีย์แปลกๆ)
const ALLOWED_COLS = new Set<string>([
  "item_name",
  "item_unit",
  "unit_cost",
  "unit_qty",
  "period1_qty",
  "period2_qty",
  "period3_qty",
  "period4_qty",
  "total_qty",
  "period1_amount",
  "period2_amount",
  "period3_amount",
  "period4_amount",
  "total_amount",
  "last_1_year_qty",
  "last_2_year_qty",
  "last_3_year_qty",
  "current_qty",
  "inc_percent",
  "period1_po_qty",
  "period2_po_qty",
  "period3_po_qty",
  "period4_po_qty",
  "period1_po_amount",
  "period2_po_amount",
  "period3_po_amount",
  "period4_po_amount",
  "total_po_qty",
  "total_po_amount",
  "year_qty",
  "incoming_balance_qty",
  "stock_item_unit_id",
  "manual_calc",
  "package_unit_cost",
  "package_incoming_balance_qty",
  "package_current_qty",
  "package_total_qty",
  "package_total_amount",
  "package_period1_qty",
  "package_period2_qty",
  "package_period3_qty",
  "package_period4_qty",
  "forcast_qty",
  "stock_sub_class_name",
  "stock_class_name",
  "stock_item_ed_type_name",
]);

/** GET /api/stock/[id]  → อ่านรายการเดียว */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "invalid id" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM stock_dep_plan_list WHERE stock_plan_list_id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error("[GET stock item] error:", err);
    return NextResponse.json({ success: false, error: "server error" }, { status: 500 });
  }
}

/** PUT /api/stock/[id]  → อัปเดตรายการเดียว */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "invalid body" }, { status: 400 });
  }

  // คัดเฉพาะฟิลด์ที่อนุญาต และตัดคีย์ที่ undefined ออก
  const entries = Object.entries(body).filter(
    ([k, v]) => ALLOWED_COLS.has(k) && v !== undefined
  );

  if (entries.length === 0) {
    return NextResponse.json({ success: false, error: "no fields to update" }, { status: 400 });
  }

  // ประกอบ SET แบบ parameterized
  // ex: SET item_name=$1, unit_cost=$2, ... WHERE stock_plan_list_id=$N
  const setFragments: string[] = [];
  const values: any[] = [];
  for (const [k, v] of entries) {
    setFragments.push(`${k} = $${values.length + 1}`);
    values.push(v);
  }
  values.push(id); // พารามิเตอร์ตัวสุดท้ายสำหรับ WHERE

  const sql = `
    UPDATE stock_dep_plan_list
       SET ${setFragments.join(", ")}
     WHERE stock_plan_list_id = $${values.length}
     RETURNING *;
  `;

  try {
    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error("[PUT stock item] error:", err);
    return NextResponse.json({ success: false, error: err?.message || "server error" }, { status: 500 });
  }
}
