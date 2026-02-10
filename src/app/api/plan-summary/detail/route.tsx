// app/api/plan-details/route.js
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const stockPlanId = searchParams.get("stock_plan_id");
  const itemTypeName = searchParams.get("item_type_name");
  const inputType = searchParams.get("input_type");

  if (!stockPlanId || !itemTypeName || !inputType) {
    return NextResponse.json(
      { success: false, error: "Missing required parameters." },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      stock_plan_list_id,
      stock_plan_id,
      item_id,
      item_name,
      item_unit,
      item_type_name,
      stock_sub_class_name,
      stock_class_name,
      stock_item_ed_type_name,
      period1_qty,
      period2_qty,
      period3_qty,
      period4_qty,
      total_qty,
      period1_amount,
      period2_amount,
      period3_amount,
      period4_amount,
      total_amount,
      last_1_year_qty,
      last_2_year_qty,
      last_3_year_qty,
      current_qty,
      unit_cost,
      stock_item_unit_id,
      unit_qty
    FROM
      stock_dep_plan_list_approved
    WHERE
      stock_plan_id = $1
      AND item_type_name = $2
      AND input_type = $3
    ORDER BY
      item_name;
  `;

  try {
    const pool = getPool();
    const { rows } = await pool.query(sql, [
      Number(stockPlanId),
      itemTypeName,
      inputType,
    ]);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error("plan-details error", e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
