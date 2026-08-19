"use client";

import React, { useState, useEffect } from "react";
import { getOrdersList, getFormData } from "@/server/inspector/orderdetail-actions";
import { 
  Package, Search, Calendar, 
  ChevronRight, Hash, ImageIcon 
} from "lucide-react";
import CreateOrder from "./components/CreateOrder";
import EditOrder from "./components/EditOrder";
import DeleteOrder from "./components/DeleteOrder";
import DetailOrder from "./components/DetailOrder";

interface OrderItem {
  id: number;
  fabricTypeId: number;
  fabricType?: { name: string };
  kategori: string;
  warnaAtauDesain: string;
  totalYardOrder: number;
  totalMeterOrder: number;
  imageUrl?: string;
}

interface OrderData {
  id: number;
  supplierId: number | null;
  supplier?: { nama: string }; 
  tanggalOrder: Date | null;
  items: OrderItem[];
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [master, setMaster] = useState<any>({ suppliers: [], fabricTypes: [], inspectors: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk Pagination (6 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const refreshData = async () => {
    setLoading(true);
    try {
      const [data, m] = await Promise.all([getOrdersList(), getFormData()]);
      setOrders(data as unknown as OrderData[]);
      setMaster(m);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchQuery) ||
    order.items.some(item => item.warnaAtauDesain?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset ke halaman 1 setiap kali melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      {/* HEADER SECTION (Tombol kembali dihapus, layout dirapikan) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Data <span className="text-blue-600">Order</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Kelola daftar order produksi dan spesifikasi kain pabrik.
          </p>
        </div>
        
        {/* Tombol Create/Tambah Order dengan background hitam dan teks putih */}
        <div className=" [&>button]:bg-black [&>button]:hover:bg-slate-800 [&>button]:text-white [&>button]:shadow-xl [&>button]:shadow-black/20 [&>button]:rounded-2xl">
          <CreateOrder master={master} onSuccess={refreshData} />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ID Order atau Nama Desain/Warna..." 
          className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      {/* DATA TABLE AREA */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-5">ID Order</th>
                <th className="px-6 py-5">Desain / Warna</th>
                <th className="px-6 py-5">Quantity</th>
                <th className="px-6 py-5">Gambar</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Memuat data order...
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Belum ada data order ditemukan.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">ORD-{order.id.toString().padStart(4, '0')}</span>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">{order.supplier?.nama || "No Supplier"}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{item.warnaAtauDesain}</p>
                      ))}
                    </td>
                    <td className="px-6 py-5 align-top">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-xs font-black text-slate-900 dark:text-white">
                          {item.totalMeterOrder} <span className="text-[10px] text-slate-500 font-bold">MTR</span>
                        </p>
                      ))}
                    </td>
                    <td className="px-6 py-5 align-top">
                      {order.items[0]?.imageUrl ? (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={order.items[0].imageUrl} alt="Order Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex justify-end gap-2 items-center">
                        <EditOrder order={order} master={master} onSuccess={refreshData} />
                        <DeleteOrder orderId={order.id} onSuccess={refreshData} />
                        
                        <DetailOrder order={order}>
                          <button className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-colors cursor-pointer">
                            <ChevronRight size={16} />
                          </button>
                        </DetailOrder>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && filteredOrders.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)} dari {filteredOrders.length} data order
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
    </div>
  );
}