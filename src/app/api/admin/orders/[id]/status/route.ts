
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

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
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    !ALLOWED_STATUSES.some(
      (status) => status === body.status
    )
  ) {
    return NextResponse.json(
      { message: "Invalid order status" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/admin/orders/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: body.status,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to reach the order service",
      },
      { status: 502 }
    );
  }
}

