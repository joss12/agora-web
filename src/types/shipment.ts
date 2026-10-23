export type ShipmentStatus =
  | "PREPARING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED";

export interface Shipment {
  id: number;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
