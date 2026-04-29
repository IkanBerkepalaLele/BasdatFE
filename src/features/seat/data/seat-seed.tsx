import { venueSeed } from "@/features/venue/data/venue-seed";

export type Seat = {
  seatId: string;
  section: string;
  seatNumber: string;
  rowNumber: string;
  venueId: string;
};

export type HasRelationship = {
  seatId: string;
  ticketId: string;
};

export function resolveVenueName(venueId: string): string {
  const venue = venueSeed.venues.find((v) => v.venueId === venueId);
  return venue ? venue.venueName : venueId;
}

export const seatSeed: Seat[] = [
  { seatId: "seat-001", section: "WVIP", seatNumber: "1", rowNumber: "A", venueId: "ven-001" },
  { seatId: "seat-002", section: "WVIP", seatNumber: "2", rowNumber: "A", venueId: "ven-001" },
  { seatId: "seat-003", section: "WVIP", seatNumber: "3", rowNumber: "A", venueId: "ven-001" },
  { seatId: "seat-004", section: "VIP", seatNumber: "1", rowNumber: "B", venueId: "ven-001" },
  { seatId: "seat-005", section: "VIP", seatNumber: "2", rowNumber: "B", venueId: "ven-001" },
  { seatId: "seat-006", section: "VIP", seatNumber: "3", rowNumber: "B", venueId: "ven-001" },
  { seatId: "seat-007", section: "Category 1", seatNumber: "1", rowNumber: "C", venueId: "ven-001" },
  { seatId: "seat-008", section: "VVIP", seatNumber: "1", rowNumber: "A", venueId: "ven-003" },
  { seatId: "seat-009", section: "VVIP", seatNumber: "2", rowNumber: "A", venueId: "ven-003" },
  { seatId: "seat-010", section: "VIP", seatNumber: "1", rowNumber: "B", venueId: "ven-003" },
  { seatId: "seat-011", section: "VVIP", seatNumber: "1", rowNumber: "A", venueId: "ven-005" },
  { seatId: "seat-012", section: "VIP", seatNumber: "1", rowNumber: "B", venueId: "ven-005" },
  { seatId: "seat-013", section: "Platinum", seatNumber: "1", rowNumber: "A", venueId: "ven-007" },
  { seatId: "seat-014", section: "Gold", seatNumber: "1", rowNumber: "B", venueId: "ven-007" },
  { seatId: "seat-015", section: "Silver", seatNumber: "1", rowNumber: "C", venueId: "ven-007" },
];

// HAS_RELATIONSHIP — seat yang sudah di-assign ke tiket
export const hasRelationshipSeed: HasRelationship[] = [
  { seatId: "seat-001", ticketId: "tkt-001" },
  { seatId: "seat-004", ticketId: "tkt-003" },
  { seatId: "seat-005", ticketId: "tkt-008" },
];

export function isSeatOccupied(seatId: string, relationships: HasRelationship[]): boolean {
  return relationships.some((r) => r.seatId === seatId);
}

let nextSeatCounter = seatSeed.length + 1;
export function generateSeatId(): string {
  const id = `seat-${String(nextSeatCounter).padStart(3, "0")}`;
  nextSeatCounter++;
  return id;
}

export const seatDummySummary = {
  seat: seatSeed.length,
};