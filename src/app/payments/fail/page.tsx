"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentFailureContent() {
  const params = useSearchParams();

  const orderId = params.get("agoraOrderId");
  const code = params.get("code");
  const message = params.get("message");

  const validOrderId =
    orderId !== null && /^[1-9]\d*$/.test(orderId);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-zinc-950">
        Payment was not completed
      </h1>

      <p className="mt-4 text-sm leading-6 text-zinc-600">
        {message || "The payment was cancelled or declined."}
      </p>

      {code && (
        <p className="mt-3 text-xs text-zinc-500">
          Error code: {code}
        </p>
      )}

      <p className="mt-4 text-sm text-zinc-500">
        If you believe you were charged, verify your order
        status before attempting payment again.
      </p>

      <Link
        href={
          validOrderId
            ? `/orders/${orderId}`
            : "/orders"
        }
        className="mt-8 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
      >
        Back to orders
      </Link>
    </main>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PaymentFailureContent />
    </Suspense>
  );
}
