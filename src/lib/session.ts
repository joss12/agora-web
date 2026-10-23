import "server-only";

import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  role: "ADMIN" | "CUSTOMER";
}

interface BackendUserResponse {
  id: number;
  email: string;
  firstName: string;
  role: "ADMIN" | "CUSTOMER";
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "springcommerce_session"
  )?.value;

  if (!token) {
    return null;
  }

  const API_URL = process.env.SPRING_API_URL;

  if (!API_URL) {
    throw new Error(
      "SPRING_API_URL is not configured."
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new Error(
      "Unable to reach the authentication service."
    );
  }

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to verify session: ${response.status}`
    );
  }

  const user: BackendUserResponse =
    await response.json();

  if (
    !user ||
    typeof user.id !== "number" ||
    typeof user.email !== "string" ||
    typeof user.firstName !== "string" ||
    !["ADMIN", "CUSTOMER"].includes(user.role)
  ) {
    throw new Error(
      "Invalid authentication response."
    );
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    role: user.role,
  };
}
