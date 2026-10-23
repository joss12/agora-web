import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const response = await backendFetch(
      `/api/products/${id}/stock/out`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
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
    console.error("Stock-out proxy error:", error);

    return NextResponse.json(
      {
        message: "Unable to remove stock",
      },
      {
        status: 500,
      }
    );
  }
}
