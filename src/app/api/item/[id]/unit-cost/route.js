// app/api/item/[id]/unit-cost/route.js
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(req, ctx) {
  const { id } = await ctx.params;        // ⬅️ ต้อง await
  const itemId = Number(id);

  const { searchParams } = new URL(req.url);
  const unitId = Number(searchParams.get('unitId') ?? '');

  console.log('unit-cost itemId', itemId, 'unitId', unitId);
  if (!Number.isFinite(itemId) || !Number.isFinite(unitId)) {
    return NextResponse.json(
      { success: false, error: 'missing itemId or unitId' },
      { status: 400 }
    );
  }

  const sql = `
    SELECT pd.stock_pkg_before_disc_price / u.unit_qty AS unit_price
    FROM stock_po_detail pd
    JOIN stock_po po ON pd.stock_po_id = po.stock_po_id
    JOIN stock_item_unit u ON pd.stock_item_unit_id = u.stock_item_unit_id
    WHERE pd.item_id = $1
      AND po.stock_po_date <= CURRENT_DATE
      AND po.po_type_id = 1
    ORDER BY po.stock_po_date DESC, pd.stock_po_id DESC
    LIMIT 1
  `;

  try {
    const pool = getPool();
    // ⬇️ $1 ต้องเป็น itemId ไม่ใช่ itemUnit
    const { rows } = await pool.query(sql, [itemId]);
    const unit_price = rows?.[0]?.unit_price ?? null;

    return NextResponse.json({ success: true, data: { unit_cost: unit_price } });
  } catch (e) {
    console.error('unit-cost error', e);
    return NextResponse.json({ success: false, error: e?.message ?? 'DB error' }, { status: 500 });
  }
}
