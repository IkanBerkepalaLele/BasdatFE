"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  List,
  Music2,
  Pencil,
  Plus,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import type { Artist } from "../data/artist-seed";
import { artistSeed } from "../data/artist-seed";
import type { RoleName } from "@/features/auth/types";

let nextArtistCounter = artistSeed.artists.length + 1;
function generateArtistId(): string {
  const id = `art-${String(nextArtistCounter).padStart(3, "0")}`;
  nextArtistCounter++;
  return id;
}

const avatarColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

const genreBadgeColors = [
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-pink-50 text-pink-600",
  "bg-cyan-50 text-cyan-600",
  "bg-indigo-50 text-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getGenreBadgeColor(genre: string): string {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  return genreBadgeColors[Math.abs(hash) % genreBadgeColors.length];
}

type ViewMode = "tabel" | "daftar";

type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; artist: Artist }
  | { kind: "delete"; artist: Artist };

export function ArtistListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin";
  const [artists, setArtists] = useState<Artist[]>(() => [...artistSeed.artists]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [viewMode, setViewMode] = useState<ViewMode>("tabel");

  const filteredArtists = useMemo(() => {
    const filtered = artists.filter((artist) => {
      const matchesSearch =
        searchQuery === "" ||
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return filtered.sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [artists, searchQuery]);

  const totalArtist = artists.length;
  const genreCount = new Set(artists.map((a) => a.genre).filter(Boolean)).size;
  const tampilDiEvent = artists.length; // placeholder count

  function handleAdd(data: Omit<Artist, "artistId">) {
    const newArtist: Artist = { ...data, artistId: generateArtistId() };
    setArtists((current) => [...current, newArtist]);
    setModal({ kind: "closed" });
  }

  function handleEdit(updated: Artist) {
    setArtists((current) =>
      current.map((a) => (a.artistId === updated.artistId ? updated : a)),
    );
    setModal({ kind: "closed" });
  }

  function handleDelete(artistId: string) {
    setArtists((current) => current.filter((a) => a.artistId !== artistId));
    setModal({ kind: "closed" });
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {canManage ? "Manajemen Artist" : "Daftar Artis"}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Kelola artis yang ada di platform TikTakTuk
          </p>
        </div>
        {canManage && (
          <button
            id="btn-tambah-artist"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
            onClick={() => setModal({ kind: "add" })}
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Artist
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL ARTIS" value={String(totalArtist)} />
        <StatCard label="GENRE" value={String(genreCount)} />
        <StatCard label="TAMPIL DI EVENT" value={String(tampilDiEvent)} />
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">Tabel Artis</h2>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            <button
              id="btn-view-tabel"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold transition ${
                viewMode === "tabel"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
              onClick={() => setViewMode("tabel")}
            >
              <Table2 size={13} />
              Tabel
            </button>
            <button
              id="btn-view-daftar"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold transition ${
                viewMode === "daftar"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
              onClick={() => setViewMode("daftar")}
            >
              <List size={13} />
              Daftar
            </button>
          </div>
        </div>

        {/* Search + Count */}
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              id="input-search-artist"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari nama atau genre..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-sm font-semibold text-slate-400">
            {filteredArtists.length} artis ditemukan
          </p>
        </div>

        {/* Tabel View */}
        {viewMode === "tabel" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Artis
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Genre
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  )}
                  {!canManage && (
                    <th className="w-12 px-6 py-3 text-right text-xs font-extrabold uppercase tracking-wider text-slate-400" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredArtists.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-sm font-bold text-slate-400"
                    >
                      Tidak ada artist yang ditemukan.
                    </td>
                  </tr>
                )}
                {filteredArtists.map((artist) => (
                  <tr
                    key={artist.artistId}
                    className="transition hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(artist.name)}`}
                        >
                          {artist.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-900">
                          {artist.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {artist.genre ? (
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getGenreBadgeColor(artist.genre)}`}
                        >
                          {artist.genre}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300">—</span>
                      )}
                    </td>
                    {canManage ? (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-${artist.artistId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
                            onClick={() => setModal({ kind: "edit", artist })}
                          >
                            <Pencil size={13} />
                            Update
                          </button>
                          <button
                            id={`btn-hapus-${artist.artistId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-[.97]"
                            onClick={() => setModal({ kind: "delete", artist })}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-6 py-4 text-right text-slate-300">-</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Daftar (List) View */
          <div className="divide-y divide-slate-50 px-6 pb-4">
            {filteredArtists.length === 0 && (
              <div className="py-12 text-center text-sm font-bold text-slate-400">
                Tidak ada artist yang ditemukan.
              </div>
            )}
            {filteredArtists.map((artist) => (
              <div
                key={artist.artistId}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(artist.name)}`}
                  >
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">{artist.name}</p>
                    {artist.genre ? (
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getGenreBadgeColor(artist.genre)}`}
                      >
                        {artist.genre}
                      </span>
                    ) : (
                      <p className="mt-0.5 text-xs font-semibold text-slate-300">
                        Genre tidak tersedia
                      </p>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-edit-list-${artist.artistId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
                      onClick={() => setModal({ kind: "edit", artist })}
                    >
                      <Pencil size={13} />
                      Update
                    </button>
                    <button
                      id={`btn-hapus-list-${artist.artistId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-[.97]"
                      onClick={() => setModal({ kind: "delete", artist })}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals (admin only) */}
      {modal.kind === "add" && (
        <ArtistFormModal
          mode="add"
          onClose={() => setModal({ kind: "closed" })}
          onSubmit={(data) => handleAdd(data)}
        />
      )}
      {modal.kind === "edit" && (
        <ArtistFormModal
          mode="edit"
          artist={modal.artist}
          onClose={() => setModal({ kind: "closed" })}
          onSubmitEdit={(updated) => handleEdit(updated)}
        />
      )}
      {modal.kind === "delete" && (
        <DeleteArtistModal
          artist={modal.artist}
          onClose={() => setModal({ kind: "closed" })}
          onConfirm={() => handleDelete(modal.artist.artistId)}
        />
      )}
    </section>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-extrabold tracking-wider text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

/* ── Modal Backdrop ────────────────────────────────────────── */
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
        style={{ animation: "modalIn 0.2s ease-out" }}
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

/* ── Artist Form Modal (Create / Edit) ─────────────────────── */
type ArtistFormModalProps =
  | {
      mode: "add";
      artist?: undefined;
      onClose: () => void;
      onSubmit: (data: Omit<Artist, "artistId">) => void;
      onSubmitEdit?: undefined;
    }
  | {
      mode: "edit";
      artist: Artist;
      onClose: () => void;
      onSubmit?: undefined;
      onSubmitEdit: (updated: Artist) => void;
    };

function ArtistFormModal(props: ArtistFormModalProps) {
  const { mode, onClose } = props;
  const isEdit = mode === "edit";

  const [name, setName] = useState(isEdit ? props.artist.name : "");
  const [genre, setGenre] = useState(isEdit ? props.artist.genre : "");
  const [nameError, setNameError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedGenre = genre.trim();

    if (!trimmedName) {
      setNameError("Nama artis wajib diisi.");
      return;
    }
    setNameError("");

    const data = { name: trimmedName, genre: trimmedGenre };
    if (isEdit) {
      props.onSubmitEdit({ ...data, artistId: props.artist.artistId });
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
            {isEdit ? "Edit Artis" : "Tambah Artis Baru"}
          </h2>
          <button
            id="btn-close-artist-modal"
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
              htmlFor="input-artist-name"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Nama Artis <span className="text-red-500">*</span>
            </label>
            <input
              id="input-artist-name"
              className={`${inputClass} ${nameError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
              placeholder="cth. Fourtwnty"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
            />
            {nameError && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{nameError}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="input-artist-genre"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Genre
            </label>
            <input
              id="input-artist-genre"
              className={inputClass}
              placeholder="cth. Indie Folk"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            id="btn-batal-artist"
            type="button"
            className="h-10 rounded-full border border-slate-200 px-6 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            id="btn-submit-artist"
            type="submit"
            className="h-10 rounded-full bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1d4ed8] active:scale-[.97]"
          >
            {isEdit ? "Simpan Perubahan" : "Tambah Artis"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

/* ── Delete Artist Modal ───────────────────────────────────── */
function DeleteArtistModal({
  artist,
  onClose,
  onConfirm,
}: {
  artist: Artist;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-extrabold text-red-600">Hapus Artis</h2>
          <button
            id="btn-close-delete-artist-modal"
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
          Apakah Anda yakin ingin menghapus artis ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Artist ID</span>
            <span className="text-sm font-bold text-slate-600">{artist.artistId}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Name</span>
            <span className="text-sm font-bold text-slate-700">{artist.name}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="btn-batal-delete-artist"
            type="button"
            className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[.97]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete-artist"
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
