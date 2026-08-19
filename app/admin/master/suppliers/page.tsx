import React from 'react';
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import CreateSupplier from "./components/CreateSupplier";
import SuppliersTable from "./SuppliersTable"; // Tanpa kurung kurawal {}

export default async function SuppliersListPage() {
  const allSuppliers = await db.select().from(suppliers).orderBy(suppliers.id);

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Data <span className="text-blue-600">Suppliers</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Daftar Pabrik / Vendor Eksternal
          </p>
        </div>
        
        <div className="[&>button]:bg-black [&>button]:hover:bg-slate-800 [&>button]:text-white [&>button]:shadow-xl [&>button]:shadow-black/20 [&>button]:rounded-2xl">
          <CreateSupplier />
        </div>
      </div>

      <SuppliersTable allSuppliers={allSuppliers} />
    </div>
  );
}