export type DiscountType = "Percentage" | "Nominal";

export type Promotion = {
  promotionId: string;
  promoCode: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number; // Added to track usage
};
