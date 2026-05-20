"use client";

import { useState } from "react";
import Navbar from "../../components/navbar";

export default function DepartmentTemplatesPage() {
  const [deptCode, setDeptCode] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadFiles = async () => {
    if (!deptCode.trim()) return;
    
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/templates/by-department?deptCode=${deptCode}`);
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadFiles();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-[#89ba16] rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              ค้นหาไฟล์ตามหน่วยงาน
            </h1>
          </div>
          <p className="text-gray-600 ml-6">
            ระบุรหัสหน่วยงานเพื่อดูไฟล์ทั้งหมด
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            รหัสหน่วยงาน
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#89ba16] focus:border-transparent outline-none transition-all duration-200"
                placeholder="กรอกรหัสหน่วยงาน เช่น D001"
                value={deptCode}
                onChange={e => setDeptCode(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <svg 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={loadFiles}
              disabled={!deptCode.trim()}
              className="px-8 py-3 bg-[#89ba16] text-white rounded-lg hover:bg-[#7aa614] transition-colors duration-200 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ค้นหา
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#89ba16]"></div>
          </div>
        )}

        {/* Empty State - No Search Yet */}
        {!loading && !searched && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-[#89ba16] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              กรอกรหัสหน่วยงานเพื่อค้นหาไฟล์
            </p>
          </div>
        )}

        {/* Empty State - No Results */}
        {!loading && searched && files.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">
              ไม่พบไฟล์สำหรับหน่วยงานนี้
            </p>
            <p className="text-gray-400 text-sm">
              ลองตรวจสอบรหัสหน่วยงานอีกครั้ง
            </p>
          </div>
        )}

        {/* Files List */}
        {!loading && files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                พบ <span className="font-semibold text-gray-900">{files.length}</span> ไฟล์
              </p>
            </div>
            
            {files.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#89ba16] bg-opacity-10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-lg">
                          {f.originalName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        {f.size}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(f.timestamp).toLocaleString("th-TH", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href={f.url}
                    download
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#89ba16] text-white rounded-lg hover:bg-[#7aa614] transition-colors duration-200 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ดาวน์โหลด
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}