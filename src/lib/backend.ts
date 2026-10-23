import "server-only";

import { cookies } from "next/headers";

const API_URL = process.env.SPRING_API_URL;

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!API_URL) {
    throw new Error("SPRING_API_URL is not configured");
  }

  const cookieStore = await cookies();

  const token = cookieStore.get(
    "springcommerce_session"
  )?.value;

  if (!token) {
    return new Response(
      JSON.stringify({ message: "Authentication required" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

if (options.body && !(options.body instanceof FormData)) {
  headers.set("Content-Type", "application/json");
}

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

