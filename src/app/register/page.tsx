import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Agora shopping account.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5 py-16 sm:py-20">
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Join Agora
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Create your account.
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Discover products, manage your orders, and enjoy
          a simpler shopping experience.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-zinc-950 underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
