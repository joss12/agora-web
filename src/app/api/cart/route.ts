
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const response = await backendFetch("/api/cart");

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to retrieve your cart" },
      { status: 502 }
    );
  }
}

export async function DELETE() {
  try {
    const response = await backendFetch("/api/cart", {
      method: "DELETE",
    });

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
      { message: "Unable to clear your cart" },
      { status: 502 }
    );
  }
}

