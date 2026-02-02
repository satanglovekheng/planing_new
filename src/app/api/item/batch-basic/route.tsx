import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(req) {
  const pool = getPool();
  
  try {
    const body = await req.json();
    const { item_ids } = body;

    // Validation
    if (!Array.isArray(item_ids) || item_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'item_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    // ป้องกัน SQL injection & จำกัดจำนวน
    const validIds = item_ids
      .filter(id => Number.isInteger(Number(id)) && Number(id) > 0)
      .slice(0, 500); // จำกัดไม่เกิน 500 รายการต่อครั้ง

    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid item_ids provided' },
        { status: 400 }
      );
    }

    // ✅ ใช้ JOIN แทนการ query แยก -> ลด query จาก 4N เหลือ 1 query!
    const sql = `
      SELECT 
        ii.item_id,
        ii.item_name,
        ii.item_unit,
        ii.item_code,
        tp.item_type_name,
        sc.stock_class_name,
        sbc.stock_sub_class_name,
        ed.stock_item_ed_type_name
      FROM stock_item ii
      LEFT JOIN stock_item_type tp ON tp.item_type = ii.item_type
      LEFT JOIN stock_class sc ON ii.stock_class_id = sc.stock_class_id
      LEFT JOIN stock_sub_class sbc ON ii.stock_sub_class_id = sbc.stock_sub_class_id
      LEFT JOIN stock_item_ed_type ed ON ii.stock_item_ed_type_id = ed.stock_item_ed_type_id
      WHERE ii.item_use_status = 'Y' 
        AND ii.item_id = ANY($1::int[])
    `;

    const { rows } = await pool.query(sql, [validIds]);

    // แปลง array เป็น object { item_id: {...data} }
    const result = {};
    rows.forEach(row => {
      result[row.item_id] = {
        item_id: row.item_id,
        item_name: row.item_name,
        item_unit: row.item_unit,
        item_code: row.item_code,
        item_type_name: row.item_type_name || null,
        stock_class_name: row.stock_class_name || null,
        stock_sub_class_name: row.stock_sub_class_name || null,
        stock_item_ed_type_name: row.stock_item_ed_type_name || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      total: rows.length,
      requested: validIds.length
    });

  } catch (e) {
    console.error('batch-basic error:', e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}