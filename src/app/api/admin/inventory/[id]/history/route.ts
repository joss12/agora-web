import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const response = await backendFetch(
      `/api/products/${id}/inventory-history`
    );

    const text = await response.text();

    if (!response.ok) {
      return new NextResponse(text || null, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("content-type") ??
            "application/json",
        },
      });
    }

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Inventory history proxy error:", error);

    return NextResponse.json(
      {
        message: "Unable to load inventory history",
      },
      {
        status: 500,
      }
    );
  }
}
