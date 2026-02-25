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

// Fullscreen download overlay
function DownloadOverlay({ fileName, progress }: { fileName: string; progress: number }) {
  return (
    <div className="download-overlay fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full opacity-20"
            style={{
              width: `${40 + i * 18}px`,
              height: `${40 + i * 18}px`,
              backgroundColor: "#89ba16",
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl px-12 py-10 flex flex-col items-center gap-6 w-full max-w-sm mx-4 overlay-card">
        {/* Icon area */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute rounded-full opacity-20 pulse-ring"
            style={{ width: "100px", height: "100px", backgroundColor: "#89ba16" }}
          />
          <div
            className="absolute rounded-full opacity-10 pulse-ring-2"
            style={{ width: "130px", height: "130px", backgroundColor: "#89ba16" }}
          />

          {/* SVG Progress Circle */}
          <svg width="80" height="80" viewBox="0 0 80 80" className="rotate-[-90deg]">
            {/* Track */}
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e8f5cc" strokeWidth="5" />
            {/* Progress arc */}
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#89ba16"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>

          {/* Download arrow icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 download-arrow" fill="none" viewBox="0 0 24 24" stroke="#89ba16" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-gray-800 font-bold text-lg leading-tight">กำลังดาวน์โหลด</p>
          <p className="text-gray-400 text-sm mt-1 max-w-xs truncate px-2">{fileName}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          {/* <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>ความคืบหน้า</span>
            <span className="font-semibold text-[#89ba16]">{Math.round(progress)}%</span>
          </div> */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-fill"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #89ba16, #b5d95a)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
                height: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
                backgroundColor: "#89ba16",
                opacity: i === 2 ? 1 : 0.4,
                animation: `wave-dot 1.2s ease ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminTemplatesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [progress, setProgress] = useState(0);

  const triggerDownload = async (url: string, name: string) => {
    setDownloadFileName(name);
    setDownloadProgress(0);
    setDownloading(true);

    // Simulate progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return prev; }
        return prev + Math.random() * 15;
      });
    }, 120);

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      clearInterval(interval);
      setDownloadProgress(100);

      await new Promise((r) => setTimeout(r, 500));

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      clearInterval(interval);
    }

    await new Promise((r) => setTimeout(r, 400));
    setDownloading(false);
    setDownloadProgress(0);
  };

  async function downloadAll() {
    setDownloading(true);
    setProgress(0);

    const res = await fetch("/api/templates/admin/download-all");
    const total = Number(res.headers.get("Content-Length"));
    const reader = res.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      if (total) setProgress(Math.round((received / total) * 100));
    }

    // สร้าง link ดาวน์โหลด
    const blob = new Blob(chunks, { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templates.zip";
    a.click();
    URL.revokeObjectURL(url);

    setDownloading(false);
    setProgress(0);
  }

  useEffect(() => {
    setMounted(true);
    fetch("/api/templates/admin")
      .then((res) => res.json())
      .then((data) => {
        setTimeout(() => {
          setFiles(data);
          setLoading(false);
        }, 600);
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

        /* ── Fullscreen Download Overlay ── */
        @keyframes overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .download-overlay {
          animation: overlay-in 0.25s ease both;
        }

        @keyframes card-in {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .overlay-card {
          animation: card-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        .particle {
          animation: float-particle 3s ease-in-out infinite;
        }

        @keyframes pulse-ring-anim {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
        .pulse-ring {
          animation: pulse-ring-anim 1.5s ease-in-out infinite;
        }
        .pulse-ring-2 {
          animation: pulse-ring-anim 1.5s ease-in-out 0.3s infinite;
        }

        @keyframes arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .download-arrow {
          animation: arrow-bounce 1s ease-in-out infinite;
        }

        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(137,186,22,0.4); }
          50% { box-shadow: 0 0 14px rgba(137,186,22,0.8); }
        }
        .progress-fill {
          animation: progress-glow 1.2s ease-in-out infinite;
        }

        @keyframes wave-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#f4f6f0" }}>
        {/* Fullscreen download overlay */}
        {downloading && (
          <DownloadOverlay fileName={downloadFileName} progress={downloadProgress} />
        )}
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
                <button
                  onClick={downloadAll}
                  disabled={downloading}
                  className="download-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold relative overflow-hidden"
                  style={{ backgroundColor: "#89ba16", minWidth: 180 }}
                >
                  {/* progress fill */}
                  {downloading && (
                    <span
                      className="absolute inset-0 bg-black/20 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {downloading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {progress}%
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m5 5H4" />
                        </svg>
                        ดาวน์โหลดทั้งหมด (ZIP)
                      </>
                    )}
                  </span>
                </button>
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
                          <button
                            onClick={() => triggerDownload(f.url, f.originalName)}
                            className="download-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: "#89ba16" }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            ดาวน์โหลด
                          </button>
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