'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Data Pendukung', path: '/dashboard/pendukung' },
    { name: 'Tim Relawan', path: '/dashboard/relawan' },
    { name: 'Logistik', path: '/dashboard/logistik' },
    { name: 'Quick Count', path: '/dashboard/quickcount' },
  ];

  return (
    <aside className="w-full md:w-64 bg-blue-800 text-white md:min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-800 font-bold">SC</div>
          <h1 className="text-xl font-bold">SIMCALEG</h1>
        </div>
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${pathname === item.path ? 'bg-blue-900 font-semibold' : 'hover:bg-blue-700'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <button onClick={handleLogout} className="mt-8 text-left px-4 py-2 text-red-300 hover:text-white hover:bg-red-600 rounded-lg transition">
        Logout
      </button>
    </aside>
  );
}