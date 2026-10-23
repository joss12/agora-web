"use client";

import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const data: { message?: string } | null =
          await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Unable to send recovery email."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
      >
        <h2 className="text-lg font-semibold text-zinc-950">
          Check your inbox
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          If an account exists for this email address, you&apos;ll
          receive a password-reset link shortly.
        </p>

        <p className="mt-3 text-sm text-zinc-500">
          The link expires after 15 minutes.
        </p>

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-zinc-950 underline underline-offset-4"
        >
          Try another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="recovery-email"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          Email address
        </label>

        <input
          id="recovery-email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:opacity-60"
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
        {loading ? "Sending recovery link..." : "Send recovery link"}
      </button>
    </form>
  );
}
