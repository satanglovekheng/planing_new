"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

export default function AdminTemplatesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates/admin")
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-[#89ba16] rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              ไฟล์เทมเพลต
            </h1>
          </div>
          <p className="text-gray-600 ml-6">
            ไฟล์ล่าสุดของทุกหน่วยงาน
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#89ba16]"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">ยังไม่มีไฟล์ในระบบ</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      รหัส
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      หน่วยงาน
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      ชื่อไฟล์
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      วันที่อัพโหลด
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      ดาวน์โหลด
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {files.map((f, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#89ba16] bg-opacity-10 text-[#89ba16]">
                          {f.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {f.deptName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {f.originalName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(f.timestamp).toLocaleString("th-TH", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={f.url}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#89ba16] text-white rounded-lg hover:bg-[#7aa614] transition-colors duration-200 font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          ดาวน์โหลด
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}