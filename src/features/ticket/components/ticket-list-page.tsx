"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
  ChevronDown, Plus, Search, 
  Ticket, X, Armchair, CalendarDays, 
  User, Pencil, Trash2,
} from "lucide-react";
import type { Ticket as TicketType } from "../data/ticket-seed";
import {
  ticketSeed, ticketCategorySeed, orderSeed,
  resolveCategory, resolveOrder, resolveEventTitle,
  resolveVenueSeatingType, resolveVenueName ,resolveCustomerName,
  resolveEventIdFromOrder, countUsedQuota,
  generateTicketCode, generateTicketId,
} from "../data/ticket-seed";
import type { RoleName } from "@/features/auth/types";

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

export function TicketListPage({
  role,
  customerId,
}: {
  role: RoleName;
  customerId?: string;
}) {
  const canCreate = role === "admin" || role === "organizer";
  const isCustomer = role === "customer";
  const canEditDelete = role === "admin";
  const [tickets, setTickets] = useState<TicketType[]>(() => [...ticketSeed]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [editTicket, setEditTicket] = useState<TicketType | null>(null);
  const [deleteTicket, setDeleteTicket] = useState<TicketType | null>(null);

  function handleAdd(data: TicketType) {
    setTickets((c) => [data, ...c]);
    setShowAdd(false);
  }
  
  function handleEdit(updated: TicketType) {
    setTickets((c) => c.map((t) => (t.ticketId === updated.ticketId ? updated : t)));
    setEditTicket(null);
  }

  function handleDelete(ticketId: string) {
    setTickets((c) => c.filter((t) => t.ticketId !== ticketId));
    setDeleteTicket(null);
  }

    const visibleTickets = useMemo(() => {
    if (!isCustomer || !customerId) return tickets;
    return tickets.filter((t) => {
        const order = resolveOrder(t.torderId);
        return order?.customerId === customerId;
    });
    }, [tickets, isCustomer, customerId]);

    const eventOptions = useMemo(() => {
    const ids = new Set<string>();
    visibleTickets.forEach((t) => {
        const eid = resolveEventIdFromOrder(t.torderId);
        if (eid) ids.add(eid);
    });
    return Array.from(ids)
        .map((id) => ({ eventId: id, title: resolveEventTitle(id) }))
        .sort((a, b) => a.title.localeCompare(b.title));
    }, [visibleTickets]);

    const filteredTickets = useMemo(() => {
    return visibleTickets.filter((t) => {
        const eventId = resolveEventIdFromOrder(t.torderId);
        const eventTitle = eventId ? resolveEventTitle(eventId) : "";
        const matchSearch =
        searchQuery === "" ||
        t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchEvent = eventFilter === "all" || eventId === eventFilter;
        return matchSearch && matchEvent;
    });
    }, [visibleTickets, searchQuery, eventFilter]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isCustomer ? "Tiket Saya" : "Manajemen Tiket"}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {isCustomer ? "Daftar tiket yang Anda miliki" : "Kelola tiket untuk setiap acara"}
          </p>
        </div>
        {canCreate && (
          <button
            id="btn-tambah-ticket"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Tiket
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL TIKET" value={String(visibleTickets.length)} />
        <StatCard label="KATEGORI TERPAKAI" value={String(new Set(visibleTickets.map((t) => t.tcategoryId)).size)} />
        <StatCard label="TOTAL ORDER" value={String(new Set(visibleTickets.map((t) => t.torderId)).size)} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
          <input
            id="input-search-ticket"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Cari kode tiket atau event..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            id="select-event-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="all">Semua Event</option>
            {eventOptions.map((evt) => (
              <option key={evt.eventId} value={evt.eventId}>{evt.title}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-4">
        {filteredTickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-400">
            Tidak ada tiket yang ditemukan.
          </div>
        )}
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.ticketId}
            ticket={ticket}
            showCustomer={!isCustomer}
            canEditDelete={canEditDelete}
            onEdit={() => setEditTicket(ticket)}
            onDelete={() => setDeleteTicket(ticket)}
          />
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddTicketModal
          existingTickets={tickets}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}
      {editTicket && <EditTicketModal 
        ticket={editTicket} onClose={() => setEditTicket(null)} onSubmit={handleEdit} />
      }
      {deleteTicket && <DeleteTicketModal 
        ticket={deleteTicket} onClose={() => setDeleteTicket(null)} onConfirm={() => 
        handleDelete(deleteTicket.ticketId)} />
      }
    </section>
  );
}

// Stat Card Component
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-extrabold tracking-wider text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

function TicketCard({ ticket, showCustomer, canEditDelete, onEdit, onDelete }: { ticket: TicketType; showCustomer: boolean; canEditDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  const cat = resolveCategory(ticket.tcategoryId);
  const order = resolveOrder(ticket.torderId);
  const eventId = order?.eventId ?? "";
  const eventTitle = resolveEventTitle(eventId);
  const venueName = resolveVenueName(eventId);
  const customerName = order ? resolveCustomerName(order.customerId) : "-";

    return (
        <article className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition hover:shadow-[0_4px_20px_rgba(15,23,42,0.10)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Ticket size={20} /></div>
            <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">{ticket.ticketCode}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-400"><CalendarDays size={13} className="shrink-0" />{eventTitle}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Kategori</p><span className="mt-1 inline-block rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{cat?.categoryName ?? "-"}</span></div>
                <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Harga</p><p className="mt-1 text-sm font-extrabold text-emerald-600">{cat ? formatCurrency(cat.price) : "-"}</p></div>
                <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Venue</p><p className="mt-1 text-sm font-bold text-slate-500">{venueName}</p></div>
                {showCustomer && (<div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Pelanggan</p><p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-500"><User size={13} /> {customerName}</p></div>)}
                <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Order</p><p className="mt-1 text-sm font-bold text-slate-500">{ticket.torderId}</p></div>
                </div>
                {canEditDelete && (
                <div className="mt-4">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]" onClick={onEdit}>
                    <Pencil size={13} /> Update
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-[.97]" onClick={onDelete}>
                        <Trash2 size={13} /> Hapus
                    </button>
                </div>
                )}
            </div>
            </div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-600">{cat?.categoryName ?? "-"}</span>
        </div>
        </article>
    );
}


// Modal Backdrop 
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="relative w-[min(95vw,520px)] rounded-2xl bg-white shadow-2xl" style={{ animation: "modalIn 0.2s ease-out" }}>
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// Add Ticket Modal 
function AddTicketModal({
  existingTickets, onClose, onSubmit,
}: {
  existingTickets: TicketType[]; onClose: () => void;
  onSubmit: (data: TicketType) => void;
}) {
  const [orderId, setOrderId] = useState("");
  const [tcategoryId, setTcategoryId] = useState("");

  const selectedOrder = orderSeed.find((o) => o.orderId === orderId);
  const eventId = selectedOrder?.eventId ?? "";

  const availableCategories = useMemo(() => {
    if (!eventId) return [];
    return ticketCategorySeed.filter((c) => c.eventId === eventId);
  }, [eventId]);

  const ticketCode = useMemo(() => generateTicketCode(), []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !tcategoryId) return;

    const cat = resolveCategory(tcategoryId);
    if (cat) {
      const used = countUsedQuota(tcategoryId, existingTickets);
      if (used >= cat.quota) return;
    }

    onSubmit({
      ticketId: generateTicketId(),
      ticketCode,
      tcategoryId,
      torderId: orderId,
    });
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">Tambah Tiket Baru</h2>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="select-order" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Order (torder_id)</label>
            <select id="select-order" className={inputClass + " appearance-none"} value={orderId} onChange={(e) => { setOrderId(e.target.value); setTcategoryId(""); }} required>
              <option value="" disabled>Pilih Order</option>
              {orderSeed.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderId} — {resolveCustomerName(o.customerId)} — {resolveEventTitle(o.eventId)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-category" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Kategori Tiket (tcategory_id)</label>
            <select id="select-category" className={inputClass + " appearance-none"} value={tcategoryId} onChange={(e) => setTcategoryId(e.target.value)} required disabled={!eventId}>
              <option value="" disabled>Pilih Kategori</option>
              {availableCategories.map((cat) => {
                const used = countUsedQuota(cat.categoryId, existingTickets);
                const full = used >= cat.quota;
                return (
                  <option key={cat.categoryId} value={cat.categoryId} disabled={full}>
                    {cat.categoryName} — {formatCurrency(cat.price)} — ({used}/{cat.quota}){full ? " [PENUH]" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Kode Tiket (auto-generated)</label>
            <input className={inputClass + " bg-slate-50 text-slate-400 cursor-not-allowed"} value={ticketCode} readOnly />
          </div>

          {eventId && resolveVenueSeatingType(eventId) === "reserved" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
              <Armchair size={14} className="mr-1 inline" />
              Venue ini menggunakan reserved seating. Assign kursi tersedia setelah modul Seat diimplementasi.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]" onClick={onClose}>Batal</button>
          <button type="submit" className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]">Buat Tiket</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// Edit Ticket Modal
function EditTicketModal({ ticket, onClose, onSubmit }: { ticket: TicketType; onClose: () => void; onSubmit: (u: TicketType) => void }) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...ticket });
  }
  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">Update Tiket</h2>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div><label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Kode Tiket</label><input className={inputClass + " bg-slate-50 text-slate-400 cursor-not-allowed"} value={ticket.ticketCode} readOnly /></div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 hover:bg-slate-50" onClick={onClose}>Batal</button>
          <button type="submit" className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white hover:bg-[#1d4ed8]">Simpan</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

function DeleteTicketModal({ ticket, onClose, onConfirm }: { ticket: TicketType; onClose: () => void; onConfirm: () => void }) {
  const cat = resolveCategory(ticket.tcategoryId);
  const eventId = resolveEventIdFromOrder(ticket.torderId);
  const eventTitle = eventId ? resolveEventTitle(eventId) : "-";
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-red-600">Hapus Tiket</h2>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
          Apakah Anda yakin ingin menghapus tiket ini? Relasi kursi akan dilepaskan. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 hover:bg-slate-50" onClick={onClose}>Batal</button>
          <button type="button" className="h-10 rounded-lg bg-red-600 px-5 text-sm font-extrabold text-white hover:bg-red-700" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}