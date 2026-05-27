"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 5) {
      setShowAdminMenu(true);
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const navItems = [
    {
      name: "ดาวน์โหลดแบบฟอร์ม",
      path: "/upload/plan70",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "สถานะการส่งไฟล์",
      path: "/upload/check-upload/plan70",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          />
        </svg>
      ),
    },
    {
      name: "รายงานสรุปผลพิจารณา",
      path: "/summary/plan70",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6"
          />
        </svg>
      ),
    },
    ...(showAdminMenu
      ? [
          {
            name: "ไฟล์อัปโหลด",
            path: "/upload/admin/plan70",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo / Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
        {/* Logo — คลิก 5 ครั้งเพื่อแสดง admin menu */}
        <div
          onClick={handleLogoClick}
          className="flex-shrink-0 cursor-pointer select-none"
        >
          <div className="w-9 h-9 bg-[#89ba16] hover:bg-[#7aa614] rounded-lg flex items-center justify-center transition-colors duration-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* หน้าแรก — อยู่ข้างๆ logo */}
        {!isCollapsed && (
          <Link
            href="/upload/plan70"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 truncate"
          >
            หน้าแรก
          </Link>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            title={isCollapsed ? item.name : undefined}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${pathname === item.path
                ? "bg-[#89ba16] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom: Contact */}
      {!isCollapsed && (
        <div className="px-3 pb-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-8 h-8 bg-[#89ba16]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">ติดต่อสอบถาม</p>
                <p className="text-xs text-gray-400 leading-tight mt-0.5">กลุ่มนโยบายและแผนยุทธศาสตร์<br />โรงพยาบาลอุตรดิตถ์</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <svg className="w-3.5 h-3.5 text-[#e53e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-xs font-bold text-[#e53e3e]">1190 หรือ 1194</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed bottom icon */}
      {isCollapsed && (
        <div className="px-3 pb-4 flex justify-center">
          <div
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100"
            title="ติดต่อสอบถาม 1190 หรือ 1194"
          >
            <svg className="w-4 h-4 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}