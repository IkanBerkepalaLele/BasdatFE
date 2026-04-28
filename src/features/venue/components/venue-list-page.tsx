"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Armchair,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";
import type { Venue, SeatingType } from "../data/venue-seed";
import { venueSeed } from "../data/venue-seed";
import type { RoleName } from "@/features/auth/types";


function formatNumber(n: number): string {
  return n.toLocaleString("id-ID");
}

function seatingLabel(type: SeatingType): string {
  return type === "reserved" ? "Reserved Seating" : "Free Seating";
}

let nextVenueCounter = venueSeed.venues.length + 1;
function generateVenueId(): string {
  const id = `ven-${String(nextVenueCounter).padStart(3, "0")}`;
  nextVenueCounter++;
  return id;
}

type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; venue: Venue }
  | { kind: "delete"; venue: Venue };

export function VenueListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin" || role === "organizer";
  const [venues, setVenues] = useState<Venue[]>(() => [...venueSeed.venues]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [seatingFilter, setSeatingFilter] = useState<"all" | SeatingType>("all");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  const cities = useMemo(() => {
    const unique = Array.from(new Set(venues.map((v) => v.city)));
    return unique.sort();
  }, [venues]);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch =
        searchQuery === "" ||
        venue.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === "all" || venue.city === cityFilter;
      const matchesSeating = seatingFilter === "all" || venue.seatingType === seatingFilter;
      return matchesSearch && matchesCity && matchesSeating;
    });
  }, [venues, searchQuery, cityFilter, seatingFilter]);

  const totalVenue = venues.length;
  const reservedCount = venues.filter((v) => v.seatingType === "reserved").length;
  const totalCapacity = venues.reduce((sum, v) => sum + v.capacity, 0);

  function handleAdd(data: Omit<Venue, "venueId">) {
    const newVenue: Venue = { ...data, venueId: generateVenueId() };
    setVenues((current) => [...current, newVenue]);
    setModal({ kind: "closed" });
  }

  function handleEdit(updated: Venue) {
    setVenues((current) =>
      current.map((v) => (v.venueId === updated.venueId ? updated : v)),
    );
    setModal({ kind: "closed" });
  }

  function handleDelete(venueId: string) {
    setVenues((current) => current.filter((v) => v.venueId !== venueId));
    setModal({ kind: "closed" });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Venue</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Kelola lokasi pertunjukan dan kapasitas tempat duduk
          </p>
        </div>
        {canManage && (
          <button
            id="btn-tambah-venue"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
            onClick={() => setModal({ kind: "add" })}
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Venue
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL VENUE" value={String(totalVenue)} />
        <StatCard label="RESERVED SEATING" value={String(reservedCount)} />
        <StatCard label="TOTAL KAPASITAS" value={formatNumber(totalCapacity)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
            size={17}
          />
          <input
            id="input-search-venue"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Cari nama atau alamat..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            id="select-city-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="all">Semua Kota</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>

        <div className="relative">
          <select
            id="select-seating-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={seatingFilter}
            onChange={(e) => setSeatingFilter(e.target.value as "all" | SeatingType)}
          >
            <option value="all">Semua Tipe Seating</option>
            <option value="reserved">Reserved Seating</option>
            <option value="free">Free Seating</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredVenues.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-400">
            Tidak ada venue yang ditemukan.
          </div>
        )}
        {filteredVenues.map((venue) => (
          <VenueCard
            key={venue.venueId}
            venue={venue}
            canManage={canManage}
            onEdit={() => setModal({ kind: "edit", venue })}
            onDelete={() => setModal({ kind: "delete", venue })}
          />
        ))}
      </div>

      {modal.kind === "add" && (
        <VenueFormModal
          mode="add"
          onClose={() => setModal({ kind: "closed" })}
          onSubmit={(data) => handleAdd(data)}
        />
      )}
      {modal.kind === "edit" && (
        <VenueFormModal
          mode="edit"
          venue={modal.venue}
          onClose={() => setModal({ kind: "closed" })}
          onSubmitEdit={(updated) => handleEdit(updated)}
        />
      )}
      {modal.kind === "delete" && (
        <DeleteVenueModal
          venue={modal.venue}
          onClose={() => setModal({ kind: "closed" })}
          onConfirm={() => handleDelete(modal.venue.venueId)}
        />
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

function VenueCard({
  venue,
  canManage,
  onEdit,
  onDelete,
}: {
  venue: Venue;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isReserved = venue.seatingType === "reserved";

  return (
    <article className="rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition hover:shadow-[0_4px_20px_rgba(15,23,42,0.10)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <Building2 size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900">{venue.venueName}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-400">
              <MapPin size={13} className="shrink-0" />
              {venue.address}
            </p>

            <div className="mt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                Kapasitas
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Armchair size={14} className="shrink-0 text-slate-400" />
                <span className="text-sm font-extrabold text-slate-700">
                  {formatNumber(venue.capacity)} Kursi
                </span>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  id={`btn-edit-${venue.venueId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
                  onClick={onEdit}
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  id={`btn-hapus-${venue.venueId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-[.97]"
                  onClick={onDelete}
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
              isReserved
                ? "bg-blue-50 text-blue-600"
                : "bg-emerald-50 text-emerald-500"
            }`}
          >
            {isReserved ? <CheckCircle2 size={13} /> : <Users size={13} />}
            {seatingLabel(venue.seatingType)}
          </span>
        </div>
      </div>
    </article>
  );
}


function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-[min(95vw,480px)] animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white shadow-2xl"
        style={{
          animation: "modalIn 0.2s ease-out",
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

type VenueFormModalProps =
  | {
      mode: "add";
      venue?: undefined;
      onClose: () => void;
      onSubmit: (data: Omit<Venue, "venueId">) => void;
      onSubmitEdit?: undefined;
    }
  | {
      mode: "edit";
      venue: Venue;
      onClose: () => void;
      onSubmit?: undefined;
      onSubmitEdit: (updated: Venue) => void;
    };

function VenueFormModal(props: VenueFormModalProps) {
  const { mode, onClose } = props;
  const isEdit = mode === "edit";

  const [venueName, setVenueName] = useState(isEdit ? props.venue.venueName : "");
  const [capacity, setCapacity] = useState(isEdit ? String(props.venue.capacity) : "");
  const [city, setCity] = useState(isEdit ? props.venue.city : "");
  const [address, setAddress] = useState(isEdit ? props.venue.address : "");
  const [hasReserved, setHasReserved] = useState(
    isEdit ? props.venue.seatingType === "reserved" : false,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = venueName.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const parsedCapacity = parseInt(capacity, 10);

    if (!trimmedName || !trimmedCity || !trimmedAddress || isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return;
    }

    const data = {
      venueName: trimmedName,
      capacity: parsedCapacity,
      city: trimmedCity,
      address: trimmedAddress,
      seatingType: (hasReserved ? "reserved" : "free") as SeatingType,
    };

    if (isEdit) {
      props.onSubmitEdit({ ...data, venueId: props.venue.venueId });
    } else {
      props.onSubmit(data);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">
            {isEdit ? "Edit Venue" : "Tambah Venue Baru"}
          </h2>
          <button
            id="btn-close-venue-modal"
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label
              htmlFor="input-venue-name"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Nama Venue (venue_name)
            </label>
            <input
              id="input-venue-name"
              className={inputClass}
              placeholder="cth. Jakarta Convention Center"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-venue-capacity"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >
                Kapasitas (capacity)
              </label>
              <input
                id="input-venue-capacity"
                className={inputClass}
                placeholder="1000"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="input-venue-city"
                className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >
                Kota (city)
              </label>
              <input
                id="input-venue-city"
                className={inputClass}
                placeholder="Jakarta"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="input-venue-address"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Alamat (address)
            </label>
            <textarea
              id="input-venue-address"
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="Jl. Gatot Subroto No.1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5" htmlFor="input-venue-reserved">
            <input
              id="input-venue-reserved"
              type="checkbox"
              checked={hasReserved}
              onChange={(e) => setHasReserved(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
            />
            <span className="text-sm font-bold text-slate-700">Has Reserved Seating</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            id="btn-batal-venue"
            type="button"
            className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            id="btn-submit-venue"
            type="submit"
            className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
          >
            {isEdit ? "Simpan" : "Tambah"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

function DeleteVenueModal({
  venue,
  onClose,
  onConfirm,
}: {
  venue: Venue;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-red-600">Hapus Venue</h2>
          <button
            id="btn-close-delete-modal"
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
          Apakah Anda yakin ingin menghapus venue <span className="font-bold text-slate-700">{venue.venueName}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="btn-batal-delete"
            type="button"
            className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            className="h-10 rounded-lg bg-red-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700 active:scale-[.97]"
            onClick={onConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
