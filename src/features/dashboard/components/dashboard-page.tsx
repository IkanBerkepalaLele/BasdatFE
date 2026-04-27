import {
  BadgePercent,
  CalendarDays,
  MapPin,
  Music2,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { roleLabels } from "@/features/auth/data/auth-seed";
import type { AuthSeed, SessionUser } from "@/features/auth/types";
import { getProfileName } from "@/features/auth/lib/auth-helpers";

type StatTone = "blue" | "green" | "purple" | "orange";

const zeroCurrency = "Rp 0";

export function DashboardPage({ data, user }: { data: AuthSeed; user: SessionUser }) {
  if (user.role === "admin") {
    return <AdminDashboard data={data} />;
  }

  if (user.role === "organizer") {
    return <OrganizerDashboard data={data} user={user} />;
  }

  return <CustomerDashboard data={data} user={user} />;
}

function AdminDashboard({ data }: { data: AuthSeed }) {
  return (
    <section className="space-y-6">
      <HeroBanner
        action="Promosi"
        eyebrow={roleLabels.admin}
        subtitle="Pantau dan kelola platform TikTakTuk"
        title="System Console"
        tone="slate"
      />
      <StatGrid
        stats={[
          {
            icon: Users,
            label: "TOTAL PENGGUNA",
            note: "Hard-coded + registrasi web",
            tone: "blue",
            value: String(data.users.length),
          },
          { icon: CalendarDays, label: "TOTAL ACARA", note: "Belum tersedia", tone: "green", value: "0" },
          { icon: TrendingUp, label: "OMZET PLATFORM", note: "Belum tersedia", tone: "purple", value: zeroCurrency },
          { icon: BadgePercent, label: "PROMOSI AKTIF", note: "Belum tersedia", tone: "orange", value: "0" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <InsightCard
          action="Kelola Venue"
          rows={[
            ["Total Venue Terdaftar", "0 Lokasi"],
            ["Reserved Seating", "0 Venue"],
            ["Kapasitas Terbesar", "0 Kursi"],
          ]}
          title="Infrastruktur Venue"
        />
        <InsightCard
          action="Kelola Promosi"
          rows={[
            ["Promo Persentase", "0 Aktif"],
            ["Promo Potongan Nominal", "0 Aktif"],
            ["Total Penggunaan", "0 Kali"],
          ]}
          title="Marketing & Promosi"
        />
      </div>
    </section>
  );
}

function OrganizerDashboard({ data, user }: { data: AuthSeed; user: SessionUser }) {
  return (
    <section className="space-y-6">
      <HeroBanner
        action="Kelola Acara"
        actionSecondary="Venue"
        eyebrow="Dashboard Penyelenggara"
        subtitle="Kelola 0 acara aktif Anda"
        title={getProfileName(data, user)}
        tone="dark"
      />
      <StatGrid
        stats={[
          { icon: CalendarDays, label: "ACARA AKTIF", note: "Belum tersedia", tone: "blue", value: "0" },
          { icon: Ticket, label: "TIKET TERJUAL", note: "Belum tersedia", tone: "green", value: "0" },
          { icon: TrendingUp, label: "REVENUE", note: "Belum tersedia", tone: "purple", value: zeroCurrency },
          { icon: MapPin, label: "VENUE MITRA", note: "Belum tersedia", tone: "orange", value: "0" },
        ]}
      />
      <ListPanel
        subtitle="Status acara yang Anda kelola"
        title="Performa Acara"
      />
    </section>
  );
}

function CustomerDashboard({ data, user }: { data: AuthSeed; user: SessionUser }) {
  return (
    <section className="space-y-6">
      <HeroBanner
        action="Cari Tiket"
        eyebrow="Selamat datang kembali"
        subtitle="0 acara menarik menunggu Anda"
        title={getProfileName(data, user)}
        tone="blue"
      />
      <StatGrid
        stats={[
          { icon: Ticket, label: "TIKET AKTIF", note: "Belum tersedia", tone: "blue", value: "0" },
          { icon: CalendarDays, label: "ACARA DIIKUTI", note: "Belum tersedia", tone: "green", value: "0" },
          { icon: TrendingUp, label: "KODE PROMO", note: "Belum tersedia", tone: "purple", value: "0" },
          { icon: Music2, label: "TOTAL BELANJA", note: "Belum tersedia", tone: "orange", value: zeroCurrency },
        ]}
      />
      <ListPanel
        subtitle="Tiket pertunjukan yang akan datang"
        title="Tiket Mendatang"
      />
    </section>
  );
}

function HeroBanner({
  action,
  actionSecondary,
  eyebrow,
  subtitle,
  title,
  tone,
}: {
  action: string;
  actionSecondary?: string;
  eyebrow: string;
  subtitle: string;
  title: string;
  tone: "blue" | "dark" | "slate";
}) {
  const color =
    tone === "blue" ? "bg-[#2878ff]" : tone === "dark" ? "bg-[#101827]" : "bg-[#28364b]";

  return (
    <section className={`flex items-center justify-between gap-4 rounded-xl ${color} px-7 py-8 text-white shadow-sm`}>
      <div>
        <p className="text-sm font-extrabold text-white/60">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-normal">{title}</h1>
        <p className="mt-3 text-base font-semibold text-white/60">{subtitle}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-slate-800 shadow-sm">
          {action}
        </button>
        {actionSecondary && (
          <button className="rounded-full bg-white/20 px-5 py-2 text-sm font-extrabold text-white">
            {actionSecondary}
          </button>
        )}
      </div>
    </section>
  );
}

function StatGrid({
  stats,
}: {
  stats: {
    icon: typeof Users;
    label: string;
    note: string;
    tone: StatTone;
    value: string;
  }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  note,
  tone,
  value,
}: {
  icon: typeof Users;
  label: string;
  note: string;
  tone: StatTone;
  value: string;
}) {
  const toneClass: Record<StatTone, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-500",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-500",
  };

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-slate-300">{label}</p>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-400">{note}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass[tone]}`}>
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function InsightCard({ action, rows, title }: { action: string; rows: [string, string][]; title: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      </div>
      <dl className="mt-10 space-y-4">
        {rows.map(([label, value]) => (
          <div className="flex items-center justify-between gap-4" key={label}>
            <dt className="text-sm font-bold text-slate-400">{label}</dt>
            <dd className="text-sm font-extrabold text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
      <button
        className="mt-5 h-10 w-full cursor-not-allowed rounded-full border border-slate-200 text-sm font-extrabold text-slate-300 shadow-sm"
        disabled
        title="Fitur ini akan diimplementasi rekan tim"
      >
        {action}
      </button>
    </article>
  );
}

function ListPanel({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
        </div>
        <button className="cursor-not-allowed text-sm font-extrabold text-slate-300" disabled>
          Lihat Semua
        </button>
      </div>
      <div className="mt-8 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-bold text-slate-400">
        Data belum tersedia karena fitur CRUD terkait akan diimplementasi rekan tim.
      </div>
    </article>
  );
}
