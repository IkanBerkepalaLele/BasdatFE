export type TicketCategory = {
  categoryId: string;
  categoryName: string;
  quota: number;
  price: number;
  eventId: string;
};

export type TicketCategorySeed = {
  categories: TicketCategory[];
};

export const ticketCategorySeed: TicketCategorySeed = {
  categories: [
    { categoryId: "tc-001", categoryName: "WVIP", quota: 50, price: 1500000, eventId: "evt-001" },
    { categoryId: "tc-002", categoryName: "VIP", quota: 150, price: 750000, eventId: "evt-001" },
    { categoryId: "tc-003", categoryName: "Category 1", quota: 300, price: 450000, eventId: "evt-001" },
    { categoryId: "tc-004", categoryName: "Category 2", quota: 600, price: 250000, eventId: "evt-001" },
    { categoryId: "tc-005", categoryName: "General Admission", quota: 500, price: 150000, eventId: "evt-002" },
    { categoryId: "tc-006", categoryName: "VVIP", quota: 30, price: 2000000, eventId: "evt-003" },
    { categoryId: "tc-007", categoryName: "VIP", quota: 100, price: 900000, eventId: "evt-003" },
    { categoryId: "tc-008", categoryName: "Regular", quota: 400, price: 350000, eventId: "evt-003" },
  ],
};
