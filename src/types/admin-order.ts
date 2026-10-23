export type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  items: AdminOrderItem[];
  recipientName: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  addressDetail: string | null;
  deliveryInstructions: string | null;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
}

export interface AdminOrderPage {
  content: AdminOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function getNextOrderStatus(
  status: OrderStatus
): OrderStatus | null {
  switch (status) {
    case "PLACED":
      return "PROCESSING";

    case "PROCESSING":
      return "SHIPPED";

    case "SHIPPED":
      return "DELIVERED";

    case "DELIVERED":
    case "CANCELLED":
      return null;
  }
}
