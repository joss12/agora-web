import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
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
      `/api/orders/${id}/history`,
      { method: "DELETE" },
    );

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const data = await response.json().catch(() => ({
      message: "Unable to remove order from history",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach order service" },
      { status: 502 },
    );
  }
}
