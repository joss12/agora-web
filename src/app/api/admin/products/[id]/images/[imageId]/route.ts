
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import { getCurrentUser } from "@/lib/session";

interface RouteContext {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
}

function isValidId(value: string): boolean {
  return /^[1-9]\d*$/.test(value);
}

async function requireAdmin(): Promise<NextResponse | null> {
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

export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, imageId } = await params;

  if (!isValidId(id) || !isValidId(imageId)) {
    return NextResponse.json(
      { message: "Invalid product or image ID" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/products/${id}/images/${imageId}/primary`,
      { method: "PATCH" }
    );

    const body = await response.text();

    return new NextResponse(body || null, {
      status: response.status,
      headers: body
        ? { "Content-Type": "application/json" }
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to set primary image" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, imageId } = await params;

  if (!isValidId(id) || !isValidId(imageId)) {
    return NextResponse.json(
      { message: "Invalid product or image ID" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/products/${id}/images/${imageId}`,
      { method: "DELETE" }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await response.text();

    return new NextResponse(body || null, {
      status: response.status,
      headers: body
        ? { "Content-Type": "application/json" }
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete image" },
      { status: 502 }
    );
  }
}

