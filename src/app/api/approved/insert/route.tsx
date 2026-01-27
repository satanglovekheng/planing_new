import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

type BasicInfo = {
  category_name?: string | null
  vendor_name?: string | null
  last_purchase_date?: string | null
}

type SinglePayload = {
  meta: {
    bdg_year: string | null
    department_id: number | null
    as_of_date?: string | null
  }
  item: {
    item_id: number | null
    stock_item_unit_id: number | string | null
    unit_qty: number | null
    unit_cost: number | null
    basic?: BasicInfo
  }
  periods: {
    qty: {
      q1: number | null
      q2: number | null
      q3: number | null
      q4: number | null
      total: number | null
    }
    amount: {
      q1: number | null
      q2: number | null
      q3: number | null
      q4: number | null
      total: number | null
    }
  }
  history: {
    last_1_year_qty: number | null
    last_2_year_qty: number | null
    last_3_year_qty: number | null
  }
  current_qty: number | null
  status: number
}

// ========== POST ==========
export async function POST(req: Request) {
  try {
    const payload: SinglePayload = await req.json()
    console.log('Received payload:', payload) // Debugging log
    const pool = await getPool()

    const {
      meta,
      item,
      periods,
      history,
      current_qty,
      status,
    } = payload

    // ตรวจสอบว่ามีข้อมูลครบ
    if (!meta.bdg_year || !meta.department_id || !item.item_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      )
    }

    console.log('Saving data for item_id:', payload) // Debugging log
    // 🔹 บันทึกข้อมูลลงฐานข้อมูล
    const [result] = await pool.query(
      `
      INSERT INTO stock_dep_plan_list_approved (
        bdg_year,
        department_id,
        item_id,
        stock_item_unit_id,
        unit_qty,
        unit_cost,
        current_qty,
        status,
        q1_qty, q2_qty, q3_qty, q4_qty, total_qty,
        q1_amount, q2_amount, q3_amount, q4_amount, total_amount,
        last_1_year_qty, last_2_year_qty, last_3_year_qty,
        as_of_date, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        unit_qty = VALUES(unit_qty),
        unit_cost = VALUES(unit_cost),
        current_qty = VALUES(current_qty),
        q1_qty = VALUES(q1_qty),
        q2_qty = VALUES(q2_qty),
        q3_qty = VALUES(q3_qty),
        q4_qty = VALUES(q4_qty),
        total_qty = VALUES(total_qty),
        q1_amount = VALUES(q1_amount),
        q2_amount = VALUES(q2_amount),
        q3_amount = VALUES(q3_amount),
        q4_amount = VALUES(q4_amount),
        total_amount = VALUES(total_amount),
        last_1_year_qty = VALUES(last_1_year_qty),
        last_2_year_qty = VALUES(last_2_year_qty),
        last_3_year_qty = VALUES(last_3_year_qty),
        status = VALUES(status),
        updated_at = NOW()
      `,
      [
        meta.bdg_year,
        meta.department_id,
        item.item_id,
        item.stock_item_unit_id,
        item.unit_qty,
        item.unit_cost,
        current_qty,
        status,
        periods.qty.q1,
        periods.qty.q2,
        periods.qty.q3,
        periods.qty.q4,
        periods.qty.total,
        periods.amount.q1,
        periods.amount.q2,
        periods.amount.q3,
        periods.amount.q4,
        periods.amount.total,
        history.last_1_year_qty,
        history.last_2_year_qty,
        history.last_3_year_qty,
        meta.as_of_date ?? null,
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      affectedRows: result.affectedRows,
    })
  } catch (err: any) {
    console.error('Error saving data:', err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
