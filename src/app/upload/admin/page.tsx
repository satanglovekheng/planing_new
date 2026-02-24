"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

// Skeleton row component
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="skeleton-pulse h-4 rounded-full bg-gray-200" style={{ width: i === 5 ? "80px" : i === 1 ? "60px" : "100%" }} />
        </td>
      ))}
    </tr>
  );
}

// File icon by extension
function FileIcon({ name }: { name: string }) {
  const ext = name?.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    pdf: "#e53e3e",
    xlsx: "#38a169",
    xls: "#38a169",
    docx: "#3182ce",
    doc: "#3182ce",
    pptx: "#dd6b20",
    ppt: "#dd6b20",
    csv: "#38a169",
  };
  const color = colors[ext ?? ""] ?? "#718096";
  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-lg text-white text-xs font-bold shrink-0 shadow-sm"
      style={{ backgroundColor: color }}
    >
      {ext?.toUpperCase().slice(0, 3) ?? "FILE"}
    </div>
  );
}

export default function AdminTemplatesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/templates/admin")
      .then((res) => res.json())
      .then((data) => {
        setTimeout(() => {
          setFiles(data);
          setLoading(false);
        }, 600); // slight delay so skeleton is visible
      });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

        * { font-family: 'Sarabun', 'Noto Sans Thai', sans-serif; }

        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .skeleton-pulse {
          background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.45s ease both;
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .row-in {
          animation: rowIn 0.35s ease both;
        }

        @keyframes spin-grow {
          0% { transform: rotate(0deg) scale(0.9); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(0.9); }
        }

        .loader-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #89ba16;
          border-right-color: #89ba16;
          animation: spin-grow 1s cubic-bezier(0.6,0,0.4,1) infinite;
          box-shadow: 0 0 18px rgba(137,186,22,0.25);
        }

        .loader-ring-inner {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #b5d95a;
          border-left-color: #b5d95a;
          animation: spin-grow 0.7s cubic-bezier(0.6,0,0.4,1) infinite reverse;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .dot-1 { animation: pulse-dot 1.2s ease infinite; }
        .dot-2 { animation: pulse-dot 1.2s ease 0.2s infinite; }
        .dot-3 { animation: pulse-dot 1.2s ease 0.4s infinite; }

        .download-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(137,186,22,0.35);
        }
        .download-btn:active {
          transform: translateY(0px);
          box-shadow: none;
        }

        .table-row:hover td {
          background-color: #f9fdf0;
        }
        .table-row td {
          transition: background-color 0.15s ease;
        }

        .code-badge {
          background: linear-gradient(135deg, rgba(137,186,22,0.12) 0%, rgba(137,186,22,0.06) 100%);
          border: 1px solid rgba(137,186,22,0.3);
          color: #5a7a0a;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-size: 0.78rem;
        }

        .header-accent {
          background: linear-gradient(180deg, #89ba16 0%, #7aa614 100%);
          box-shadow: 0 2px 8px rgba(137,186,22,0.4);
        }

        .stat-card {
          border-left: 3px solid #89ba16;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#f4f6f0" }}>
        <Navbar />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className={`max-w-7xl mx-auto px-6 py-8 ${mounted ? "fade-up" : "opacity-0"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 rounded-full header-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">ไฟล์หน่วยงาน</h1>
                  <p className="text-gray-500 text-sm mt-0.5">ไฟล์ล่าสุดของทุกหน่วยงานในระบบ</p>
                </div>
              </div>

              {/* Stat chips */}
              {!loading && files.length > 0 && (
                <div className="hidden sm:flex items-center gap-3 fade-up">
                  <div className="stat-card bg-white rounded-xl px-4 py-2.5">
                    <p className="text-xs text-gray-400 leading-none mb-1">ทั้งหมด</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">{files.length}</p>
                  </div>
                  <div className="stat-card bg-white rounded-xl px-4 py-2.5">
                    <p className="text-xs text-gray-400 leading-none mb-1">หน่วยงาน</p>
                    <p className="text-xl font-bold text-gray-900 leading-none">
                      {new Set(files.map((f) => f.code)).size}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            /* ─── Beautiful Loading State ─── */
            <div className="space-y-6">
              {/* Spinner card */}
              <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="loader-ring absolute" />
                  <div className="loader-ring-inner" />
                  {/* Center dot */}
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#89ba16" }} />
                </div>
                <div>
                  <p className="text-gray-600 font-medium text-center mb-1">กำลังโหลดข้อมูล</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#89ba16] dot-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#89ba16] dot-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#89ba16] dot-3" />
                  </div>
                </div>
              </div>

              {/* Skeleton table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="skeleton-pulse h-4 rounded-full w-40 bg-gray-200" />
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["รหัส", "หน่วยงาน", "ชื่อไฟล์", "วันที่อัพโหลด", "ดาวน์โหลด"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left">
                          <div className="skeleton-pulse h-3 rounded-full w-16 bg-gray-200" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : files.length === 0 ? (
            /* ─── Empty State ─── */
            <div className="bg-white rounded-2xl shadow-sm p-16 flex flex-col items-center gap-4 fade-up">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(137,186,22,0.1)" }}>
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#89ba16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">ยังไม่มีไฟล์ในระบบ</p>
                <p className="text-gray-400 text-sm mt-1">ไฟล์จะปรากฏที่นี่เมื่อมีการอัพโหลด</p>
              </div>
            </div>
          ) : (
            /* ─── File Table ─── */
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden fade-up">
              {/* Table toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  แสดง <span className="font-semibold text-gray-800">{files.length}</span> ไฟล์
                </p>
                <a
                  href="/api/templates/admin/download-all"
                  className="download-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                  style={{ backgroundColor: "#89ba16" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m5 5H4" />
                  </svg>
                  ดาวน์โหลดทั้งหมด (ZIP)
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        { label: "รหัส", align: "left" },
                        { label: "หน่วยงาน", align: "left" },
                        { label: "ชื่อไฟล์", align: "left" },
                        { label: "วันที่อัพโหลด", align: "left" },
                        { label: "ดาวน์โหลด", align: "center" },
                      ].map((h) => (
                        <th
                          key={h.label}
                          className={`px-6 py-3.5 text-${h.align} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {files.map((f, i) => (
                      <tr
                        key={i}
                        className="table-row row-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <td className="px-6 py-4">
                          <span className="code-badge inline-flex items-center px-3 py-1 rounded-lg text-xs">
                            {f.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-800 font-medium text-sm">{f.deptName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileIcon name={f.originalName} />
                            <span className="text-gray-700 text-sm leading-tight max-w-xs truncate">
                              {f.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700 text-sm">
                              {new Date(f.timestamp).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-gray-400 text-xs mt-0.5">
                              {new Date(f.timestamp).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} น.
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a
                            href={f.url}
                            download
                            className="download-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: "#89ba16" }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
    </>
  );
}