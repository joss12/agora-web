import {
  NextRequest,
  NextResponse,
} from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      {
        message: "Invalid address ID.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/account/addresses/${id}/default`,
      {
        method: "PATCH",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to update the default address.",
      },
      { status: 502 }
    );
  }
}
