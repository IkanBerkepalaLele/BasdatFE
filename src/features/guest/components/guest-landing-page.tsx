"use client";

import type { ReactNode } from "react";
import { BrandMark } from "@/shared/components/brand-mark";

type GuestNavProps = {
  onLanding: () => void;
  onLogin: () => void;
  onPromotion: () => void;
  onRegister: () => void;
  onTicketCategory: () => void;
};

type GuestShellProps = GuestNavProps & {
  children: ReactNode;
};

const description =
  "TikTakTuk adalah sebuah perusahaan nasional yang bergerak di bidang hiburan. Sistem ini mengelola banyak pertunjukan pada lintas kota di Indonesia dan didesain untuk mendukung perencanaan pertunjukan, media koordinasi artis, penjualan tiket, dan promosi pertunjukan.";

export function GuestShell({
  children,
  onLanding,
  onLogin,
  onPromotion,
  onRegister,
  onTicketCategory,
}: GuestShellProps) {
  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <GuestNavbar
        onLanding={onLanding}
        onLogin={onLogin}
        onPromotion={onPromotion}
        onRegister={onRegister}
        onTicketCategory={onTicketCategory}
      />
      {children}
    </main>
  );
}

export function GuestLandingPage(props: GuestNavProps) {
  return (
    <GuestShell {...props}>
      <section className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <BrandMark />
        <article className="mt-10 rounded-xl border border-slate-200 bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.07)] sm:px-9">
          <h2 className="text-2xl font-extrabold tracking-normal text-slate-950">
            Tentang TikTakTuk
          </h2>
          <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
            {description}
          </p>
        </article>
      </section>
    </GuestShell>
  );
}

function GuestNavbar({
  onLanding,
  onLogin,
  onPromotion,
  onRegister,
  onTicketCategory,
}: GuestNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button className="flex items-center gap-3" onClick={onLanding}>
          <BrandMark compact />
          <span className="text-lg font-extrabold text-slate-950">TikTakTuk</span>
        </button>
        <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto text-sm font-extrabold text-slate-500 md:order-none md:w-auto">
          <button className="shrink-0 transition hover:text-blue-600" onClick={onTicketCategory}>
            Kategori Tiket
          </button>
          <button className="shrink-0 transition hover:text-blue-600" onClick={onPromotion}>
            Promosi
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            onClick={onLogin}
          >
            Login
          </button>
          <button
            className="h-10 rounded-lg bg-[#171717] px-4 text-sm font-extrabold text-white transition hover:bg-black"
            onClick={onRegister}
          >
            Register
          </button>
        </div>
      </div>
    </header>
  );
}
