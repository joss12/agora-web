import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return NextResponse.json(
      { message: "Invalid product ID." },
      { status: 400 }
    );
  }

  const API_URL = process.env.SPRING_API_URL;

  if (!API_URL) {
    return NextResponse.json(
      { message: "Backend API is not configured." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/products/${productId}/ratings`,
      { cache: "no-store" }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to load product ratings." },
      { status: 502 }
    );
  }
}
