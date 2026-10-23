
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import { getCurrentUser } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authorizeAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Administrator access required" },
      { status: 403 }
    );
  }

  return null;
}

function validId(id: string) {
  return /^[1-9]\d*$/.test(id);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const unauthorized = await authorizeAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  if (!validId(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    return new NextResponse(text || null, {
      status: response.status,
      headers: text
        ? { "Content-Type": "application/json" }
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update product" },
      { status: 502 }
    );
  }
}



export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();

  if (!user) {
    console.error("[DELETE product] Session verification failed");

    return NextResponse.json(
      {
        message: "Session verification failed",
        source: "next-session",
      },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      {
        message: "Administrator access required",
        source: "next-session",
      },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  if (!validId(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    console.log("[DELETE product] Admin session verified");

    const response = await backendFetch(
      `/api/products/${id}`,
      { method: "DELETE" }
    );

    console.log(
      "[DELETE product] Spring Boot status:",
      response.status
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();

    if (response.status === 401) {
      return NextResponse.json(
        {
          message: "Spring Boot rejected the DELETE request",
          source: "spring-backend",
        },
        { status: 401 }
      );
    }

    return new NextResponse(text || null, {
      status: response.status,
      headers: text
        ? {
            "Content-Type":
              response.headers.get("Content-Type") ??
              "text/plain",
          }
        : undefined,
    });
  } catch (error) {
    console.error("[DELETE product] Request failed:", error);

    return NextResponse.json(
      { message: "Unable to delete product" },
      { status: 502 }
    );
  }
}

