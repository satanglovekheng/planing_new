import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(_req, { params }) {
  const { id } = params; // item_id
  const pool = getPool();

  try {
    const baseSql = `
      SELECT ii.item_id, ii.item_name, ii.item_unit, tp.item_type_name
      FROM stock_item ii
      JOIN stock_item_type tp ON tp.item_type = ii.item_type
      WHERE ii.item_use_status = 'Y' AND ii.item_id = $1
      LIMIT 1
    `;
    const { rows: baseRows } = await pool.query(baseSql, [id]);
    if (baseRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const base = baseRows[0];

    const { rows: classRows } = await pool.query(
      `SELECT sc.stock_class_name
       FROM stock_item ii
       JOIN stock_class sc ON ii.stock_class_id = sc.stock_class_id
       WHERE ii.item_id = $1
       LIMIT 1`, [id]
    );

    const { rows: subClassRows } = await pool.query(
      `SELECT sbc.stock_sub_class_name
       FROM stock_item ii
       JOIN stock_sub_class sbc ON ii.stock_sub_class_id = sbc.stock_sub_class_id
       WHERE ii.item_id = $1
       LIMIT 1`, [id]
    );

    const { rows: edRows } = await pool.query(
      `SELECT ed.stock_item_ed_type_name
       FROM stock_item ii
       JOIN stock_item_ed_type ed ON ii.stock_item_ed_type_id = ed.stock_item_ed_type_id
       WHERE ii.item_id = $1
       LIMIT 1`, [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...base,
        stock_class_name: classRows[0]?.stock_class_name ?? null,
        stock_sub_class_name: subClassRows[0]?.stock_sub_class_name ?? null,
        stock_item_ed_type_name: edRows[0]?.stock_item_ed_type_name ?? null,
      },
    });
  } catch (e) {
    console.error('item basic error', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}