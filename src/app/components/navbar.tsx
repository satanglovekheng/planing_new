"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "ไฟล์ทั้งหมด",
      path: "/upload",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: "ค้นหาตามหน่วยงาน",
      path: "/upload/check-upload",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ];

  const isActive = (path: string) => pathname === path;

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
              <h1 className="text-xl font-bold text-gray-900">
                ระบบจัดการไฟล์
              </h1>
              <p className="text-xs text-gray-500">Template Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
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
              </Link>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <div className="w-8 h-8 bg-[#89ba16] bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {/* <div className="text-right">
                <p className="text-sm font-medium text-gray-900">ผู้ดูแลระบบ</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div> */}
            </div>

            {/* Mobile Menu Button */}
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
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
              </Link>
            ))}
            
            {/* Mobile User Info */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 bg-[#89ba16] bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#89ba16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-gray-900">ผู้ดูแลระบบ</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}