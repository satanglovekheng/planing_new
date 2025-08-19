// app/api/items/search/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(Number(searchParams.get('limit') || 20), 100);
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0);
  const warehouseId = searchParams.get('warehouseId'); // ทางเลือก หากต้องกรองคลัง

  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  // ใช้ ILIKE (case-insensitive) และ parameterized query ปลอดภัย
  const sql = `
    SELECT ii.item_id, ii.item_name, ii.item_unit
    FROM stock_item_warehouse iw
    JOIN stock_item ii ON iw.item_id = ii.item_id
    WHERE ii.item_use_status = 'Y'
      AND (
        CAST(ii.item_id AS TEXT) ILIKE '%' || $1 || '%'
        OR ii.item_name ILIKE '%' || $1 || '%'
      )
      ${warehouseId ? 'AND iw.warehouse_id = $4' : ''}
    ORDER BY ii.item_name
    LIMIT $2 OFFSET $3
  `;

  try {
    const pool = getPool();
    const params = [q, limit, offset];
    if (warehouseId) params.push(Number(warehouseId));

    const { rows } = await pool.query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('items search error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}