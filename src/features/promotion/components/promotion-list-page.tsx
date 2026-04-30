"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Calendar, 
  Users, 
  X,
  AlertTriangle,
  ChevronDown,
  Info
} from "lucide-react";
import { promotionSeedData } from "../data/promotion-seed";
import { Promotion, DiscountType } from "../types";
import type { RoleName } from "@/features/auth/types";

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ModalState = 
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "update"; promotion: Promotion }
  | { kind: "delete"; promotion: Promotion };

export function PromotionListPage({ role }: { role: RoleName }) {
  const [promotions, setPromotions] = useState<Promotion[]>(promotionSeedData);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  const isAdmin = role === "admin";

  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => 
      p.promoCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promotions, searchQuery]);

  function handleCreate(data: Omit<Promotion, "promotionId">) {
    const newPromo: Promotion = {
      ...data,
      promotionId: `prm-${String(promotions.length + 1).padStart(3, "0")}`,
    };
    setPromotions(prev => [newPromo, ...prev]);
    setModal({ kind: "closed" });
  }

  function handleUpdate(updated: Promotion) {
    setPromotions(prev => prev.map(p => p.promotionId === updated.promotionId ? updated : p));
    setModal({ kind: "closed" });
  }

  function handleDelete(promotionId: string) {
    setPromotions(prev => prev.filter(p => p.promotionId !== promotionId));
    setModal({ kind: "closed" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Daftar Promosi</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {isAdmin ? "Kelola kode promo dan diskon untuk pelanggan." : "Lihat promosi menarik yang sedang berlangsung."}
          </p>
        </div>
        {isAdmin && (
          <button
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-700 active:scale-[.97]"
            onClick={() => setModal({ kind: "create" })}
          >
            <Plus size={16} strokeWidth={3} />
            Buat Promo
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
        <input
          type="text"
          placeholder="Cari Kode Promo..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPromotions.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-400">
            Tidak ada promosi yang ditemukan.
          </div>
        ) : (
          filteredPromotions.map((promo) => (
            <PromotionCard 
              key={promo.promotionId} 
              promotion={promo} 
              isAdmin={isAdmin} 
              onEdit={() => setModal({ kind: "update", promotion: promo })}
              onDelete={() => setModal({ kind: "delete", promotion: promo })}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {modal.kind === "create" && (
        <PromotionFormModal 
          mode="create" 
          onClose={() => setModal({ kind: "closed" })} 
          onSubmit={handleCreate} 
          existingCodes={promotions.map(p => p.promoCode)}
        />
      )}
      {modal.kind === "update" && (
        <PromotionFormModal 
          mode="update" 
          promotion={modal.promotion} 
          onClose={() => setModal({ kind: "closed" })} 
          onSubmitUpdate={handleUpdate} 
          existingCodes={promotions.filter(p => p.promotionId !== modal.promotion.promotionId).map(p => p.promoCode)}
        />
      )}
      {modal.kind === "delete" && (
        <DeleteConfirmModal 
          promotion={modal.promotion} 
          onClose={() => setModal({ kind: "closed" })} 
          onConfirm={() => handleDelete(modal.promotion.promotionId)} 
        />
      )}
    </div>
  );
}

function PromotionCard({ 
  promotion, 
  isAdmin, 
  onEdit, 
  onDelete 
}: { 
  promotion: Promotion; 
  isAdmin: boolean; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const isExpired = new Date(promotion.endDate) < new Date();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Tag size={24} />
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button 
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              onClick={onEdit}
            >
              <Edit3 size={16} />
            </button>
            <button 
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
              onClick={onDelete}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{promotion.promoCode}</h3>
        <p className="text-sm font-bold text-blue-600 mt-1">
          Diskon {promotion.discountType === "Percentage" ? `${promotion.discountValue}%` : formatCurrency(promotion.discountValue)}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <Calendar size={14} className="text-slate-400" />
          <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
          {isExpired && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">Expired</span>}
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <Users size={14} className="text-slate-400" />
          <span>Batas Penggunaan: <span className="text-slate-900 font-bold">{promotion.usageLimit}x</span></span>
        </div>
      </div>
    </article>
  );
}

function PromotionFormModal({ 
  mode, 
  promotion, 
  onClose, 
  onSubmit, 
  onSubmitUpdate,
  existingCodes
}: { 
  mode: "create" | "update"; 
  promotion?: Promotion; 
  onClose: () => void; 
  onSubmit?: (data: Omit<Promotion, "promotionId">) => void;
  onSubmitUpdate?: (data: Promotion) => void;
  existingCodes: string[];
}) {
  const isUpdate = mode === "update";
  
  const [code, setCode] = useState(promotion?.promoCode || "");
  const [type, setType] = useState<DiscountType>(promotion?.discountType || "Percentage");
  const [value, setValue] = useState(promotion?.discountValue || 0);
  const [start, setStart] = useState(promotion?.startDate || "");
  const [end, setEnd] = useState(promotion?.endDate || "");
  const [limit, setLimit] = useState(promotion?.usageLimit || 1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!code || !start || !end || value <= 0 || limit <= 0) {
      alert("Harap isi semua field dengan benar.");
      return;
    }

    if (existingCodes.includes(code.toUpperCase())) {
      alert("Kode promo sudah digunakan. Harap gunakan kode unik.");
      return;
    }

    if (new Date(end) < new Date(start)) {
      alert("Tanggal berakhir tidak boleh sebelum tanggal mulai.");
      return;
    }

    const data = {
      promoCode: code.toUpperCase(),
      discountType: type,
      discountValue: value,
      startDate: start,
      endDate: end,
      usageLimit: limit,
    };

    if (isUpdate && promotion && onSubmitUpdate) {
      onSubmitUpdate({ ...data, promotionId: promotion.promotionId });
    } else if (onSubmit) {
      onSubmit(data);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-extrabold text-slate-900">
            {isUpdate ? "Update Promotion" : "Create Promotion"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Kode Promo</label>
            <input 
              type="text" 
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase"
              placeholder="cth. PROMOLEBARAN"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tipe Diskon</label>
              <div className="relative">
                <select 
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                  value={type}
                  onChange={(e) => setType(e.target.value as DiscountType)}
                >
                  <option value="Percentage">Persentase (%)</option>
                  <option value="Nominal">Nominal (Rp)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Nilai Diskon</label>
              <input 
                type="number" 
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={value || ""}
                onChange={(e) => setValue(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tanggal Mulai</label>
              <input 
                type="date" 
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tanggal Berakhir</label>
              <input 
                type="date" 
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Batas Penggunaan</label>
            <input 
              type="number" 
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              value={limit || ""}
              onChange={(e) => setLimit(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-extrabold shadow-lg shadow-blue-100 hover:bg-blue-700"
            >
              {isUpdate ? "Simpan" : "Buat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ 
  promotion, 
  onClose, 
  onConfirm 
}: { 
  promotion: Promotion; 
  onClose: () => void; 
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-sm animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Hapus Promosi?</h2>
        <p className="mt-2 text-sm font-semibold text-slate-400">
          Anda akan menghapus promo <span className="text-slate-900 font-bold">{promotion.promoCode}</span>. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-extrabold shadow-lg shadow-red-100 hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
