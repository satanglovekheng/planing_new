"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>("ดาวน์โหลดแบบฟอร์ม");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      name: "ดาวน์โหลดแบบฟอร์ม",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subItems: [
        {
          name: "แผนปี 2569",
          path: "/upload",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "แผนปี 2570",
          path: "/upload/plan70",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          ),
        },
      ],
    },
    {
      name: "สถานะการส่งไฟล์",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      subItems: [
        {
          name: "แผนปี 2569",
          path: "/upload/check-upload",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          name: "แผนปี 2570",
          path: "/upload/check-upload/plan70",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        },
      ],
    },
    {
      name: "อัปโหลดไฟล์",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      subItems: [
        {
          name: "ไฟล์หน่วยงาน 2569",
          path: "/upload/admin",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "ไฟล์หน่วยงาน 2570",
          path: "/upload/admin/plan70",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          ),
        },
      ],
    },
    {
      name: "รวมผลสรุปผลการพิจ...",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subItems: [
        {
          name: "สรุปผล 2569",
          path: "/summary/2569",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          name: "สรุปผล 2570",
          path: "/summary/2570",
          icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (subItems: { path: string }[]) =>
    subItems.some((sub) => pathname === sub.path);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo / Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-9 h-9 bg-[#89ba16] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#7aa614] transition-colors duration-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>

        </Link>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600
            transition-colors duration-200 flex-shrink-0
            ${isCollapsed ? "mx-auto" : ""}
          `}
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

      {/* หน้าแรก */}
      <div className="px-3 pt-3">
        <Link
          href="/"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
            ${pathname === "/"
              ? "bg-[#89ba16] text-white shadow-md shadow-[#89ba16]/30"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }
          `}
          title={isCollapsed ? "หน้าแรก" : undefined}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!isCollapsed && <span>หน้าแรก</span>}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {navItems.map((item) => {
          const groupActive = isGroupActive(item.subItems);
          const isOpen = openDropdown === item.name;

          return (
            <div key={item.name}>
              {/* Parent button */}
              <button
                onClick={() => !isCollapsed && toggleDropdown(item.name)}
                title={isCollapsed ? item.name : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 text-left
                  ${groupActive && !isOpen
                    ? "text-[#89ba16]"
                    : isOpen
                    ? "bg-[#89ba16]/10 text-[#89ba16]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={`flex-shrink-0 ${groupActive || isOpen ? "text-[#89ba16]" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Sub items */}
              {!isCollapsed && isOpen && (
                <div className="ml-3 mt-1 pl-3 border-l-2 border-[#89ba16]/20 space-y-0.5">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150
                        ${isActive(sub.path)
                          ? "bg-[#89ba16]/10 text-[#89ba16] font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }
                      `}
                    >
                      <span className={`flex-shrink-0 ${isActive(sub.path) ? "text-[#89ba16]" : "text-gray-400"}`}>
                        {sub.icon}
                      </span>
                      <span className="truncate">{sub.name}</span>
                      {isActive(sub.path) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#89ba16] flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Collapsed: tooltip sub-items popup (simple version) */}
              {isCollapsed && (
                <div className="relative group/collapsed">
                  {/* tooltip on hover handled via title attr above */}
                </div>
              )}
            </div>
          );
        })}
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
          <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100" title="ติดต่อสอบถาม 1190 หรือ 1194">
            <svg className="w-4 h-4 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}