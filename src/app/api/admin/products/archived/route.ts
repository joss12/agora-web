
import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
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

  const page = request.nextUrl.searchParams.get("page") ?? "0";
  const size = request.nextUrl.searchParams.get("size") ?? "10";

  try {
    const response = await backendFetch(
      `/api/admin/products/archived?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to load archived products" },
      { status: 502 }
    );
  }
}

