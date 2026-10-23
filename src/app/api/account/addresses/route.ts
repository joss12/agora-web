import {
  NextRequest,
  NextResponse,
} from "next/server";

import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const response = await backendFetch(
      "/api/account/addresses",
      {
        method: "GET",
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
          "Unable to load addresses.",
      },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const response = await backendFetch(
      "/api/account/addresses",
      {
        method: "POST",
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
          "Unable to create address.",
      },
      { status: 502 }
    );
  }
}
