"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { 
  Armchair, Plus, X, Building2,
  ChevronDown, Search, Pencil, Trash2,
} from "lucide-react";
import type { Seat, HasRelationship } from "../data/seat-seed";
import { 
  seatSeed, resolveVenueName, generateSeatId, 
  hasRelationshipSeed, isSeatOccupied 
} from "../data/seat-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import type { RoleName } from "@/features/auth/types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

export function SeatListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin" || role === "organizer";
  const [seats, setSeats] = useState<Seat[]>(() => [...seatSeed]);
  const [showAdd, setShowAdd] = useState(false);
  const [relationships, setRelationships] = useState<HasRelationship[]>(() => [...hasRelationshipSeed]);
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [editSeat, setEditSeat] = useState<Seat | null>(null);
  const [deleteSeat, setDeleteSeat] = useState<Seat | null>(null);

  function handleAdd(data: Seat) {
    setSeats((c) => [...c, data]);
    setShowAdd(false);
  }

  function handleEdit(updated: Seat) {
    setSeats((c) => c.map((s) => (s.seatId === updated.seatId ? updated : s)));
    setEditSeat(null);
  }

  function handleDelete(seatId: string) {
    setSeats((c) => c.filter((s) => s.seatId != seatId));
    setDeleteSeat(null);
  }

  const venueOptions = useMemo(() => {
    const ids = Array.from(new Set(seats.map((s) => s.venueId)));
    return ids.map((id) => ({ venueId: id, name: resolveVenueName(id) })).sort((a, b) => a.name.localeCompare(b.name));
  }, [seats]);

  const filteredSeats = useMemo(() => {
    return seats.filter((s) => {
      const matchSearch =  searchQuery === "" ||
        s.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rowNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.seatNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVenue = venueFilter === "all" || s.venueId === venueFilter;
      return matchSearch && matchVenue;
    });
  }, [seats, searchQuery, venueFilter]);

  const totalSeats = seats.length;
  const occupiedCount = seats.filter((s) => isSeatOccupied(s.seatId, relationships)).length;
  const availableCount = totalSeats - occupiedCount;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Kursi</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">Kelola kursi dan denah tempat duduk venue</p>
        </div>
        {canManage && (
          <button id="btn-tambah-seat" className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]" onClick={() => setShowAdd(true)}>
            <Plus size={16} strokeWidth={3} /> Tambah Kursi
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL KURSI" value={String(totalSeats)} />
        <StatCard label="TERSEDIA" value={String(availableCount)} />
        <StatCard label="TERISI" value={String(occupiedCount)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
          <input id="input-search-seat" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Cari section, baris, atau nomor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="relative">
          <select id="select-venue-filter" className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
            <option value="all">Semua Venue</option>
            {venueOptions.map((v) => (<option key={v.venueId} value={v.venueId}>{v.name}</option>))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Simple table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Section</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Baris</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">No. Kursi</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Venue</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</th>
              {canManage && <th className="px-4 py-4"></th>}
            </tr>
          </thead>
          <tbody>
            {filteredSeats.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">Tidak ada kursi yang ditemukan.</td></tr>
            )}
            {filteredSeats.map((seat) => {
              const occupied = isSeatOccupied(seat.seatId, relationships);
              return (
                <tr key={seat.seatId} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Armchair size={16} className="text-blue-500" />
                      <span className="font-extrabold text-slate-900">{seat.section}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-600">{seat.rowNumber}</td>
                  <td className="px-4 py-4"><span className="rounded-md bg-slate-100 px-2.5 py-1 font-extrabold text-slate-700">{seat.seatNumber}</span></td>
                  <td className="px-4 py-4"><span className="flex items-center gap-1.5 font-semibold text-slate-500"><Building2 size={14} />{resolveVenueName(seat.venueId)}</span></td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${occupied ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${occupied ? "bg-red-500" : "bg-emerald-500"}`} />
                      {occupied ? "TERISI" : "TERSEDIA"}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4">
                      <button className="lrounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" onClick={() => setEditSeat(seat)}>
                        <Pencil size={15} />
                      </button>
                      {(() => {
                        const occupied = isSeatOccupied(seat.seatId, relationships);
                        return occupied ? (
                          <button className="rounded-lg p-1.5 text-slate-200 cursor-not-allowed" disabled title="Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus.">
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <button className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteSeat(seat)}>
                            <Trash2 size={15} />
                          </button>
                        );
                      })()}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAdd && <SeatFormModal mode="add" onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      {editSeat && <SeatFormModal mode="edit" seat={editSeat} onClose={() => setEditSeat(null)} onSubmitEdit={handleEdit} />}
      {deleteSeat && <DeleteSeatModal seat={deleteSeat} onClose={() => setDeleteSeat(null)} onConfirm={() => handleDelete(deleteSeat.seatId)} />}
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

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="relative w-[min(95vw,480px)] rounded-2xl bg-white shadow-2xl" style={{ animation: "modalIn 0.2s ease-out" }}>{children}</div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

type SeatFormProps =
  | { mode: "add"; seat?: undefined; onClose: () => void; onSubmit: (s: Seat) => void; onSubmitEdit?: undefined }
  | { mode: "edit"; seat: Seat; onClose: () => void; onSubmit?: undefined; onSubmitEdit: (s: Seat) => void };

function SeatFormModal(props: SeatFormProps) {
  const { mode, onClose } = props;
  const isEdit = mode === "edit";

  const [venueId, setVenueId] = useState(isEdit ? props.seat.venueId : "");
  const [section, setSection] = useState(isEdit ? props.seat.section : "");
  const [rowNumber, setRowNumber] = useState(isEdit ? props.seat.rowNumber : "");
  const [seatNumber, setSeatNumber] = useState(isEdit ? props.seat.seatNumber : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!venueId || !section.trim() || !rowNumber.trim() || !seatNumber.trim()) return;
    const data: Seat = {
      seatId: isEdit ? props.seat.seatId : generateSeatId(),
      section: section.trim(),
      seatNumber: seatNumber.trim(),
      rowNumber: rowNumber.trim(),
      venueId,
    };
    if (isEdit) props.onSubmitEdit(data);
    else props.onSubmit(data);
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Edit Kursi" : "Tambah Kursi Baru"}</h2>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Venue</label>
            <select className={inputClass + " appearance-none"} value={venueId} onChange={(e) => setVenueId(e.target.value)} required>
              <option value="" disabled>Pilih Venue</option>
              {venueSeed.venues.map((v) => (<option key={v.venueId} value={v.venueId}>{v.venueName}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Section</label>
            <input className={inputClass} placeholder="cth. WVIP" value={section} onChange={(e) => setSection(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Baris</label>
              <input className={inputClass} placeholder="cth. A" value={rowNumber} onChange={(e) => setRowNumber(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">No. Kursi</label>
              <input className={inputClass} placeholder="cth. 1" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} required />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 hover:bg-slate-50" onClick={onClose}>Batal</button>
          <button type="submit" className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white hover:bg-[#1d4ed8]">{isEdit ? "Simpan" : "Tambah"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

function DeleteSeatModal({ seat, onClose, onConfirm }: { seat: Seat; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-red-600">Hapus Kursi</h2>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
          Apakah Anda yakin ingin menghapus kursi <span className="font-bold text-slate-700">{seat.section} — Baris {seat.rowNumber}, No. {seat.seatNumber}</span>?
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 hover:bg-slate-50" onClick={onClose}>Batal</button>
          <button type="button" className="h-10 rounded-lg bg-red-600 px-5 text-sm font-extrabold text-white hover:bg-red-700" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}