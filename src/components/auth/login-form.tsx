"use client";

import { FormEvent, useRef, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "react-toastify";

interface LoginResult {
  user: {
    id: number;
    email: string;
    firstName: string;
    role: "ADMIN" | "CUSTOMER";
  };
}

interface ApiError {
  message?: string;
}

function getSafeNext(
  requestedNext: string | null
): string | null {
  if (
    !requestedNext ||
    !requestedNext.startsWith("/") ||
    requestedNext.startsWith("//") ||
    requestedNext.startsWith("/\\")
  ) {
    return null;
  }

  // Prevent backslash-based redirect ambiguity.
  if (requestedNext.includes("\\")) {
    return null;
  }

  return requestedNext;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedNext = getSafeNext(
    searchParams.get("next")
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submittingRef = useRef(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const data: ApiError | null =
          await response.json().catch(() => null);

        const message =
          response.status === 401
            ? "Invalid email or password."
            : data?.message ??
              "Unable to sign in. Please try again.";

        throw new Error(message);
      }

      const data: LoginResult = await response.json();

      if (!data.user) {
        throw new Error("Invalid login response.");
      }

      const { user } = data;

      let destination: string;

      if (user.role === "ADMIN") {
        destination =
          requestedNext?.startsWith("/admin")
            ? requestedNext
            : "/admin";
      } else {
        destination =
          requestedNext &&
          !requestedNext.startsWith("/admin")
            ? requestedNext
            : "/account";
      }

      toast.success(`Welcome back, ${user.firstName}!`);

      router.replace(destination);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          disabled={loading}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          disabled={loading}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:opacity-60"
          placeholder="Your password"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
