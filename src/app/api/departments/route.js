// app/api/departments/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || process.env.MOCK_USER_ID;
  console.log('departments userId', userId);

  const sql = `
    SELECT d.department_name, d.department_id
    FROM stock_user_department ud
    JOIN stock_department d
      ON ud.stock_department_id = d.department_id
    WHERE ud.stock_user_id = $1
      AND d.stock_department_type_id = 1
    ORDER BY d.department_name
  `;

  try {
    const pool = getPool();
    // ถ้า ud.stock_user_id เป็น integer ใน DB แนะนำ cast ให้เป็น number
    const { rows } = await pool.query(sql, [Number(userId)]);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('departments error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
