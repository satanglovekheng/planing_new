import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(_req, { params }) {
  const { id } = params; // item_id

  const sql = `
    SELECT u.stock_item_unit_id, u.item_unit_name, u.unit_qty
    FROM stock_item_unit u
    JOIN stock_item ii ON ii.item_id = u.item_id
    WHERE ii.item_use_status = 'Y'
      AND u.item_unit_status = '1'
      AND ii.item_id = $1
    ORDER BY u.item_unit_name
  `;

  try {
    const pool = getPool();
    const { rows } = await pool.query(sql, [id]);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('item units error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}