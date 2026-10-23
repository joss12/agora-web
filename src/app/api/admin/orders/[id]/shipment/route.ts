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

export async function GET(
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
      `/api/admin/orders/${id}/shipment`,
      {
        method: "GET",
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

export async function POST(
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

  try {
    const body = await request.json();

    const response = await backendFetch(
      `/api/admin/orders/${id}/shipment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
