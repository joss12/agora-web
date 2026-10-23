import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    productId: string;
  }>;
}

async function handleRequest(
  method: "POST" | "DELETE",
  context: RouteContext
) {
  const { productId } = await context.params;

  if (!/^[1-9]\d*$/.test(productId)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/v1/wishlist/${productId}`,
      { method }
    );

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update your wishlist" },
      { status: 502 }
    );
  }
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  return handleRequest("POST", context);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  return handleRequest("DELETE", context);
}
