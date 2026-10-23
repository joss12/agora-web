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
      { message: "Invalid recovery details." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  const token =
    typeof input.token === "string" ? input.token : "";

  const newPassword =
    typeof input.newPassword === "string"
      ? input.newPassword
      : "";

  if (!token || newPassword.length < 8 || newPassword.length > 128) {
    return NextResponse.json(
      { message: "Please provide a valid token and password." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/auth/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      const message =
        response.status === 400
          ? "This recovery link is invalid or has expired."
          : response.status === 429
            ? "Too many attempts. Please try again later."
            : "Unable to reset your password right now.";

      return NextResponse.json(
        { message },
        {
          status:
            response.status === 400 || response.status === 429
              ? response.status
              : 502,
        }
      );
    }

    const result = NextResponse.json({
      message: "Your password has been updated successfully.",
    });

    // Clear the browser's previous session after a successful reset.
    result.cookies.set("springcommerce_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable." },
      { status: 502 }
    );
  }
}
