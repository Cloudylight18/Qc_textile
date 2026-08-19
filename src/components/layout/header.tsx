"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { User, Bell, ChevronDown, Settings, LogOut, Menu, CheckCircle2, Info, AlertCircle, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from "@/server/admin/auth-actions";

interface HeaderProps {
  userAvatar?: string | null;
  userName?: string;
  children?: React.ReactNode;
}

export default function Header({ userAvatar, userName, children }: HeaderProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Cegah Hydration Error
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  const getRoleInfo = () => {
    if (pathname.includes('/admin')) return { name: "Administrator", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white", roleId: 'admin' };
    if (pathname.includes('/inspector')) return { name: "QC Inspector", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-600 dark:text-white", roleId: 'inspector' };
    return { name: "Pimpinan", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 text-amber-600 dark:bg-amber-600 dark:text-white", roleId: 'pimpinan' };
  };

  const role = getRoleInfo();

  // Dinamis path untuk pengaturan berdasarkan role yang sedang aktif
  const settingsHref = `/${role.roleId}/pengaturan`;

  const getNotifications = () => {
    if (role.roleId === 'admin') {
      return [
        { id: 1, title: "Pembaruan Sistem", desc: "Database user disinkronkan.", time: "Baru saja", type: "success" },
        { id: 2, title: "Data Masuk", desc: "Supplier PT Dewa memperbarui data.", time: "15 mnt lalu", type: "info" }
      ];
    }
    if (role.roleId === 'inspector') {
      return [
        { id: 1, title: "Tugas Inspeksi", desc: "Kain Cotton Carded menunggu verifikasi.", time: "1 jam lalu", type: "info" }
      ];
    }
    return [
      { id: 1, title: "Laporan Grade A", desc: "Inspeksi telah diverifikasi.", time: "Baru saja", type: "success" }
    ];
  };

  const notifications = getNotifications();

  const renderNotifIcon = (type: string) => {
    if (type === 'success') return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (type === 'alert') return <AlertCircle size={16} className="text-amber-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <header className="h-16 md:h-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-colors duration-300 shadow-sm dark:shadow-none">
      
      {/* TRIGGER MOBILE SIDEBAR */}
      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Menu" className="text-slate-700 dark:text-white p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-95">
          <Menu size={18} />
        </button>
        <span translate="no" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">QC System</span>
      </div>

      <div className="hidden md:block flex-1"></div>
      {children}

      {/* BAGIAN KANAN */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        
        {/* TOGGLE DARK MODE */}
        <div className="w-[38px] h-[38px] md:w-[42px] md:h-[42px] flex items-center justify-center">
          {mounted && (
            <button 
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="p-2 md:p-2.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>

        {/* CONTAINER NOTIFIKASI */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifikasi" 
            className={`relative p-2 md:p-2.5 transition-all rounded-xl md:rounded-2xl border cursor-pointer ${
              isNotifOpen ? 'bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 bg-slate-50 border-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-slate-800 dark:border-slate-700'
            }`}
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 md:mt-4 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl md:rounded-[2rem] shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <div>
                  <p translate="no" className="text-[10px] md:text-xs text-slate-900 dark:text-white font-black uppercase tracking-widest">Notifications</p>
                </div>
                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full text-[9px] font-black">{notifications.length} Baru</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex gap-3">
                    <div className="mt-0.5 flex-shrink-0">{renderNotifIcon(notif.type)}</div>
                    <div>
                      <p translate="no" className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">{notif.title}</p>
                      <p translate="no" className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{notif.desc}</p>
                      <p translate="no" className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE CONTROL */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 md:gap-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 md:p-2 pr-3 md:pr-5 rounded-xl md:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {/* RENDER FOTO PROFIL DARI DATABASE ATAU ICON DEFAULT */}
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-600 ${userAvatar ? 'bg-transparent' : role.bg}`}>
              {userAvatar ? (
                <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </div>
            
            <div className="hidden sm:block text-left">
              <p translate="no" className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Profile</p>
              <p translate="no" className={`text-[10px] font-black uppercase tracking-widest ${role.color}`}>{userName || role.name}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 md:mt-4 w-56 md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl md:rounded-[2rem] shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3">
                {/* PREVIEW FOTO PROFIL KECIL DI DALAM DROPDOWN */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-slate-500" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p translate="no" className="text-[9px] md:text-[10px] text-slate-900 dark:text-white font-black uppercase tracking-widest truncate">{userName || role.name}</p>
                  <p translate="no" className="text-[8px] text-slate-500 uppercase">Internal Account</p>
                </div>
              </div>
              
              <Link href={settingsHref} className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-all">
                <Settings size={14} className="text-blue-500" /> <span translate="no">Account Settings</span>
              </Link>
              
              <button onClick={() => logoutAction()} className="w-full flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 border-t border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                <LogOut size={14} /> <span translate="no">Terminate Session</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}