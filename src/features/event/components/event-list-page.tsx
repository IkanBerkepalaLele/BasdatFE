"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Guitar,
  Heart,
  MapPin,
  Mic,
  Music,
  Palette,
  Pencil,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { Event } from "../data/event-seed";
import { eventSeed } from "../data/event-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import type { RoleName } from "@/features/auth/types";

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} · ${hh}:${mi}`;
}

function resolveVenue(venueId: string) {
  return venueSeed.venues.find((v) => v.venueId === venueId);
}

let nextEventCounter = eventSeed.events.length + 1;
function generateEventId(): string {
  const id = `evt-${String(nextEventCounter).padStart(3, "0")}`;
  nextEventCounter++;
  return id;
}

type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; event: Event };

const iconMap = {
  music: Music,
  palette: Palette,
  guitar: Guitar,
  mic: Mic,
  sparkles: Sparkles,
} as const;

export function EventListPage({ role, organizerId, onCheckout }: { role: RoleName; organizerId?: string; onCheckout?: (eventId: string) => void }) {
  const [events, setEvents] = useState<Event[]>(() => {
    if (role === "organizer" && organizerId) {
      return eventSeed.events.filter((e) => e.organizerId === organizerId);
    }
    return [...eventSeed.events];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [artistFilter, setArtistFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  function handleAdd(data: Omit<Event, "eventId">) {
    const newEvent: Event = { ...data, eventId: generateEventId() };
    setEvents((current) => [...current, newEvent]);
    setModal({ kind: "closed" });
  }

  function handleEdit(updated: Event) {
    setEvents((current) =>
      current.map((e) => (e.eventId === updated.eventId ? updated : e)),
    );
    setModal({ kind: "closed" });
  }

  const venues = useMemo(() => {
    const ids = Array.from(new Set(events.map((e) => e.venueId)));
    return ids
      .map((id) => resolveVenue(id))
      .filter(Boolean)
      .sort((a, b) => a!.venueName.localeCompare(b!.venueName));
  }, [events]);

  const allArtists = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.artists.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        searchQuery === "" ||
        evt.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.artists.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVenue = venueFilter === "all" || evt.venueId === venueFilter;
      const matchesArtist =
        artistFilter === "all" || evt.artists.some((a) => a === artistFilter);
      return matchesSearch && matchesVenue && matchesArtist;
    });
  }, [events, searchQuery, venueFilter, artistFilter]);

  function toggleFavorite(eventId: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Jelajahi Acara</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Temukan acara terbaik dan beli tiket favorit Anda
          </p>
        </div>
        {(role === "organizer" || role === "admin") && (
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
            onClick={() => setModal({ kind: "add" })}
          >
            <Plus size={16} strokeWidth={3} />
            Buat Acara
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
            size={17}
          />
          <input
            id="input-search-event"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Cari acara atau artis..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            id="select-venue-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
          >
            <option value="all">Semua Venue</option>
            {venues.map((v) => (
              <option key={v!.venueId} value={v!.venueId}>
                {v!.venueName}
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
            id="select-artist-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
          >
            <option value="all">Semua Artis</option>
            {allArtists.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm font-bold text-slate-400">
          Tidak ada acara yang ditemukan.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.eventId}
              event={evt}
              isFavorite={favorites.has(evt.eventId)}
              onToggleFavorite={() => toggleFavorite(evt.eventId)}
              role={role}
              onEdit={() => setModal({ kind: "edit", event: evt })}
              onCheckout={() => onCheckout?.(evt.eventId)}
            />
          ))}
        </div>
      )}

      {modal.kind === "add" && (
        <EventFormModal
          mode="add"
          organizerId={organizerId}
          onClose={() => setModal({ kind: "closed" })}
          onSubmit={handleAdd}
        />
      )}
      {modal.kind === "edit" && (
        <EventFormModal
          mode="edit"
          event={modal.event}
          organizerId={organizerId}
          onClose={() => setModal({ kind: "closed" })}
          onSubmitEdit={handleEdit}
        />
      )}
    </section>
  );
}

function EventCard({
  event,
  isFavorite,
  onToggleFavorite,
  role,
  onEdit,
  onCheckout,
}: {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  role: RoleName;
  onEdit: () => void;
  onCheckout?: () => void;
}) {
  const venue = resolveVenue(event.venueId);
  const Icon = iconMap[event.iconKind];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.07)] transition hover:shadow-[0_6px_24px_rgba(15,23,42,0.13)]">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#6366f1]">
        <Icon
          size={64}
          className="text-white/30 transition-transform duration-300 group-hover:scale-110"
          strokeWidth={1.5}
        />
        <button
          id={`btn-fav-${event.eventId}`}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition ${
            isFavorite
              ? "bg-white text-red-500"
              : "bg-white/20 text-white hover:bg-white/40"
          }`}
          onClick={onToggleFavorite}
          aria-label="Tandai favorit"
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-base font-extrabold text-slate-900">{event.eventTitle}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.artists.map((artist) => (
            <span
              key={artist}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500"
            >
              {artist}
            </span>
          ))}
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CalendarDays size={13} className="shrink-0" />
            {formatDateTime(event.eventDateTime)}
          </p>
          {venue && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <MapPin size={13} className="shrink-0" />
              {venue.venueName}, {venue.city}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <CircleDollarSign size={13} className="shrink-0" />
            Mulai {formatCurrency(event.basePrice)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.ticketCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          {role === "organizer" || role === "admin"  ? (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.98]"
              onClick={onEdit}
            >
              <Pencil size={15} /> Edit Acara
            </button>
          ) : (
            <button
              id={`btn-beli-${event.eventId}`}
              className="w-full rounded-xl bg-[#2563eb] py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[.98]"
              onClick={(e) => {
                e.stopPropagation();
                onCheckout?.();
              }}
            >
              Beli Tiket
            </button>
          )}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl animate-[modalIn_0.2s_ease-out] rounded-2xl bg-white shadow-2xl"
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

function EventFormModal({
  mode,
  event,
  onClose,
  onSubmit,
  onSubmitEdit,
  organizerId,
}: {
  mode: "add" | "edit";
  event?: Event;
  onClose: () => void;
  onSubmit?: (data: Omit<Event, "eventId">) => void;
  onSubmitEdit?: (updated: Event) => void;
  organizerId?: string;
}) {
  const isEdit = mode === "edit";

  const initialDate = isEdit ? event!.eventDateTime.split("T")[0] : "";
  const initialTime = isEdit ? event!.eventDateTime.split("T")[1].substring(0, 5) : "";
  const initialCategories = isEdit && event!.ticketCategories.length > 0
    ? event!.ticketCategories.map((c) => ({ id: Math.random().toString(), name: c, price: event!.basePrice, quota: 100 }))
    : [{ id: Math.random().toString(), name: "", price: 0, quota: 0 }];

  const [title, setTitle] = useState(isEdit ? event!.eventTitle : "");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [venueId, setVenueId] = useState(isEdit ? event!.venueId : "");
  const [artists, setArtists] = useState<string[]>(isEdit ? [...event!.artists] : []);
  const [artistInput, setArtistInput] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [description, setDescription] = useState("");

  function addArtist(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = artistInput.trim();
      if (val && !artists.includes(val)) {
        setArtists([...artists, val]);
      }
      setArtistInput("");
    }
  }

  function removeArtist(artist: string) {
    setArtists(artists.filter((a) => a !== artist));
  }

  function addCategory() {
    setCategories([...categories, { id: Math.random().toString(), name: "", price: 0, quota: 0 }]);
  }

  function updateCategory(id: string, field: string, value: string | number) {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function removeCategory(id: string) {
    if (categories.length > 1) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date || !time || !venueId || categories.length === 0) return;

    const basePrice = Math.min(...categories.map((c) => Number(c.price)));
    const ticketCategories = categories.map((c) => c.name).filter(Boolean);

    const eventData: Omit<Event, "eventId"> = {
      eventTitle: title,
      eventDateTime: `${date}T${time}:00`,
      venueId,
      organizerId: isEdit ? event!.organizerId : (organizerId || ""),
      artists,
      basePrice,
      ticketCategories,
      iconKind: isEdit ? event!.iconKind : "music",
    };

    if (isEdit && onSubmitEdit) {
      onSubmitEdit({ ...eventData, eventId: event!.eventId });
    } else if (onSubmit) {
      onSubmit(eventData);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-900">
            {isEdit ? "Edit Acara" : "Buat Acara Baru"}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Judul Acara (Event_Title)
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="cth. Konser Melodi Senja"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Tanggal (Date)
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Waktu (Time)
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Venue (Venue_ID)
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Venue</option>
                  {venueSeed.venues.map((v) => (
                    <option key={v.venueId} value={v.venueId}>{v.venueName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Artis (Event_Artist)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {artists.map((artist) => (
                    <span
                      key={artist}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white"
                    >
                      {artist}
                      <button
                        type="button"
                        onClick={() => removeArtist(artist)}
                        className="text-white/70 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ketik nama artis lalu tekan Enter"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  onKeyDown={addArtist}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Kategori Tiket (Ticket_Category)
                </label>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 relative">
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                        onClick={() => removeCategory(cat.id)}
                      >
                        <X size={16} />
                      </button>
                      <input
                        type="text"
                        className="w-[calc(100%-24px)] mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                        placeholder="Nama Kategori (cth. VIP)"
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, "name", e.target.value)}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                          placeholder="Harga"
                          value={cat.price || ""}
                          onChange={(e) => updateCategory(cat.id, "price", e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                          placeholder="Kuota"
                          value={cat.quota || ""}
                          onChange={(e) => updateCategory(cat.id, "quota", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  onClick={addCategory}
                >
                  <Plus size={14} /> Tambah Kategori
                </button>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Deskripsi
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y"
                  placeholder="Deskripsi acara..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
          <button
            type="button"
            className="w-full md:w-auto h-11 rounded-full border border-slate-200 px-8 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full md:w-auto h-11 rounded-full bg-blue-600 px-8 text-sm font-extrabold text-white transition hover:bg-blue-700"
          >
            {isEdit ? "Simpan" : "Buat Acara"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
