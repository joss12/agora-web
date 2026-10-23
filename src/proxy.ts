import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function proxy(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const configuredOrigin = process.env.APP_ORIGIN;

  if (!configuredOrigin) {
    return NextResponse.json(
      { message: "APP_ORIGIN is not configured" },
      { status: 500 }
    );
  }

  let allowedOrigin: string;

  try {
    allowedOrigin = new URL(configuredOrigin).origin;
  } catch {
    return NextResponse.json(
      { message: "APP_ORIGIN is invalid" },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin");

  if (!origin || origin !== allowedOrigin) {
    return NextResponse.json(
      { message: "CSRF validation failed" },
      { status: 403 }
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "none"
  ) {
    return NextResponse.json(
      { message: "Cross-site request blocked" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
