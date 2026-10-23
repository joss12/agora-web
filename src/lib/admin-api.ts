
import "server-only";

import { cookies } from "next/headers";

import type {
  AdminOrder,
  AdminOrderPage,
  OrderStatus,
} from "@/types/admin-order";
import type {
  AdminCustomerDetail,
  AdminCustomerPage,
} from "@/types/admin-customer";

const API_URL = process.env.SPRING_API_URL;

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "SPRING_API_URL is not configured"
    );
  }

  const token = (
    await cookies()
  ).get("springcommerce_session")?.value;

  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );



  if (response.status === 401) {
    throw new Error("UNAUTHENTICATED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error(
      `Admin API error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getAdminOrders(
  page = 0,
  size = 20,
  status?: OrderStatus
): Promise<AdminOrderPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (status) {
    params.set("status", status);
  }

  return adminFetch<AdminOrderPage>(
    `/api/admin/orders?${params.toString()}`
  );
}


export async function getAdminCustomer(
  id: number
): Promise<AdminCustomerDetail> {
  return adminFetch<AdminCustomerDetail>(
    `/api/admin/customers/${id}`
  );
}

export async function getAdminOrder(
  id: number
): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(
    `/api/admin/orders/${id}`
  );
}

export async function updateAdminOrderStatus(
  id: number,
  status: OrderStatus
): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(
    `/api/admin/orders/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
}


export async function getAdminCustomers(
  page = 0,
  size = 20
): Promise<AdminCustomerPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return adminFetch<AdminCustomerPage>(
    `/api/admin/customers?${params.toString()}`
  );
}
