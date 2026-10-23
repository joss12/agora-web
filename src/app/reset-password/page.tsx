import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Agora account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-16 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Agora account security
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
        Create a new password.
      </h1>

      <p className="mt-3 mb-8 text-sm leading-6 text-zinc-600">
        Choose a new password to regain access to your account.
      </p>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500">
            Loading password recovery...
          </p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
