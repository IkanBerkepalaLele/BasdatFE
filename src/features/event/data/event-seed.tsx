export type Event = {
  eventId: string;
  eventDateTime: string;
  eventTitle: string;
  venueId: string;
  organizerId: string;
  artists: string[];
  basePrice: number;
  ticketCategories: string[];
  iconKind: "music" | "palette" | "guitar" | "mic" | "sparkles";
};

export type EventSeed = {
  events: Event[];
};

export const eventSeed: EventSeed = {
  events: [
    {
      eventId: "evt-001",
      eventDateTime: "2026-04-30T18:00:00",
      eventTitle: "Konser Melodi Senja",
      venueId: "ven-001",
      organizerId: "org-001",
      artists: ["Fourtwenty", "Hindia"],
      basePrice: 250000,
      ticketCategories: ["VVIP", "VIP", "Category 1", "Category 2"],
      iconKind: "music",
    },
    {
      eventId: "evt-002",
      eventDateTime: "2026-04-30T18:15:00",
      eventTitle: "Festival Seni Budaya",
      venueId: "ven-002",
      organizerId: "org-002",
      artists: ["Tulus"],
      basePrice: 150000,
      ticketCategories: ["General Admission"],
      iconKind: "palette",
    },
    {
      eventId: "evt-003",
      eventDateTime: "2026-04-30T18:30:00",
      eventTitle: "Malam Akustik Bandung",
      venueId: "ven-003",
      organizerId: "org-003",
      artists: ["Pamungkas", "Nadin Amizah"],
      basePrice: 350000,
      ticketCategories: ["VVIP", "VIP", "Regular"],
      iconKind: "guitar",
    },
    {
      eventId: "evt-004",
      eventDateTime: "2026-04-30T18:45:00",
      eventTitle: "Malang Creative Expo",
      venueId: "ven-004",
      organizerId: "org-004",
      artists: ["Kunto Aji", "Sal Priadi"],
      basePrice: 120000,
      ticketCategories: ["VIP", "Regular"],
      iconKind: "sparkles",
    },
    {
      eventId: "evt-005",
      eventDateTime: "2026-04-30T19:00:00",
      eventTitle: "Jogja Art Night",
      venueId: "ven-005",
      organizerId: "org-005",
      artists: ["Feast", "Reality Club"],
      basePrice: 200000,
      ticketCategories: ["VVIP", "VIP"],
      iconKind: "mic",
    },
    {
      eventId: "evt-006",
      eventDateTime: "2026-04-30T19:15:00",
      eventTitle: "Surabaya Sound Fest",
      venueId: "ven-006",
      organizerId: "org-001",
      artists: ["Bernadya", "Mahalini"],
      basePrice: 300000,
      ticketCategories: ["VVIP", "VIP", "Regular"],
      iconKind: "music",
    },
    {
      eventId: "evt-007",
      eventDateTime: "2026-04-30T19:30:00",
      eventTitle: "Bali Sunset Concert",
      venueId: "ven-007",
      organizerId: "org-002",
      artists: ["Sheila on 7", "Dewa 19"],
      basePrice: 500000,
      ticketCategories: ["Platinum", "Gold", "Silver"],
      iconKind: "guitar",
    },
    {
      eventId: "evt-008",
      eventDateTime: "2026-04-30T19:45:00",
      eventTitle: "Makassar Music Fiesta",
      venueId: "ven-008",
      organizerId: "org-003",
      artists: ["Judika", "Raisa"],
      basePrice: 180000,
      ticketCategories: ["VIP", "Regular"],
      iconKind: "mic",
    },
    {
      eventId: "evt-009",
      eventDateTime: "2026-04-30T20:00:00",
      eventTitle: "Medan Harmoni Festival",
      venueId: "ven-009",
      organizerId: "org-004",
      artists: ["Ardhito Pramono"],
      basePrice: 175000,
      ticketCategories: ["General Admission"],
      iconKind: "palette",
    },
    {
      eventId: "evt-010",
      eventDateTime: "2026-04-30T20:15:00",
      eventTitle: "Semarang Cultural Night",
      venueId: "ven-010",
      organizerId: "org-005",
      artists: ["Nidji", "Padi Reborn"],
      basePrice: 275000,
      ticketCategories: ["VVIP", "VIP"],
      iconKind: "sparkles",
    },
  ],
};

export const eventDummySummary = {
  event: eventSeed.events.length,
};
