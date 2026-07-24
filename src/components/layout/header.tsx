"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User, Bell, Search, ChevronDown, Settings, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from "@/server/admin/auth-actions";

export default function Header() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getRoleInfo = () => {
    if (pathname.includes('/admin')) return { name: "Administrator", color: "text-blue-500", bg: "bg-blue-600" };
    if (pathname.includes('/inspector')) return { name: "QC Inspector", color: "text-emerald-500", bg: "bg-emerald-600" };
    return { name: "Pimpinan", color: "text-amber-500", bg: "bg-amber-600" };
  };

  const role = getRoleInfo();

  return (
    /* PERBAIKAN 1: Tinggi dinamis (h-16 di HP, h-24 di Laptop) & Padding dinamis (px-4 di HP, px-8 di Laptop) */
    <header className="h-16 md:h-24 border-b border-white/5 bg-[#0f172a] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      
      {/* TRIGGER MOBILE SIDEBAR: Muncul hanya di layar HP (md:hidden) */}
      <div className="flex items-center gap-3 md:hidden">
        <button className="text-white p-2 bg-white/[0.02] border border-white/5 rounded-xl transition-all active:scale-95">
          <Menu size={18} />
        </button>
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">QC System</span>
      </div>

      {/* SEARCH BAR DESKTOP: Disembunyikan di HP (hidden), baru muncul pas masuk laptop (md:flex) */}
      <div className="hidden md:flex items-center bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 gap-3 focus-within:border-white/10 transition-all">
        <Search className="w-4 h-4 text-gray-600" />
        <input 
          type="text" 
          placeholder="Search system command..." 
          className="bg-transparent outline-none text-xs w-64 font-bold text-gray-400 placeholder:text-gray-700 uppercase tracking-widest" 
        />
      </div>

      {/* BAGIAN KANAN: Tombol Notif & Profile Dropdown */}
      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        
        {/* BUTTON NOTIFIKASI: Menyesuaikan padding agar pas di genggaman HP */}
        <button className="relative p-2 md:p-3 text-gray-600 hover:text-white bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl transition-all">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-2 right-2 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full border border-[#050505]"></span>
        </button>

        {/* PROFILE CONTROL CONTAINER */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 md:gap-4 bg-white/[0.02] border border-white/5 p-1.5 md:p-2 pr-3 md:pr-5 rounded-xl md:rounded-2xl hover:bg-white/[0.05] transition-all"
          >
            {/* Kotak Icon User: Ramping di HP (w-8 h-8), Normal di laptop */}
            <div className={`w-8 h-8 md:w-10 md:h-10 ${role.bg} rounded-lg md:rounded-xl flex items-center justify-center shadow-2xl`}>
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>

            {/* Teks Informasi Akun: Tersembunyi di HP, otomatis muncul di Layar Tablet ke atas */}
            <div className="hidden sm:block text-left">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-0.5">Authorization</p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${role.color}`}>{role.name}</p>
            </div>
            
            <ChevronDown className={`w-3 h-3 text-gray-700 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROP DOWN MENU */}
          {isProfileOpen && (
            /* PERBAIKAN 2: mt-2 di HP biar gak terlalu jauh drop-downnya, serta z-index maksimal (z-50) */
            <div className="absolute right-0 top-full mt-2 md:mt-4 w-56 md:w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.01]">
                <p className="text-[9px] md:text-[10px] text-white font-black uppercase tracking-widest">Internal Account</p>
                <p className="text-[7px] md:text-[8px] text-gray-600 font-bold uppercase mt-1">Dewa Sutratex Security System</p>
              </div>
              
              <Link 
                href="/admin/settings" 
                className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
              >
                <Settings size={14} className="text-blue-500" /> Account Settings
              </Link>
              
              <button 
                onClick={() => logoutAction()}
                className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-red-500/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 border-t border-white/5 transition-all"
              >
                <LogOut size={14} /> Terminate Session
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}