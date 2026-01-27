// app/api/items/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const sql = `
    SELECT ii.item_id, ii.item_name, ii.item_unit
    FROM stock_item_warehouse iw
    JOIN stock_item ii ON iw.item_id = ii.item_id
    WHERE ii.item_use_status = 'Y'
    ORDER BY iw.warehouse_id, ii.item_name
  `;
  try {
    const pool = getPool();
    const { rows } = await pool.query(sql);
    console.log('items rows', rows.length);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('items error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}