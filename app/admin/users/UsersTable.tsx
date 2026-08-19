"use client";

import React, { useState, useEffect } from 'react';
import { User as UserIcon } from "lucide-react";
import EditUser from "./components/EditUser"; 
import DeleteButton from "./components/DeleteButton";

interface User {
  id: number;
  nama: string | null;
  username: string;
  role: string;
  fotoProfil: string | null;
}

export default function UsersTable({ allUsers }: { allUsers: User[] }) {
  // State untuk Pagination (6 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset ke halaman 1 jika data user berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [allUsers]);

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(allUsers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = allUsers.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl flex flex-col mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-6 py-5">Staff Profile</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Tidak ada data pengguna.
                </td>
              </tr>
            ) : (
              currentData.map((user) => ( 
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-5 align-top">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {user.fotoProfil ? (
                          <img src={user.fotoProfil} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase">{user.nama || user.username}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          Role: {user.role} <span className="text-slate-400 mx-1">|</span> <span className="text-blue-500">@{user.username}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right align-top">
                    <div className="flex justify-end gap-2 items-center">
                      <EditUser user={user} />
                      <DeleteButton id={user.id} username={user.username} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {allUsers.length > 0 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, allUsers.length)} dari {allUsers.length} pengguna
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Prev
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  currentPage === pageNumber
                    ? "bg-black text-white shadow-lg shadow-black/20 border border-black dark:border-slate-700"
                    : "bg-slate-200 dark:bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}