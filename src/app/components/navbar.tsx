"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    {
      name: "ไฟล์ทั้งหมด",
      path: "",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subItems: [
        {
          name: "แผนปี 2569",
          path: "/upload",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "แผนปี 2570",
          path: "/upload/plan70",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          ),
        },
      ],
    },
    {
      name: "ค้นหาตามหน่วยงาน",
      path: "",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      subItems: [
        {
          name: "แผนปี 2569",
          path: "/upload/check-upload",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          name: "แผนปี 2570",
          path: "/upload/check-upload/plan70",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const userSubItems = [
    {
      name: "ไฟล์หน่วยงาน แผนปี 2569",
      path: "/upload/admin",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "ไฟล์หน่วยงาน แผนปี 2570",
      path: "/upload/admin/plan70",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => pathname === path;

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#89ba16] rounded-lg flex items-center justify-center group-hover:bg-[#7aa614] transition-colors duration-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">ระบบจัดการไฟล์</h1>
              <p className="text-xs text-gray-500">Template Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive(item.path)
                      ? "bg-[#89ba16] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {openDropdown === item.name && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                          ${isActive(sub.path)
                            ? "bg-[#89ba16]/10 text-[#89ba16] font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <span className={isActive(sub.path) ? "text-[#89ba16]" : "text-gray-400"}>
                          {sub.icon}
                        </span>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">

            {/* User Icon with Dropdown */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => handleMouseEnter("user")}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                <div className="w-8 h-8 bg-[#89ba16] bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === "user" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* User Dropdown */}
              {openDropdown === "user" && (
                <div
                  className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn"
                  onMouseEnter={() => handleMouseEnter("user")}
                  onMouseLeave={handleMouseLeave}
                >
                  {userSubItems.map((sub) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${isActive(sub.path)
                          ? "bg-[#89ba16]/10 text-[#89ba16] font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <span className={isActive(sub.path) ? "text-[#89ba16]" : "text-gray-400"}>
                        {sub.icon}
                      </span>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? "bg-[#89ba16] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                </div>
                {/* Mobile sub-items */}
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                        ${isActive(sub.path)
                          ? "text-[#89ba16] font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }
                      `}
                    >
                      <span className="text-gray-400">{sub.icon}</span>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Mobile User Sub-items */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-8 h-8 bg-[#89ba16] bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">ไฟล์หน่วยงาน</span>
              </div>
              <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-4">
                {userSubItems.map((sub) => (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${isActive(sub.path)
                        ? "text-[#89ba16] font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    <span className="text-gray-400">{sub.icon}</span>
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}