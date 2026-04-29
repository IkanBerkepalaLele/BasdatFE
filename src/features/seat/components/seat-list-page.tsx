"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Armchair, Plus, X, Building2 } from "lucide-react";
import type { Seat } from "../data/seat-seed";
import { seatSeed, resolveVenueName, generateSeatId } from "../data/seat-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import type { RoleName } from "@/features/auth/types";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

export function SeatListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin" || role === "organizer";
  const [seats, setSeats] = useState<Seat[]>(() => [...seatSeed]);
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(data: Seat) {
    setSeats((c) => [...c, data]);
    setShowAdd(false);
  }

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

      {/* Simple table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Section</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Baris</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">No. Kursi</th>
              <th className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Venue</th>
            </tr>
          </thead>
          <tbody>
            {seats.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-sm font-bold text-slate-400">Tidak ada kursi.</td></tr>
            )}
            {seats.map((seat) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <SeatFormModal mode="add" onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
    </section>
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