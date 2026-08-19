"use client";

import React, { useState, useRef } from 'react';
import { Camera, User, Lock, Save, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { updateProfileSettingsAction } from '@/server/admin/auth-actions';

export default function AdminSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "Rafi Darajat",
    username: "admin_rafi",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("⚠️ Ukuran foto maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("⚠️ Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsLoading(true);
    // Properti 'role' dihapus karena tidak didefinisikan dalam parameter updateProfileSettingsAction
    const res = await updateProfileSettingsAction({
      name: formData.name,
      username: formData.username,
      currentPassword: formData.currentPassword || undefined,
      newPassword: formData.newPassword || undefined,
      fotoProfil: profileImage || undefined,
    });

    setIsLoading(false);
    alert(res.message);
    if (res.success) {
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] p-4 md:p-8 font-sans antialiased pb-24">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-inner">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div translate="no">
            <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">Admin Settings</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Akses Kontrol Penuh Keamanan Akun</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center">
            <p translate="no" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 w-full border-b border-slate-800 pb-3 text-left">Foto Profil</p>
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-[#050810] shadow-xl flex items-center justify-center relative z-10">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-600" />
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 z-20 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full border-4 border-[#0b0f19] transition-all shadow-lg cursor-pointer">
                <Camera size={16} />
              </button>
              <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            </div>
            <h2 translate="no" className="text-sm font-black text-white uppercase tracking-widest mb-1">{formData.name}</h2>
            <p translate="no" className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mt-2">Administrator</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSaveChanges} className="bg-[#0b0f19] border border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-6">
            <div className="space-y-4">
              <p translate="no" className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Informasi Dasar</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label translate="no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-[#050810] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label translate="no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-500">Username Sistem</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full bg-[#050810] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 font-bold" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <p translate="no" className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Keamanan & Password</p>
              <div className="space-y-1.5">
                <label translate="no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Saat Ini</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="currentPassword" placeholder="Masukkan password saat ini" value={formData.currentPassword} onChange={handleChange} className="w-full bg-[#050810] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none font-bold" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label translate="no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input type={showPassword ? "text" : "password"} name="newPassword" placeholder="Opsional" value={formData.newPassword} onChange={handleChange} className="w-full bg-[#050810] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label translate="no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Ulangi baru" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-[#050810] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none font-bold" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 cursor-pointer">
                <Save size={16} /> {isLoading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}