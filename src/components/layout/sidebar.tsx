"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  Factory, 
  ShieldCheck, 
  ChevronDown,
  Database,
  Shirt
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMasterOpen, setIsMasterOpen] = useState(false);

  useEffect(() => {
    if (pathname.includes('/admin/master')) {
      setIsMasterOpen(true);
    }
  }, [pathname]);

  const menuConfig = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Data Users', icon: Users, path: '/admin/users' },
      { name: 'Orders', icon: ClipboardList, path: '/admin/orders' },
    ],
    inspector: [
      { name: 'My Tasks', icon: ClipboardList, path: '/inspector/dashboard' },
      { name: 'Daftar Defect', icon: ShieldCheck, path: '/inspector/defect' },
      { name: 'Settings', icon: Settings, path: '/inspector/settings' },
    ],
    pimpinan: [
      { name: 'Laporan Utama', icon: Factory, path: '/pimpinan/dashboard' },
      { name: 'Statistik', icon: LayoutDashboard, path: '/pimpinan/stats' },
      { name: 'Settings', icon: Settings, path: '/pimpinan/settings' },
    ]
  };

  const currentRole = pathname.split('/')[1] as keyof typeof menuConfig;
  const menuItems = menuConfig[currentRole] || [];

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a] border-t border-white/5 z-50 flex md:hidden items-center justify-around px-2 backdrop-blur-md bg-opacity-95">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-all ${
                isActive ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-wider text-center block overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {item.name}
              </span>
            </Link>
          );
        })}

        {currentRole === 'admin' && (
          <Link
            href="/admin/master/jenis-kain"
            className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-all ${
              pathname.includes('/admin/master') ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-wider">Master</span>
          </Link>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800 h-screen sticky top-0 flex flex-col hidden md:flex z-40">
        <div className="p-8 mb-4">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            Dewa<span className="text-blue-500">Sutratex</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500">
              Quality Control v1.1
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}

          {currentRole === 'admin' && (
            <div className="pt-2">
              <button 
                onClick={() => setIsMasterOpen(!isMasterOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isMasterOpen || pathname.includes('/admin/master') 
                  ? 'text-blue-400 bg-blue-500/5' 
                  : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Database className="w-4 h-4" />
                  <span>Master Data</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMasterOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isMasterOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="ml-9 border-l border-slate-800 space-y-1">
                  <Link 
                    href="/admin/master/suppliers"
                    className={`flex items-center gap-3 pl-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      pathname === '/admin/master/suppliers' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Factory size={12} /> Data Supplier
                  </Link>
                  <Link 
                    href="/admin/master/jenis-kain"
                    className={`flex items-center gap-3 pl-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      pathname === '/admin/master/jenis-kain' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Shirt size={12} /> Jenis Kain
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* BOTTOM BADGE SIDEBAR - Fixed Structure */}
        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Active Role</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">
                {currentRole || 'User'} Mode
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-[9px] text-slate-700 font-bold uppercase tracking-widest">
            Dewa Sutratex II &copy; 2026
          </p>
        </div>
      </aside>
    </>
  );
}