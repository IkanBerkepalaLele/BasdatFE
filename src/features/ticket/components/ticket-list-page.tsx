"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Plus, Ticket, X, Armchair } from "lucide-react";
import type { Ticket as TicketType } from "../data/ticket-seed";
import {
  ticketSeed, ticketCategorySeed, orderSeed,
  resolveCategory, resolveOrder, resolveEventTitle,
  resolveVenueSeatingType, resolveCustomerName,
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
  const [tickets, setTickets] = useState<TicketType[]>(() => [...ticketSeed]);
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(data: TicketType) {
    setTickets((c) => [data, ...c]);
    setShowAdd(false);
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Tiket</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Kelola tiket untuk setiap acara
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

      {/* Simple list */}
      <div className="space-y-4">
        {tickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-400">
            Tidak ada tiket.
          </div>
        )}
        {tickets.map((ticket) => {
          const cat = resolveCategory(ticket.tcategoryId);
          const eventId = resolveEventIdFromOrder(ticket.torderId);
          return (
            <article key={ticket.ticketId} className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{ticket.ticketCode}</h3>
                  <p className="text-sm font-semibold text-slate-400">
                    {eventId ? resolveEventTitle(eventId) : "-"} · {cat?.categoryName ?? "-"} · {cat ? formatCurrency(cat.price) : "-"}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddTicketModal
          existingTickets={tickets}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}
    </section>
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
