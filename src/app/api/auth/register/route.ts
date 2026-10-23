import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SPRING_API_URL;

export async function POST(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "Backend API URL is not configured." },
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
      { message: "Invalid registration details." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  const firstName =
    typeof input.firstName === "string"
      ? input.firstName.trim()
      : "";

  const lastName =
    typeof input.lastName === "string"
      ? input.lastName.trim()
      : "";

  const email =
    typeof input.email === "string"
      ? input.email.trim().toLowerCase()
      : "";

  const password =
    typeof input.password === "string"
      ? input.password
      : "";

  if (
    !firstName ||
    !lastName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8
  ) {
    return NextResponse.json(
      { message: "Please provide valid registration details." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const message =
        response.status === 409
          ? "An account with this email already exists."
          : response.status === 400
            ? "Please check your registration details."
            : "Registration failed. Please try again.";

      return NextResponse.json(
        { message },
        {
          status:
            response.status >= 400 &&
            response.status < 600
              ? response.status
              : 502,
        }
      );
    }

    const user = await response.json();

    return NextResponse.json(user, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { message: "Registration service is unavailable." },
      { status: 502 }
    );
  }
}
