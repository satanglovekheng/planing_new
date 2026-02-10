// app/api/plan-summary/route.js
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  const sql = `
SELECT
  l.stock_plan_id,
  p.bdg_year,
  p.department_id,
  d.department_name,
  l.item_type_name,
  l.input_type,


  SUM(l.total_amount) AS total_amount_sum,


  (
    CASE WHEN MAX(l.app_user_1) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN MAX(l.app_user_2) IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN MAX(l.app_user_3) IS NOT NULL THEN 1 ELSE 0 END
  ) AS approve_count,


  MAX(l.app_user_1) AS app_user_1,
  MAX(l.app_date_1) AS app_date_1,
  MAX(l.app_time_1) AS app_time_1,

  MAX(l.app_user_2) AS app_user_2,
  MAX(l.app_date_2) AS app_date_2,
  MAX(l.app_time_2) AS app_time_2,

  MAX(l.app_user_3) AS app_user_3,
  MAX(l.app_date_3) AS app_date_3,
  MAX(l.app_time_3) AS app_time_3,

  MAX(l.status) AS status

FROM stock_dep_plan_list_approved AS l
JOIN stock_dep_plan AS p
  ON l.stock_plan_id = p.stock_plan_id
JOIN stock_department AS d
  ON p.department_id = d.department_id

WHERE
  l.item_type_name IS NOT NULL
  AND l.input_type IS NOT NULL

GROUP BY
  l.stock_plan_id,
  p.bdg_year,
  p.department_id,
  d.department_name,
  l.item_type_name,
  l.input_type

ORDER BY
  p.bdg_year,
  d.department_name,
  l.item_type_name;
  `;

  try {
    const pool = await getPool();
    const { rows } = await pool.query(sql);

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (e) {
    console.error("plan-summary error", e);
    return NextResponse.json(
      {
        success: false,
        error: e.message,
      },
      { status: 500 }
    );
  }
}
