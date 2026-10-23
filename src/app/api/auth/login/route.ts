
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SPRING_API_URL;

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  firstName: string;
  role: "ADMIN" | "CUSTOMER";
}

export async function POST(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "Backend API URL is not configured" },
      { status: 500 }
    );
  }

  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable" },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: response.status }
    );
  }

  const data = (await response.json()) as LoginResponse;

  if (
    !data.accessToken ||
    !["ADMIN", "CUSTOMER"].includes(data.role)
  ) {
    return NextResponse.json(
      { message: "Invalid authentication response" },
      { status: 502 }
    );
  }

  const result = NextResponse.json({
    user: {
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      role: data.role,
    },
  });

  result.cookies.set(
    "springcommerce_session",
    data.accessToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresIn,
    }
  );

  return result;
}
