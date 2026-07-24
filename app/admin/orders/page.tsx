"use client";

import React, { useState, useEffect } from "react";
import { getOrdersList, getFormData } from "@/server/inspector/orderdetail-actions";
import { 
  Package, Search, ArrowLeft, Calendar, 
  ChevronRight, Hash, ImageIcon 
} from "lucide-react";
import Link from "next/link";
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER SECTION - Diselaraskan dengan User Access */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-blue-500 flex items-center gap-2 mb-2 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Kembali
          </Link>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">
            Data <span className="text-blue-600">Order</span>
          </h1>
        </div>
        <CreateOrder master={master} onSuccess={refreshData} />
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Order ID or Design Name..." 
          className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl outline-none focus:border-blue-500/50 transition-all text-sm backdrop-blur-md text-white placeholder:text-gray-700"
        />
      </div>

      {/* DATA TABLE AREA - Container style sama dengan User Access */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">
                <th className="p-6">ID Order </th>
                <th className="p-6">Desain/Warna</th>
                <th className="p-6">Quantity</th>
                <th className="p-6">Gambar</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[10px] text-gray-500 uppercase tracking-widest">Loading...</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                  <td className="p-6 align-top">
                    <p className="font-black text-white">ORD-{order.id.toString().padStart(4, '0')}</p>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">{order.supplier?.nama || "No Supplier"}</p>
                  </td>
                  <td className="p-6 align-top">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs text-gray-300 font-medium capitalize">{item.warnaAtauDesain}</p>
                    ))}
                  </td>
                  <td className="p-6 align-top">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-xs text-white font-bold">{item.totalMeterOrder} <span className="text-gray-500 font-normal">MTR</span></p>
                    ))}
                  </td>
                  <td className="p-6 align-top">
                    {order.items[0]?.imageUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                        <img src={order.items[0].imageUrl} className="w-full h-full object-cover" />
                      </div>
                    ) : <span className="text-gray-700">-</span>}
                  </td>
                  <td className="p-6 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <EditOrder order={order} master={master} onSuccess={refreshData} />
                      <DeleteOrder orderId={order.id} onSuccess={refreshData} />
                      <DetailOrder order={order.id}>
                        <button className="p-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </DetailOrder>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}