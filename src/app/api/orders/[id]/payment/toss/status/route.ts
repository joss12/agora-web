import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
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
      `/api/orders/${id}/payment/toss/status`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => ({
      message: "Unable to check Toss payment status",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Unable to reach Toss payment service",
      },
      { status: 502 },
    );
  }
}
