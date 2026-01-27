// app/api/budget-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import type { Pool, PoolClient, QueryResult } from "pg";

// ---------- Types ----------
type BasicInfo = {
  item_id: number;
  item_name: string;
  item_unit: string;
  item_type_name: string | null;
  stock_class_name: string | null;
  stock_sub_class_name: string | null;
  stock_item_ed_type_name: string | null;
} | null;

type SinglePayload = {
  meta: {
    bdg_year: string | null;
    department_id: number | null;
    as_of_date?: string | null;
  };
  item: {
    item_id: number | null;
    stock_item_unit_id: number | string | null; // รับได้ทั้ง id หรือ "ชื่อหน่วย"
    unit_qty: number | null;
    unit_cost: number | null;
    basic?: BasicInfo;
  };
  periods: {
    qty: {
      q1: number | null;
      q2: number | null;
      q3: number | null;
      q4: number | null;
      total: number | null;
    };
    amount: {
      q1: number | null;
      q2: number | null;
      q3: number | null;
      q4: number | null;
      total: number | null;
    };
  };
  history: {
    last_1_year_qty: number | null;
    last_2_year_qty: number | null;
    last_3_year_qty: number | null;
  };
  current_qty: number | null;
  input_type: string | null;
};

type BatchPayload = SinglePayload[];

type UpsertOk = {
  success: true;
  data: {
    stock_plan_id: number;
    stock_plan_list_id: number;
    mode: "updated" | "inserted" | "update-skip";
    updated_columns?: string[];
    inserted_columns?: string[];
  };
};

type UpsertFail = { success: false; error: string };

type UpsertResult = UpsertOk | UpsertFail;

// ---------- Helpers ----------
const asInt = (v: any, d: number | null = null): number | null => {
  if (v === null || v === undefined || v === "") return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// query helper ให้ได้ generic เสมอ (ตัดปัญหา Untyped function ...)
const q =
  <T>(client: PoolClient) =>
  (sql: string, params?: any[]): Promise<QueryResult<T>> =>
    client.query(sql, params) as unknown as Promise<QueryResult<T>>;

/**
 * แก้ให้คืนค่า unit_id ถูกต้อง:
 * - ถ้า input เป็น number -> คืนเลย
 * - ถ้าเป็นชื่อหน่วย -> ค้นหาโดย trim เทียบกับ item_unit_name
 * NOTE: เลือกมาเป็น alias "unit_id" แล้วอ่าน rows[0]?.unit_id ได้ตรง ๆ
 */
async function resolveUnitId(
  client: PoolClient,
  provided: number | string | null
): Promise<number | null> {
  if (provided === null || provided === undefined || provided === "")
    return null;
  if (typeof provided === "number" && Number.isFinite(provided))
    return provided;

  const name = String(provided).trim();
  if (!name) return null;

  const { rows } = await q<{ unit_id: number }>(client)(
    `
      SELECT stock_item_unit_id AS unit_id
        FROM stock_item_unit
       WHERE TRIM(item_unit_name) = TRIM($1)
       ORDER BY stock_item_unit_id ASC
       LIMIT 1
    `,
    [name]
  );
  return rows[0]?.unit_id ?? null;
}

/**
 * ใช้ UPSERT สำหรับ stock_dep_plan เพื่อกัน race:
 * ต้องมี unique index: UNIQUE(bdg_year, department_id)
 *   CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_dep_plan_year_dept
 *   ON stock_dep_plan(bdg_year, department_id);
 */
async function ensureStockPlan(
  client: PoolClient,
  bdg_year: string,
  department_id: number
): Promise<number> {
  // ใช้ CTE: ถ้าไม่มีแถว → insert แล้ว RETURNING; ถ้ามีอยู่แล้ว → select เอา id เดิม
  const sql = `
    WITH ins AS (
      INSERT INTO stock_dep_plan (bdg_year, department_id)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1
        FROM stock_dep_plan
        WHERE bdg_year = $1 AND department_id = $2
      )
      RETURNING stock_plan_id
    )
    SELECT stock_plan_id FROM ins
    UNION ALL
    SELECT stock_plan_id
    FROM stock_dep_plan
    WHERE bdg_year = $1 AND department_id = $2
    LIMIT 1;
  `;

  const res = await q<{ stock_plan_id: number }>(client)(sql, [
    bdg_year,
    department_id,
  ]);

  if (res.rows.length === 0) {
    throw new Error("ไม่พบหรือสร้าง stock_dep_plan ไม่สำเร็จ");
  }
  return res.rows[0].stock_plan_id;
}

async function upsertOne(
  client: PoolClient,
  body: SinglePayload
): Promise<UpsertResult> {
  // --------- Validate ---------
  if (!body?.meta?.bdg_year || !body?.meta?.department_id) {
    return { success: false, error: "ต้องมี bdg_year และ department_id" };
  }
  if (!body?.item?.item_id) {
    return { success: false, error: "ต้องมี item_id" };
  }

  const bdg_year = body.meta.bdg_year!;
  const department_id = Number(body.meta.department_id);

  // ---------- 1) ล็อกแบบเบา ๆ กันชนต่อแถวเดียว (optional) ----------
  const yearKey = Number(String(bdg_year).replace(/\D/g, "")) || 0;
  await client.query("SELECT pg_advisory_xact_lock($1::int4, $2::int4)", [
    yearKey,
    department_id,
  ]);

  // ---------- 2) GET/UPSERT stock_dep_plan ----------
  const stock_plan_id = await ensureStockPlan(client, bdg_year, department_id);

  // ---------- 3) เตรียม list ----------
  const b = body;
  const stock_item_unit_id = await resolveUnitId(
    client,
    b.item?.stock_item_unit_id ?? null
  );

  const list: Record<string, any> = {
    stock_plan_id,
    item_id: b.item?.item_id ?? null,

    item_name: b.item?.basic?.item_name ?? null,
    item_unit: b.item?.basic?.item_unit ?? null,
    item_type_name: b.item?.basic?.item_type_name ?? null,
    stock_sub_class_name: b.item?.basic?.stock_sub_class_name ?? null,
    stock_class_name: b.item?.basic?.stock_class_name ?? null,
    stock_item_ed_type_name: b.item?.basic?.stock_item_ed_type_name ?? null,

    period1_qty: asInt(b.periods?.qty?.q1),
    period2_qty: asInt(b.periods?.qty?.q2),
    period3_qty: asInt(b.periods?.qty?.q3),
    period4_qty: asInt(b.periods?.qty?.q4),
    total_qty: asInt(b.periods?.qty?.total),

    period1_amount: asInt(b.periods?.amount?.q1),
    period2_amount: asInt(b.periods?.amount?.q2),
    period3_amount: asInt(b.periods?.amount?.q3),
    period4_amount: asInt(b.periods?.amount?.q4),
    total_amount: asInt(b.periods?.amount?.total),
    last_1_year_qty: asInt(b.history?.last_1_year_qty),
    last_2_year_qty: asInt(b.history?.last_2_year_qty),
    last_3_year_qty: asInt(b.history?.last_3_year_qty),
    current_qty: asInt(b.current_qty),

    unit_cost: asInt(b.item?.unit_cost),
    stock_item_unit_id: asInt(stock_item_unit_id),
    unit_qty: asInt(b.item?.unit_qty),
    input_type:  b.input_type,
  };

  console.log("Upsert stock_dep_plan_list_approved:", list);
  if (!list.item_id) {
    return {
      success: false,
      error: "ต้องมี item_id ในการบันทึก stock_dep_plan_list",
    };
  }

  // ลบ key ที่เป็น null/undefined/'' (ยกเว้นคีย์หลัก 3 ตัว)
  Object.keys(list).forEach((k) => {
    if (["stock_plan_id", "item_id", "stock_item_unit_id"].includes(k)) return;
    const v = list[k];
    if (v === null || v === undefined || v === "") delete list[k];
  });

  // ---------- 4) UPDATE ถ้ามีรายการเดิม ----------
  const existsRes = await q<{ stock_plan_list_id: number }>(client)(
    `
      SELECT stock_plan_list_id
        FROM stock_dep_plan_list_approved
       WHERE stock_plan_id = $1
         AND item_id = $2
         AND status = '0'
         AND COALESCE(stock_item_unit_id,0) = COALESCE($3,0)
       LIMIT 1
    `,
    [stock_plan_id, list.item_id, list.stock_item_unit_id ?? 0]
  );

  if (existsRes.rowCount) {
    const updatableCols = Object.keys(list).filter(
      (c) => !["stock_plan_id", "item_id", "stock_item_unit_id"].includes(c)
    );

    if (updatableCols.length === 0) {
      return {
        success: true,
        data: {
          stock_plan_id,
          stock_plan_list_id: existsRes.rows[0].stock_plan_list_id,
          mode: "update-skip",
        },
      };
    }

    const setSql = updatableCols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const setValues = updatableCols.map((c) => list[c]);
    const stock_plan_list_id = existsRes.rows[0].stock_plan_list_id;

    const updateSql = `
      UPDATE stock_dep_plan_list_approved
         SET ${setSql}
       WHERE stock_plan_list_id = $${updatableCols.length + 1}
       RETURNING stock_plan_list_id
    `;
    const updateRes = await client.query(updateSql, [
      ...setValues,
      stock_plan_list_id,
    ]);

    return {
      success: true,
      data: {
        stock_plan_id,
        stock_plan_list_id: updateRes.rows[0].stock_plan_list_id,
        mode: "updated",
        updated_columns: updatableCols,
      },
    };
  }

  // ---------- 5) INSERT ใหม่ ----------
  // ไม่ต้อง “กันชน PK” เอง ปล่อยให้ sequence ทำงานอัตโนมัติ
  const cols = Object.keys(list);
  const values = cols.map((k) => list[k]);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");

  const insertListSql = `
  INSERT INTO stock_dep_plan_list_approved (
    ${cols.join(", ")},status
  )
  VALUES (
    ${placeholders},'0'
  )
  RETURNING stock_plan_list_id
`;
  const insRes = await client.query(insertListSql, values);

  return {
    success: true,
    data: {
      stock_plan_id,
      stock_plan_list_id: insRes.rows[0].stock_plan_list_id,
      mode: "inserted",
      inserted_columns: cols,
    },
  };
}

// ---------- Route ----------
export async function POST(req: NextRequest) {
  const pool: Pool = getPool();
  const bodyRaw = await req.json();
  const items: SinglePayload[] = Array.isArray(bodyRaw)
    ? (bodyRaw as BatchPayload)
    : [bodyRaw];

  // validate เร็ว ๆ ระดับ request
  for (const it of items) {
    if (!it?.meta?.bdg_year || !it?.meta?.department_id) {
      return NextResponse.json(
        {
          success: false,
          error: "ต้องมี bdg_year และ department_id ในทุก payload",
        },
        { status: 400 }
      );
    }
    if (!it?.item?.item_id) {
      return NextResponse.json(
        { success: false, error: "ต้องมี item_id ในทุก payload" },
        { status: 400 }
      );
    }
  }

  const client: PoolClient = await pool.connect();
  const MAX_RETRIES = 3;

  try {
    const results: (UpsertResult & { index: number })[] = [];

    for (let i = 0; i < items.length; i++) {
      const single = items[i];
      let result: UpsertResult | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await client.query("BEGIN");
          const r = await upsertOne(client, single);
          if (!r.success) {
            await client.query("ROLLBACK");
            result = r;
            break;
          }
          await client.query("COMMIT");
          result = r;
          break;
        } catch (err: any) {
          try {
            await client.query("ROLLBACK");
          } catch {}
          const isPKDup = err?.code === "23505";
          if (isPKDup && attempt < MAX_RETRIES) {
            // เผื่อชน unique ระหว่าง batch (แม้เราจะใช้ UPDATE ก่อนแล้ว)
            continue;
          }
          result = { success: false, error: err?.message || String(err) };
          break;
        }
      }

      results.push({ ...(result as UpsertResult), index: i });
    }

    // single → คงรูปแบบ {success, data}
    if (!Array.isArray(bodyRaw) && results.length === 1) {
      const r0 = results[0];
      if (r0.success)
        return NextResponse.json({ success: true, data: r0.data });
      return NextResponse.json(
        { success: false, error: r0.error },
        { status: 500 }
      );
    }

    // batch → ส่ง results[]
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
