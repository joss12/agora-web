import {
  NextRequest,
  NextResponse,
} from "next/server";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

function forbidden(message: string) {
  return NextResponse.json(
    { message },
    { status: 403 }
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API requests.
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Safe HTTP methods do not require CSRF validation.
  if (SAFE_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");

  // Browsers normally send Origin on cross-origin requests
  // and modern same-origin POST/PATCH/DELETE requests.
  if (!origin) {
    return forbidden(
      "Request origin is required."
    );
  }

  let requestOrigin: string;

  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return forbidden(
      "Invalid request origin."
    );
  }

  // Configure the public origin explicitly in production.
  // Never trust an arbitrary Host or forwarded-host header
  // as the sole source of the expected origin.
  const configuredOrigin =
    process.env.APP_ORIGIN;

  if (!configuredOrigin) {
    return NextResponse.json(
      {
        message:
          "Application origin is not configured.",
      },
      { status: 500 }
    );
  }

  let allowedOrigin: string;

  try {
    allowedOrigin = new URL(
      configuredOrigin
    ).origin;
  } catch {
    return NextResponse.json(
      {
        message:
          "Application origin configuration is invalid.",
      },
      { status: 500 }
    );
  }

  if (requestOrigin !== allowedOrigin) {
    return forbidden(
      "Cross-origin request blocked."
    );
  }

  // Block cross-site requests even if an Origin header
  // is somehow consistent with the configured origin.
  const fetchSite = request.headers.get(
    "sec-fetch-site"
  );

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "none"
  ) {
    return forbidden(
      "Cross-site request blocked."
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
