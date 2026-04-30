import { Promotion } from "../types";

export const promotionSeedData: Promotion[] = [
  {
    promotionId: "prm-001",
    promoCode: "TIKTAKTUK",
    discountType: "Nominal",
    discountValue: 50000,
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    usageLimit: 100,
  },
  {
    promotionId: "prm-002",
    promoCode: "HEMAT20",
    discountType: "Percentage",
    discountValue: 20,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    usageLimit: 50,
  },
  {
    promotionId: "prm-003",
    promoCode: "LEBARAN",
    discountType: "Nominal",
    discountValue: 75000,
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    usageLimit: 200,
  },
];
