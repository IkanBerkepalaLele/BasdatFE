"use client";

import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { roleLabels } from "../data/auth-seed";
import type { RoleName } from "../types";
import { BrandMark } from "@/shared/components/brand-mark";

const menuItems: Record<RoleName, string[]> = {
  admin: [
    "Dashboard",
    "Semua Event",
    "Manajemen Venue",
    "Manajemen Artist",
    "Manajemen Kursi",
    "Kategori Tiket",
    "Manajemen Tiket",
    "Semua Order",
    "Tiket (Aset)",
    "Order (Aset)",
    "Profile",
  ],
  organizer: [
    "Dashboard",
    "Event Saya",
    "Manajemen Venue",
    "Manajemen Kursi",
    "Kategori Tiket",
    "Manajemen Tiket",
    "Semua Order",
    "Tiket (Aset)",
    "Order (Aset)",
    "Profile",
  ],
  customer: ["Dashboard", "Tiket Saya", "Pesanan", "Cari Event", "Promosi", "Venue", "Artis", "Logout"],
};

export function AppNavbar({
  onArtist,
  onDashboard,
  onEvent,
  onFeatureBlocked,
  onLogout,
  onProfile,
  onVenue,
  role,
}: {
  onArtist: () => void;
  onDashboard: () => void;
  onEvent: () => void;
  onFeatureBlocked: (feature: string) => void;
  onLogout: () => void;
  onProfile: () => void;
  onVenue: () => void;
  role: RoleName;
}) {
  const [open, setOpen] = useState(false);
  const items = menuItems[role];

  function handleMenu(label: string) {
    if (label === "Dashboard") {
      onDashboard();
    } else if (label === "Manajemen Venue" || label === "Venue") {
      onVenue();
    } else if (label === "Manajemen Artist" || label === "Artis") {
      onArtist();
    } else if (label === "Event Saya" || label === "Cari Event" || label === "Semua Event") {
      onEvent();
    } else if (label === "Profile") {
      onProfile();
    } else if (label === "Logout") {
      onLogout();
    } else {
      onFeatureBlocked(label);
    }
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button aria-label="Dashboard" className="shrink-0" onClick={onDashboard}>
          <BrandMark compact />
        </button>
        <nav className="hidden min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto px-2 lg:flex">
          {items.map((item) => {
            const active = item === "Dashboard" || item === "Semua Event";
            const clickable = item === "Dashboard" || item === "Profile" || item === "Logout" || item === "Manajemen Venue" || item === "Venue" || item === "Event Saya" || item === "Cari Event" || item === "Semua Event" || item === "Manajemen Artist" || item === "Artis";

            return (
              <button
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : clickable
                      ? "text-slate-600 hover:bg-slate-100"
                      : "cursor-not-allowed text-slate-300"
                }`}
                disabled={!clickable}
                key={item}
                onClick={() => handleMenu(item)}
                title={clickable ? item : "Fitur ini akan diimplementasi rekan tim"}
              >
                {item}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 sm:inline-flex">
            {roleLabels[role]}
          </span>
          <button
            aria-label="Profil"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 shadow-sm hover:bg-slate-50"
            onClick={onProfile}
          >
            <UserRound size={19} />
          </button>
          <button
            aria-label="Logout"
            className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 shadow-sm hover:bg-slate-50 sm:block"
            onClick={onLogout}
          >
            <LogOut size={19} />
          </button>
          <button
            aria-label="Menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 shadow-sm lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {items.map((item) => {
              const clickable = item === "Dashboard" || item === "Profile" || item === "Logout" || item === "Manajemen Venue" || item === "Venue" || item === "Event Saya" || item === "Cari Event" || item === "Manajemen Artist" || item === "Artis";
              return (
                <button
                  className={`rounded-lg px-3 py-3 text-left text-sm font-extrabold ${
                    clickable ? "bg-slate-50 text-slate-700" : "cursor-not-allowed bg-slate-50 text-slate-300"
                  }`}
                  disabled={!clickable}
                  key={item}
                  onClick={() => handleMenu(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
