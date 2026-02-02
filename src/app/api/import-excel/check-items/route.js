import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// body คาดหวัง: { codes: string[] }
export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        let codes = body?.codes;
        const type = body?.type;
        if (!Array.isArray(codes)) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: 'codes' must be an array" },
                { status: 400 }
            );
        }

        const cleaned = Array.from(
            new Set(
              codes
                .map((x) => {
                  if (x == null) return "";
          
                  return String(x)
                    .replace(/,/g, "")      // ลบ comma
                    .replace(/\.00$/, "")   // ตัด .00 ท้าย
                    .trim();
                })
                .filter((x) => x !== "")
            )
          );
          
          console.log("cleaned codes", cleaned);

        if (cleaned.length === 0) {
            return NextResponse.json({
                success: true,
                total: 0,
                foundCount: 0,
                notFoundCount: 0,
                found: [],
                notFound: [],
            });
        }

        const pool = getPool();

        const sql = `
            SELECT item_name, item_id
            FROM stock_item
            WHERE item_id = ANY($1::int[])
        `;

        const { rows } = await pool.query(sql, [cleaned]);
        console.log("check-items rows", rows);

        // ===== กรณี dashboard =====
        if (type === 'dashboard') {
            const found = rows.map(r => ({
                item_name: r.item_name,
                item_id: r.item_id
            }));

            return NextResponse.json({
                success: true,
                total: found.length,
                foundCount: found.length,
                notFoundCount: 0,
                found,
                notFound: [],
            });
        }

        // ===== กรณีปกติ =====
        const foundMap = new Map(
            rows.map(r => [
              String(r.item_id),
              { item_id: r.item_id, item_name: r.item_name }
            ])
          );

          const found = cleaned
          .filter(c => foundMap.has(c))
          .map(c => foundMap.get(c));

        const notFound = cleaned.filter(c => !foundMap.has(c));

        return NextResponse.json({
            success: true,
            total: cleaned.length,
            foundCount: found.length,
            notFoundCount: notFound.length,
            found,
            notFound,
        });
    } catch (e) {
        console.error("check-items error", e);
        return NextResponse.json(
            { success: false, error: e?.message || "Internal error" },
            { status: 500 }
        );
    }
}


// (ออปชัน) ทดสอบผ่าน query string: /api/import-excel/check-items?codes=A,B,C
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const qs = url.searchParams.get("codes") || "";
        const list = qs
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");
        const fakeReq = new Request(req.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codes: list }),
        });
        return POST(fakeReq);
    } catch (e) {
        return NextResponse.json(
            { success: false, error: e?.message || "Internal error" },
            { status: 500 }
        );
    }
}
