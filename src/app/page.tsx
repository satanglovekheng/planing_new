"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search, X, Edit3, Package2, Calculator, History, TrendingUp, ChevronUp, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import Sidebar from "./components/Sidebar";
// ===== Types =====
type StockRow = {
  stock_plan_list_id: number;
  item_name: string;
  item_unit: string | null;
  item_type_name: string | null;
};

type SortKey = "item_name" | "item_unit" | "item_type_name";

// ข้อมูลเต็มที่ใช้ใน Modal (ตาม payload ที่ให้มา)
type StockPlanDetail = {
  stock_plan_list_id: number;
  stock_plan_id: number;
  item_id: number;
  period1_qty: number | null;
  period2_qty: number | null;
  period3_qty: number | null;
  period4_qty: number | null;
  total_qty: number | null;
  hos_guid: string | null;
  item_name: string;
  item_unit: string | null;
  period1_amount: string | number | null;
  period2_amount: string | number | null;
  period3_amount: string | number | null;
  period4_amount: string | number | null;
  total_amount: string | number | null;
  last_1_year_qty: number | null;
  last_2_year_qty: number | null;
  last_3_year_qty: number | null;
  current_qty: number | null;
  unit_cost: string | number | null;
  inc_percent: number | null;
  item_type_name: string | null;
  period1_po_qty: number | null;
  period2_po_qty: number | null;
  period3_po_qty: number | null;
  period4_po_qty: number | null;
  period1_po_amount: number | null;
  period2_po_amount: number | null;
  period3_po_amount: number | null;
  period4_po_amount: number | null;
  total_po_qty: number | null;
  total_po_amount: number | null;
  year_qty: number | null;
  trend_1_yr_b0: number | null;
  trend_1_yr_b1: number | null;
  trend_3_yr_b0: number | null;
  trend_3_yr_b1: number | null;
  trend_1_yr_point: number | null;
  trend_1_yr_rsd: number | null;
  trend_1_yr_r2: number | null;
  trend_1_yr_mean: number | null;
  trend_1_yr_sd: number | null;
  incoming_balance_qty: number | null;
  stock_item_unit_id: number | null;
  unit_qty: number | null;
  manual_calc: string | number | null;
  package_unit_cost: number | null;
  package_incoming_balance_qty: number | null;
  package_current_qty: number | null;
  package_total_qty: number | null;
  package_total_amount: number | null;
  package_period1_qty: number | null;
  package_period2_qty: number | null;
  package_period3_qty: number | null;
  package_period4_qty: number | null;
  forcast_qty: number | null;
  stock_sub_class_name: string | null;
  stock_class_name: string | null;
  stock_item_ed_type_name: string | null;
};

type Department = {
  department_id: number;
  department_name: string;
};

function SortIcon({ dir }: { dir: "asc" | "desc" }) {
  return (
    <span className="inline-block align-middle ml-2">
      {dir === "asc" ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </span>
  );
}

/** ================= Pagination items generator =================*/
function buildPager(totalPages: number, current: number) {
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const lastBlock = [totalPages - 2, totalPages - 1, totalPages];
  if (current <= 3) return [1, 2, 3, "…", ...lastBlock];
  if (current >= totalPages - 2) return [1, 2, 3, "…", ...lastBlock];
  return [current - 2, current - 1, current, "…", ...lastBlock];
}

// ===== Helpers =====
const toNum = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

// ====== Main Page ======
export default function StockPlanTablePage() {
  // ===== control =====
  const depID = localStorage.getItem('officer_id');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("item_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ===== data =====
  const [rows, setRows] = useState<StockRow[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => {
    const t = Number.isFinite(total) ? total : 0;
    const ps = Number.isFinite(pageSize) ? pageSize : 20;
    const tp = Math.ceil(t / ps);
    return Math.max(1, tp || 1);
  }, [total, pageSize]);
  const showingFrom = (page - 1) * pageSize + 1;
  const showingTo = Math.min(total, page * pageSize);

  // ===== modal state =====
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StockPlanDetail | null>(null);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    let alive = true;
    fetch(`/api/departments?userId=${depID}`)
      .then(r => r.json())
      .then(res => {
        if (!alive) return;
        if (res?.success !== false) {
          const list: Department[] = Array.isArray(res) ? res : res?.data || [];
          setDepartments(list);
          // ค่าเริ่มต้น: เลือกทุก department
          setSelectedDeptIds(list.map(d => Number(d.department_id)).filter(Boolean));
        } else {
          console.error('departments api error:', res?.error);
        }
      })
      .catch(err => console.error('departments fetch error:', err));
    return () => { alive = false; };
  }, [depID]);

  const filteredDepartments = useMemo(() => {
    const kw = deptSearch.trim().toLowerCase();
    if (!kw) return departments;
    return departments.filter(d =>
      String(d.department_name || "").toLowerCase().includes(kw) ||
      String(d.department_id || "").includes(kw)
    );
  }, [departments, deptSearch]);

  const allSelected = selectedDeptIds.length > 0 && selectedDeptIds.length === departments.length;

  const toggleDept = (id: number) => {
    setSelectedDeptIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setPage(1);
  };
  
  const selectAll = () => {
    setSelectedDeptIds(departments.map(d => d.department_id));
    setPage(1);
  };
  
  const clearAll = () => {
    setSelectedDeptIds([]);
    setPage(1);
  };

  // ===== fetch (server-side pagination) =====
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    const fetchData = async () => {
      // ถ้ายังไม่มี dep ที่เลือก ให้เคลียร์ผลลัพธ์ (กันยิง API โดยไม่มี where)
      if (!selectedDeptIds || selectedDeptIds.length === 0) {
        setRows([]);
        setTotal(0);
        return;
      }

      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          depIDs: selectedDeptIds,   // <<== ใช้ array
          q, sortKey, sortDir, page, pageSize
        }),
      });
      const json = await res.json();
      if (!alive) return;
      if (json?.success) {
        const payload = json.data;
        if (Array.isArray(payload)) {
          setRows(payload as StockRow[]);
          setTotal(payload.length);
        } else {
          setRows((payload?.rows as StockRow[]) ?? []);
          setTotal(Number(payload?.total ?? 0));
        }
      } else {
        console.error("stock api error:", json?.error);
        setRows([]);
        setTotal(0);
      }
    };

    const t = setTimeout(fetchData, 200);
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [selectedDeptIds, q, sortKey, sortDir, page, pageSize]);



  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const pageItems = useMemo(() => buildPager(totalPages, page), [totalPages, page]);

  // ===== open modal and load full row =====
  const onEdit = async (row: StockRow) => {
    try {
      const res = await fetch(`/api/stock/${row.stock_plan_list_id}`);
      const json = await res.json();
      console.log(json)
      const detail: StockPlanDetail = json?.data ?? ({} as any);

      // fallback หาก backend ยังไม่พร้อม ใช้ mock จากตัวอย่าง
      const fallback: StockPlanDetail = {
        stock_plan_list_id: row.stock_plan_list_id,
        stock_plan_id: 29,
        item_id: 8929,
        period1_qty: 11,
        period2_qty: null,
        period3_qty: null,
        period4_qty: null,
        total_qty: 11,
        hos_guid: null,
        item_name: row.item_name,
        item_unit: row.item_unit,
        period1_amount: "14712.500",
        period2_amount: null,
        period3_amount: null,
        period4_amount: null,
        total_amount: "14712.500",
        last_1_year_qty: null,
        last_2_year_qty: null,
        last_3_year_qty: null,
        current_qty: null,
        unit_cost: "1337.500",
        inc_percent: null,
        item_type_name: row.item_type_name,
        period1_po_qty: null,
        period2_po_qty: null,
        period3_po_qty: null,
        period4_po_qty: null,
        period1_po_amount: null,
        period2_po_amount: null,
        period3_po_amount: null,
        period4_po_amount: null,
        total_po_qty: null,
        total_po_amount: null,
        year_qty: null,
        trend_1_yr_b0: null,
        trend_1_yr_b1: null,
        trend_3_yr_b0: null,
        trend_3_yr_b1: null,
        trend_1_yr_point: null,
        trend_1_yr_rsd: null,
        trend_1_yr_r2: null,
        trend_1_yr_mean: null,
        trend_1_yr_sd: null,
        incoming_balance_qty: null,
        stock_item_unit_id: 8929,
        unit_qty: 1,
        manual_calc: null,
        package_unit_cost: null,
        package_incoming_balance_qty: null,
        package_current_qty: null,
        package_total_qty: null,
        package_total_amount: null,
        package_period1_qty: null,
        package_period2_qty: null,
        package_period3_qty: null,
        package_period4_qty: null,
        forcast_qty: null,
        stock_sub_class_name: null,
        stock_class_name: "ยาฉีด",
        stock_item_ed_type_name: "ยาในบัญชีหลักแห่งชาติ",
      };

      setForm(Object.keys(detail || {}).length ? detail : fallback);
      setOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ===== change handlers & recalculation =====
  const update = (patch: Partial<StockPlanDetail>) => {
    setForm((prev) => {
      const next = { ...(prev as StockPlanDetail), ...patch } as StockPlanDetail;

      // คำนวณ amount ของแต่ละไตรมาสและรวม (ถ้ามี unit_cost)
      const uc = toNum(next.unit_cost);
      const q1 = toNum(next.period1_qty);
      const q2 = toNum(next.period2_qty);
      const q3 = toNum(next.period3_qty);
      const q4 = toNum(next.period4_qty);
      const tQty = q1 + q2 + q3 + q4;

      const a1 = q1 * uc;
      const a2 = q2 * uc;
      const a3 = q3 * uc;
      const a4 = q4 * uc;
      const tAmount = a1 + a2 + a3 + a4;

      next.total_qty = tQty;
      next.period1_amount = a1;
      next.period2_amount = a2;
      next.period3_amount = a3;
      next.period4_amount = a4;
      next.total_amount = tAmount;
      return next;
    });
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stock/${form.stock_plan_list_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Update failed");
      setOpen(false);
      setPage((p) => p);
    } catch (e) {
      console.error("save error:", e);
      alert("บันทึกไม่สำเร็จ\n" + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <Sidebar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Package2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ตารางแผนจัดซื้อ</h1>
              <p className="text-slate-500 mt-1">จัดการและแก้ไขแผนการจัดซื้อสินค้า</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
    {/* ค้นหารายการ */}
    <div className="flex-1">
      <div className="relative">
        <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-slate-500 focus-within:border-slate-500 transition-all duration-200">
          <Search className="w-5 h-5 mr-3 text-slate-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหาสินค้า: ชื่อรายการ / หน่วยนับ / ประเภท"
            className="flex-1 outline-none text-slate-700 placeholder-slate-400"
          />
          {q && (
            <button
              onClick={() => { setQ(""); setPage(1); }}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>

    {/* ตัวเลือกแผนก */}
    <div className="relative">
      <button
        onClick={() => setDeptOpen(o => !o)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200"
      >
        หน่วยงาน ({selectedDeptIds.length}/{departments.length || 0})
        {allSelected ? <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">เลือกทั้งหมด</span> : null}
      </button>

      {deptOpen && (
        <div className="absolute right-0 mt-2 w-[420px] z-40 bg-white border border-slate-200 rounded-2xl shadow-lg p-4">
          {/* Search box */}
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <div className="px-3 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder="ค้นหาแผนก… (พิมพ์ชื่อหรือเลข ID)"
              className="flex-1 px-3 py-2 outline-none"
            />
            {deptSearch && (
              <button className="px-2 text-slate-400 hover:text-slate-600" onClick={() => setDeptSearch("")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-500">
              พบ {filteredDepartments.length} จาก {departments.length} แผนก
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                เลือกทั้งหมด
              </button>
              <button
                onClick={clearAll}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                ล้างเลือก
              </button>
              <button
                onClick={() => setDeptOpen(false)}
                className="text-sm px-3 py-1.5 rounded-lg bg-slate-600 text-white hover:bg-slate-700"
              >
                ปิด
              </button>
            </div>
          </div>

          {/* List */}
          <div className="mt-3 max-h-[300px] overflow-auto border border-slate-200 rounded-xl">
            {filteredDepartments.length === 0 ? (
              <div className="p-4 text-center text-slate-500">ไม่พบแผนกที่ตรงคำค้น</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredDepartments.map((d) => {
                  const checked = selectedDeptIds.includes(d.department_id);
                  return (
                    <li
                      key={d.department_id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                    >
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDept(d.department_id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{d.department_name}</div>
                          <div className="text-xs text-slate-500">ID: {d.department_id}</div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Page size */}
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600">แสดงต่อหน้า:</span>
      <select
        value={pageSize}
        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-white"
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  </div>

  {/* แสดง chip ของแผนกที่เลือก (ถ้าต้องการลบเร็ว ๆ) */}
  {selectedDeptIds.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-2">
      {departments
        .filter(d => selectedDeptIds.includes(d.department_id))
        .slice(0, 10) // โชว์อย่างมาก 10 อัน ป้องกันยาวเกิน
        .map(d => (
          <span key={d.department_id} className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {d.department_name}
            <button onClick={() => toggleDept(d.department_id)} className="text-slate-500 hover:text-slate-700">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      {selectedDeptIds.length > 10 && (
        <span className="text-sm text-slate-500">+{selectedDeptIds.length - 10} รายการ</span>
      )}
    </div>
  )}
</div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 w-16">#</th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => onSort("item_name")}
                  >
                    <div className="flex items-center">
                      รายการสินค้า
                      {sortKey === "item_name" && <SortIcon dir={sortDir} />}
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors duration-200 w-48"
                    onClick={() => onSort("item_unit")}
                  >
                    <div className="flex items-center">
                      หน่วยนับ
                      {sortKey === "item_unit" && <SortIcon dir={sortDir} />}
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors duration-200 w-56"
                    onClick={() => onSort("item_type_name")}
                  >
                    <div className="flex items-center">
                      ประเภทสินค้า
                      {sortKey === "item_type_name" && <SortIcon dir={sortDir} />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center w-32">การดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package2 className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500">ไม่พบข้อมูล</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.stock_plan_list_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{r.item_name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{r.item_unit || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{r.item_type_name || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onEdit(r)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all duration-200 hover:shadow-sm transform hover:-translate-y-0.5"
                        >
                          <Edit3 className="w-4 h-4" />
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="text-sm text-slate-600">
              แสดง {total === 0 ? 0 : showingFrom}-{showingTo} จาก {total} รายการ
            </div>

            <div className="md:ml-auto flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
                First
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {pageItems.map((it, i) =>
                  it === "…" ? (
                    <span key={`dots-${i}`} className="px-2 text-slate-400 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={it as number}
                      onClick={() => setPage(it as number)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${page === it
                        ? "bg-slate-600 text-white border border-slate-600"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {it}
                    </button>
                  )
                )}
              </div>

              <button
                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                Last
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= Modal ================= */}
        {open && form && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">แบบฟอร์มวางแผนงบประมาณ</h2>
                      <p className="text-slate-500 mt-1">แก้ไขข้อมูลแผนการจัดซื้อ</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    อ้างอิงราคา ณ วันนี้ ({new Date().toLocaleDateString('th-TH')})
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Item Details */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Package2 className="w-5 h-5 text-slate-600" />
                    ข้อมูลสินค้า
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-600">ชื่อรายการ:</span>
                      <div className="text-slate-800 mt-1 font-medium">{form.item_name}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-600">หน่วยพื้นฐาน:</span>
                      <div className="text-slate-800 mt-1">{form.item_unit || "-"}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-600">หมวด (Class):</span>
                      <div className="text-slate-800 mt-1">{form.stock_class_name || "-"}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-600">ED Type:</span>
                      <div className="text-slate-800 mt-1">{form.stock_item_ed_type_name || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* Unit + pack + price */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">หน่วยบรรจุและราคา</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">หน่วยบรรจุ (ที่ต้องการซื้อ)</label>
                      <input
                        value={form.item_unit || ""}
                        onChange={(e) => update({ item_unit: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ขนาดบรรจุ</label>
                      <input
                        type="number"
                        value={form.unit_qty ?? 1}
                        onChange={(e) => update({ unit_qty: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ราคาต่อหน่วยล่าสุด</label>
                      <input
                        type="number"
                        step="0.01"
                        value={toNum(form.unit_cost)}
                        onChange={(e) => update({ unit_cost: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Quarterly Planning */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-slate-600" />
                      จำนวนตามไตรมาส
                    </h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((qIdx) => (
                        <div key={qIdx}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">ไตรมาส {qIdx}</label>
                          <input
                            type="number"
                            value={toNum((form as any)[`period${qIdx}_qty`])}
                            onChange={(e) => update({ [`period${qIdx}_qty`]: Number(e.target.value) } as any)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      💰 ราคาตามไตรมาส
                    </h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((qIdx) => (
                        <div key={qIdx}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">ไตรมาส {qIdx}</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={toNum((form as any)[`period${qIdx}_amount`])}
                              onChange={(e) => update({ [`period${qIdx}_amount`]: Number(e.target.value) } as any)}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                              readOnly
                            />
                            <div className="absolute right-3 top-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                              คำนวณ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 สรุปจำนวนรวม</h3>
                    <div className="relative">
                      <input
                        type="number"
                        value={toNum(form.total_qty)}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-lg cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-xs bg-slate-600 text-white px-2 py-1 rounded-full">
                        ผลรวม
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">💵 สรุปราคารวม</h3>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={toNum(form.total_amount)}
                        readOnly
                        className="w-full px-4 py-3 border border-green-200 rounded-xl bg-white text-green-700 font-bold text-lg cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        บาท
                      </div>
                    </div>
                  </div>
                </div>

                {/* History & Current Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-600" />
                      ประวัติการใช้ย้อนหลัง
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'last_1_year_qty', label: '1 ปีที่แล้ว' },
                        { key: 'last_2_year_qty', label: '2 ปีที่แล้ว' },
                        { key: 'last_3_year_qty', label: '3 ปีที่แล้ว' }
                      ].map(year => (
                        <div key={year.key}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            {year.label}
                          </label>
                          <input
                            type="number"
                            value={(form as any)[year.key] ?? 0}
                            onChange={(e) => update({ [year.key]: Number(e.target.value) } as any)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      📦 จำนวนคงคลังปัจจุบัน
                    </h3>
                    <input
                      type="number"
                      value={form.current_qty ?? 0}
                      onChange={(e) => update({ current_qty: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg"
                      placeholder="ระบุจำนวนคงคลัง"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex flex-wrap gap-4 justify-end">
                    <button
                      className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-white hover:bg-slate-100 transition-all duration-200 border border-slate-300"
                      onClick={() => setOpen(false)}
                      disabled={saving}
                    >
                      ยกเลิก
                    </button>
                    <button
                      className="px-8 py-3 rounded-xl font-medium text-white bg-slate-600 hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={save}
                      disabled={saving}
                    >
                      {saving ? "🔄 กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}