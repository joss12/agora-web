
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import { getCurrentUser } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function validId(id: string) {
  return /^[1-9]\d*$/.test(id);
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
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

  const { id } = await context.params;

  if (!validId(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  const incoming = await request.formData();
  const file = incoming.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { message: "Please select an image" },
      { status: 400 }
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await backendFetch(
      `/api/products/${id}/images`,
      {
        method: "POST",
        body: formData,
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
      { message: "Unable to upload image" },
      { status: 502 }
    );
  }
}

