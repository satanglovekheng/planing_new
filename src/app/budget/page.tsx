// app/budget/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Search as SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

type YearRow = { bdg_year: string };
type DeptRow = { department_id: number; department_name: string };

type ItemRow = { item_id: number; item_name: string; item_unit: string };

type ItemBasic = {
    item_id: number;
    item_name: string;
    item_unit: string;
    item_type_name: string | null;
    stock_class_name: string | null;
    stock_sub_class_name: string | null;
    stock_item_ed_type_name: string | null;
};

type ItemUnit = { stock_item_unit_id: number; item_unit_name: string; unit_qty: number };

export default function BudgetFormPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const router = useRouter();
    // Step 1
    const [years, setYears] = useState<YearRow[]>([]);
    const [departments, setDepartments] = useState<DeptRow[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');

    // Step 2
    const [search, setSearch] = useState('');
    const [liveResults, setLiveResults] = useState<ItemRow[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [basic, setBasic] = useState<ItemBasic | null>(null);
    const [units, setUnits] = useState<ItemUnit[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [unitCost, setUnitCost] = useState<number | null>(null);      // ราคา/หน่วยพื้นฐาน จาก API
    const [unitCostSum, setUnitCostSum] = useState<number | null>(null); // ราคา/แพ็ก (หน่วยบรรจุที่เลือก)

    const [periodQty, setPeriodQty] = useState({ p1: '', p2: '', p3: '', p4: '' }); // string input
    const [periodAmount, setPeriodAmount] = useState({ a1: '', a2: '', a3: '', a4: '' }); // auto-filled
    const [historyQty, setHistoryQty] = useState({ y1: '', y2: '', y3: '' });
    const [currentQty, setCurrentQty] = useState('');

    // --- UX ของกล่องค้นหา ---
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [highlight, setHighlight] = useState<number>(-1);
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLUListElement | null>(null);

    // utils
    const parseNum = (v: string | number | null | undefined): number | null => {
        if (v === '' || v === null || v === undefined) return null;
        const n = Number(String(v).replace(/,/g, ''));
        return Number.isFinite(n) ? n : null;
    };
    const sumNums = (vals: Array<number | null>): number =>
        vals.filter((v): v is number => v !== null && Number.isFinite(v)).reduce((a, b) => a + b, 0);

    const formatMoney = (n: number | null): string =>
        n === null ? '' : n.toFixed(2);


    // ✅ ตรวจสอบ officer_id ตั้งแต่ตอนเข้า (ถ้าไม่มี -> ไป login)
    useEffect(() => {
        const officerId = typeof window !== 'undefined'
            ? localStorage.getItem('officer_id')
            : null;

        if (!officerId) {
            router.replace('/login');
        }
    }, [router]);

    // Load Step 1 options
    useEffect(() => {
        fetch('/api/budget-years').then(r => r.json()).then(res => {
            if (res.success) setYears(res.data);
        });
        const depID = localStorage.getItem('officer_id');

        fetch(`/api/departments?userId=${depID}`)
            .then(r => r.json())
            .then(res => {
                console.log('Department ID from localStorage:', depID);
                if (res.success) {
                    setDepartments(res.data);
                    if (Array.isArray(res.data) && res.data.length === 1) {
                        setSelectedDeptId(Number(res.data[0].department_id));
                    }
                }
            });
    }, []);

    // Type-ahead search (debounce + abort)
    useEffect(() => {
        const q = search.trim();
        setHighlight(-1);
        if (q.length < 2) {
            setLiveResults([]);
            setSearchError('');
            setOpenDropdown(false);
            return;
        }
        const ctrl = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                setSearchError('');
                const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}&limit=20`, { signal: ctrl.signal });
                const json = await res.json();
                if (json.success) {
                    setLiveResults(json.data || []);
                    setOpenDropdown(true);
                } else {
                    setSearchError(json.error || 'ค้นหาไม่สำเร็จ');
                    setOpenDropdown(true);
                }
            } catch (err: any) {
                if (err?.name !== 'AbortError') {
                    setSearchError(String(err));
                    setOpenDropdown(true);
                }
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => { ctrl.abort(); clearTimeout(timer); };
    }, [search]);

    // ปิด dropdown เมื่อคลิกนอก
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!dropdownRef.current || !inputRef.current) return;
            const target = e.target as Node;
            if (!dropdownRef.current.contains(target) && !inputRef.current.contains(target)) {
                setOpenDropdown(false);
            }
        };
        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, []);

    const canNext = Boolean(selectedYear) && (departments.length === 1 ? true : Boolean(selectedDeptId));

    // เมื่อเลือก item -> โหลด basic + units
    useEffect(() => {
        if (!selectedItemId) return;
        (async () => {
            const [b, u] = await Promise.all([
                fetch(`/api/item/${selectedItemId}/basic`).then(r => r.json()),
                fetch(`/api/item/${selectedItemId}/units`).then(r => r.json()),
            ]);
            if (b.success) setBasic(b.data);
            if (u.success) {
                setUnits(u.data ?? []);
                const first = (u.data?.[0]?.stock_item_unit_id ?? null) as number | null;
                setSelectedUnitId(first);
            } else {
                setUnits([]);
                setSelectedUnitId(null);
            }
            setUnitCost(null);
            setUnitCostSum(null);
        })();
    }, [selectedItemId]);

    // ดึงราคา/หน่วยพื้นฐานของ item+unit ที่เลือก
    useEffect(() => {
        if (!selectedItemId || selectedUnitId == null) return;

        const url = `/api/item/${selectedItemId}/unit-cost?unitId=${selectedUnitId}`;
        let cancelled = false;

        (async () => {
            try {
                const r = await fetch(url);
                const res = await r.json();
                if (cancelled) return;

                const price = res?.success ? Number(res.data.unit_cost) : null;
                setUnitCost(Number.isFinite(price as number) ? (price as number) : null);
            } catch {
                if (!cancelled) setUnitCost(null);
            }
        })();

        return () => { cancelled = true; };
    }, [selectedItemId, selectedUnitId]);

    // หา unit_qty ของหน่วยบรรจุที่เลือก
    const selectedUnitQty: number | null = (() => {
        if (selectedUnitId == null) return null;
        const u = units.find(x => x.stock_item_unit_id === selectedUnitId);
        return u ? u.unit_qty : null;
    })();

    // คำนวณ "ราคาต่อหน่วยล่าสุด" (ราคา/แพ็ก) = unitCost (ต่อหน่วยพื้นฐาน) * unit_qty
    useEffect(() => {
        if (unitCost != null && selectedUnitQty != null) {
            setUnitCostSum(unitCost * selectedUnitQty);
        } else {
            setUnitCostSum(null);
        }
    }, [unitCost, selectedUnitQty]);

    // คำนวณ "ราคารวมตามไตรมาส" อัตโนมัติ = qty[ไตรมาส] * unitCostSum
    useEffect(() => {
        if (unitCostSum == null) {
            // ถ้าไม่มีราคา ก็เคลียร์ค่า amount เพื่อกันความสับสน
            setPeriodAmount({ a1: '', a2: '', a3: '', a4: '' });
            return;
        }
        const q1 = parseNum(periodQty.p1);
        const q2 = parseNum(periodQty.p2);
        const q3 = parseNum(periodQty.p3);
        const q4 = parseNum(periodQty.p4);

        const a1 = q1 !== null ? formatMoney(q1 * unitCostSum) : '';
        const a2 = q2 !== null ? formatMoney(q2 * unitCostSum) : '';
        const a3 = q3 !== null ? formatMoney(q3 * unitCostSum) : '';
        const a4 = q4 !== null ? formatMoney(q4 * unitCostSum) : '';

        setPeriodAmount({ a1, a2, a3, a4 });
    }, [periodQty, unitCostSum]);

    function resetAll() {
        setStep(1);
        setSelectedYear('');
        setSelectedDeptId('');
        setSearch('');
        setLiveResults([]);
        setSelectedItemId(null);
        setBasic(null);
        setUnits([]);
        setSelectedUnitId(null);
        setUnitCost(null);
        setUnitCostSum(null);
        setPeriodQty({ p1: '', p2: '', p3: '', p4: '' });
        setPeriodAmount({ a1: '', a2: '', a3: '', a4: '' });
        setHistoryQty({ y1: '', y2: '', y3: '' });
        setCurrentQty('');
        setOpenDropdown(false);
        setHighlight(-1);
    }

    const sumQtyNumber = (() => {
        const q1 = parseNum(periodQty.p1);
        const q2 = parseNum(periodQty.p2);
        const q3 = parseNum(periodQty.p3);
        const q4 = parseNum(periodQty.p4);
        return sumNums([q1, q2, q3, q4]);
    })();

    const sumAmountNumber = (() => {
        const a1 = parseNum(periodAmount.a1);
        const a2 = parseNum(periodAmount.a2);
        const a3 = parseNum(periodAmount.a3);
        const a4 = parseNum(periodAmount.a4);
        return sumNums([a1, a2, a3, a4]);
    })();

    async function handleSave() {
        const deptId =
            departments.length === 1
                ? Number(departments[0].department_id)
                : (selectedDeptId ? Number(selectedDeptId) : null);

        const unit = units.find(u => u.stock_item_unit_id === selectedUnitId);

        const payload = {
            meta: {
                bdg_year: selectedYear || null,
                department_id: deptId,
            },
            item: {
                item_id: selectedItemId,
                stock_item_unit_id: selectedUnitId || null,
                unit_qty: unit ? unit.unit_qty : null,
                unit_cost: unitCostSum, // ราคา/แพ็ก (หน่วยบรรจุที่เลือก)
                basic,
            },
            periods: {
                qty: {
                    q1: parseNum(periodQty.p1),
                    q2: parseNum(periodQty.p2),
                    q3: parseNum(periodQty.p3),
                    q4: parseNum(periodQty.p4),
                    total: sumQtyNumber,
                },
                amount: {
                    q1: parseNum(periodAmount.a1),
                    q2: parseNum(periodAmount.a2),
                    q3: parseNum(periodAmount.a3),
                    q4: parseNum(periodAmount.a4),
                    total: sumAmountNumber,
                },
            },
            history: {
                last_1_year_qty: parseNum(historyQty.y1),
                last_2_year_qty: parseNum(historyQty.y2),
                last_3_year_qty: parseNum(historyQty.y3),
            },
            current_qty: parseNum(currentQty),
        };

        try {
            const res = await fetch('/api/budget-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!json.success) {
                alert('บันทึกล้มเหลว: ' + (json.error || 'unknown error'));
                return;
            }
            alert(`บันทึกสำเร็จ\nstock_plan_id: ${json.data.stock_plan_id}\nstock_plan_list_id: ${json.data.stock_plan_list_id}`);
        } catch (e: any) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + e.message);
        }
    }

    // เลือก item จากผลค้นหา
    const chooseItem = (it: ItemRow) => {
        setSelectedItemId(Number(it.item_id));
        setSearch(it.item_name);
        setLiveResults([]);
        setOpenDropdown(false);
        setHighlight(-1);
    };

    // คีย์บอร์ดในช่องค้นหา
    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!openDropdown) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight(h => Math.min(h + 1, liveResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight(h => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            if (highlight >= 0 && liveResults[highlight]) {
                e.preventDefault();
                chooseItem(liveResults[highlight]);
            }
        } else if (e.key === 'Escape') {
            setOpenDropdown(false);
            setHighlight(-1);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-4">แบบฟอร์มวางแผนงบประมาณ</h1>

                    {step === 1 && (
                        <div className="space-y-4 border rounded-xl p-4">
                            <div>
                                <label className="font-medium">ปีงบประมาณ</label>
                                <select className="border rounded p-2 w-full mt-1" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                                    <option value="">— เลือกปีงบประมาณ —</option>
                                    {years.map(y => (
                                        <option key={y.bdg_year} value={y.bdg_year}>{y.bdg_year}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-medium">แผนก</label>
                                {departments.length === 1 ? (
                                    <input className="border rounded p-2 w-full mt-1 bg-gray-100" value={departments[0].department_name} readOnly />
                                ) : (
                                    <select className="border rounded p-2 w-full mt-1" value={selectedDeptId || ''} onChange={e => setSelectedDeptId(Number(e.target.value))}>
                                        <option value="">— เลือกแผนก —</option>
                                        {departments.map(d => (
                                            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    disabled={!canNext}
                                    onClick={() => setStep(2)}
                                    className={`px-4 py-2 rounded text-white transition ${canNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="font-medium">ค้นหารายการ (ID/ชื่อ)</label>
                                    <div className="relative mt-1">
                                        <div className="flex items-center border rounded px-2">
                                            <SearchIcon className="w-4 h-4 mr-2 opacity-60" />
                                            <input
                                                ref={inputRef}
                                                className="p-2 w-full outline-none"
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                onKeyDown={onSearchKeyDown}
                                                placeholder="พิมพ์อย่างน้อย 2 ตัวอักษร เช่น 13085 หรือ พาราเซตามอล"
                                                onFocus={() => { if (liveResults.length || searchError) setOpenDropdown(true); }}
                                            />
                                            {search && (
                                                <button
                                                    className="p-1 opacity-60 hover:opacity-100 transition"
                                                    onClick={() => { setSearch(''); setLiveResults([]); setOpenDropdown(false); setHighlight(-1); }}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Loading / Error */}
                                        {searchLoading && (
                                            <div className="absolute right-2 top-2.5 flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                กำลังค้นหา…
                                            </div>
                                        )}
                                        {!searchLoading && searchError && openDropdown && (
                                            <div className="absolute z-20 w-full mt-1 border rounded bg-white text-sm p-3 text-red-600">
                                                {searchError}
                                            </div>
                                        )}

                                        {/* Dropdown results */}
                                        {openDropdown && !searchLoading && !searchError && (liveResults.length > 0 ? (
                                            <ul
                                                ref={dropdownRef}
                                                className="absolute z-20 w-full mt-1 max-h-72 overflow-auto border rounded bg-white shadow-sm">
                                                {liveResults.map((it, idx) => (
                                                    <li
                                                        key={it.item_id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => chooseItem(it)}
                                                        className={`px-3 py-2 flex items-center justify-between cursor-pointer transition
                          ${idx === highlight ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                        <div>
                                                            <div className="font-medium">{it.item_name}</div>
                                                            <div className="text-xs text-gray-500">ID: {it.item_id} • หน่วยพื้นฐาน: {it.item_unit}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="absolute z-20 w-full mt-1 border rounded bg-white text-sm p-3 text-gray-500">
                                                ไม่พบผลลัพธ์
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pb-2">
                                    <label className="font-medium block">อ้างอิงราคา</label>
                                    <div className="mt-1 px-3 py-2 border rounded bg-gray-50 text-sm">
                                        ณ วันนี้ ({new Date().toISOString().slice(0, 10)})
                                    </div>
                                </div>
                            </div>

                            {basic && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm border rounded-xl p-4">
                                    <div><span className="font-semibold">ชื่อรายการ:</span> {basic.item_name}</div>
                                    <div><span className="font-semibold">หน่วยพื้นฐาน:</span> {basic.item_unit}</div>
                                    <div><span className="font-semibold">ประเภทสินค้า:</span> {basic.item_type_name ?? '-'}</div>
                                    <div><span className="font-semibold">หมวด (Class):</span> {basic.stock_class_name ?? '-'}</div>
                                    <div><span className="font-semibold">หมวดย่อย (Sub-class):</span> {basic.stock_sub_class_name ?? '-'}</div>
                                    <div><span className="font-semibold">ED Type:</span> {basic.stock_item_ed_type_name ?? '-'}</div>
                                </div>
                            )}

                            {units.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="font-medium">หน่วยบรรจุ (ที่ต้องการซื้อ)</label>
                                        <select
                                            className="border rounded p-2 w-full mt-1"
                                            value={selectedUnitId ?? ''} // '' เพื่อแสดง placeholder เมื่อ null
                                            onChange={e => {
                                                const v = e.target.value;
                                                setSelectedUnitId(v ? Number(v) : null);
                                            }}
                                        >
                                            <option value="">— เลือกหน่วย —</option>
                                            {units.map(u => (
                                                <option key={u.stock_item_unit_id} value={u.stock_item_unit_id}>
                                                    {u.item_unit_name} (x{u.unit_qty})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-medium">ขนาดบรรจุ</label>
                                        <input
                                            className="border rounded p-2 w-full mt-1 bg-gray-100"
                                            value={selectedUnitQty ?? ''}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="font-medium">ราคาต่อหน่วยล่าสุด</label>
                                        <input
                                            className="border rounded p-2 w-full mt-1 bg-gray-100"
                                            value={unitCostSum != null ? formatMoney(unitCostSum) : ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-2">จำนวนตามไตรมาส</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label>ไตรมาส 1
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={periodQty.p1}
                                                onChange={e => setPeriodQty({ ...periodQty, p1: e.target.value })} />
                                        </label>
                                        <label>ไตรมาส 2
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={periodQty.p2}
                                                onChange={e => setPeriodQty({ ...periodQty, p2: e.target.value })} />
                                        </label>
                                        <label>ไตรมาส 3
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={periodQty.p3}
                                                onChange={e => setPeriodQty({ ...periodQty, p3: e.target.value })} />
                                        </label>
                                        <label>ไตรมาส 4
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={periodQty.p4}
                                                onChange={e => setPeriodQty({ ...periodQty, p4: e.target.value })} />
                                        </label>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-2">ราคารวมตามไตรมาส</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label>ไตรมาส 1
                                            <input className="border rounded p-2 w-full mt-1" value={periodAmount.a1} readOnly />
                                        </label>
                                        <label>ไตรมาส 2
                                            <input className="border rounded p-2 w-full mt-1" value={periodAmount.a2} readOnly />
                                        </label>
                                        <label>ไตรมาส 3
                                            <input className="border rounded p-2 w-full mt-1" value={periodAmount.a3} readOnly />
                                        </label>
                                        <label>ไตรมาส 4
                                            <input className="border rounded p-2 w-full mt-1" value={periodAmount.a4} readOnly />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* สรุปรวม */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-xl p-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <label>จำนวนรวม
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={sumQtyNumber || sumQtyNumber === 0 ? String(sumQtyNumber) : ''}
                                                readOnly />
                                        </label>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <label>ราคารวม
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={formatMoney(sumAmountNumber)}
                                                readOnly />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* ประวัติการใช้ & คงคลัง */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-2">ปริมาณการใช้ย้อนหลัง (ปี)</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label>1 ปี
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={historyQty.y1}
                                                onChange={e => setHistoryQty({ ...historyQty, y1: e.target.value })} />
                                        </label>
                                        <label>2 ปี
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={historyQty.y2}
                                                onChange={e => setHistoryQty({ ...historyQty, y2: e.target.value })} />
                                        </label>
                                        <label>3 ปี
                                            <input className="border rounded p-2 w-full mt-1"
                                                value={historyQty.y3}
                                                onChange={e => setHistoryQty({ ...historyQty, y3: e.target.value })} />
                                        </label>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <h3 className="font-semibold mb-2">จำนวนคงคลังปัจจุบัน</h3>
                                    <input className="border rounded p-2 w-full"
                                        value={currentQty}
                                        onChange={e => setCurrentQty(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setStep(1)}>ย้อนกลับ</button>
                                <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleSave}>บันทึก</button>
                                <button className="px-4 py-2 rounded bg-orange-500 text-white" onClick={resetAll}>ล้างค่า</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
