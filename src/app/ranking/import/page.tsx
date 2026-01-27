"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

interface ExcelRow {
  B: any;
  C: any;
  J: any;
  K: any;
  L: any;
}

export default function ExcelPage() {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* -------------------- Excel -------------------- */
  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target?.result;
      if (!binaryStr) return;

      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
      });

      const body = rows.slice(4);

      const result: ExcelRow[] = body
        .filter((row) => {
          const j = row[9];
          return j !== null && j !== "" && String(j).trim() !== "-";
        })
        .map((row) => ({
          B: row[1],
          C: row[2],
          J: row[9],
          K: row[10],
          L: row[11],
        }));

      setData(result);
    };

    reader.readAsBinaryString(file);
  };

  /* -------------------- Upload -------------------- */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    setData([]);
    setFileName("");
  };

  /* -------------------- Save API -------------------- */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = data.map((row) => ({
        item_name: row.B,
        item_unit: row.C,
        period1_qty: row.J,
        total_qty: row.K,
        item_type_name: row.L,
      }));
      console.log("Payload to save:", payload);
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("save failed");

      alert("บันทึกข้อมูลเรียบร้อย");
      setShowConfirm(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-red-400 bg-clip-text text-transparent mb-3">
            Excel Reader
          </h1>
          <p className="text-gray-600">อัปโหลดไฟล์ Excel เพื่ออ่านข้อมูลตั้งแต่แถวที่ 5</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 border-gray-100">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-green-400 bg-green-50 scale-[1.02]"
                : "border-gray-300 hover:border-green-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {isDragging ? "วางไฟล์ที่นี่" : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง"}
                </p>
                <p className="text-sm text-gray-500">รองรับไฟล์ .xlsx และ .xls</p>
              </div>
            </label>
          </div>

          {fileName && (
            <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{fileName}</p>
                  <p className="text-sm text-gray-500">{data.length} รายการ</p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors duration-200"
              >
                ล้างข้อมูล
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        {data.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
            {/* Top Action Bar */}
            <div className="bg-gradient-to-r from-green-100 to-red-100 px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ผลลัพธ์</h2>
                <p className="text-gray-600 mt-1">
                  พบทั้งหมด <span className="font-bold text-green-600">{data.length}</span> รายการ
                </p>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>บันทึกข้อมูล</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-red-50">
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-green-200 w-16">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-green-200">
                      รายการ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-green-200">
                      หน่วย
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-green-200">
                      จำนวน
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-green-200">
                      งบ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-red-200">
                      หน่วยงาน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-red-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 border-b border-gray-100 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-lg text-sm font-semibold">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 border-b border-gray-100">
                        {row.B ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 border-b border-gray-100">
                        {row.C ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 border-b border-gray-100">
                        {row.J ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 border-b border-gray-100">
                        {row.K ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 border-b border-gray-100">
                        {row.L ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && fileName === "" && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">อัปโหลดไฟล์ Excel เพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-6 mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
                ยืนยันการบันทึก
              </h2>
              <p className="text-center text-gray-600 mb-8">
                ต้องการบันทึกข้อมูล{" "}
                <span className="font-bold text-green-600">{data.length}</span>{" "}
                รายการ ใช่หรือไม่?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>ยืนยัน</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}