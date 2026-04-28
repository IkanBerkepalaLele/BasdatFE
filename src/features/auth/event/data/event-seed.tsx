export type Event = {
  eventId: string;
  eventDateTime: string; // ISO string biar gampang dipakai
  eventTitle: string;
  venueId: string;
  organizerId: string;
};

export type EventSeed = {
  events: Event[];
};

export const eventSeed: EventSeed = {
  events: [
    {
      eventId: "evt-001",
      eventDateTime: "2025-05-10T19:00:00",
      eventTitle: "Jakarta Music Festival",
      venueId: "ven-001",
      organizerId: "org-001",
    },
    {
      eventId: "evt-002",
      eventDateTime: "2025-05-12T18:30:00",
      eventTitle: "Indie Night Live",
      venueId: "ven-002",
      organizerId: "org-002",
    },
    {
      eventId: "evt-003",
      eventDateTime: "2025-05-15T20:00:00",
      eventTitle: "Bandung Jazz Session",
      venueId: "ven-003",
      organizerId: "org-003",
    },
    {
      eventId: "evt-004",
      eventDateTime: "2025-05-18T17:00:00",
      eventTitle: "Malang Creative Expo",
      venueId: "ven-004",
      organizerId: "org-004",
    },
    {
      eventId: "evt-005",
      eventDateTime: "2025-05-20T19:30:00",
      eventTitle: "Jogja Art Performance",
      venueId: "ven-005",
      organizerId: "org-005",
    },
    {
      eventId: "evt-006",
      eventDateTime: "2025-05-22T18:00:00",
      eventTitle: "Surabaya Tech Conference",
      venueId: "ven-006",
      organizerId: "org-001",
    },
    {
      eventId: "evt-007",
      eventDateTime: "2025-05-25T19:00:00",
      eventTitle: "Bali Sunset Concert",
      venueId: "ven-007",
      organizerId: "org-002",
    },
    {
      eventId: "evt-008",
      eventDateTime: "2025-05-27T16:00:00",
      eventTitle: "Makassar Food Festival",
      venueId: "ven-008",
      organizerId: "org-003",
    },
    {
      eventId: "evt-009",
      eventDateTime: "2025-05-29T18:30:00",
      eventTitle: "Medan Business Summit",
      venueId: "ven-009",
      organizerId: "org-004",
    },
    {
      eventId: "evt-010",
      eventDateTime: "2025-05-31T19:00:00",
      eventTitle: "Semarang Cultural Night",
      venueId: "ven-010",
      organizerId: "org-005",
    },
  ],
};

export const eventDummySummary = {
  event: eventSeed.events.length,
};