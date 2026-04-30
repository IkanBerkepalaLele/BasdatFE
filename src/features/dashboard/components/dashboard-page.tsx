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
import { orderSeedData } from "@/features/order/data/order-seed";
import type { Order } from "@/features/order/types";
import { promotionSeedData } from "@/features/promotion/data/promotion-seed";
import type { Promotion } from "@/features/promotion/types";
import {
  orderSeed as ticketOrderSeed,
  ticketCategorySeed as ticketCategories,
  ticketSeed,
} from "@/features/ticket/data/ticket-seed";
import { venueSeed, type Venue } from "@/features/venue/data/venue-seed";

type StatTone = "blue" | "green" | "purple" | "orange";

type DashboardActions = {
  onEvent: () => void;
  onPromotion: () => void;
  onTicket: () => void;
  onVenue: () => void;
};

function formatNumber(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrency(value: number) {
  return `Rp ${formatNumber(value)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getEventStatusBadge(event: Event) {
  const eventStart = new Date(event.eventDateTime);
  const eventEnd = new Date(eventStart.getTime() + 4 * 60 * 60 * 1000);
  const now = new Date();

  if (now >= eventStart && now <= eventEnd) {
    return { label: "LIVE", tone: "green" as const };
  }

  if (now < eventStart) {
    return { label: "AKAN DATANG", tone: "blue" as const };
  }

  return { label: "SELESAI", tone: "slate" as const };
}

function getOrganizerEvents(data: AuthSeed, user: SessionUser): Event[] {
  const organizer = data.organizers.find((item) => item.userId === user.userId);
  return organizer ? eventSeed.events.filter((event) => event.organizerId === organizer.organizerId) : [];
}

function getEventVenueCount(events: Event[]) {
  return new Set(events.map((event) => event.venueId)).size;
}

function getEvent(eventId: string) {
  return eventSeed.events.find((event) => event.eventId === eventId);
}

function getVenue(event: Event | undefined) {
  return event ? venueSeed.venues.find((venue) => venue.venueId === event.venueId) : undefined;
}

function getPaidOrders(orders: Order[]) {
  return orders.filter((order) => order.paymentStatus === "Paid");
}

function sumOrderAmount(orders: Order[]) {
  return orders.reduce((total, order) => total + order.totalAmount, 0);
}

function getOrdersByEventIds(eventIds: Set<string>) {
  return orderSeedData.filter((order) => eventIds.has(order.eventId));
}

function getTicketsByEventIds(eventIds: Set<string>) {
  return ticketSeed.filter((ticket) => {
    const order = ticketOrderSeed.find((item) => item.orderId === ticket.torderId);
    return order ? eventIds.has(order.eventId) : false;
  });
}

function getEventTicketQuota(eventId: string) {
  return ticketCategories
    .filter((category) => category.eventId === eventId)
    .reduce((total, category) => total + category.quota, 0);
}

function getSoldPercentage(sold: number, quota: number) {
  if (quota <= 0) return 0;
  return Math.round((sold / quota) * 100);
}

function getCustomerOrders(data: AuthSeed, user: SessionUser) {
  const customer = data.customers.find((item) => item.userId === user.userId);
  const orders = customer ? orderSeedData.filter((order) => order.customerId === customer.customerId) : [];

  return { customer, orders };
}

function getCustomerTickets(customerId: string | undefined) {
  if (!customerId) return [];

  const orderIds = new Set(
    ticketOrderSeed.filter((order) => order.customerId === customerId).map((order) => order.orderId),
  );

  return ticketSeed.filter((ticket) => orderIds.has(ticket.torderId));
}

function getTicketOrderStatus(orderId: string) {
  return orderSeedData.find((order) => order.orderId === orderId)?.paymentStatus ?? "Paid";
}

function isPromotionActive(promotion: Promotion) {
  const today = new Date();
  const startDate = new Date(`${promotion.startDate}T00:00:00`);
  const endDate = new Date(`${promotion.endDate}T23:59:59`);

  return today >= startDate && today <= endDate && promotion.usageCount < promotion.usageLimit;
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
  const activePromotions = promotionSeedData.filter(isPromotionActive);
  const platformRevenue = sumOrderAmount(getPaidOrders(orderSeedData));
  const activePercentagePromotions = activePromotions.filter((promotion) => promotion.discountType === "Percentage");
  const activeNominalPromotions = activePromotions.filter((promotion) => promotion.discountType === "Nominal");
  const totalPromotionUsage = promotionSeedData.reduce((total, promotion) => total + promotion.usageCount, 0);

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
          { icon: TrendingUp, label: "OMZET PLATFORM", note: "Gross volume", tone: "purple", value: formatCurrency(platformRevenue) },
          { icon: BadgePercent, label: "PROMOSI AKTIF", note: "Running campaigns", tone: "orange", value: String(activePromotions.length) },
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
          onAction={onPromotion}
          rows={[
            ["Promo Persentase", `${activePercentagePromotions.length} Aktif`],
            ["Promo Potongan Nominal", `${activeNominalPromotions.length} Aktif`],
            ["Total Penggunaan", `${formatNumber(totalPromotionUsage)} Kali`],
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
  const eventIds = new Set(events.map((event) => event.eventId));
  const organizerOrders = getOrdersByEventIds(eventIds);
  const organizerTickets = getTicketsByEventIds(eventIds);
  const organizerRevenue = sumOrderAmount(getPaidOrders(organizerOrders));

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
          { icon: Ticket, label: "TIKET TERJUAL", note: "Total terjual", tone: "green", value: String(organizerTickets.length) },
          { icon: TrendingUp, label: "REVENUE", note: "Bulan ini", tone: "purple", value: formatCurrency(organizerRevenue) },
          { icon: MapPin, label: "VENUE MITRA", note: "Lokasi aktif", tone: "orange", value: String(venueCount) },
        ]}
      />
      <ListPanel
        onAction={onEvent}
        rows={events.map((event) => {
          const venue = getVenue(event);
          const eventOrders = organizerOrders.filter((order) => order.eventId === event.eventId);
          const eventTickets = getTicketsByEventIds(new Set([event.eventId]));
          const eventRevenue = sumOrderAmount(getPaidOrders(eventOrders));
          const soldPercentage = getSoldPercentage(eventTickets.length, getEventTicketQuota(event.eventId));

          return {
            badge: getEventStatusBadge(event),
            detail: `${soldPercentage}% terjual | ${eventTickets.length} tiket terdata | ${venue?.venueName ?? "Venue belum tersedia"}`,
            id: event.eventId,
            label: event.eventTitle,
            value: formatCurrency(eventRevenue),
          };
        })}
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
  const { customer, orders } = getCustomerOrders(data, user);
  const activePromotions = promotionSeedData.filter(isPromotionActive);
  const paidOrders = getPaidOrders(orders);
  const totalSpend = sumOrderAmount(paidOrders);
  const customerTickets = getCustomerTickets(customer?.customerId);
  const activeTickets = customerTickets.filter((ticket) => getTicketOrderStatus(ticket.torderId) === "Paid");
  const joinedEventCount = new Set(orders.map((order) => order.eventId)).size;
  const ticketRows = (activeTickets.length > 0 ? activeTickets : customerTickets).slice(0, 5).map((ticket) => {
    const ticketOrder = ticketOrderSeed.find((order) => order.orderId === ticket.torderId);
    const event = getEvent(ticketOrder?.eventId ?? "");
    const venue = getVenue(event);
    const category = ticketCategories.find((item) => item.categoryId === ticket.tcategoryId);

    return {
      badge: { label: category?.categoryName ?? "TIKET", tone: "blue" as const },
      detail: `${category?.categoryName ?? "Kategori"} | ${venue?.venueName ?? "Venue belum tersedia"}`,
      id: ticket.ticketId,
      label: event?.eventTitle ?? ticket.ticketCode,
      value: formatDate(event?.eventDateTime ?? new Date().toISOString()),
    };
  });

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
          { icon: Ticket, label: "TIKET AKTIF", note: "Siap digunakan", tone: "blue", value: String(activeTickets.length) },
          { icon: CalendarDays, label: "ACARA DIIKUTI", note: "Total pengalaman", tone: "green", value: String(joinedEventCount) },
          { icon: TrendingUp, label: "KODE PROMO", note: "Tersedia untuk Anda", tone: "purple", value: String(activePromotions.length) },
          { icon: Music2, label: "TOTAL BELANJA", note: "Bulan ini", tone: "orange", value: formatCurrency(totalSpend) },
        ]}
      />
      <ListPanel
        onAction={onTicket}
        rows={ticketRows}
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

function ListPanel({
  onAction,
  rows = [],
  subtitle,
  title,
}: {
  onAction?: () => void;
  rows?: {
    badge?: { label: string; tone: "blue" | "green" | "slate" };
    detail: string;
    id?: string;
    label: string;
    value: string;
  }[];
  subtitle: string;
  title: string;
}) {
  const disabled = !onAction;
  const badgeClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-500",
  };

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
      {rows.length > 0 ? (
        <div className="mt-8 divide-y divide-slate-100 rounded-lg border border-slate-100">
          {rows.map((row, index) => (
            <div
              className="flex items-start justify-between gap-4 px-4 py-3"
              key={row.id ?? `${row.label}-${row.value}-${index}`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-slate-800">{row.label}</p>
                  {row.badge && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${badgeClass[row.badge.tone]}`}
                    >
                      {row.badge.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-400">{row.detail}</p>
              </div>
              <p className="shrink-0 text-xs font-extrabold text-slate-500">{row.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-bold text-slate-400">
          Data belum tersedia.
        </div>
      )}
    </article>
  );
}
