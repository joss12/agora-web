"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ConfirmationStatus =
  | "confirming"
  | "success"
  | "error";

function PaymentSuccessContent() {
  const params = useSearchParams();

  const [status, setStatus] =
    useState<ConfirmationStatus>("confirming");

  const [message, setMessage] = useState(
    "Verifying your payment with Toss Payments...",
  );

  const started = useRef(false);

  const agoraOrderId = params.get("agoraOrderId");
  const paymentKey = params.get("paymentKey");
  const tossOrderId = params.get("orderId");
  const amount = params.get("amount");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function confirmPayment() {
      if (
        !agoraOrderId ||
        !/^[1-9]\d*$/.test(agoraOrderId) ||
        !paymentKey ||
        !tossOrderId ||
        !amount ||
        !/^[1-9]\d*$/.test(amount) ||
        !Number.isSafeInteger(Number(amount))
      ) {
        setStatus("error");
        setMessage("Invalid payment confirmation information.");
        return;
      }

      try {
        const response = await fetch(
          `/api/orders/${agoraOrderId}/payment/toss/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentKey,
              orderId: tossOrderId,
              amount: Number(amount),
            }),
          },
        );

        if (response.status === 401) {
          window.location.href =
            `/login?next=${encodeURIComponent(
              window.location.pathname +
                window.location.search,
            )}`;
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Payment confirmation could not be completed.",
          );
        }

        if (data?.status !== "PAID") {
          throw new Error(
            "Payment has not reached the paid state.",
          );
        }

        setStatus("success");
        setMessage("Your payment was confirmed successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
        );
      }
    }

    void confirmPayment();
  }, [agoraOrderId, paymentKey, tossOrderId, amount]);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">
        {status === "confirming"
          ? "Confirming payment"
          : status === "success"
            ? "Payment successful!"
            : "Payment verification needed"}
      </h1>

      <p
        role="status"
        className="mt-4 text-sm leading-6 text-zinc-600"
      >
        {message}
      </p>

      {status === "success" && (
        <p className="mt-3 text-sm text-zinc-500">
          Thank you for shopping with Agora.
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-amber-700">
          Your payment may already have been processed.
          Check the order status before starting another payment.
        </p>
      )}

      {agoraOrderId && /^[1-9]\d*$/.test(agoraOrderId) && (
        <Link
          href={`/orders/${agoraOrderId}`}
          className="mt-8 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          View order
        </Link>
      )}
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="py-20 text-center">
          Loading payment information...
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
