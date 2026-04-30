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
import { eventSeed, type Event } from "@/features/event/data/event-seed";
import { venueSeed, type Venue } from "@/features/venue/data/venue-seed";

type StatTone = "blue" | "green" | "purple" | "orange";

const zeroCurrency = "Rp 0";

type DashboardActions = {
  onEvent: () => void;
  onPromotion: () => void;
  onTicket: () => void;
  onVenue: () => void;
};

function formatNumber(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getOrganizerEvents(data: AuthSeed, user: SessionUser): Event[] {
  const organizer = data.organizers.find((item) => item.userId === user.userId);
  return organizer ? eventSeed.events.filter((event) => event.organizerId === organizer.organizerId) : [];
}

function getEventVenueCount(events: Event[]) {
  return new Set(events.map((event) => event.venueId)).size;
}

export function DashboardPage({
  data,
  onEvent,
  onPromotion,
  onTicket,
  onVenue,
  user,
}: { data: AuthSeed; user: SessionUser } & DashboardActions) {
  if (user.role === "admin") {
    return <AdminDashboard data={data} onPromotion={onPromotion} onVenue={onVenue} />;
  }

  if (user.role === "organizer") {
    return <OrganizerDashboard data={data} onEvent={onEvent} onVenue={onVenue} user={user} />;
  }

  return <CustomerDashboard data={data} onEvent={onEvent} onTicket={onTicket} user={user} />;
}

function AdminDashboard({
  data,
  onPromotion,
  onVenue,
}: {
  data: AuthSeed;
  onPromotion: () => void;
  onVenue: () => void;
}) {
  const reservedVenues = venueSeed.venues.filter((venue) => venue.seatingType === "reserved");
  const largestVenue = venueSeed.venues.reduce<Venue | null>(
    (largest, venue) => (!largest || venue.capacity > largest.capacity ? venue : largest),
    null,
  );

  return (
    <section className="space-y-6">
      <HeroBanner
        action="Promosi"
        eyebrow={roleLabels.admin}
        onAction={onPromotion}
        subtitle="Pantau dan kelola platform TikTakTuk"
        title="System Console"
        tone="slate"
      />
      <StatGrid
        stats={[
          {
            icon: Users,
            label: "TOTAL PENGGUNA",
            note: "Pengguna aktif",
            tone: "blue",
            value: String(data.users.length),
          },
          { icon: CalendarDays, label: "TOTAL ACARA", note: "Bulan ini", tone: "green", value: String(eventSeed.events.length) },
          { icon: TrendingUp, label: "OMZET PLATFORM", note: "Gross volume", tone: "purple", value: zeroCurrency },
          { icon: BadgePercent, label: "PROMOSI AKTIF", note: "Running campaigns", tone: "orange", value: "0" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <InsightCard
          action="Kelola Venue"
          onAction={onVenue}
          rows={[
            ["Total Venue Terdaftar", `${venueSeed.venues.length} Lokasi`],
            ["Reserved Seating", `${reservedVenues.length} Venue`],
            ["Kapasitas Terbesar", largestVenue ? `${formatNumber(largestVenue.capacity)} Kursi` : "0 Kursi"],
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
function OrganizerDashboard({
  data,
  onEvent,
  onVenue,
  user,
}: {
  data: AuthSeed;
  onEvent: () => void;
  onVenue: () => void;
  user: SessionUser;
}) {
  const events = getOrganizerEvents(data, user);
  const venueCount = getEventVenueCount(events);

  return (
    <section className="space-y-6">
      <HeroBanner
        action="Kelola Acara"
        actionSecondary="Venue"
        eyebrow="Dashboard Penyelenggara"
        onAction={onEvent}
        onActionSecondary={onVenue}
        subtitle={`Kelola ${events.length} acara aktif Anda`}
        title={getProfileName(data, user)}
        tone="dark"
      />
      <StatGrid
        stats={[
          { icon: CalendarDays, label: "ACARA AKTIF", note: "Dalam koordinasi", tone: "blue", value: String(events.length) },
          { icon: Ticket, label: "TIKET TERJUAL", note: "Total terjual", tone: "green", value: "0" },
          { icon: TrendingUp, label: "REVENUE", note: "Bulan ini", tone: "purple", value: zeroCurrency },
          { icon: MapPin, label: "VENUE MITRA", note: "Lokasi aktif", tone: "orange", value: String(venueCount) },
        ]}
      />
      <ListPanel
        subtitle="Status acara yang Anda kelola"
        title="Performa Acara"
      />
    </section>
  );
}

function CustomerDashboard({
  data,
  onEvent,
  onTicket,
  user,
}: {
  data: AuthSeed;
  onEvent: () => void;
  onTicket: () => void;
  user: SessionUser;
}) {
  return (
    <section className="space-y-6">
      <HeroBanner
        action="Cari Tiket"
        eyebrow="Selamat datang kembali"
        onAction={onEvent}
        subtitle={`${eventSeed.events.length} acara menarik menunggu Anda`}
        title={getProfileName(data, user)}
        tone="blue"
      />
      <StatGrid
        stats={[
          { icon: Ticket, label: "TIKET AKTIF", note: "Siap digunakan", tone: "blue", value: "0" },
          { icon: CalendarDays, label: "ACARA DIIKUTI", note: "Total pengalaman", tone: "green", value: "0" },
          { icon: TrendingUp, label: "KODE PROMO", note: "Tersedia untuk Anda", tone: "purple", value: "0" },
          { icon: Music2, label: "TOTAL BELANJA", note: "Bulan ini", tone: "orange", value: zeroCurrency },
        ]}
      />
      <ListPanel
        onAction={onTicket}
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
  onAction,
  onActionSecondary,
  subtitle,
  title,
  tone,
}: {
  action: string;
  actionSecondary?: string;
  eyebrow: string;
  onAction?: () => void;
  onActionSecondary?: () => void;
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
        <button
          className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-[.98]"
          onClick={onAction}
          type="button"
        >
          {action}
        </button>
        {actionSecondary && (
          <button
            className="rounded-full bg-white/20 px-5 py-2 text-sm font-extrabold text-white transition hover:bg-white/30 active:scale-[.98]"
            onClick={onActionSecondary}
            type="button"
          >
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

function InsightCard({
  action,
  onAction,
  rows,
  title,
}: {
  action: string;
  onAction?: () => void;
  rows: [string, string][];
  title: string;
}) {
  const disabled = !onAction;

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
        className={`mt-5 h-10 w-full rounded-full border border-slate-200 text-sm font-extrabold shadow-sm transition ${
          disabled
            ? "cursor-not-allowed text-slate-300"
            : "text-slate-700 hover:bg-slate-50 active:scale-[.98]"
        }`}
        disabled={disabled}
        onClick={onAction}
        title={disabled ? "Fitur belum diimplementasi" : action}
        type="button"
      >
        {action}
      </button>
    </article>
  );
}

function ListPanel({ onAction, subtitle, title }: { onAction?: () => void; subtitle: string; title: string }) {
  const disabled = !onAction;

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
        </div>
        <button
          className={`text-sm font-extrabold transition ${
            disabled ? "cursor-not-allowed text-slate-300" : "text-blue-600 hover:text-blue-700"
          }`}
          disabled={disabled}
          onClick={onAction}
          type="button"
        >
          Lihat Semua
        </button>
      </div>
      <div className="mt-8 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-bold text-slate-400">
        Data belum tersedia.
      </div>
    </article>
  );
}
