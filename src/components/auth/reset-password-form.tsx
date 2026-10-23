"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must contain 8 to 128 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data: { message?: string } | null =
          await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Unable to reset your password."
        );
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);

      // Remove the recovery token from the browser's address bar.
      window.history.replaceState(null, "", "/reset-password");
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

  if (success) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
      >
        <h2 className="text-lg font-semibold text-zinc-950">
          Password updated!
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Your password has been changed successfully. Please sign in
          using your new password.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex w-full justify-center rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-lg font-semibold text-zinc-950">
          Recovery link missing
        </h2>

        <p className="mt-3 text-sm text-zinc-600">
          Please request a new password-reset link.
        </p>

        <Link
          href="/forgot-password"
          className="mt-5 inline-block text-sm font-semibold text-zinc-950 underline underline-offset-4"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="new-password"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          New password
        </label>

        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          placeholder="Enter your new password"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="confirm-new-password"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          Confirm new password
        </label>

        <input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={loading}
          placeholder="Confirm your new password"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 disabled:opacity-60"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}

          {error.toLowerCase().includes("expired") && (
            <Link
              href="/forgot-password"
              className="mt-3 block font-semibold underline underline-offset-4"
            >
              Request a new link
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Updating password..." : "Reset password"}
      </button>
    </form>
  );
}
