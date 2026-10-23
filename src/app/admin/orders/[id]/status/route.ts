
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { updateAdminOrderStatus } from "@/lib/admin-api";

import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/types/admin-order";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    !ORDER_STATUSES.includes(
      body.status as OrderStatus
    )
  ) {
    return NextResponse.json(
      { message: "Invalid order status" },
      { status: 400 }
    );
  }

  try {
    const order = await updateAdminOrderStatus(
      Number(id),
      body.status as OrderStatus
    );

    return NextResponse.json(order);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NOT_FOUND"
    ) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Unable to update order status" },
      { status: 500 }
    );
  }
}

