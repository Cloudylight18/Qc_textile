"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, Settings, Factory, ShieldCheck, ChevronDown, Database, Shirt, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (pathname.includes('/admin/master')) {
      setIsMasterOpen(true);
    }
  }, [pathname]);

  const menuConfig = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Data Users', icon: Users, path: '/admin/users' },
      { name: 'Knowledge Base', icon: BookOpen, path: '/admin/knowledge' },
      { name: 'Orders', icon: ClipboardList, path: '/admin/orders' },
    ],
    inspector: [
      { name: 'Dashboard', icon: LayoutDashboard, path: "/inspector" },
      { name: 'Tugas QC', icon: ClipboardList, path: '/inspector/tugas' },
      { name: 'Katalog Defect', icon: ShieldCheck, path: '/inspector/defect' },
    ],
    pimpinan: [
      { name: 'Laporan Utama', icon: Factory, path: '/pimpinan/dashboard' },
    ]
  };

  const currentRole = pathname.split('/')[1] as keyof typeof menuConfig;
  const menuItems = menuConfig[currentRole] || [];

  const isRouteActive = (itemPath: string) => {
    if (pathname === itemPath) return true;
    if (itemPath !== '/' && pathname.startsWith(itemPath + '/')) return true;
    return false;
  };

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <div aria-label="Navigasi Mobile" className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 z-50 flex md:hidden items-center justify-around px-2 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 shadow-md">
        {menuItems.map((item) => {
          const isActive = isRouteActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-all ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span translate="no" className="text-[8px] font-black uppercase tracking-wider text-center block overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {item.name}
              </span>
            </Link>
          );
        })}

        {currentRole === 'admin' && (
          <Link href="/admin/master/jenis-kain" className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-all ${pathname.includes('/admin/master') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <Database className="w-5 h-5" />
            <span translate="no" className="text-[8px] font-black uppercase tracking-wider">Master</span>
          </Link>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside aria-label="Navigasi Desktop" className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 flex-col hidden md:flex z-40 transition-all duration-300 ease-in-out relative`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3.5 top-12 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all z-50 shadow-sm">
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`pt-8 pb-6 mb-2 transition-all duration-300 ${isCollapsed ? 'px-0 flex flex-col items-center' : 'px-8'}`}>
          {isCollapsed ? (
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck size={20} />
            </div>
          ) : (
            <>
              <h1 translate="no" className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
                QC_Kain<span className="text-blue-600 dark:text-blue-400">App</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <p translate="no" className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Quality Control v1.1</p>
              </div>
            </>
          )}
        </div>

        <nav className={`flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-4' : 'px-4'}`}>
          {menuItems.map((item) => {
            const isActive = isRouteActive(item.path);
            return (
              <Link key={item.path} href={item.path} title={isCollapsed ? item.name : undefined} className={`flex items-center ${isCollapsed ? 'justify-center p-3.5' : 'gap-4 px-5 py-3.5'} rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group ${isActive ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white'}`}>
                <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {!isCollapsed && <span translate="no" className="truncate">{item.name}</span>}
              </Link>
            );
          })}

          {currentRole === 'admin' && (
            <div className="pt-2">
              <button onClick={() => { if (isCollapsed) { setIsCollapsed(false); setIsMasterOpen(true); } else { setIsMasterOpen(!isMasterOpen); } }} title={isCollapsed ? "Master Data" : undefined} className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3.5' : 'justify-between px-5 py-3.5'} rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${(isMasterOpen && !isCollapsed) || pathname.includes('/admin/master') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50'}`}>
                <div className="flex items-center gap-4">
                  <Database className={`w-4 h-4 ${((isMasterOpen && !isCollapsed) || pathname.includes('/admin/master')) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!isCollapsed && <span translate="no">Master Data</span>}
                </div>
                {!isCollapsed && <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMasterOpen ? 'rotate-180' : ''}`} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isMasterOpen && !isCollapsed ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="ml-9 border-l border-slate-200 dark:border-slate-800 space-y-1">
                  <Link href="/admin/master/suppliers" className={`flex items-center gap-3 pl-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${pathname === '/admin/master/suppliers' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'}`}>
                    <Factory size={12} /> <span translate="no" className="truncate">Data Supplier</span>
                  </Link>
                  <Link href="/admin/master/jenis-kain" className={`flex items-center gap-3 pl-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${pathname === '/admin/master/jenis-kain' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'}`}>
                    <Shirt size={12} /> <span translate="no" className="truncate">Jenis Kain</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className={`border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6'}`}>
          <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'p-3 flex justify-center' : 'p-4'}`}>
            {!isCollapsed && <p translate="no" className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Active Role</p>}
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
              {!isCollapsed && (
                <p translate="no" className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter italic truncate">
                  {currentRole || 'User'} Mode
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}