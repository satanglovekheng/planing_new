import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(req: Request) {
  const { stock_plan_list_ids, officer_name } = await req.json();

  if (
    !Array.isArray(stock_plan_list_ids) ||
    stock_plan_list_ids.length === 0 ||
    !officer_name
  ) {
    return NextResponse.json(
      { message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  }

  // แปลงให้ชัวร์ว่าเป็น int[]
  const planIds = stock_plan_list_ids.map((id) => Number(id));

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 lock ข้อมูลทุกแถวที่เกี่ยวข้อง
    const { rows } = await client.query(
      `
      SELECT app_user_1, app_user_2, app_user_3
      FROM stock_dep_plan_list_approved
      WHERE stock_plan_list_id = ANY($1::int[])
      FOR UPDATE
      `,
      [planIds]
    );

    if (rows.length === 0) {
      throw new Error("ไม่พบแผนที่ต้องการอนุมัติ");
    }

    const { app_user_1, app_user_2, app_user_3 } = rows[0];

    // // 🚫 กันคนเดิมกดซ้ำ
    // if ([app_user_1, app_user_2, app_user_3].includes(officer_name)) {
    //   return NextResponse.json(
    //     { message: "คุณได้อนุมัติแผนนี้ไปแล้ว" },
    //     { status: 400 }
    //   );
    // }

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);

    let updateSql = "";
    let message = "";
    let approvedLevel = 0;

    if (!app_user_1) {
      updateSql = `
        UPDATE stock_dep_plan_list_approved
        SET app_user_1 = $1, app_date_1 = $2, app_time_1 = $3
        WHERE stock_plan_list_id = ANY($4::int[])
      `;
      message = "อนุมัติลำดับที่ 1 สำเร็จ";
      approvedLevel = 1;

    } else if (!app_user_2) {
      updateSql = `
        UPDATE stock_dep_plan_list_approved
        SET app_user_2 = $1, app_date_2 = $2, app_time_2 = $3
        WHERE stock_plan_list_id = ANY($4::int[])
      `;
      message = "อนุมัติลำดับที่ 2 สำเร็จ";
      approvedLevel = 2;

    } else if (!app_user_3) {
      updateSql = `
        UPDATE stock_dep_plan_list_approved
        SET app_user_3 = $1, app_date_3 = $2, app_time_3 = $3
        WHERE stock_plan_list_id = ANY($4::int[])
      `;
      message = "อนุมัติลำดับที่ 3 สำเร็จ";
      approvedLevel = 3;

    } else {
      return NextResponse.json(
        { message: "แผนนี้ถูกอนุมัติครบแล้ว" },
        { status: 400 }
      );
    }

    // ✏️ update ผู้อนุมัติ
    await client.query(updateSql, [
      officer_name,
      date,
      time,
      planIds,
    ]);

    // ✅ ถ้าครบ 3 คน → เปลี่ยนสถานะ + insert ข้อมูล
    if (approvedLevel === 3) {
      // เปลี่ยนสถานะ
      await client.query(
        `
        UPDATE stock_dep_plan_list_approved
        SET status = 2
        WHERE stock_plan_list_id = ANY($1::int[])
        `,
        [planIds]
      );

      // 🔥 insert ข้อมูลไปตารางจริง
      await client.query(
        `
        INSERT INTO stock_dep_plan_list (
          stock_plan_id,
          item_id,
          period1_qty,
          period2_qty,
          period3_qty,
          period4_qty,
          total_qty,
          hos_guid,
          item_name,
          item_unit,
          period1_amount,
          period2_amount,
          period3_amount,
          period4_amount,
          total_amount,
          last_1_year_qty,
          last_2_year_qty,
          last_3_year_qty,
          current_qty,
          unit_cost,
          inc_percent,
          item_type_name,
          period1_po_qty,
          period2_po_qty,
          period3_po_qty,
          period4_po_qty,
          period1_po_amount,
          period2_po_amount,
          period3_po_amount,
          period4_po_amount,
          total_po_qty,
          total_po_amount,
          year_qty,
          trend_1_yr_b0,
          trend_1_yr_b1,
          trend_3_yr_b0,
          trend_3_yr_b1,
          trend_1_yr_point,
          trend_1_yr_rsd,
          trend_1_yr_r2,
          trend_1_yr_mean,
          trend_1_yr_sd,
          incoming_balance_qty,
          stock_item_unit_id,
          unit_qty,
          manual_calc,
          package_unit_cost,
          package_incoming_balance_qty,
          package_current_qty,
          package_total_qty,
          package_total_amount,
          package_period1_qty,
          package_period2_qty,
          package_period3_qty,
          package_period4_qty,
          forcast_qty,
          stock_sub_class_name,
          stock_class_name,
          stock_item_ed_type_name
        )
        SELECT
          a.stock_plan_id,
          a.item_id,
          a.period1_qty,
          a.period2_qty,
          a.period3_qty,
          a.period4_qty,
          a.total_qty,
          a.hos_guid,
          a.item_name,
          a.item_unit,
          a.period1_amount,
          a.period2_amount,
          a.period3_amount,
          a.period4_amount,
          a.total_amount,
          a.last_1_year_qty,
          a.last_2_year_qty,
          a.last_3_year_qty,
          a.current_qty,
          a.unit_cost,
          a.inc_percent,
          a.item_type_name,
          a.period1_po_qty,
          a.period2_po_qty,
          a.period3_po_qty,
          a.period4_po_qty,
          a.period1_po_amount,
          a.period2_po_amount,
          a.period3_po_amount,
          a.period4_po_amount,
          a.total_po_qty,
          a.total_po_amount,
          a.year_qty,
          a.trend_1_yr_b0,
          a.trend_1_yr_b1,
          a.trend_3_yr_b0,
          a.trend_3_yr_b1,
          a.trend_1_yr_point,
          a.trend_1_yr_rsd,
          a.trend_1_yr_r2,
          a.trend_1_yr_mean,
          a.trend_1_yr_sd,
          a.incoming_balance_qty,
          a.stock_item_unit_id,
          a.unit_qty,
          a.manual_calc,
          a.package_unit_cost,
          a.package_incoming_balance_qty,
          a.package_current_qty,
          a.package_total_qty,
          a.package_total_amount,
          a.package_period1_qty,
          a.package_period2_qty,
          a.package_period3_qty,
          a.package_period4_qty,
          a.forcast_qty,
          a.stock_sub_class_name,
          a.stock_class_name,
          a.stock_item_ed_type_name
        FROM stock_dep_plan_list_approved a
        WHERE a.stock_plan_list_id = ANY($1::int[])
        AND NOT EXISTS (
          SELECT 1
          FROM stock_dep_plan_list b
          WHERE b.stock_plan_id = a.stock_plan_id
            AND b.item_id = a.item_id
        )
        `,
        [planIds]
      );

      message += " และบันทึกข้อมูลเรียบร้อย";
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true, message });

  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
