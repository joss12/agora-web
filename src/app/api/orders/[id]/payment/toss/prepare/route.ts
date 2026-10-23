import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 },
    );
  }

  try {
    const response = await backendFetch(
      `/api/orders/${id}/payment/toss/prepare`,
      { method: "POST" },
    );

    const data = await response.json().catch(() => ({
      message: "Unable to prepare payment",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach payment service" },
      { status: 502 },
    );
  }
}
