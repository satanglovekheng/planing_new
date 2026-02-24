"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

/* =========================
   Skeleton Loading
========================= */
const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
    <div className="h-6 w-56 bg-gray-200 rounded mb-6" />
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex gap-4 mb-4">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

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

      {/* =========================
          Header
      ========================= */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-[#89ba16] rounded-full" />
            <h1 className="text-3xl font-bold text-gray-900">
              ไฟล์หน่วยงาน
            </h1>
          </div>
          <p className="text-gray-600 ml-6">
            ไฟล์ล่าสุดของทุกหน่วยงาน
          </p>
        </div>
      </div>

      {/* =========================
          Content
      ========================= */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <TableSkeleton />
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-[fadeInUp_0.4s_ease-out]">
            <svg
              className="mx-auto h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              ยังไม่มีไฟล์ในระบบ
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-[fadeInUp_0.4s_ease-out]">
            {/* Download All */}
            <div className="flex justify-end p-4">
              <a
                href="/api/templates/admin/download-all"
                className="
                  inline-flex items-center gap-2 px-5 py-2
                  bg-[#89ba16] text-white rounded-lg
                  hover:bg-[#7aa614]
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-200
                  shadow-md
                  text-sm font-medium
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m5 5H4"
                  />
                </svg>
                ดาวน์โหลดทั้งหมด (ZIP)
              </a>
            </div>

            {/* Table */}
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
                      ไฟล์
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
                      className="
                        transition-all duration-200
                        hover:bg-[#89ba16]/5
                        hover:scale-[1.005]
                      "
                    >
                      <td className="px-6 py-4">
                        <span className="
                          inline-flex px-3 py-1 rounded-full
                          text-xs font-medium
                          bg-[#89ba16]/10 text-[#89ba16]
                        ">
                          {f.code}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {f.deptName}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {f.originalName}
                        </div>
                        <div className="text-sm text-gray-500">
                          อัปโหลด{" "}
                          {new Date(f.timestamp).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <a
                          href={f.url}
                          download
                          className="
                            inline-flex items-center gap-2 px-4 py-2
                            bg-[#89ba16] text-white rounded-lg
                            hover:bg-[#7aa614]
                            active:scale-95
                            transition-all duration-200
                            shadow hover:shadow-md
                            text-sm font-medium
                          "
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          Animation Style
      ========================= */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}