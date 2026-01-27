// app/budget/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Search as SearchIcon, X, Calculator, FileText, History, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

type YearRow = { bdg_year: string };
type DeptRow = { department_id: number; department_name: string };

type ItemRow = { item_id: number; item_name: string; item_unit: string };

type ItemBasic = {
    item_id: number;
    item_code: string;
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
                console.log('Search results for', q, json);
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
        console.log('Selected item ID:', selectedItemId);
        (async () => {
            const [b, u] = await Promise.all([
                fetch(`/api/item/${selectedItemId}/basic`).then(r => r.json()),
                fetch(`/api/item/${selectedItemId}/units`).then(r => r.json()),
            ]);
            if (b.success) setBasic(b.data);
            console.log('Item basic:', b);
            console.log('Item units:', u);
            if (u.success) {
                console.log('Item units:', u);
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
        <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <Sidebar />
            <main className="flex-1">
                <div className="max-w-6xl mx-auto p-6">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <FileText className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">แบบฟอร์มวางแผนงบประมาณ</h1>
                                <p className="text-slate-500 mt-1">จัดทำแผนการจัดซื้อสินค้าประจำปี</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                                step >= 1 ? 'bg-slate-600 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                                1
                            </div>
                            <div className="text-xs font-medium text-slate-600 mt-2 absolute ml-[-10px] translate-y-8">
                                ข้อมูลพื้นฐาน
                            </div>
                        </div>
                        <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                            step >= 2 ? 'bg-slate-600' : 'bg-slate-200'
                        }`} />
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                                step >= 2 ? 'bg-slate-600 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                                2
                            </div>
                            <div className="text-xs font-medium text-slate-600 mt-2 absolute ml-[-15px] translate-y-8">
                                รายละเอียดสินค้า
                            </div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">ปีงบประมาณ</label>
                                    <select 
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-white" 
                                        value={selectedYear} 
                                        onChange={e => setSelectedYear(e.target.value)}
                                    >
                                        <option value="">— เลือกปีงบประมาณ —</option>
                                        {years.map(y => (
                                            <option key={y.bdg_year} value={y.bdg_year}>{y.bdg_year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">แผนก</label>
                                    {departments.length === 1 ? (
                                        <div className="relative">
                                            <input 
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed" 
                                                value={departments[0].department_name} 
                                                readOnly 
                                            />
                                            <div className="absolute right-3 top-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                อัตโนมัติ
                                            </div>
                                        </div>
                                    ) : (
                                        <select 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-white" 
                                            value={selectedDeptId || ''} 
                                            onChange={e => setSelectedDeptId(Number(e.target.value))}
                                        >
                                            <option value="">— เลือกแผนก —</option>
                                            {departments.map(d => (
                                                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        disabled={!canNext}
                                        onClick={() => setStep(2)}
                                        className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                                            canNext 
                                                ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5' 
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Search Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <SearchIcon className="w-4 h-4" />
                                            ค้นหารายการสินค้า
                                        </label>
                                        <div className="relative">
                                            <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-slate-500 focus-within:border-slate-500 transition-all duration-200">
                                                <SearchIcon className="w-5 h-5 mr-3 text-slate-400" />
                                                <input
                                                    ref={inputRef}
                                                    className="flex-1 outline-none text-slate-700 placeholder-slate-400"
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    onKeyDown={onSearchKeyDown}
                                                    placeholder="พิมพ์รหัสสินค้าหรือชื่อสินค้า (อย่างน้อย 2 ตัวอักษร)"
                                                    onFocus={() => { if (liveResults.length || searchError) setOpenDropdown(true); }}
                                                />
                                                {search && (
                                                    <button
                                                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200 ml-2"
                                                        onClick={() => { setSearch(''); setLiveResults([]); setOpenDropdown(false); setHighlight(-1); }}>
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Loading */}
                                            {searchLoading && (
                                                <div className="absolute right-4 top-3.5 flex items-center gap-2 text-sm text-slate-500">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-xs">กำลังค้นหา...</span>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {!searchLoading && searchError && openDropdown && (
                                                <div className="absolute z-30 w-full mt-2 p-4 border border-red-200 rounded-xl bg-red-50 text-red-600 text-sm">
                                                    {searchError}
                                                </div>
                                            )}

                                            {/* Dropdown results */}
                                            {openDropdown && !searchLoading && !searchError && (liveResults.length > 0 ? (
                                                <ul
                                                    ref={dropdownRef}
                                                    className="absolute z-30 w-full mt-2 max-h-80 overflow-auto border border-slate-200 rounded-xl bg-white shadow-lg">
                                                    {liveResults.map((it, idx) => (
                                                        <li
                                                            key={it.item_id}
                                                            role="button"
                                                            tabIndex={0}
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => chooseItem(it)}
                                                            className={`px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-slate-100 last:border-b-0 ${
                                                                idx === highlight ? 'bg-slate-50' : 'hover:bg-slate-50'
                                                            }`}>
                                                            <div className="font-medium text-slate-800">{it.item_name}</div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                รหัส: {it.item_id} • หน่วยพื้นฐาน: {it.item_unit}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : search.length >= 2 ? (
                                                <div className="absolute z-30 w-full mt-2 p-4 border border-slate-200 rounded-xl bg-white shadow-lg text-slate-500 text-sm">
                                                    ไม่พบผลลัพธ์ที่ตรงกับการค้นหา
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>

                                    <div className="w-64">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">อ้างอิงราคา</label>
                                        <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600">
                                            ณ วันนี้ ({new Date().toLocaleDateString('th-TH')})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item Details */}
                            {basic && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-slate-600" />
                                        ข้อมูลสินค้า
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">รหัสสินค้า:</span>
                                            <div className="text-slate-800 mt-1">{basic.item_code}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">ชื่อรายการ:</span>
                                            <div className="text-slate-800 mt-1">{basic.item_name}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">หน่วยพื้นฐาน:</span>
                                            <div className="text-slate-800 mt-1">{basic.item_unit}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">ประเภทสินค้า:</span>
                                            <div className="text-slate-800 mt-1">{basic.item_type_name || '-'}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">หมวด (Class):</span>
                                            <div className="text-slate-800 mt-1">{basic.stock_class_name || '-'}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">หมวดย่อย (Sub-class):</span>
                                            <div className="text-slate-800 mt-1">{basic.stock_sub_class_name || '-'}</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="font-medium text-slate-600">ED Type:</span>
                                            <div className="text-slate-800 mt-1">{basic.stock_item_ed_type_name || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Unit Selection */}
                            {units.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">หน่วยบรรจุและราคา</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">หน่วยบรรจุ (ที่ต้องการซื้อ)</label>
                                            <select
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-white"
                                                value={selectedUnitId ?? ''}
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
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">ขนาดบรรจุ</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                                                    value={selectedUnitQty ?? ''}
                                                    readOnly
                                                />
                                                <div className="absolute right-3 top-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                    อัตโนมัติ
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">ราคาต่อหน่วยล่าสุด</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                                                    value={unitCostSum != null ? formatMoney(unitCostSum) : ''}
                                                    readOnly
                                                />
                                                <div className="absolute right-3 top-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                    คำนวณ
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quarterly Planning */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-slate-600" />
                                        จำนวนตามไตรมาส
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'p1', label: 'ไตรมาส 1', color: 'blue' },
                                            { key: 'p2', label: 'ไตรมาส 2', color: 'green' },
                                            { key: 'p3', label: 'ไตรมาส 3', color: 'yellow' },
                                            { key: 'p4', label: 'ไตรมาส 4', color: 'red' }
                                        ].map(quarter => (
                                            <div key={quarter.key}>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {quarter.label}
                                                </label>
                                                <input 
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                                                    value={periodQty[quarter.key as keyof typeof periodQty]}
                                                    onChange={e => setPeriodQty({ ...periodQty, [quarter.key]: e.target.value })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        💰 ราคารวมตามไตรมาส
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'a1', label: 'ไตรมาส 1', color: 'blue' },
                                            { key: 'a2', label: 'ไตรมาส 2', color: 'green' },
                                            { key: 'a3', label: 'ไตรมาส 3', color: 'yellow' },
                                            { key: 'a4', label: 'ไตรมาส 4', color: 'red' }
                                        ].map(quarter => (
                                            <div key={quarter.key}>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {quarter.label}
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                                                        value={periodAmount[quarter.key as keyof typeof periodAmount]} 
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
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold text-lg cursor-not-allowed"
                                            value={sumQtyNumber || sumQtyNumber === 0 ? String(sumQtyNumber) : ''}
                                            readOnly 
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
                                            className="w-full px-4 py-3 border border-green-200 rounded-xl bg-white text-green-700 font-bold text-lg cursor-not-allowed"
                                            value={formatMoney(sumAmountNumber)}
                                            readOnly 
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
                                            { key: 'y1', label: '1 ปีที่แล้ว' },
                                            { key: 'y2', label: '2 ปีที่แล้ว' },
                                            { key: 'y3', label: '3 ปีที่แล้ว' }
                                        ].map(year => (
                                            <div key={year.key}>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {year.label}
                                                </label>
                                                <input 
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                                                    value={historyQty[year.key as keyof typeof historyQty]}
                                                    onChange={e => setHistoryQty({ ...historyQty, [year.key]: e.target.value })}
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg"
                                        value={currentQty}
                                        onChange={e => setCurrentQty(e.target.value)}
                                        placeholder="ระบุจำนวนคงคลัง"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex flex-wrap gap-4 justify-end">
                                    <button 
                                        className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 border border-slate-200"
                                        onClick={() => setStep(1)}
                                    >
                                        ← ย้อนกลับ
                                    </button>
                                    <button 
                                        className="px-6 py-3 rounded-xl font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 transition-all duration-200 border border-orange-200"
                                        onClick={resetAll}
                                    >
                                        🔄 ล้างข้อมูล
                                    </button>
                                    <button 
                                        className="px-8 py-3 rounded-xl font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                        onClick={handleSave}
                                    >
                                        💾 บันทึกข้อมูล
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}