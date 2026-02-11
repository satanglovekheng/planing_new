"use client";
import { useEffect, useState } from "react";

export default function UploadExcelPage() {
    const [department, setDepartment] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetch("/api/templates")
            .then(res => res.json())
            .then(setTemplates);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!department || !file || !selectedFileType || !departmentId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        const formData = new FormData();
        formData.append("departmentId", departmentId);
        formData.append("department", department);
        formData.append("file", file);
        formData.append("fileType", selectedFileType);

        const selectedTemplate = templates.find(t => t.name === selectedFileType);
        if (selectedTemplate) {
            formData.append("folder", selectedTemplate.folder);
        }

        setLoading(true);
        const res = await fetch("/api/upload-excel", {
            method: "POST",
            body: formData,
        });
        setLoading(false);
        if (res.ok) {
            alert("อัปโหลดสำเร็จ 🎉");
            setDepartment("");
            setFile(null);
            setSelectedFileType("");
            setDepartmentId("");
        } else {
            alert("อัปโหลดไม่สำเร็จ");
        }
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section - Minimal */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#89ba16] rounded-xl mb-4">
                        <svg
                            className="w-7 h-7 text-white"
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
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        อัปโหลดไฟล์ Excel
                    </h1>
                    <p className="text-gray-500 text-sm">
                        อัปโหลดไฟล์ข้อมูลของหน่วยงาน
                    </p>
                </div>

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Templates List */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-fit lg:sticky lg:top-8">
                        <div className="bg-[#89ba16] px-6 py-5">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
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
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                ไฟล์ตัวอย่าง
                            </h2>
                            <p className="text-white/80 text-sm mt-1">
                                ดาวน์โหลดไฟล์ตัวอย่างเพื่อใช้งาน
                            </p>
                        </div>

                        {/* Scrollable Templates List */}
                        <div className="max-h-[550px] overflow-y-auto">
                            <div className="p-5 space-y-3">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="border border-gray-200 rounded-xl p-4 hover:border-[#89ba16] hover:bg-[#89ba16]/5 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-gray-600"
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
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                                    {template.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                                    {template.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                                        {template.size}
                                                    </span>
                                                    <a
                                                        href={template.url}
                                                        download
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#89ba16] text-white text-xs font-medium hover:bg-[#7aa614] transition-colors"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                            />
                                                        </svg>
                                                        ดาวน์โหลด
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Scrollbar Style */}
                        <style jsx>{`
              .max-h-\[550px\]::-webkit-scrollbar {
                width: 6px;
              }
              .max-h-\[550px\]::-webkit-scrollbar-track {
                background: transparent;
              }
              .max-h-\[550px\]::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 10px;
              }
              .max-h-\[550px\]::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
              }
            `}</style>
                    </div>

                    {/* Right Side - Upload Form */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-fit">
                        <div className="bg-gray-900 px-8 py-5">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                รายละเอียดการอัปโหลด
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* File Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    ประเภทไฟล์ <span className="text-[#89ba16]">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg
                                            className="w-5 h-5 text-gray-400"
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
                                    <select
                                        value={selectedFileType}
                                        onChange={(e) => setSelectedFileType(e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none appearance-none bg-white cursor-pointer text-sm"
                                    >
                                        <option value="">เลือกประเภทไฟล์</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.name}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                        <svg
                                            className="w-4 h-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                {selectedFileType && (
                                    <p className="mt-2 text-xs text-[#89ba16] flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        จัดเก็บใน: {templates.find(t => t.name === selectedFileType)?.folder}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Department Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        รหัสหน่วยงาน <span className="text-[#89ba16]">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={departmentId}
                                            onChange={(e) => setDepartmentId(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none text-sm"
                                            placeholder="รหัสหน่อยงาน"
                                        />
                                    </div>
                                </div>

                                {/* Department Input */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        ชื่อหน่วยงาน <span className="text-[#89ba16]">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89ba16] focus:border-[#89ba16] transition-all outline-none text-sm"
                                            placeholder="ระบุชื่อหน่วยงาน"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    ไฟล์ Excel <span className="text-[#89ba16]">*</span>
                                </label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive
                                        ? "border-[#89ba16] bg-[#89ba16]/5"
                                        : file
                                            ? "border-[#89ba16] bg-[#89ba16]/5"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        id="file-upload"
                                    />
                                    <div className="p-8 text-center">
                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-14 h-14 bg-[#89ba16] rounded-xl flex items-center justify-center mb-3">
                                                    <svg
                                                        className="w-7 h-7 text-white"
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
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFile(null)}
                                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                                >
                                                    ลบไฟล์
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <svg
                                                        className="w-7 h-7 text-gray-400"
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
                                                <p className="text-sm text-gray-900 font-medium mb-1">
                                                    ลากไฟล์มาวาง หรือคลิกเพื่อเลือก
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    รองรับไฟล์ .xlsx และ .xls
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !department || !file || !selectedFileType}
                                className="w-full bg-[#89ba16] text-white py-3.5 rounded-xl font-medium hover:bg-[#7aa614] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
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
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        บันทึกไฟล์
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Card - Minimal */}
                <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 max-w-7xl mx-auto">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-[#89ba16]/10 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-[#89ba16]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                คำแนะนำการใช้งาน
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#89ba16] mt-0.5">•</span>
                                    <span>เลือกประเภทไฟล์ที่ต้องการอัปโหลด ระบบจะจัดเก็บในโฟลเดอร์ที่เหมาะสม</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#89ba16] mt-0.5">•</span>
                                    <span>ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบข้อมูลที่ถูกต้อง</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#89ba16] mt-0.5">•</span>
                                    <span>ตรวจสอบความถูกต้องของข้อมูลก่อนอัปโหลด</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#89ba16] mt-0.5">•</span>
                                    <span>ไฟล์ต้องเป็นนามสกุล .xlsx หรือ .xls เท่านั้น</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}