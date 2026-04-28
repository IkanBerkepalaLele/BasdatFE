export type SeatingType = "reserved" | "free";

export type Venue = {
  venueId: string;
  venueName: string;
  capacity: number;
  address: string;
  city: string;
  seatingType: SeatingType;
};

export type VenueSeed = {
  venues: Venue[];
};

export const venueSeed: VenueSeed = {
  venues: [
    {
      venueId: "ven-001",
      venueName: "Jakarta Convention Center",
      capacity: 1000,
      address: "Jl. Gatot Subroto No.1, Jakarta",
      city: "Jakarta",
      seatingType: "reserved",
    },
    {
      venueId: "ven-002",
      venueName: "Taman Impian Jayakarta",
      capacity: 500,
      address: "Jl. Lodan Timur No.7, Jakarta Utara",
      city: "Jakarta",
      seatingType: "free",
    },
    {
      venueId: "ven-003",
      venueName: "Bandung Hall Center",
      capacity: 800,
      address: "Jl. Asia Afrika, Bandung",
      city: "Bandung",
      seatingType: "reserved",
    },
    {
      venueId: "ven-004",
      venueName: "Graha Cakrawala",
      capacity: 1500,
      address: "Jl. Veteran, Malang",
      city: "Malang",
      seatingType: "free",
    },
    {
      venueId: "ven-005",
      venueName: "Jogja Expo Center",
      capacity: 3000,
      address: "Jl. Raya Janti, Yogyakarta",
      city: "Yogyakarta",
      seatingType: "reserved",
    },
    {
      venueId: "ven-006",
      venueName: "Grand City Hall",
      capacity: 2500,
      address: "Jl. Walikota Mustajab, Surabaya",
      city: "Surabaya",
      seatingType: "free",
    },
    {
      venueId: "ven-007",
      venueName: "Bali Nusa Dua Hall",
      capacity: 4000,
      address: "Kawasan ITDC Nusa Dua, Bali",
      city: "Bali",
      seatingType: "reserved",
    },
    {
      venueId: "ven-008",
      venueName: "Makassar Convention Hall",
      capacity: 1800,
      address: "Jl. Metro Tanjung Bunga, Makassar",
      city: "Makassar",
      seatingType: "free",
    },
    {
      venueId: "ven-009",
      venueName: "Medan International Hall",
      capacity: 2200,
      address: "Jl. Gagak Hitam, Medan",
      city: "Medan",
      seatingType: "reserved",
    },
    {
      venueId: "ven-010",
      venueName: "Semarang Grand Hall",
      capacity: 1600,
      address: "Jl. Pandanaran, Semarang",
      city: "Semarang",
      seatingType: "free",
    },
  ],
};

export const venueDummySummary = {
  venue: venueSeed.venues.length,
};