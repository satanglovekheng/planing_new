import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }
console.log('Login attempt:', { username, password }); // Hide password in logs

console.log('Login attempt:',  password.toUpperCase() ); // Hide password in logs
    const pool = getPool();

    // Step 1: Check login credentials and get officer_id
    const loginSql = `
      SELECT officer_id , officer_name
      FROM "officer" 
      WHERE officer_login_name = $1 AND officer_login_password_md5 = $2
    `;

    const loginResult = await pool.query(loginSql, [username, password.toUpperCase()]);

    if (loginResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const officerId = loginResult.rows[0].officer_id;

    // Step 2: Get stock_user_id
    const userSql = `
      SELECT ud.stock_user_id
      FROM stock_user_department ud, stock_department d
      WHERE ud.stock_user_id = $1
        AND ud.stock_department_id = d.department_id
        AND d.stock_department_type_id = 1
      GROUP BY ud.stock_user_id
    `;

    const userResult = await pool.query(userSql, [officerId]);
    console.log('User result:', userResult.rows); // Debugging log
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลผู้ใช้ในระบบคลังสินค้า' },
        { status: 404 }
      );
    }

    const stockUserId = userResult.rows[0].stock_user_id;

    // Step 3: Get department information
    const departmentSql = `
      SELECT d.department_name, d.department_id
      FROM stock_user_department ud
      JOIN stock_department d ON ud.stock_department_id = d.department_id
      WHERE ud.stock_user_id = $1
        AND d.stock_department_type_id = 1
      ORDER BY d.department_name
    `;

    const departmentResult = await pool.query(departmentSql, [stockUserId]);

    if (departmentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลแผนกของผู้ใช้' },
        { status: 404 }
      );
    }

    // Get the first department (you might want to handle multiple departments differently)
    const department = departmentResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        officer_name : loginResult.rows[0].officer_name,
        officer_id: officerId,
        stock_user_id: stockUserId,
        department_id: department.department_id,
        department_name: department.department_name,
        all_departments: departmentResult.rows // In case user has multiple departments
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}