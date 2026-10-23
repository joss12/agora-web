import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
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
          ? "Review updated successfully."
          : "Unable to process review.",
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
          ? "Review updated successfully."
          : "Unable to process review.",
      },
      { status: response.status }
    );
  }
}

function parseReviewId(id: string): number | null {
  const reviewId = Number(id);

  return Number.isSafeInteger(reviewId) &&
    reviewId > 0
    ? reviewId
    : null;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  const reviewId = parseReviewId(id);

  if (!reviewId) {
    return NextResponse.json(
      { message: "Invalid review ID." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid review data." },
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
      `/api/v1/reviews/${reviewId}`,
      {
        method: "PUT",
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
        message: "Unable to connect to the review service.",
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
  const reviewId = parseReviewId(id);

  if (!reviewId) {
    return NextResponse.json(
      { message: "Invalid review ID." },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/v1/reviews/${reviewId}`,
      {
        method: "DELETE",
      }
    );

    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      {
        message: "Unable to connect to the review service.",
      },
      { status: 502 }
    );
  }
}
