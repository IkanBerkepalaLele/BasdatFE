export type PaymentStatus = "Pending" | "Paid" | "Cancelled";

export type Order = {
  orderId: string;
  orderDate: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  customerId: string;
  eventId: string; // Helpful for filtering and display
};
