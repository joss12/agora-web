
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/admin/products/${id}/restore`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      return NextResponse.json(
        {
          message:
            error?.message ??
            "Unable to restore product",
        },
        { status: response.status }
      );
    }

    const product = await response.json();

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the backend" },
      { status: 502 }
    );
  }
}

