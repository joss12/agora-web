import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    productId: string;
  }>;
}

export async function GET(
  _request: Request,
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
      `/api/v1/wishlist/products/${productId}`
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to check wishlist status" },
      { status: 502 }
    );
  }
}
