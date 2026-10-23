import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout | Agora",
  description:
    "Complete your purchase securely on Agora.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Agora
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-3 text-sm text-zinc-500 sm:text-base">
          Review your order and enter your delivery details.
        </p>
      </div>

      <CheckoutForm />
    </main>
  );
}
