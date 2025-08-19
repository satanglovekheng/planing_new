// components/Sidebar.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, FileText, Settings } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { href: '/budget', label: 'งบประมาณ', icon: FileText },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // ล้างค่าที่เกี่ยวข้องกับ session ใน localStorage
    localStorage.removeItem('officer_id');
    localStorage.removeItem('department_id');
    localStorage.removeItem('department_name');
    // ถ้ามีค่าอื่น ๆ ก็ล้างเพิ่มได้
    // localStorage.clear(); // ถ้าต้องการล้างทั้งหมด

    router.replace('/login');
  };

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="text-lg font-bold">Hospital Budget</div>
        <div className="text-xs text-gray-500">v1.0</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-1 transition
                ${active ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer (Logout) */}
      <div className="p-2 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
