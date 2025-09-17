// src/app/api/stock/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

type SortKey = "item_name" | "item_unit" | "item_type_name";
const SORT_MAP: Record<SortKey, string> = {
  item_name: "l.item_name",
  item_unit: "l.item_unit",
  item_type_name: "l.item_type_name",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const depID = Number(body.depID);
    const q: string = (body.q ?? "").toString().trim();
    const sortKey: SortKey = (body.sortKey as SortKey) || "item_name";
    const sortDir: "asc" | "desc" = body.sortDir === "desc" ? "desc" : "asc";
    const page = Math.max(1, Number(body.page) || 1);
    const pageSize = Math.min(500, Math.max(1, Number(body.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    if (!depID) {
      return NextResponse.json(
        { success: false, error: "department_id is required" },
        { status: 400 }
      );
    }

    // ป้องกัน ORDER BY injection
    const orderByCol = SORT_MAP[sortKey] ?? "l.item_name";
    const orderDir = sortDir === "desc" ? "DESC" : "ASC";

    const pool = getPool();

    // สร้างคำค้นแบบ ILIKE
    const needle = q ? `%${q}%` : null;

    const sql = `
      SELECT
        l.stock_plan_list_id,
        l.item_name,
        l.item_unit,
        l.item_type_name,
        COUNT(*) OVER() AS total_count
      FROM stock_dep_plan p
      JOIN stock_dep_plan_list l ON l.stock_plan_id = p.stock_plan_id
      WHERE p.department_id = $1
        AND (
          $2::text IS NULL
          OR l.item_name ILIKE $2
          OR l.item_unit ILIKE $2
          OR l.item_type_name ILIKE $2
        )
      ORDER BY ${orderByCol} ${orderDir} NULLS LAST
      LIMIT $3 OFFSET $4
    `;

    const { rows } = await pool.query(sql, [depID, needle, pageSize, offset]);

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: {
        rows: rows.map((r) => ({
          stock_plan_list_id: r.stock_plan_list_id,
          item_name: r.item_name,
          item_unit: r.item_unit,
          item_type_name: r.item_type_name,
        })),
        total,
        page,
        pageSize,
      },
    });
  } catch (e: any) {
    console.error("stock api error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
