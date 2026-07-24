import React from 'react';
import { db } from "@/db";
import { users } from "@/db/schema";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import Link from "next/link";

// IMPORT KOMPONEN DARI FOLDER COMPONENTS
import CreateUser from "./components/CreateUser";
import EditUser from "./components/EditUser"; // Pastikan EditUser.tsx sudah ada kodenya
import DeleteButton from "./components/DeleteButton";

export default async function UsersListPage() {
  const allUsers = await db.select().from(users).orderBy(users.id);

  return (
    <div className="md:p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-500 mb-6 transition-all group">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-blue-500/50 transition-all">
                <ArrowLeft className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Panel</span>
            </Link>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-300">
              User <span className="text-blue-600">Access</span>
            </h1>
          </div>
          
          {/* KOMPONEN POP-UP TAMBAH USER */}
          <CreateUser />
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/50">
                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Staff Profile</th>
                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50">
                          <UserIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-300 uppercase">{user.nama || user.username}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{user.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3">
                        {/* KOMPONEN POP-UP EDIT */}
                        <EditUser user={user} />

                        {/* KOMPONEN HAPUS */}
                        <DeleteButton id={user.id} username={user.username} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}