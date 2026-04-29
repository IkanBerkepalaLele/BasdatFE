"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Music2,
  Pencil,
  Plus,
  Search,
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

type SortDir = "asc" | "desc";

type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; artist: Artist }
  | { kind: "delete"; artist: Artist };

export function ArtistListPage({ role }: { role: RoleName }) {
  const canManage = role === "admin";
  const [artists, setArtists] = useState<Artist[]>(() => [...artistSeed.artists]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const genres = useMemo(() => {
    const unique = Array.from(new Set(artists.map((a) => a.genre).filter(Boolean)));
    return unique.sort();
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const filtered = artists.filter((artist) => {
      const matchesSearch =
        searchQuery === "" ||
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === "all" || artist.genre === genreFilter;
      return matchesSearch && matchesGenre;
    });

    return filtered.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, "id");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [artists, searchQuery, genreFilter, sortDir]);

  const totalArtist = artists.length;
  const genreCount = new Set(artists.map((a) => a.genre).filter(Boolean)).size;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Artist</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Kelola data artis yang tampil pada event TikTakTuk
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

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="TOTAL ARTIST" value={String(totalArtist)} />
        <StatCard label="TOTAL GENRE" value={String(genreCount)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
            size={17}
          />
          <input
            id="input-search-artist"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Cari nama atau genre..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            id="select-genre-filter"
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-600 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="all">Semua Genre</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  No
                </th>
                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Artist ID
                </th>
                <th className="px-6 py-4">
                  <button
                    className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-slate-400 transition hover:text-slate-600"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  >
                    Name
                    {sortDir === "asc" ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Genre
                </th>
                {canManage && (
                  <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredArtists.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="px-6 py-12 text-center text-sm font-bold text-slate-400"
                  >
                    Tidak ada artist yang ditemukan.
                  </td>
                </tr>
              )}
              {filteredArtists.map((artist, index) => (
                <tr
                  key={artist.artistId}
                  className="transition hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-semibold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      {artist.artistId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <Music2 size={16} />
                      </div>
                      <span className="font-extrabold text-slate-900">
                        {artist.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {artist.genre ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-600">
                        {artist.genre}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-300">—</span>
                    )}
                  </td>
                  {canManage && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-extrabold tracking-wider text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
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

    const data = {
      name: trimmedName,
      genre: trimmedGenre,
    };

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
