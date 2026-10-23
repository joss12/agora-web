import {
  NextRequest,
  NextResponse,
} from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/admin/orders/${id}/shipment/delivered`,
      {
        method: "PATCH",
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    return NextResponse.json(
      data ?? {},
      {
        status: response.status,
      }
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to reach the shipment service",
      },
      { status: 502 }
    );
  }
}
