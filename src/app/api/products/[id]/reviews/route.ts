import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function parseProductId(id: string): number | null {
  const productId = Number(id);

  if (
    !Number.isSafeInteger(productId) ||
    productId <= 0
  ) {
    return null;
  }

  return productId;
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
      {
        message: response.ok
          ? "Request completed successfully."
          : "Unable to process review request.",
      },
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
          ? "Request completed successfully."
          : "Unable to process review request.",
      },
      { status: response.status }
    );
  }
}

// ============================================
// GET /api/products/:id/reviews
// Public: List product reviews
// ============================================

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  const productId = parseProductId(id);

  if (!productId) {
    return NextResponse.json(
      { message: "Invalid product ID." },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const page = Number(
    searchParams.get("page") ?? "0"
  );

  const size = Number(
    searchParams.get("size") ?? "5"
  );

  if (
    !Number.isSafeInteger(page) ||
    page < 0 ||
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size > 50
  ) {
    return NextResponse.json(
      {
        message: "Invalid pagination parameters.",
      },
      { status: 400 }
    );
  }

  const API_URL = process.env.SPRING_API_URL;

  if (!API_URL) {
    return NextResponse.json(
      {
        message: "Backend API is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/products/${productId}/reviews?page=${page}&size=${size}`,
      {
        cache: "no-store",
      }
    );

    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      {
        message: "Unable to load product reviews.",
      },
      { status: 502 }
    );
  }
}

// ============================================
// POST /api/products/:id/reviews
// Authenticated: Create product review
// ============================================

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  const productId = parseProductId(id);

  if (!productId) {
    return NextResponse.json(
      { message: "Invalid product ID." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Invalid JSON request body.",
      },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        message: "Invalid review data.",
      },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.rating !== "number" ||
    !Number.isInteger(data.rating) ||
    data.rating < 1 ||
    data.rating > 5 ||
    typeof data.title !== "string" ||
    !data.title.trim() ||
    typeof data.content !== "string" ||
    !data.content.trim()
  ) {
    return NextResponse.json(
      {
        message:
          "Rating must be between 1 and 5. Title and content are required.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/v1/products/${productId}/reviews`,
      {
        method: "POST",
        body: JSON.stringify({
          rating: data.rating,
          title: data.title.trim(),
          content: data.content.trim(),
        }),
      }
    );

    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to connect to the review service.",
      },
      { status: 502 }
    );
  }
}
