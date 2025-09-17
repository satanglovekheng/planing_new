// app/api/budget-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

type Payload = {
  meta: {
    bdg_year: string | null;
    department_id: number | null;
    as_of_date: string | null;
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
  const body = (await req.json()) as Payload;

  // --------- Validate ---------
  if (!body?.meta?.bdg_year || !body?.meta?.department_id) {
    return NextResponse.json({ success: false, error: 'ต้องมี bdg_year และ department_id' }, { status: 400 });
  }
  if (!body?.item?.item_id) {
    return NextResponse.json({ success: false, error: 'ต้องมี item_id' }, { status: 400 });
  }

  const bdg_year = body.meta.bdg_year!;
  const department_id = Number(body.meta.department_id);
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // ---------- 1) GET or INSERT stock_dep_plan (ไม่ใช้ ON CONFLICT) ----------
      // ใช้ advisory lock ตามคู่ (ปี, แผนก) กันแข่งกันสร้าง plan ซ้ำ
      const yearKey = Number(String(bdg_year).replace(/\D/g, '')) || 0; // แปลงปีเป็นเลข int4
      await client.query('SELECT pg_advisory_xact_lock($1::int4, $2::int4)', [yearKey, department_id]);

      // หาว่ามี plan อยู่แล้วไหม
      const planSel = await client.query<{ stock_plan_id: number }>(
        `SELECT stock_plan_id
         FROM stock_dep_plan
         WHERE bdg_year = $1 AND department_id = $2
         LIMIT 1`,
        [bdg_year, department_id]
      );

      let stock_plan_id: number;
      if (planSel.rowCount && planSel.rows[0]) {
        stock_plan_id = planSel.rows[0].stock_plan_id;
      } else {
        const planIns = await client.query<{ stock_plan_id: number }>(
          `INSERT INTO stock_dep_plan (bdg_year, department_id)
           VALUES ($1, $2)
           RETURNING stock_plan_id`,
          [bdg_year, department_id]
        );
        stock_plan_id = planIns.rows[0].stock_plan_id;
      }

      // ---------- 2) เตรียมข้อมูลสำหรับ stock_dep_plan_list ----------
      const b = body;
      const stock_item_unit_id = (b.item?.stock_item_unit_id ?? 0) as number; // normalize

      const list: Record<string, any> = {
        stock_plan_id,
        item_id: b.item?.item_id ?? null,

        item_name: b.item?.basic?.item_name ?? null,
        item_unit: b.item?.basic?.item_unit ?? null,
        item_type_name: b.item?.basic?.item_type_name ?? null,
        stock_sub_class_name: b.item?.basic?.stock_sub_class_name ?? null,
        stock_class_name: b.item?.basic?.stock_class_name ?? null,
        stock_item_ed_type_name: b.item?.basic?.stock_item_ed_type_name ?? null,

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

        last_1_year_qty: b.history?.last_1_year_qty ?? null,
        last_2_year_qty: b.history?.last_2_year_qty ?? null,
        last_3_year_qty: b.history?.last_3_year_qty ?? null,
        current_qty: b.current_qty ?? null,

        unit_cost: b.item?.unit_cost ?? null,
        stock_item_unit_id, // normalized
        unit_qty: b.item?.unit_qty ?? null,
      };

      if (!list.item_id) {
        throw new Error('ต้องมี item_id ในการบันทึก stock_dep_plan_list');
      }

      // ลบ key ที่เป็น null/undefined/'' (ยกเว้นคีย์หลัก 3 ตัว)
      Object.keys(list).forEach((k) => {
        if (['stock_plan_id', 'item_id', 'stock_item_unit_id'].includes(k)) return;
        const v = list[k];
        if (v === null || v === undefined || v === '') delete list[k];
      });

      // ---------- 3) ถ้ามีรายการเดิม → UPDATE ----------
      const existsRes = await client.query<{ stock_plan_list_id: number }>(
        `SELECT stock_plan_list_id
         FROM stock_dep_plan_list
         WHERE stock_plan_id = $1
           AND item_id = $2
           AND COALESCE(stock_item_unit_id,0) = COALESCE($3,0)
         LIMIT 1`,
        [stock_plan_id, list.item_id, stock_item_unit_id]
      );

      if (existsRes.rowCount) {
        const updatableCols = Object.keys(list).filter(
          (c) => !['stock_plan_id', 'item_id', 'stock_item_unit_id'].includes(c)
        );

        if (updatableCols.length === 0) {
          await client.query('COMMIT');
          return NextResponse.json({
            success: true,
            data: { stock_plan_id, stock_plan_list_id: existsRes.rows[0].stock_plan_list_id, mode: 'update-skip' },
          });
        }

        const setSql = updatableCols.map((c, i) => `${c} = $${i + 1}`).join(', ');
        const setValues = updatableCols.map((c) => list[c]);
        const stock_plan_list_id = existsRes.rows[0].stock_plan_list_id;

        const updateSql = `
          UPDATE stock_dep_plan_list
          SET ${setSql}
          WHERE stock_plan_list_id = $${updatableCols.length + 1}
          RETURNING stock_plan_list_id
        `;
        const updateRes = await client.query(updateSql, [...setValues, stock_plan_list_id]);

        await client.query('COMMIT');
        return NextResponse.json({
          success: true,
          data: { stock_plan_id, stock_plan_list_id: updateRes.rows[0].stock_plan_list_id, mode: 'updated', updated_columns: updatableCols },
        });
      }

      // ---------- 4) INSERT ใหม่แบบ “กันชน PK” ----------
      // ล็อกช่วง generate id (กันคอนเคอร์เรนซ์)
      await client.query('SELECT pg_advisory_xact_lock($1::int4, $2::int4)', [8991, 2]);

      // ชื่อ sequence ของคอลัมน์ PK
      const seqRes = await client.query<{ seq_name: string }>(
        `SELECT pg_get_serial_sequence('public.stock_dep_plan_list','stock_plan_list_id') AS seq_name`
      );
      const seqName = seqRes.rows[0]?.seq_name;
      if (!seqName) {
        throw new Error('ไม่พบ sequence ของ stock_dep_plan_list.stock_plan_list_id');
      }

      // MAX id ปัจจุบัน
      const maxRes = await client.query<{ max_id: string }>(
        `SELECT COALESCE(MAX(stock_plan_list_id), 0)::bigint AS max_id FROM public.stock_dep_plan_list`
      );
      const maxId = BigInt(maxRes.rows[0].max_id);

      // nextval() จนกว่าจะมากกว่า MAX(id)
      let newId: bigint = 0n;
      while (true) {
        const nres = await client.query<{ id: string }>(`SELECT nextval($1)::bigint AS id`, [seqName]);
        newId = BigInt(nres.rows[0].id);
        if (newId > maxId) break;
      }

      // ใส่ id ที่หาเองลงไป
      (list as any).stock_plan_list_id = Number(newId);

      // สร้าง INSERT แบบไดนามิก
      const cols = Object.keys(list);
      const values = cols.map((k) => list[k]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

      const insertListSql = `
        INSERT INTO stock_dep_plan_list (${cols.join(', ')})
        VALUES (${placeholders})
        RETURNING stock_plan_list_id
      `;
      const insRes = await client.query(insertListSql, values);
      const stock_plan_list_id = insRes.rows[0].stock_plan_list_id;

      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        data: { stock_plan_id, stock_plan_list_id, mode: 'inserted', inserted_columns: cols },
      });
    } catch (err: any) {
      try { await client.query('ROLLBACK'); } catch {}
      // ถ้าเจอชน PK ก็จะรีทรายทั้งรอบ (แต่ด้วยวิธีนี้ ไม่น่าเจอแล้ว)
      const isPKDup = err?.code === '23505';
      if (isPKDup && attempt < MAX_RETRIES) {
        // ลองใหม่
        client.release();
        continue;
      }
      console.error('budget-requests POST error:', err);
      return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
    } finally {
      client.release();
    }
  }

  // ปกติจะไม่ถึงตรงนี้
  return NextResponse.json({ success: false, error: 'too many retries' }, { status: 500 });
}
