"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="https://hr-utth.com/hr/assets/img/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />

            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                ระบบจัดทำแผนปฎิบัติการ
              </h1>
              <p className="text-xs text-gray-500">
                ประจำปีงบประมาณ ปี 2570
              </p>
            </div>
          </Link>

        </div>
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