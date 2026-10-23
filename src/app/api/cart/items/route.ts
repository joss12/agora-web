import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

function isValidRequest(
  value: unknown
): value is AddCartItemRequest {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.productId === "number" &&
    Number.isSafeInteger(body.productId) &&
    body.productId > 0 &&
    typeof body.quantity === "number" &&
    Number.isSafeInteger(body.quantity) &&
    body.quantity > 0
  );
}

async function forwardResponse(
  response: Response
): Promise<NextResponse> {
  if (response.status === 204) {
    return new NextResponse(null, {
      status: 204,
    });
  }

  const text = await response.text();

  if (!text) {
    return NextResponse.json(
      response.ok
        ? { message: "Cart updated successfully." }
        : { message: "Unable to update cart." },
      { status: response.status }
    );
  }

  try {
    return NextResponse.json(
      JSON.parse(text),
      { status: response.status }
    );
  } catch {
    return NextResponse.json(
      {
        message: response.ok
          ? "Cart updated successfully."
          : "Unable to update cart.",
      },
      { status: response.status }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!isValidRequest(body)) {
    return NextResponse.json(
      {
        message:
          "A valid product ID and quantity are required.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      "/api/cart/items",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to connect to the shopping cart service.",
      },
      { status: 502 }
    );
  }
}
