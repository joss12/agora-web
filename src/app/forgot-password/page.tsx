import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Recover access to your Agora account.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Agora account recovery
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
        Forgot your password?
      </h1>

      <p className="mt-3 mb-8 text-sm leading-6 text-zinc-600">
        Enter your email address and we&apos;ll send you a link to
        reset your password.
      </p>

      <ForgotPasswordForm />

      <p className="mt-8 text-center text-sm text-zinc-600">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-zinc-950 underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
