import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ConfirmBody {
  paymentKey: string;
  orderId: string;
  amount: number;
}

function isConfirmBody(value: unknown): value is ConfirmBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.paymentKey === "string" &&
    body.paymentKey.length > 0 &&
    body.paymentKey.length <= 200 &&
    typeof body.orderId === "string" &&
    body.orderId.length >= 6 &&
    body.orderId.length <= 64 &&
    typeof body.amount === "number" &&
    Number.isSafeInteger(body.amount) &&
    body.amount > 0
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isConfirmBody(body)) {
    return NextResponse.json(
      { message: "Invalid payment confirmation data" },
      { status: 400 },
    );
  }

  try {
    const response = await backendFetch(
      `/api/orders/${id}/payment/toss/confirm`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    const data = await response.json().catch(() => ({
      message: "Unable to confirm payment",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Payment status is uncertain. Check your order before retrying.",
      },
      { status: 502 },
    );
  }
}
