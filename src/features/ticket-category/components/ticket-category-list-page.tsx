"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  List,
  Pencil,
  Plus,
  Search,
  Table2,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import type { TicketCategory } from "../data/ticket-category-seed";
import { ticketCategorySeed } from "../data/ticket-category-seed";
import { eventSeed } from "@/features/event/data/event-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import type { RoleName } from "@/features/auth/types";

let nextCatCounter = ticketCategorySeed.categories.length + 1;
function generateCategoryId(): string {
  const id = `tc-${String(nextCatCounter).padStart(3, "0")}`;
  nextCatCounter++;
  return id;
}

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function getEventTitle(eventId: string): string {
  return eventSeed.events.find((e) => e.eventId === eventId)?.eventTitle ?? eventId;
}

function getVenueCapacity(eventId: string): number {
  const event = eventSeed.events.find((e) => e.eventId === eventId);
  if (!event) return Infinity;
  const venue = venueSeed.venues.find((v) => v.venueId === event.venueId);
  return venue?.capacity ?? Infinity;
}

type ViewMode = "tabel" | "daftar";
type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; category: TicketCategory }
  | { kind: "delete"; category: TicketCategory };

export function TicketCategoryListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin" || role === "organizer";
  const [categories, setCategories] = useState<TicketCategory[]>(() => [
    ...ticketCategorySeed.categories,
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [viewMode, setViewMode] = useState<ViewMode>("tabel");

  const eventOptions = useMemo(() => {
    const ids = Array.from(new Set(categories.map((c) => c.eventId)));
    return ids
      .map((id) => ({ id, title: getEventTitle(id) }))
      .sort((a, b) => a.title.localeCompare(b.title, "id"));
  }, [categories]);

  const filtered = useMemo(() => {
    const list = categories.filter((c) => {
      const matchSearch =
        searchQuery === "" ||
        c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getEventTitle(c.eventId).toLowerCase().includes(searchQuery.toLowerCase());
      const matchEvent = eventFilter === "all" || c.eventId === eventFilter;
      return matchSearch && matchEvent;
    });
    return list.sort((a, b) => {
      const evtCmp = getEventTitle(a.eventId).localeCompare(getEventTitle(b.eventId), "id");
      if (evtCmp !== 0) return evtCmp;
      return a.categoryName.localeCompare(b.categoryName, "id");
    });
  }, [categories, searchQuery, eventFilter]);

  const totalKuota = categories.reduce((s, c) => s + c.quota, 0);
  const maxPrice = categories.length > 0 ? Math.max(...categories.map((c) => c.price)) : 0;

  function handleAdd(data: Omit<TicketCategory, "categoryId">) {
    setCategories((cur) => [...cur, { ...data, categoryId: generateCategoryId() }]);
    setModal({ kind: "closed" });
  }
  function handleEdit(updated: TicketCategory) {
    setCategories((cur) => cur.map((c) => (c.categoryId === updated.categoryId ? updated : c)));
    setModal({ kind: "closed" });
  }
  function handleDelete(id: string) {
    setCategories((cur) => cur.filter((c) => c.categoryId !== id));
    setModal({ kind: "closed" });
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kategori Tiket</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Kelola kategori dan harga tiket per acara
          </p>
        </div>
        {canManage && (
          <button
            id="btn-tambah-kategori"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
            onClick={() => setModal({ kind: "add" })}
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Kategori
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL KATEGORI" value={String(categories.length)} />
        <StatCard label="TOTAL KUOTA" value={totalKuota.toLocaleString("id-ID")} />
        <StatCard label="HARGA TERTINGGI" value={formatCurrency(maxPrice)} />
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        {/* Search + Filter */}
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              id="input-search-kategori"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari kategori..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              id="select-event-filter"
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">Semua Acara</option>
              {eventOptions.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        {/* Count + View Toggle */}
        <div className="flex items-center justify-between px-6 pb-2">
          <p className="text-sm font-semibold text-slate-400">{filtered.length} kategori ditemukan</p>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            <button
              id="btn-view-tabel-tc"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold transition ${viewMode === "tabel" ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              onClick={() => setViewMode("tabel")}
            >
              <Table2 size={13} /> Tabel
            </button>
            <button
              id="btn-view-daftar-tc"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold transition ${viewMode === "daftar" ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              onClick={() => setViewMode("daftar")}
            >
              <List size={13} /> Daftar
            </button>
          </div>
        </div>

        {/* Table */}
        {viewMode === "tabel" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Kategori</th>
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Acara</th>
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Harga</th>
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">Kuota</th>
                  <th className="px-6 py-3 text-right text-xs font-extrabold uppercase tracking-wider text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">Tidak ada kategori yang ditemukan.</td></tr>
                )}
                {filtered.map((cat) => (
                  <tr key={cat.categoryId} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{cat.categoryName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{getEventTitle(cat.eventId)}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(cat.price)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{cat.quota.toLocaleString("id-ID")} tiket</td>
                    <td className="px-6 py-4">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-2">
                          <button id={`btn-edit-${cat.categoryId}`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 transition hover:text-slate-700" onClick={() => setModal({ kind: "edit", category: cat })}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button id={`btn-hapus-${cat.categoryId}`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-500 transition hover:text-red-700" onClick={() => setModal({ kind: "delete", category: cat })}>
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 px-6 pb-4">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm font-bold text-slate-400">Tidak ada kategori yang ditemukan.</div>
            )}
            {filtered.map((cat) => (
              <div key={cat.categoryId} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">{cat.categoryName}</p>
                    <p className="text-xs font-semibold text-slate-400">{getEventTitle(cat.eventId)}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-600">{formatCurrency(cat.price)}</span>
                      <span className="text-xs font-semibold text-slate-400">{cat.quota.toLocaleString("id-ID")} tiket</span>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button id={`btn-edit-list-${cat.categoryId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]" onClick={() => setModal({ kind: "edit", category: cat })}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button id={`btn-hapus-list-${cat.categoryId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-[.97]" onClick={() => setModal({ kind: "delete", category: cat })}>
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.kind === "add" && (
        <CategoryFormModal mode="add" categories={categories} onClose={() => setModal({ kind: "closed" })} onSubmit={handleAdd} />
      )}
      {modal.kind === "edit" && (
        <CategoryFormModal mode="edit" category={modal.category} categories={categories} onClose={() => setModal({ kind: "closed" })} onSubmitEdit={handleEdit} />
      )}
      {modal.kind === "delete" && (
        <DeleteCategoryModal category={modal.category} onClose={() => setModal({ kind: "closed" })} onConfirm={() => handleDelete(modal.category.categoryId)} />
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-extrabold tracking-wider text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

/* ── Modal Backdrop ──────────────────────────────────────── */
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="relative w-[min(95vw,480px)] rounded-2xl bg-white shadow-2xl" style={{ animation: "modalIn 0.2s ease-out" }}>
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

/* ── Category Form Modal ─────────────────────────────────── */
type FormProps =
  | { mode: "add"; category?: undefined; categories: TicketCategory[]; onClose: () => void; onSubmit: (d: Omit<TicketCategory, "categoryId">) => void; onSubmitEdit?: undefined }
  | { mode: "edit"; category: TicketCategory; categories: TicketCategory[]; onClose: () => void; onSubmit?: undefined; onSubmitEdit: (u: TicketCategory) => void };

function CategoryFormModal(props: FormProps) {
  const { mode, onClose, categories } = props;
  const isEdit = mode === "edit";

  const [eventId, setEventId] = useState(isEdit ? props.category.eventId : (eventSeed.events[0]?.eventId ?? ""));
  const [categoryName, setCategoryName] = useState(isEdit ? props.category.categoryName : "");
  const [price, setPrice] = useState(isEdit ? String(props.category.price) : "");
  const [quota, setQuota] = useState(isEdit ? String(props.category.quota) : "");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimName = categoryName.trim();
    const parsedPrice = parseInt(price, 10);
    const parsedQuota = parseInt(quota, 10);

    if (!trimName || !eventId) { setError("Seluruh field wajib diisi."); return; }
    if (isNaN(parsedQuota) || parsedQuota <= 0) { setError("Kuota harus berupa bilangan bulat positif (> 0)."); return; }
    if (isNaN(parsedPrice) || parsedPrice < 0) { setError("Harga harus berupa bilangan tidak negatif (>= 0)."); return; }

    // Venue capacity check
    const otherQuota = categories
      .filter((c) => c.eventId === eventId && (!isEdit || c.categoryId !== props.category?.categoryId))
      .reduce((s, c) => s + c.quota, 0);
    const venueCapacity = getVenueCapacity(eventId);
    if (otherQuota + parsedQuota > venueCapacity) {
      setError(`Total kuota (${otherQuota + parsedQuota}) melebihi kapasitas venue (${venueCapacity}).`);
      return;
    }

    setError("");
    const data = { categoryName: trimName, quota: parsedQuota, price: parsedPrice, eventId };
    if (isEdit) {
      props.onSubmitEdit({ ...data, categoryId: props.category.categoryId });
    } else {
      props.onSubmit(data);
    }
  }

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}</h2>
          <button id="btn-close-tc-modal" type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">{error}</p>}

          <div>
            <label htmlFor="select-tc-event" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Acara <span className="text-red-500">*</span></label>
            <div className="relative">
              <select id="select-tc-event" className={`${inputClass} appearance-none pr-10`} value={eventId} onChange={(e) => setEventId(e.target.value)}>
                {eventSeed.events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>{ev.eventTitle}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label htmlFor="input-tc-name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Nama Kategori <span className="text-red-500">*</span></label>
            <input id="input-tc-name" className={inputClass} placeholder="cth. WVIP" type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-tc-price" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Harga (RP) <span className="text-red-500">*</span></label>
              <input id="input-tc-price" className={inputClass} placeholder="750000" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label htmlFor="input-tc-quota" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Kuota <span className="text-red-500">*</span></label>
              <input id="input-tc-quota" className={inputClass} placeholder="100" type="number" min="1" value={quota} onChange={(e) => setQuota(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button id="btn-batal-tc" type="button" className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]" onClick={onClose}>Batal</button>
          <button id="btn-submit-tc" type="submit" className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]">{isEdit ? "Simpan" : "Tambah"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

/* ── Delete Category Modal ───────────────────────────────── */
function DeleteCategoryModal({ category, onClose, onConfirm }: { category: TicketCategory; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-red-600">Hapus Kategori</h2>
          <button id="btn-close-delete-tc" type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Category ID</span>
            <span className="text-sm font-bold text-slate-600">{category.categoryId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Category Name</span>
            <span className="text-sm font-bold text-slate-700">{category.categoryName}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button id="btn-batal-delete-tc" type="button" className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]" onClick={onClose}>Batal</button>
          <button id="btn-confirm-delete-tc" type="button" className="h-10 rounded-lg bg-red-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700 active:scale-[.97]" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
