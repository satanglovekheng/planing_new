// components/Sidebar.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, FileText, Package2, TrendingUp, User, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
};

const navItems: NavItem[] = [
  { 
    href: '/', 
    label: 'ตารางแผนจัดซื้อ', 
    icon: Package2,
    description: 'จัดการแผนการจัดซื้อ'
  },
  { 
    href: '/budget', 
    label: 'วางแผนงบประมาณ', 
    icon: TrendingUp,
    description: 'สร้างแผนงบประมาณใหม่'
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<{
    officer_id: string | null;
    department_name: string | null;
  }>({
    officer_id: null,
    department_name: null
  });

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserInfo({
        officer_id: localStorage.getItem('officer_id'),
        department_name: localStorage.getItem('department_name')
      });
    }
    console.log('User Info:', userInfo); // Debugging log
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('officer_id');
    localStorage.removeItem('department_id');
    localStorage.removeItem('department_name');
    router.replace('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-600 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">Hospital Budget</div>
            <div className="text-xs text-slate-500">ระบบจัดการงบประมาณโรงพยาบาล</div>
          </div>
        </div>
        
        {/* User Info Card */}
        {userInfo.officer_id && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">
                  รหัส: {userInfo.officer_id}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {userInfo.department_name || 'ไม่ระบุแผนก'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full group flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
                  active 
                    ? 'bg-slate-600 text-white shadow-md' 
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors duration-200 ${
                  active 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${active ? 'text-white' : 'text-slate-800'}`}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div className={`text-xs mt-1 ${active ? 'text-white/80' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <LogOut className="w-5 h-5" />
          <span>ออกจากระบบ</span>
        </button>
        
        {/* Version */}
        <div className="text-center mt-3 text-xs text-slate-400">
          เวอร์ชัน 1.0.0
        </div>
      </div>
    </aside>
  );
}