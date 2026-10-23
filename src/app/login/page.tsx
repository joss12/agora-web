import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Agora account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16 sm:py-20">
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Welcome to Agora
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          Welcome back.
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          Sign in to manage your cart and orders.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500">
            Loading login form...
          </p>
        }
      >
        <LoginForm />
      </Suspense>

      <p className="mt-5 text-center text-sm">
        <Link
          href="/forgot-password"
          className="font-semibold text-zinc-950 underline underline-offset-4"
        >
          Forgot your password?
        </Link>
      </p>

      <p className="mt-8 text-center text-sm text-zinc-600">
        New to Agora?{" "}
        <Link
          href="/register"
          className="font-semibold text-zinc-950 underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </main>
  );
}
