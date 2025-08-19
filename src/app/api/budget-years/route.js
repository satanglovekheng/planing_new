// app/api/budget-years/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const sql = `
    SELECT bdg_year
    FROM stock_bdg_year
    WHERE status_open='Y'
    ORDER BY bdg_year DESC
  `;
  try {
    const pool = getPool();
    // ✅ ไม่มีพารามิเตอร์: เรียกแบบนี้เลย
    const { rows } = await pool.query(sql);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('budget-years error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}