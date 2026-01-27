import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

interface RankingUpdate {
  stock_plan_list_id: number;
  unit_cost: number;
}


const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  export async function OPTIONS() {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
/* =======================
   GET : ดึงข้อมูลมาแสดง
   - เรียงตาม unit_cost ASC (แสดงรายการที่จัดอันดับก่อน)
======================= */
export async function GET() {
  try {
    const pool = await getPool();
    const sql = `
      SELECT
        stock_plan_list_id,
        item_name,
        item_unit,
        period1_qty,
        total_qty,
        item_type_name,
        app_date_1,
        unit_cost
      FROM stock_dep_plan_list_approved
      WHERE stock_plan_id = 0
      ORDER BY 
        CASE 
          WHEN unit_cost IS NULL THEN 1 
          ELSE 0 
        END,
        unit_cost ASC,
        app_date_1 DESC
    `;
    const { rows } = await pool.query(sql);
    return NextResponse.json(rows, { headers: corsHeaders });
  } catch (error) {
    console.error("SELECT ERROR:", error);
    return NextResponse.json(
        { message: "ไม่สามารถดึงข้อมูลได้" },
        { status: 500, headers: corsHeaders }
      );
  }
}

/* =======================
   POST : อัพเดตลำดับอันดับ (unit_cost)
   - ใช้ stock_plan_list_id ในการอัพเดต
======================= */
export async function POST(req: Request) {
  try {
    const body: RankingUpdate[] = await req.json();

    // ต้องเป็น array เท่านั้น
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "รูปแบบข้อมูลไม่ถูกต้อง (ต้องเป็น array)" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // SQL สำหรับอัพเดต unit_cost
    const sql = `
      UPDATE stock_dep_plan_list_approved
      SET unit_cost = $1
      WHERE stock_plan_list_id = $2 AND stock_plan_id = 0
    `;

    let success = 0;
    let failed: RankingUpdate[] = [];

    for (const item of body) {
      const { stock_plan_list_id, unit_cost } = item;

      // validate
      if (!stock_plan_list_id || unit_cost === undefined || unit_cost === null) {
        failed.push(item);
        continue;
      }

      try {
        const result = await pool.query(sql, [unit_cost, stock_plan_list_id]);

        if (result.rowCount && result.rowCount > 0) {
          success++;
        } else {
          failed.push(item);
        }
      } catch (itemError) {
        console.error(`Error updating item ID: ${stock_plan_list_id}`, itemError);
        failed.push(item);
      }
    }

    return NextResponse.json({
      message: "อัพเดตการจัดอันดับเรียบร้อย",
      updated: success,
      failed: failed.length,
      failed_items: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัพเดตข้อมูล" },
      { status: 500 }
    );
  }
}

/* =======================
   PUT : รีเซ็ตการจัดอันดับ (ลบ unit_cost)
   - ตั้งค่า unit_cost เป็น NULL
======================= */
export async function PUT(req: Request) {
  try {
    const body: { stock_plan_list_ids: number[] } = await req.json();

    if (!Array.isArray(body.stock_plan_list_ids)) {
      return NextResponse.json(
        { message: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // รีเซ็ต unit_cost เป็น NULL
    const sql = `
      UPDATE stock_dep_plan_list_approved
      SET unit_cost = NULL
      WHERE stock_plan_list_id = ANY($1) AND stock_plan_id = 0
    `;

    const result = await pool.query(sql, [body.stock_plan_list_ids]);

    return NextResponse.json({
      message: "รีเซ็ตการจัดอันดับเรียบร้อย",
      reset: result.rowCount,
    });
  } catch (error) {
    console.error("RESET ERROR:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล" },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE : รีเซ็ตการจัดอันดับทั้งหมด
   - ตั้งค่า unit_cost ทั้งหมดเป็น NULL
======================= */
export async function DELETE() {
  try {
    const pool = await getPool();

    // รีเซ็ต unit_cost ทั้งหมดเป็น NULL
    const sql = `
      UPDATE stock_dep_plan_list_approved
      SET unit_cost = NULL
      WHERE stock_plan_id = 0 AND unit_cost IS NOT NULL
    `;

    const result = await pool.query(sql);

    return NextResponse.json({
      message: "รีเซ็ตการจัดอันดับทั้งหมดเรียบร้อย",
      reset: result.rowCount,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล" },
      { status: 500 }
    );
  }
}