import { eventSeed } from "@/features/event/data/event-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import { authSeed } from "@/features/auth/data/auth-seed";

export type TicketCategory = {
  categoryId: string;
  categoryName: string;
  quota: number;
  price: number;
  eventId: string;
};

export type Order = {
  orderId: string;
  customerId: string;
  eventId: string;
};

export type Ticket = {
  ticketId: string;
  ticketCode: string;
  tcategoryId: string;
  torderId: string;
};


export const ticketCategorySeed: TicketCategory[] = [
  { categoryId: "tcat-001", categoryName: "VVIP", quota: 50, price: 500000, eventId: "evt-001" },
  { categoryId: "tcat-002", categoryName: "VIP", quota: 100, price: 350000, eventId: "evt-001" },
  { categoryId: "tcat-003", categoryName: "Category 1", quota: 200, price: 250000, eventId: "evt-001" },
  { categoryId: "tcat-004", categoryName: "Category 2", quota: 300, price: 150000, eventId: "evt-001" },
  { categoryId: "tcat-005", categoryName: "General Admission", quota: 500, price: 150000, eventId: "evt-002" },
  { categoryId: "tcat-006", categoryName: "VVIP", quota: 30, price: 700000, eventId: "evt-003" },
  { categoryId: "tcat-007", categoryName: "VIP", quota: 80, price: 500000, eventId: "evt-003" },
  { categoryId: "tcat-008", categoryName: "Regular", quota: 200, price: 350000, eventId: "evt-003" },
  { categoryId: "tcat-009", categoryName: "VIP", quota: 60, price: 240000, eventId: "evt-004" },
  { categoryId: "tcat-010", categoryName: "Regular", quota: 150, price: 120000, eventId: "evt-004" },
  { categoryId: "tcat-011", categoryName: "VVIP", quota: 100, price: 400000, eventId: "evt-005" },
  { categoryId: "tcat-012", categoryName: "VIP", quota: 200, price: 300000, eventId: "evt-005" },
  { categoryId: "tcat-013", categoryName: "Platinum", quota: 50, price: 1000000, eventId: "evt-007" },
  { categoryId: "tcat-014", categoryName: "Gold", quota: 100, price: 750000, eventId: "evt-007" },
  { categoryId: "tcat-015", categoryName: "Silver", quota: 200, price: 500000, eventId: "evt-007" },
];

export const orderSeed: Order[] = [
  { orderId: "ord-001", customerId: "cus-001", eventId: "evt-001" },
  { orderId: "ord-002", customerId: "cus-002", eventId: "evt-001" },
  { orderId: "ord-003", customerId: "cus-001", eventId: "evt-003" },
  { orderId: "ord-004", customerId: "cus-003", eventId: "evt-002" },
  { orderId: "ord-005", customerId: "cus-004", eventId: "evt-005" },
  { orderId: "ord-006", customerId: "cus-005", eventId: "evt-007" },
  { orderId: "ord-007", customerId: "cus-002", eventId: "evt-004" },
];

export const ticketSeed: Ticket[] = [
  { ticketId: "tkt-001", ticketCode: "TKT-EVT001-VVIP-0001", tcategoryId: "tcat-001", torderId: "ord-001" },
  { ticketId: "tkt-002", ticketCode: "TKT-EVT001-VVIP-0002", tcategoryId: "tcat-001", torderId: "ord-002" },
  { ticketId: "tkt-003", ticketCode: "TKT-EVT001-VIP-0001", tcategoryId: "tcat-002", torderId: "ord-001" },
  { ticketId: "tkt-004", ticketCode: "TKT-EVT001-CAT1-0001", tcategoryId: "tcat-003", torderId: "ord-002" },
  { ticketId: "tkt-005", ticketCode: "TKT-EVT002-GA-0001", tcategoryId: "tcat-005", torderId: "ord-004" },
  { ticketId: "tkt-006", ticketCode: "TKT-EVT003-VVIP-0001", tcategoryId: "tcat-006", torderId: "ord-003" },
  { ticketId: "tkt-007", ticketCode: "TKT-EVT003-VIP-0001", tcategoryId: "tcat-007", torderId: "ord-003" },
  { ticketId: "tkt-008", ticketCode: "TKT-EVT005-VVIP-0001", tcategoryId: "tcat-011", torderId: "ord-005" },
  { ticketId: "tkt-009", ticketCode: "TKT-EVT007-PLAT-0001", tcategoryId: "tcat-013", torderId: "ord-006" },
  { ticketId: "tkt-010", ticketCode: "TKT-EVT007-GOLD-0001", tcategoryId: "tcat-014", torderId: "ord-006" },
];

export function resolveCategory(tcategoryId: string): TicketCategory | undefined {
  return ticketCategorySeed.find((c) => c.categoryId === tcategoryId);
}

export function resolveOrder(torderId: string): Order | undefined {
  return orderSeed.find((o) => o.orderId === torderId);
}

export function resolveEventTitle(eventId: string): string {
  const evt = eventSeed.events.find((e) => e.eventId === eventId);
  return evt ? evt.eventTitle : eventId;
}

export function resolveVenueName(eventId: string): string {
  const evt = eventSeed.events.find((e) => e.eventId === eventId);
  if (!evt) return "-";
  const venue = venueSeed.venues.find((v) => v.venueId === evt.venueId);
  return venue ? venue.venueName : "-";
}

export function resolveVenueSeatingType(eventId: string): "reserved" | "free" | null {
  const evt = eventSeed.events.find((e) => e.eventId === eventId);
  if (!evt) return null;
  const venue = venueSeed.venues.find((v) => v.venueId === evt.venueId);
  return venue ? venue.seatingType : null;
}

export function resolveCustomerName(customerId: string): string {
  const cust = authSeed.customers.find((c) => c.customerId === customerId);
  return cust ? cust.fullName : customerId;
}

export function resolveEventIdFromOrder(torderId: string): string | null {
  const order = resolveOrder(torderId);
  return order ? order.eventId : null;
}

export function countUsedQuota(tcategoryId: string, tickets: Ticket[]): number {
  return tickets.filter((t) => t.tcategoryId === tcategoryId).length;
}

let nextTicketCounter = ticketSeed.length + 1;
export function generateTicketCode(): string {
  const code = `TKT-AUTO-${String(nextTicketCounter).padStart(4, "0")}`;
  nextTicketCounter++;
  return code;
}

export function generateTicketId(): string {
  const id = `tkt-${String(nextTicketCounter).padStart(3, "0")}`;
  return id;
}

export function resolveVenueIdFromEvent(eventId: string): string | null {
  const event = eventSeed.events.find((e: any) => e.eventId === eventId);
  return event?.venueId ?? null;
}

export const ticketDummySummary = {
  ticket: ticketSeed.length,
  ticketCategory: ticketCategorySeed.length,
  order: orderSeed.length,
};