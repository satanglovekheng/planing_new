// app/api/plan-summary/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const sql = `
    SELECT
      l.stock_plan_id,
      p.bdg_year,
      p.department_id,
      d.department_name,
      l.item_type_name,
      l.input_type,
      SUM(l.total_amount) AS total_amount_sum
    FROM
      stock_dep_plan_list_approved AS l
    JOIN
      stock_dep_plan AS p
      ON l.stock_plan_id = p.stock_plan_id
    JOIN
      stock_department AS d
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
    const pool = getPool();
    const { rows } = await pool.query(sql);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('plan-summary error', e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
