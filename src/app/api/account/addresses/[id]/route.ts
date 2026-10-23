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
  request: NextRequest,
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
    const body = await request.json();

    const response = await backendFetch(
      `/api/account/addresses/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
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
          "Unable to update address.",
      },
      { status: 502 }
    );
  }
}

export async function DELETE(
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
      `/api/account/addresses/${id}`,
      {
        method: "DELETE",
      }
    );

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
      {
        message:
          "Unable to delete address.",
      },
      { status: 502 }
    );
  }
}
