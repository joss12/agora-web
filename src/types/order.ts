export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  recipientName: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  addressDetail: string | null;
  deliveryInstructions: string | null;
  createdAt: string;
}

export interface PaymentAttempt {
  id: number;
  outcome: string;
  transactionReference: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  transactionReference: string | null;
  tossOrderId: string | null;
  attempts: PaymentAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
