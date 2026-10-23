import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    itemId: string;
  }>;
}

interface UpdateCartItemRequest {
  quantity: number;
}

function isValidQuantity(
  value: unknown
): value is UpdateCartItemRequest {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.quantity === "number" &&
    Number.isSafeInteger(body.quantity) &&
    body.quantity > 0
  );
}

function isValidItemId(itemId: string): boolean {
  return /^[1-9]\d*$/.test(itemId);
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

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { itemId } = await context.params;

  if (!isValidItemId(itemId)) {
    return NextResponse.json(
      { message: "Invalid cart item ID." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!isValidQuantity(body)) {
    return NextResponse.json(
      {
        message:
          "Quantity must be a positive integer.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/cart/items/${itemId}`,
      {
        method: "PUT",
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

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { itemId } = await context.params;

  if (!isValidItemId(itemId)) {
    return NextResponse.json(
      { message: "Invalid cart item ID." },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/cart/items/${itemId}`,
      {
        method: "DELETE",
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
