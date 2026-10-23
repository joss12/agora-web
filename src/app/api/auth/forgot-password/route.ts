import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.SPRING_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "Authentication service is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;
  const email =
    typeof input.email === "string"
      ? input.email.trim().toLowerCase()
      : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.status === 429) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: "Unable to send a recovery email right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message:
        "If an account exists for this email, a password-reset link will be sent.",
    });
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable." },
      { status: 502 }
    );
  }
}
