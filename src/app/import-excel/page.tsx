"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ======= Helper Types =======
type RowShape = Record<string, any> & { __sheet?: string };

type ParsedSheet = {
    name: string;
    rows: RowShape[];
};

type ImportType = "investment" | "budget" | "dashboard";

type YearItem = { bdg_year: string | number };
type DepartmentItem = { department_id: number; department_name: string };

type FoundItem = {
    item_code: string;
    item_id: number;
};

type SaveItemBasic = {
    item_id: number | null;
    item_name: string | null;
    item_unit: string | null;
    item_type_name: string | null;
    item_code: string | null;
    stock_class_name: string | null;
    stock_sub_class_name: string | null;
    stock_item_ed_type_name: string | null;
};

type SaveItemPayload = {
    meta: {
        bdg_year: string | null;
        department_id: number | "";
    };
    item: {
        item_id: number | null;
        stock_item_unit_id: string | null;
        unit_qty: number | null;
        unit_cost: number | null;
        basic?: SaveItemBasic | null;
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
    __debug?: { sheet?: string; row_ref?: Record<string, any> };
    input_type: string | null;
};

type ItemBasicFromAPI = Partial<SaveItemBasic>;

// ======= Column Configs =======
const COLS_BY_TYPE: Record<ImportType, string[]> = {
    investment: ["B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O" , "X"],
    budget: ["B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "Q", "T", "U", "X"],
    dashboard: ["C", "D", "G", "H", "I", "J", "L", "N", "O", "P", "X"],
};

const colLetterToIndex = (letter: string) => {
    let sum = 0;
    for (const ch of letter) {
        sum = sum * 26 + (ch.charCodeAt(0) - 64);
    }
    return sum - 1;
};

const ALL_SHEETS = "__ALL__";

export default function Page() {
    const [step, setStep] = useState<number>(1);
    const [years, setYears] = useState<YearItem[]>([]);
    const [departments, setDepartments] = useState<DepartmentItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
    const canNext = Boolean(selectedYear && selectedDeptId);
    const [uploadMode, setUploadMode] = useState<"add" | "update" | "dashboard" | "">("");
    const [type, setType] = useState("");

    useEffect(() => {
        fetch("/api/budget-years")
            .then((r) => r.json())
            .then((res) => {
                if (res?.success) setYears(res.data as YearItem[]);
            })
            .catch(() => {});

        const depID = typeof window !== "undefined" ? localStorage.getItem("officer_id") : null;
        fetch(`/api/departments?userId=${depID ?? ""}`)
            .then((r) => r.json())
            .then((res) => {
                if (res?.success) {
                    const data = (res.data ?? []) as DepartmentItem[];
                    setDepartments(data);
                    if (Array.isArray(data) && data.length === 1) {
                        setSelectedDeptId(Number(data[0].department_id));
                    }
                }
            })
            .catch(() => {});
    }, []);

    const [fileName, setFileName] = useState<string>("");
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
    const [parsed, setParsed] = useState<ParsedSheet[]>([]);
    const [previewSheet, setPreviewSheet] = useState<string | null>(null);
    const [importType, setImportType] = useState<ImportType>("investment");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [checking, setChecking] = useState(false);
    const [checkError, setCheckError] = useState<string | null>(null);
    const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
    const [notFoundCodes, setNotFoundCodes] = useState<string[]>([]);
    const [checkTotal, setCheckTotal] = useState<number>(0);

    const [payloadPreview, setPayloadPreview] = useState<SaveItemPayload[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveResultMsg, setSaveResultMsg] = useState<string | null>(null);

    const [itemBasics, setItemBasics] = useState<Record<number, ItemBasicFromAPI>>({});

    const requiredCols = useMemo(() => COLS_BY_TYPE[importType], [importType]);
    const requiredIndexes = useMemo(() => requiredCols.map(colLetterToIndex), [requiredCols]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFileName(f.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;
            const wb = XLSX.read(data, { type: "array" });
            setWorkbook(wb);
            setSheetNames(wb.SheetNames);
            setSelectedSheets([]);
            setParsed([]);
            setPreviewSheet(null);
            resetCheckResults();
            setPayloadPreview([]);
            setSaveError(null);
            setSaveResultMsg(null);
            setItemBasics({});
        };
        reader.readAsArrayBuffer(f);
    }

    function toggleSheet(name: string) {
        setSelectedSheets((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
    }

    async function checkItems(codes: string[]) {
        try {
            setChecking(true);
            setCheckError(null);

            if (codes.length === 0) {
                setChecking(false);
                setCheckError("ไม่พบค่าจากคอลัมน์ C ที่จะใช้ตรวจสอบ");
                setFoundItems([]);
                setNotFoundCodes([]);
                setCheckTotal(0);
                return;
            }


            if (importType === "dashboard") {
                setType(importType);
            }else{
                setType(importType);
            }
            
            const res = await fetch("/api/import-excel/check-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codes , type }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            console.log("Check items result:", data);
            setFoundItems(Array.isArray(data.found) ? data.found : []);
            console.log("Found items:", data.found);
            setNotFoundCodes(Array.isArray(data.notFound) ? data.notFound : []);
            setCheckTotal(data.total ?? codes.length);
        } catch (e: any) {
            setCheckError(e?.message || "เกิดข้อผิดพลาดระหว่างตรวจสอบ");
        } finally {
            setChecking(false);
        }
    }

    const collectCodesFromState = (): string[] => {
        const raw = parsed.flatMap((ps) => ps.rows.map((r) => String((r as any)["X"] ?? "").trim()));
        return Array.from(new Set(raw.filter((x) => x !== "")));
    };

    function checkItemsFromState() {
        const codes = collectCodesFromState();
        console.log("Checking items for codes:", codes);
        checkItems(codes);
    }

    function parseSelected() {
        if (!workbook || selectedSheets.length === 0) return;
      
        const CODE_COL = "X"; // ⭐ คอลัมน์ที่ใช้เป็น code หลัก
      
        const results: ParsedSheet[] = selectedSheets.map((name) => {
          const ws = workbook.Sheets[name];
          if (!ws) return { name, rows: [] };
      
          const data2D: any[][] = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            defval: "",
            blankrows: false,
            raw: false, // ⭐ สำคัญมาก: ให้ XLSX คืน "ผลลัพธ์ของสูตร"
          });
      
          // ข้าม header 4 แถว
          const sliced = data2D.slice(4);
          const rows: RowShape[] = [];
      
          for (const row of sliced) {
            const obj: RowShape = {};
      
            // map column จาก index
            requiredCols.forEach((col, i) => {
              const idx = requiredIndexes[i];
              obj[col] = row?.[idx] ?? "";
            });
      
            obj.__sheet = name;
      
            // ✅ อ่านค่า code จากคอลัมน์ X (รองรับสูตร)
            const code = String(obj[CODE_COL] ?? "")
              .replace(/\u00A0/g, " ")
              .trim();
      
            // ไม่มี code → ข้าม
            if (code === "") continue;
      
            // อย่างน้อยต้องมีข้อมูลสักคอลัมน์
            const hasValue = requiredCols.some(
              (c) => String(obj[c] ?? "").trim() !== ""
            );
      
            if (hasValue) rows.push(obj);
          }
      
          return { name, rows };
        });
      
        // ====== state reset / update ======
        setParsed(results);
        if (results.length > 0) setPreviewSheet(ALL_SHEETS);
      
        resetCheckResults();
        setPayloadPreview([]);
        setSaveError(null);
        setSaveResultMsg(null);
        setItemBasics({});
      
        // ====== รวม code จากทุก sheet (ไม่ซ้ำ) ======
        const autoCodes = Array.from(
          new Set(
            results.flatMap((ps) =>
              ps.rows
                .map((r) => String((r as any)[CODE_COL] ?? "").trim())
                .filter((x) => x !== "")
            )
          )
        );
      
        // ส่งไปเช็ก item
        checkItems(autoCodes);
      }
      

    function downloadJSON() {
        const payload = parsed.flatMap((ps) => ps.rows);
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `extracted_${importType}_${fileName.replace(/\.[^.]+$/, "")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadCSV() {
        const cols = requiredCols;
        const header = [...cols, "sheet"].join(",");
        const allRows = parsed.flatMap((ps) => ps.rows.map((r) => ({ ...r, sheet: ps.name })));

        const lines = [
            header,
            ...allRows.map((r) => {
                const values = cols.map((c) => sanitizeCSV(String((r as any)[c] ?? "")));
                values.push(sanitizeCSV(String((r as any)["__sheet"] ?? "")));
                return values.join(",");
            }),
        ];

        const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `extracted_${importType}_${fileName.replace(/\.[^.]+$/, "")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function sanitizeCSV(v: string) {
        const needsQuote = /[",\r\n]/.test(v);
        let out = v.replace(/"/g, '""');
        if (needsQuote) out = `"${out}"`;
        return out;
    }

    function resetAll() {
        setWorkbook(null);
        setSheetNames([]);
        setSelectedSheets([]);
        setParsed([]);
        setPreviewSheet(null);
        setFileName("");
        if (inputRef.current) inputRef.current.value = "";
        resetCheckResults();
        setPayloadPreview([]);
        setSaveError(null);
        setSaveResultMsg(null);
        setItemBasics({});
    }

    function resetCheckResults() {
        setFoundItems([]);
        setNotFoundCodes([]);
        setCheckTotal(0);
        setCheckError(null);
        setChecking(false);
    }

    const selectedDeptName = departments.find((d) => d.department_id === Number(selectedDeptId))?.department_name ?? "";

    const asNumber = (v: any): number | null => {
        if (v === null || v === undefined) return null;
        let s = String(v);
        const thai = "๐๑๒๓๔๕๖๗๘๙";
        const arab = "0123456789";
        s = s.replace(/[๐-๙]/g, (d) => arab[thai.indexOf(d)]);
        s = s.replace(/\u00A0/g, " ");
        s = s.replace(/\s+/g, " ").trim();
        s = s.replace(/,/g, "");
        s = s.replace(/[^\d.\-]/g, "");
        if (s === "" || s === "-" || s === ".") return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    };

    const findItemByCode = (code: string): FoundItem | undefined =>
        foundItems.find((fi) => String(fi.item_id).trim() === String(code).trim());

    // async function fetchItemBasic(itemId: number): Promise<ItemBasicFromAPI | null> {
    //     try {
    //         const res = await fetch(`/api/item/${itemId}/basic`);
    //         if (!res.ok) return null;
    //         const json = await res.json();
    //         const data = json?.data ?? json ?? null;
    //         if (!data || typeof data !== "object") return null;

    //         const basic: ItemBasicFromAPI = {
    //             item_type_name: data.item_type_name ?? null,
    //             stock_class_name: data.stock_class_name ?? null,
    //             stock_sub_class_name: data.stock_sub_class_name ?? null,
    //             stock_item_ed_type_name: data.stock_item_ed_type_name ?? null,
    //             item_name: data.item_name ?? null,
    //             item_unit: data.item_unit ?? null,
    //             item_id: Number(data.item_id ?? itemId) || itemId,
    //             item_code: data.item_code ?? null,
    //         };
    //         return basic;
    //     } catch {
    //         return null;
    //     }
    // }

// เพิ่ม function ใหม่
async function fetchItemBasicsBatch(itemIds: number[]): Promise<Record<number, ItemBasicFromAPI>> {
    try {
        const res = await fetch('/api/item/batch-basic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: itemIds })
        });
        
        if (!res.ok) return {};
        const json = await res.json();
        
        return json?.data ?? {};
    } catch (err) {
        console.error('fetchItemBasicsBatch error:', err);
        return {};
    }
}

// แก้ไข useEffect
useEffect(() => {
    if (!foundItems || foundItems.length === 0) return;
    
    const ids = Array.from(new Set(foundItems.map((f) => f.item_id).filter(Boolean)));
    const missing = ids.filter((id) => !(id in itemBasics));
    
    if (missing.length === 0) return;
    
    (async () => {
        // ✅ เรียก API ครั้งเดียว แทน N ครั้ง
        const results = await fetchItemBasicsBatch(missing);
        
        if (Object.keys(results).length > 0) {
            setItemBasics((prev) => ({ ...prev, ...results }));
        }
    })();
}, [foundItems]);;

    function buildPayload(): SaveItemPayload[] {
        const allRows = parsed.flatMap((ps) => ps.rows.map((r) => ({ ...r, __sheet: ps.name })));
        const items: SaveItemPayload[] = [];

        for (const row of allRows) {
            
            const itemCodeC = String((row as any)["X"] ?? "").trim();
            console.log("Processing itemCodeC:", itemCodeC);
            if (!itemCodeC) continue;

            const matched = findItemByCode(itemCodeC);
            if (importType !== "dashboard" && !matched) continue;

            const itemNameB = String(row["B"] ?? "").trim();
            const unitNameD = String(row["D"] ?? "").trim();
            const extra = itemBasics[matched.item_id] || {};

            if (importType === "investment") {
                const unitCostF = asNumber(row["F"]);
                const unitCostG = asNumber(row["G"]);
                const unitCostH = asNumber(row["H"]);
                const unitCostI = asNumber(row["I"]);
                const unitQtyAll = (unitCostF ?? 0) + (unitCostG ?? 0);

                const payload: SaveItemPayload = {
                    meta: {
                        bdg_year: selectedYear || null,
                        department_id: selectedDeptId,
                    },
                    item: {
                        item_id: matched.item_id ?? null,
                        stock_item_unit_id: unitNameD || null,
                        unit_qty: unitQtyAll,
                        unit_cost: unitCostH,
                        basic: {
                            item_id: matched.item_id ?? null,
                            item_name: itemNameB || extra.item_name ?? null,
                            item_unit: unitNameD || extra.item_unit ?? null,
                            item_type_name: extra.item_type_name ?? null,
                            item_code: itemCodeC || extra.item_code ?? null,
                            stock_class_name: extra.stock_class_name ?? null,
                            stock_sub_class_name: extra.stock_sub_class_name ?? null,
                            stock_item_ed_type_name: extra.stock_item_ed_type_name ?? null,
                        },
                    },
                    periods: {
                        qty: {
                            q1: unitQtyAll,
                            q2: 0,
                            q3: 0,
                            q4: 0,
                            total: unitQtyAll,
                        },
                        amount: {
                            q1: unitCostI,
                            q2: 0,
                            q3: 0,
                            q4: 0,
                            total: unitCostI,
                        },
                    },
                    history: {
                        last_1_year_qty: 0,
                        last_2_year_qty: 0,
                        last_3_year_qty: 0,
                    },
                    current_qty: 0,
                    input_type: uploadMode === "update" ? "edit" : "add",
                };

                items.push(payload);
            } else if (importType === "budget" ) {
                const unitQtyJ = asNumber(row["J"]);
                const unitQtyL = asNumber(row["L"]);
                const unitCostM = asNumber(row["M"]);
                const amtN = asNumber(row["N"]) ?? 0;
                const amtO = asNumber(row["O"]) ?? 0;
                const amtP = asNumber(row["P"]) ?? 0;
                const amtQ = asNumber(row["Q"]) ?? 0;

                const totalQtyE = asNumber(row["E"]);
                const totalAmtM = unitCostM;

                const payload: SaveItemPayload = {
                    meta: {
                        bdg_year: selectedYear || null,
                        department_id: selectedDeptId,
                    },
                    item: {
                        item_id: matched.item_id ?? null,
                        stock_item_unit_id: unitNameD || null,
                        unit_qty: unitQtyL,
                        unit_cost: unitCostM,
                        basic: {
                            item_id: matched.item_id ?? null,
                            item_name: itemNameB || extra.item_name ?? null,
                            item_unit: unitNameD || extra.item_unit ?? null,
                            item_type_name: extra.item_type_name ?? null,
                            item_code: itemCodeC || extra.item_code ?? null,
                            stock_class_name: extra.stock_class_name ?? null,
                            stock_sub_class_name: extra.stock_sub_class_name ?? null,
                            stock_item_ed_type_name: extra.stock_item_ed_type_name ?? null,
                        },
                    },
                    periods: {
                        qty: {
                            q1: unitQtyJ,
                            q2: 0,
                            q3: 0,
                            q4: 0,
                            total: unitQtyJ ?? null
                        },
                        amount: {
                            q1: amtN,
                            q2: amtO,
                            q3: amtP,
                            q4: amtQ,
                            total: totalAmtM ?? null
                        },
                    },
                    history: {
                        last_1_year_qty: asNumber(row["E"]),
                        last_2_year_qty: asNumber(row["F"]),
                        last_3_year_qty: asNumber(row["G"]),
                    },
                    current_qty: asNumber(row["H"]),
                    __debug: {
                        sheet: (row as any).__sheet,
                        row_ref: row as any,
                    },
                    input_type: uploadMode === "update" ? "edit" : "add",
                };
                items.push(payload);
            }else if(importType === "dashboard"){
                console.log("dashboard payload");
                const unitQtyJ = asNumber(row["J"]);
                const unitQtyL = asNumber(row["L"]);
                const unitCostM = asNumber(row["M"]);
                const amtN = asNumber(row["N"]) ?? 0;
                const amtO = asNumber(row["O"]) ?? 0;
                const amtP = asNumber(row["P"]) ?? 0;
                const amtQ = asNumber(row["Q"]) ?? 0;

                const totalQtyE = asNumber(row["E"]);
                const totalAmtM = unitCostM;

                const payload: SaveItemPayload = {
                    meta: {
                        bdg_year: selectedYear || null,
                        department_id: selectedDeptId,
                    },
                    item: {
                        item_id: matched.item_id ?? null,
                        stock_item_unit_id: unitNameD || null,
                        unit_qty: unitQtyL,
                        unit_cost: unitCostM,
                        basic: {
                            item_id: matched.item_id ?? null,
                            item_name: itemNameB || extra.item_name ?? null,
                            item_unit: unitNameD || extra.item_unit ?? null,
                            item_type_name: extra.item_type_name ?? null,
                            item_code: itemCodeC || extra.item_code ?? null,
                            stock_class_name: extra.stock_class_name ?? null,
                            stock_sub_class_name: extra.stock_sub_class_name ?? null,
                            stock_item_ed_type_name: extra.stock_item_ed_type_name ?? null,
                        },
                    },
                    periods: {
                        qty: {
                            q1: unitQtyJ,
                            q2: 0,
                            q3: 0,
                            q4: 0,
                            total: unitQtyJ ?? null
                        },
                        amount: {
                            q1: amtN,
                            q2: amtO,
                            q3: amtP,
                            q4: amtQ,
                            total: totalAmtM ?? null
                        },
                    },
                    history: {
                        last_1_year_qty: asNumber(row["E"]),
                        last_2_year_qty: asNumber(row["F"]),
                        last_3_year_qty: asNumber(row["G"]),
                    },
                    current_qty: asNumber(row["H"]),
                    __debug: {
                        sheet: (row as any).__sheet,
                        row_ref: row as any,
                    },
                    input_type: uploadMode === "update" ? "edit" : "add",
                };
                items.push(payload);
            }
        }

        return items;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fefefe] to-gray-50">
            {/* Header */}
            <div className="bg-[#008374] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold mb-2">นำเข้าไฟล์ Excel</h1>
                    <p className="text-[#89ba16] text-sm">เลือกหลายชีตและจัดการข้อมูลพัสดุ</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Step 1 */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">ข้อมูลเบื้องต้น</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ปีงบประมาณ</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008374] focus:border-transparent outline-none transition"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">— เลือกปีงบประมาณ —</option>
                                    {years.map((y) => (
                                        <option key={String(y.bdg_year)} value={String(y.bdg_year)}>
                                            {String(y.bdg_year)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">แผนก</label>
                                {departments.length === 1 ? (
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                            value={departments[0]?.department_name ?? ""}
                                            readOnly
                                        />
                                        <div className="absolute right-3 top-3 text-xs bg-[#89ba16] bg-opacity-10 text-[#89ba16] px-2 py-1 rounded-full">
                                            อัตโนมัติ
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008374] focus:border-transparent outline-none transition"
                                        value={selectedDeptId}
                                        onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : "")}
                                    >
                                        <option value="">— เลือกแผนก —</option>
                                        {departments.map((d) => (
                                            <option key={d.department_id} value={d.department_id}>
                                                {d.department_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">รูปแบบการอัปโหลด</label>
                                <div className="flex gap-6">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="uploadMode"
                                            value="add"
                                            checked={uploadMode === "add"}
                                            onChange={() => setUploadMode("add")}
                                            className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                        />
                                        <span className="text-gray-700">อัปโหลดเพิ่มแผน</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="uploadMode"
                                            value="update"
                                            checked={uploadMode === "update"}
                                            onChange={() => setUploadMode("update")}
                                            className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                        />
                                        <span className="text-gray-700">อัปโหลดปรับแผน</span>
                                    </label>

                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="uploadMode"
                                            value="dashboard"
                                            checked={uploadMode === "dashboard"}
                                            onChange={() => setUploadMode("dashboard")}
                                            className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                        />
                                        <span className="text-gray-700">Dashboard</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    disabled={!canNext}
                                    onClick={() => setStep(2)}
                                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        canNext
                                            ? "bg-[#008374] hover:bg-[#006d61] text-white shadow-sm"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <>
                        <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <button 
                                onClick={() => setStep(1)} 
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                ← ย้อนกลับ
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <span className="text-sm text-gray-600">กำลังทำงานภายใต้:</span>
                            <span className="px-3 py-1 rounded-full text-sm bg-[#008374] text-white bg-opacity-10 text-[#008374] font-medium">
                                ปี: {selectedYear}
                            </span>
                            <span className="px-3 py-1 rounded-full text-white text-sm bg-[#89ba16] bg-opacity-10 text-[#89ba16] font-medium">
                                {selectedDeptName || departments[0]?.department_name}
                            </span>
                        </div>

                        {/* Import Type */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">ประเภทการนำเข้า</h2>
                            <div className="flex flex-wrap gap-6 items-center">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="importType"
                                        value="investment"
                                        checked={importType === "investment"}
                                        onChange={() => setImportType("investment")}
                                        className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                    />
                                    <span className="text-gray-700">แผนงบลงทุน</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="importType"
                                        value="budget"
                                        checked={importType === "budget"}
                                        onChange={() => setImportType("budget")}
                                        className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                    />
                                    <span className="text-gray-700">แผนงบประมาณ</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="importType"
                                        value="dashboard"
                                        checked={importType === "dashboard"}
                                        onChange={() => setImportType("dashboard")}
                                        className="w-4 h-4 text-[#008374] focus:ring-[#008374]"
                                    />
                                    <span className="text-gray-700">Dashboard</span>
                                </label>
                                <span className="text-sm text-gray-500">
                                    คอลัมน์: {requiredCols.join(", ")}
                                </span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">เลือกไฟล์</h2>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="block w-full md:w-auto cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#008374] file:text-white hover:file:bg-[#006d61] file:cursor-pointer border border-gray-300 rounded-lg"
                                />
                                {fileName && (
                                    <span className="text-sm text-gray-700">
                                        <span className="text-[#89ba16] font-medium">✓</span> {fileName}
                                    </span>
                                )}
                                <button 
                                    onClick={resetAll} 
                                    className="ml-auto px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    ล้างค่า
                                </button>
                            </div>
                            {!workbook && (
                                <p className="text-xs text-gray-500 mt-3">
                                    * รองรับเฉพาะไฟล์ Excel (.xlsx, .xls)
                                </p>
                            )}
                        </div>

                        {/* Sheet Selection */}
                        {workbook && (
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">เลือกชีตที่ต้องการอ่าน</h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedSheets(sheetNames)}
                                            className="px-3 py-2 text-sm rounded-lg  bg-opacity-10 text-[#89ba16] hover:bg-opacity-20 transition-colors"
                                        >
                                            เลือกทั้งหมด
                                        </button>
                                        <button
                                            onClick={() => setSelectedSheets([])}
                                            className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            ไม่เลือก
                                        </button>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3">
                                    {sheetNames.map((name) => (
                                        <label 
                                            key={name} 
                                            className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedSheets.includes(name)
                                                    ? "border-[#008374] bg-[#008374] bg-opacity-5"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSheets.includes(name)} 
                                                onChange={() => toggleSheet(name)}
                                                className="w-4 h-4 text-[#008374] focus:ring-[#008374] rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{name}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                        disabled={selectedSheets.length === 0}
                                        onClick={parseSelected}
                                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                            selectedSheets.length === 0
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-[#008374] hover:bg-[#006d61] text-white shadow-sm"
                                        }`}
                                    >
                                        อ่านข้อมูลจากชีตที่เลือก
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Preview & Actions */}
                        {parsed.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
                                {/* Header Actions */}
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <h2 className="text-lg font-semibold text-gray-800">พรีวิวข้อมูล</h2>
                                        <select
                                            value={previewSheet ?? ""}
                                            onChange={(e) => setPreviewSheet(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#008374] focus:border-transparent"
                                        >
                                            <option value={ALL_SHEETS}>ทั้งหมด (รวมทุกชีต)</option>
                                            {parsed.map((ps) => (
                                                <option key={ps.name} value={ps.name}>
                                                    {ps.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={downloadJSON} 
                                            className="px-4 py-2 text-sm rounded-lg bg-[#89ba16] text-white hover:bg-[#7aa514] transition-colors"
                                        >
                                            ดาวน์โหลด JSON
                                        </button>
                                        <button 
                                            onClick={downloadCSV} 
                                            className="px-4 py-2 text-sm rounded-lg bg-[#008374] text-white hover:bg-[#006d61] transition-colors"
                                        >
                                            ดาวน์โหลด CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Check Items */}
                                <div className="flex flex-col md:flex-row md:items-center gap-3 pb-4 border-b border-gray-200">
                                    <button
                                        onClick={checkItemsFromState}
                                        disabled={checking}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            checking
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                    >
                                        {checking ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                กำลังตรวจสอบ...
                                            </span>
                                        ) : (
                                            "ตรวจสอบอีกครั้ง (คอลัมน์ C)"
                                        )}
                                    </button>
                                    {checkError && (
                                        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                                            {checkError}
                                        </span>
                                    )}
                                </div>

                                {/* Build & Save Payload */}
                                <div className="flex flex-col md:flex-row md:items-center gap-3 pb-4 border-b border-gray-200">
                                    <button
                                        onClick={() => {
                                            const built = buildPayload();
                                            setPayloadPreview(built);
                                            setSaveResultMsg(null);
                                            setSaveError(null);
                                            if (!built.length) {
                                                setSaveError("ไม่มีแถวที่ตรงกับรายการในฐานข้อมูล");
                                            }
                                        }}
                                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
                                    >
                                        สร้างตัวอย่างข้อมูลที่จะส่ง
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaving(true);
                                                setSaveError(null);
                                                setSaveResultMsg(null);

                                                const toSend = payloadPreview.length > 0 ? payloadPreview : buildPayload();

                                                if (!toSend.length) {
                                                    setSaveError("ไม่มีข้อมูลที่จะส่ง");
                                                    setSaving(false);
                                                    return;
                                                }

                                                const payload: any = toSend.length === 1 ? toSend[0] : toSend;
                                                const endpoint = uploadMode === "update" ? "/api/budget-edit" : "/api/budget-requests";

                                                const res = await fetch(endpoint, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(payload),
                                                });

                                                const json = await res.json();
                                                if (!json.success) {
                                                    setSaveError("บันทึกล้มเหลว: " + (json.error || "unknown error"));
                                                    return;
                                                }

                                                if (json.data) {
                                                    setSaveResultMsg(
                                                        `บันทึกสำเร็จ • ID: ${json.data.stock_plan_id} • List ID: ${json.data.stock_plan_list_id}`
                                                    );
                                                } else if (Array.isArray(json.results)) {
                                                    const ok = json.results.filter((r: any) => r.success);
                                                    setSaveResultMsg(
                                                        `บันทึกเสร็จสิ้น • สำเร็จ: ${ok.length}/${json.results.length} รายการ`
                                                    );
                                                } else {
                                                    setSaveResultMsg("บันทึกสำเร็จ");
                                                }
                                            } catch (e: any) {
                                                setSaveError("เกิดข้อผิดพลาด: " + e.message);
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            saving
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-[#89ba16] hover:bg-[#7aa514] text-white"
                                        }`}
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                กำลังบันทึก...
                                            </span>
                                        ) : (
                                            "ส่งบันทึกข้อมูล"
                                        )}
                                    </button>

                                    {saveError && (
                                        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg ">
                                            {saveError}
                                        </span>
                                    )}
                                    {saveResultMsg && (
                                        <span className="text-sm text-[#89ba16] bg-[#89ba16] bg-opacity-10 px-3 py-1 rounded-lg text-white">
                                            {saveResultMsg}
                                        </span>
                                    )}
                                </div>

                                {/* Check Results */}
                                {(foundItems.length > 0 || notFoundCodes.length > 0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                                        <h3 className="font-semibold text-gray-800 mb-3">ผลการตรวจสอบ</h3>
                                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                                            <span className="px-3 py-1 bg-white rounded-full border border-gray-300">
                                                รวม: <b>{checkTotal}</b>
                                            </span>
                                            <span className="px-3 py-1 bg-[#89ba16] bg-opacity-10 text-[#89ba16] rounded-full border border-[#89ba16] border-opacity-30">
                                                พบ: <b>{foundItems.length}</b>
                                            </span>
                                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-200">
                                                ไม่พบ: <b>{notFoundCodes.length}</b>
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-800">
                                                        รายการที่ <span className="text-[#89ba16]">พบ</span>
                                                    </h4>
                                                    <span className="text-xs px-2 py-1 bg-[#89ba16] bg-opacity-10 text-[#89ba16] rounded-full">
                                                        {foundItems.length}
                                                    </span>
                                                </div>
                                                {foundItems.length === 0 ? (
                                                    <p className="text-sm text-gray-500">—</p>
                                                ) : (
                                                    <div className="max-h-56 overflow-auto">
                                                        <ul className="text-sm space-y-2">
                                                            {foundItems.map((it) => {
                                                                const extra = itemBasics[it.item_id];
                                                                return (
                                                                    <li 
                                                                        key={it.item_id} 
                                                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                                                    >
                                                                        <span className="font-medium">{it.item_name}</span>
                                                                        <span className="text-xs text-gray-500">#{it.item_id}</span>
                                                                        {extra?.item_type_name && (
                                                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#008374] bg-opacity-10 text-white">
                                                                                {extra.item_type_name}
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-800">
                                                        รายการที่ <span className="text-red-600">ไม่พบ</span>
                                                    </h4>
                                                    <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                                        {notFoundCodes.length}
                                                    </span>
                                                </div>
                                                {notFoundCodes.length === 0 ? (
                                                    <p className="text-sm text-gray-500">—</p>
                                                ) : (
                                                    <div className="max-h-56 overflow-auto">
                                                        <ul className="text-sm space-y-2">
                                                            {notFoundCodes.map((c) => (
                                                                <li 
                                                                    key={c} 
                                                                    className="p-2 bg-red-50 rounded-lg text-red-700"
                                                                >
                                                                    {c}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payload Preview */}
                                {payloadPreview.length > 0 && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-800">พรีวิวข้อมูลที่จะส่ง</h3>
                                            <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-300">
                                                {payloadPreview.length} รายการ • แสดง 10 ตัวอย่าง
                                            </span>
                                        </div>
                                        <pre className="text-xs bg-white border border-gray-200 rounded-lg p-4 overflow-auto max-h-72 font-mono">
{JSON.stringify(payloadPreview.slice(0, 10), null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* Data Table */}
                                <div className="overflow-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-[#008374] text-white sticky top-0">
                                            <tr>
                                                {[...requiredCols, "sheet"].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left font-semibold">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsed
                                                .filter((ps) => previewSheet === ALL_SHEETS || ps.name === previewSheet)
                                                .flatMap((ps) => ps.rows.map((r) => ({ ...r, __sheet: ps.name })))
                                                .slice(0, 200)
                                                .map((r, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        {requiredCols.map((c) => (
                                                            <td key={c} className="px-4 py-2 text-gray-700">
                                                                {String((r as any)[c] ?? "")}
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-2">
                                                            <span className="text-xs px-2 py-1 bg-[#89ba16] bg-opacity-10 text-[#89ba16] rounded-full">
                                                                {(r as any).__sheet}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {parsed.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-8 text-center text-gray-500" colSpan={requiredCols.length + 1}>
                                                        ไม่มีข้อมูล
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-gray-500">
                                    * แสดงตัวอย่างสูงสุด 200 แถว • ประเภท: {importType === "investment" ? "แผนงบลงทุน" : "แผนงบประมาณ"}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}