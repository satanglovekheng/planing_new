// app/api/budget-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

type Payload = {
  meta: {
    bdg_year: string | null;
    department_id: number | null;
    as_of_date: string | null; // ใช้บนฟรอนต์อ้างอิงราคาได้ แต่ตาราง stock_dep_plan ไม่มีคอลัมน์นี้
  };
  item: {
    item_id: number | null;
    stock_item_unit_id: number | null;
    unit_qty: number | null;
    unit_cost: number | null;
    basic?: {
      item_id: number;
      item_name: string;
      item_unit: string;
      item_type_name: string | null;
      stock_class_name: string | null;
      stock_sub_class_name: string | null;
      stock_item_ed_type_name: string | null;
    } | null;
  };
  periods: {
    qty: { q1: number | null; q2: number | null; q3: number | null; q4: number | null; total: number | null };
    amount: { q1: number | null; q2: number | null; q3: number | null; q4: number | null; total: number | null };
  };
  history: {
    last_1_year_qty: number | null;
    last_2_year_qty: number | null;
    last_3_year_qty: number | null;
  };
  current_qty: number | null;
};

export async function POST(req: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = (await req.json()) as Payload;

    // --------- Validate เบื้องต้น ---------
    if (!body?.meta?.bdg_year || !body?.meta?.department_id) {
      return NextResponse.json({ success: false, error: 'ต้องมี bdg_year และ department_id' }, { status: 400 });
    }

    await client.query('BEGIN');

    const bdg_year = body.meta.bdg_year;
    const department_id = Number(body.meta.department_id);
    // const as_of_date = body.meta.as_of_date;  // ❗ ไม่ได้ใช้ใน stock_dep_plan เพราะตารางไม่มีคอลัมน์นี้

    // --------- 1) UPSERT stock_dep_plan และคืน stock_plan_id ----------
    // ต้องมี unique constraint: UNIQUE (bdg_year, department_id)
    // DO UPDATE เซ็ตค่าเดิมกลับไป (ไม่เปลี่ยนข้อมูล แต่ทำให้ RETURNING ใช้ได้ทั้ง insert/update)
    const upsertSql = `
    WITH ins AS (
      INSERT INTO stock_dep_plan (bdg_year, department_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING stock_plan_id
    )
    SELECT stock_plan_id FROM ins
    UNION ALL
    SELECT stock_plan_id FROM stock_dep_plan WHERE bdg_year = $1 AND department_id = $2
    LIMIT 1
    `;
    const upsertRes = await client.query(upsertSql, [bdg_year, department_id]);
    const stock_plan_id: number = upsertRes.rows[0].stock_plan_id;

    // --------- 2) เตรียมข้อมูลสำหรับ stock_dep_plan_list (เฉพาะคอลัมน์ที่มีค่า) ----------
    const b = body;
    const list: Record<string, any> = {
      stock_plan_id,

      // item/basic
      item_id: b.item?.item_id ?? null,
      item_name: b.item?.basic?.item_name ?? null,
      item_unit: b.item?.basic?.item_unit ?? null,
      item_type_name: b.item?.basic?.item_type_name ?? null,
      stock_sub_class_name: b.item?.basic?.stock_sub_class_name ?? null,
      stock_class_name: b.item?.basic?.stock_class_name ?? null,
      stock_item_ed_type_name: b.item?.basic?.stock_item_ed_type_name ?? null,

      // ปริมาณ/จำนวนเงินรายไตรมาส
      period1_qty: b.periods?.qty?.q1 ?? null,
      period2_qty: b.periods?.qty?.q2 ?? null,
      period3_qty: b.periods?.qty?.q3 ?? null,
      period4_qty: b.periods?.qty?.q4 ?? null,
      total_qty:  b.periods?.qty?.total ?? null,

      period1_amount: b.periods?.amount?.q1 ?? null,
      period2_amount: b.periods?.amount?.q2 ?? null,
      period3_amount: b.periods?.amount?.q3 ?? null,
      period4_amount: b.periods?.amount?.q4 ?? null,
      total_amount:  b.periods?.amount?.total ?? null,

      // ประวัติ/คงคลัง
      last_1_year_qty: b.history?.last_1_year_qty ?? null,
      last_2_year_qty: b.history?.last_2_year_qty ?? null,
      last_3_year_qty: b.history?.last_3_year_qty ?? null,
      current_qty: b.current_qty ?? null,

      // ราคาต่อหน่วยและหน่วยบรรจุ
      unit_cost: b.item?.unit_cost ?? null,
      stock_item_unit_id: b.item?.stock_item_unit_id ?? null,
      unit_qty: b.item?.unit_qty ?? null,
    };

    // ต้องมี item_id เสมอ
    if (!list.item_id) {
      throw new Error('ต้องมี item_id ในการบันทึก stock_dep_plan_list');
    }

    // ลบ key ที่เป็น null/undefined/'' เพื่อไม่ใส่ลง INSERT (คอลัมน์จะสั้นลง)
    Object.keys(list).forEach((k) => {
      const v = list[k];
      if (v === null || v === undefined || v === '') delete list[k];
    });

    const cols = Object.keys(list);
    const values = cols.map((k) => list[k]);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

    const insertListSql = `
      INSERT INTO stock_dep_plan_list (${cols.join(', ')})
      VALUES (${placeholders})
      RETURNING stock_plan_list_id
    `;
    const insListRes = await client.query(insertListSql, values);
    const stock_plan_list_id: number = insListRes.rows[0].stock_plan_list_id;

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        stock_plan_id,
        stock_plan_list_id,
        inserted_columns: cols, // debug: ดูว่าลงคอลัมน์ใดบ้าง
      },
    });
  } catch (err: any) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('budget-requests POST error:', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}
