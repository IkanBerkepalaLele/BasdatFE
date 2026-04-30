"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  ChevronDown,
  X,
  AlertTriangle
} from "lucide-react";
import { orderSeedData } from "../data/order-seed";
import { eventSeed } from "@/features/event/data/event-seed";
import { authSeed } from "@/features/auth/data/auth-seed";
import type { RoleName } from "@/features/auth/types";
import type { Order, PaymentStatus } from "../types";

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderListPage({ 
  role, 
  customerId, 
  organizerId 
}: { 
  role: RoleName; 
  customerId?: string; 
  organizerId?: string;
}) {
  const [orders, setOrders] = useState<Order[]>(() => {
    let filtered = [...orderSeedData];
    if (role === "customer") {
      filtered = filtered.filter(o => o.customerId === customerId);
    } else if (role === "organizer") {
      const myEventIds = eventSeed.events
        .filter(e => e.organizerId === organizerId)
        .map(e => e.eventId);
      filtered = filtered.filter(o => myEventIds.includes(o.eventId));
    }
    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [editModal, setEditModal] = useState<{ isOpen: boolean; order?: Order }>({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; order?: Order }>({ isOpen: false });

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const paid = filteredOrders.filter(o => o.paymentStatus === "Paid").length;
    const pending = filteredOrders.filter(o => o.paymentStatus === "Pending").length;
    const revenue = filteredOrders
      .filter(o => o.paymentStatus === "Paid")
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    return { total, paid, pending, revenue };
  }, [filteredOrders]);

  function handleDelete(order: Order) {
    setDeleteModal({ isOpen: true, order });
  }

  function confirmDelete() {
    if (deleteModal.order) {
      setOrders(prev => prev.filter(o => o.orderId !== deleteModal.order!.orderId));
      setDeleteModal({ isOpen: false });
    }
  }

  function handleUpdateStatus(orderId: string, newStatus: PaymentStatus) {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentStatus: newStatus } : o));
    setEditModal({ isOpen: false });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Daftar Order</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {role === "admin" ? "Kelola seluruh pesanan tiket di platform." : "Pantau riwayat pesanan tiket Anda."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Order" 
          value={stats.total.toString()} 
          icon={<ShoppingBag className="text-blue-600" size={20} />} 
          color="bg-blue-50"
        />
        <StatCard 
          label="Order Lunas" 
          value={stats.paid.toString()} 
          icon={<CheckCircle2 className="text-emerald-600" size={20} />} 
          color="bg-emerald-50"
        />
        <StatCard 
          label="Order Pending" 
          value={stats.pending.toString()} 
          icon={<Clock className="text-amber-600" size={20} />} 
          color="bg-amber-50"
        />
        {(role === "admin" || role === "organizer") && (
          <StatCard 
            label="Total Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={<TrendingUp className="text-indigo-600" size={20} />} 
            color="bg-indigo-50"
          />
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
          <input
            type="text"
            placeholder="Cari Order ID..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">Semua Status</option>
            <option value="Paid">Lunas</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Dibatalkan</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Order Date</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-right">Total Amount</th>
                {role === "admin" && (
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 6 : 5} className="px-6 py-12 text-center text-sm font-bold text-slate-400 italic">
                    Tidak ada pesanan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">#{order.orderId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatDate(order.orderDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                           {authSeed.customers.find(c => c.customerId === order.customerId)?.fullName.charAt(0) || "C"}
                         </div>
                         <span className="text-sm font-bold text-slate-600">
                           {authSeed.customers.find(c => c.customerId === order.customerId)?.fullName || order.customerId}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    {role === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            onClick={() => setEditModal({ isOpen: true, order })}
                            title="Update Status"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                            onClick={() => handleDelete(order)}
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Update Status Pesanan</h2>
              <button onClick={() => setEditModal({ isOpen: false })} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-500">
                Order ID: <span className="text-slate-900 font-bold">#{editModal.order.orderId}</span>
              </p>
              <div className="grid gap-3">
                {(["Pending", "Paid", "Cancelled"] as PaymentStatus[]).map((status) => (
                  <button
                    key={status}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                      editModal.order?.paymentStatus === status
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                    onClick={() => handleUpdateStatus(editModal.order!.orderId, status)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        status === "Paid" ? "bg-emerald-100 text-emerald-600" :
                        status === "Pending" ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {status === "Paid" ? <CheckCircle2 size={16} /> :
                         status === "Pending" ? <Clock size={16} /> :
                         <XCircle size={16} />}
                      </div>
                      <span className="font-bold text-slate-700">{status === "Paid" ? "Lunas" : status === "Pending" ? "Pending" : "Dibatalkan"}</span>
                    </div>
                    {editModal.order?.paymentStatus === status && <CheckCircle2 className="text-blue-600" size={20} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
            </div>
            <h2 className="text-center text-xl font-extrabold text-slate-900 mb-2">Hapus Pesanan?</h2>
            <p className="text-center text-sm font-semibold text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus pesanan <span className="text-slate-900 font-bold">#{deleteModal.order.orderId}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const configs = {
    Paid: { icon: <CheckCircle2 size={12} />, text: "Lunas", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    Pending: { icon: <Clock size={12} />, text: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-100" },
    Cancelled: { icon: <XCircle size={12} />, text: "Dibatalkan", classes: "bg-red-50 text-red-700 border-red-100" },
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.classes}`}>
      {config.icon}
      {config.text}
    </span>
  );
}
