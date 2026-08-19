import React from 'react';
import { db } from "@/db";
import { users } from "@/db/schema";
import CreateUser from "./components/CreateUser";
import UsersTable from "./UsersTable"; 

export default async function UsersListPage() {
  const allUsers = await db.select().from(users).orderBy(users.id);

  return (
    <div className="md:p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER: Judul User Access sejajar dengan Tombol Tambah Staff */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div>
  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black">
    Daftar <span className="text-black-600">User</span>
  </h1>
</div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Kelola manajemen akun pegawai dan hak akses sistem
            </p>
          </div>
          <CreateUser />
        </div>

        {/* Meneruskan data asli database (allUsers) ke Komponen Tabel Interaktif */}
        <UsersTable allUsers={allUsers} />

      </div>
    </div>
  );
}