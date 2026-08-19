"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Save, ShieldCheck, Lock, Info } from 'lucide-react';
import { updateProfileSettingsAction } from '@/server/admin/auth-actions';
import { toast } from 'sonner';

type UserProps = {
  id: number;
  nama: string | null;
  username: string;
  role: string;
  fotoProfil: string | null;
};

export default function ProfileSettings({ user }: { user: UserProps }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(user.fotoProfil);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.nama || "",
  });

  useEffect(() => {
    setFormData({ name: user.nama || "" });
    setProfileImage(user.fotoProfil);
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const promise = updateProfileSettingsAction({
      name: formData.name,
      fotoProfil: profileImage || undefined,
    });

    toast.promise(promise, {
      loading: 'Menyimpan perubahan...',
      success: (res) => res.message,
      error: (err) => `Gagal: ${err.message}`,
    });

    await promise;
    setIsLoading(false);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (role === 'inspector') return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    if (role === 'pimpinan') return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 w-full border-b border-slate-100 dark:border-slate-800 pb-3 text-left">Foto Profil</p>
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xl flex items-center justify-center relative z-10">
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} className="text-slate-400 dark:text-slate-500" />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 z-20 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full border-4 border-white dark:border-slate-900 transition-all shadow-lg">
              <Camera size={16} />
            </button>
            <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{formData.name}</h2>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border mt-2 ${getRoleBadge(user.role)}`}>{user.role}</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <form onSubmit={handleSaveChanges} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 flex flex-col h-full">
          <div className="space-y-6 flex-1">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Informasi Dasar</p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">Username Login <Lock size={10} className="text-rose-500" /></label>
              <input type="text" value={user.username} readOnly disabled className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-500 font-bold cursor-not-allowed" />
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 ml-1 mt-1 font-medium"><Info size={12} className="text-blue-500 flex-shrink-0" /> Username dan Password hanya dapat diubah oleh Administrator.</p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:bg-slate-400 disabled:shadow-none">
              <Save size={16} /> {isLoading ? "MENYIMPAN..." : "SIMPAN PROFIL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}