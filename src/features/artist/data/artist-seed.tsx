export type Artist = {
  artistId: string;
  name: string;
  genre: string;
};

export type ArtistSeed = {
  artists: Artist[];
};

export const artistSeed: ArtistSeed = {
  artists: [
    {
      artistId: "art-001",
      name: "Fourtwnty",
      genre: "Indie Folk",
    },
    {
      artistId: "art-002",
      name: "Tulus",
      genre: "Pop",
    },
    {
      artistId: "art-003",
      name: "Nidji",
      genre: "Pop Rock",
    },
    {
      artistId: "art-004",
      name: "Sheila on 7",
      genre: "Pop Rock",
    },
    {
      artistId: "art-005",
      name: "Dewa 19",
      genre: "Rock",
    },
    {
      artistId: "art-006",
      name: "Fiersa Besari",
      genre: "Indie Folk",
    },
    {
      artistId: "art-007",
      name: "Pamungkas",
      genre: "R&B",
    },
    {
      artistId: "art-008",
      name: "Reality Club",
      genre: "Indie Pop",
    },
    {
      artistId: "art-009",
      name: "NOAH",
      genre: "Pop Rock",
    },
    {
      artistId: "art-010",
      name: "Hindia",
      genre: "Indie Pop",
    },
  ],
};
