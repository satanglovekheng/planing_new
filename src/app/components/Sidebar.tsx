// components/Sidebar.tsx
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, FileText, Package2, TrendingUp, User, Building2, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'ตารางแผนจัดซื้อ', icon: Package2, description: 'จัดการแผนการจัดซื้อ' },
  { href: '/budget', label: 'วางแผนงบประมาณ', icon: TrendingUp, description: 'สร้างแผนงบประมาณใหม่' },
  { href: '/plan-summary', label: 'ข้อมูลแผนพัสดุ', icon: Package2, description: 'ระบบแสดงข้อมูลแผนพัสดุ' },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState({ officer_id: null, department_name: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserInfo({
        officer_id: localStorage.getItem('officer_id'),
        department_name: localStorage.getItem('department_name'),
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  return (
    <>
      {/* ปุ่ม Toggle (เฉพาะมือถือ) */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#008374] text-white p-2 rounded-lg md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-40 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600 rounded-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">Hospital Budget</div>
              <div className="text-xs text-slate-500">ระบบจัดการงบประมาณโรงพยาบาล</div>
            </div>
          </div>
          {/* ปุ่มปิด Sidebar */}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-slate-100 transition md:hidden"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* User Info */}
        {userInfo.officer_id && (
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">รหัส: {userInfo.officer_id}</p>
                <p className="text-xs text-slate-500">{userInfo.department_name || 'ไม่ระบุแผนก'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full group flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                  active
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div>
                  <p className={`font-medium text-sm ${active ? 'text-white' : 'text-slate-800'}`}>
                    {item.label}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      active ? 'text-white/80' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
          <div className="text-center mt-3 text-xs text-slate-400">เวอร์ชัน 1.0.0</div>
        </div>
      </aside>
    </>
  );
}
