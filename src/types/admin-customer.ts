import type { AdminOrder } from "@/types/admin-order";

export interface AdminCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface AdminCustomerPage {
  customers: AdminCustomer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminCustomerDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  orders: AdminOrder[];
}
