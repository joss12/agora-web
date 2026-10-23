"use client";

import { useRef, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { CreditCard, Wallet } from "lucide-react";

import { formatKRW } from "@/lib/format";

interface TossPrepareResponse {
  orderId: number;
  tossOrderId: string;
  amount: number;
  currency: string;
}

interface TossPaymentStatusResponse {
  orderId: number;
  tossOrderId: string | null;
  tossStatus: string;
  recoveryAllowed: boolean;
  message: string;
}

interface TossPaymentProps {
  orderId: number;
  amount: number;
  orderName: string;
  customerName?: string;
}

type PaymentMethod = "CARD" | "TOSSPAY";

function getApiError(data: unknown, fallback: string): string {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}

export function TossPayment({
  orderId,
  amount,
  orderName,
  customerName,
}: TossPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submittingRef = useRef(false);

  async function requestJson(
    url: string,
    options?: RequestInit
  ): Promise<{
    response: Response;
    data: unknown;
  }> {
    const response = await fetch(url, {
      cache: "no-store",
      ...options,
    });

    if (response.status === 401) {
      window.location.href =
        `/login?next=${encodeURIComponent(`/orders/${orderId}`)}`;

      throw new Error("Please sign in to continue.");
    }

    const data: unknown = await response.json().catch(() => null);

    return { response, data };
  }

  function validatePreparation(
    data: unknown
  ): TossPrepareResponse {
    if (
      data === null ||
      typeof data !== "object" ||
      !("orderId" in data) ||
      !("tossOrderId" in data) ||
      !("amount" in data) ||
      !("currency" in data)
    ) {
      throw new Error("Invalid payment preparation response.");
    }

    const prepared = data as TossPrepareResponse;

    if (
      prepared.orderId !== orderId ||
      typeof prepared.tossOrderId !== "string" ||
      prepared.tossOrderId.length < 6 ||
      prepared.tossOrderId.length > 64 ||
      !Number.isSafeInteger(prepared.amount) ||
      prepared.amount <= 0 ||
      prepared.currency !== "KRW"
    ) {
      throw new Error("Invalid payment preparation response.");
    }

    if (prepared.amount !== amount) {
      throw new Error(
        "The order total has changed. Please refresh the page."
      );
    }

    return prepared;
  }

  async function preparePayment(): Promise<TossPrepareResponse> {
    const { response, data } = await requestJson(
      `/api/orders/${orderId}/payment/toss/prepare`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(
        getApiError(data, "Unable to prepare your payment.")
      );
    }

    return validatePreparation(data);
  }

  async function recoverPayment(): Promise<TossPrepareResponse> {
    const { response, data } = await requestJson(
      `/api/orders/${orderId}/payment/toss/recover`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(
        getApiError(
          data,
          "Unable to recover the expired payment. No new payment was started."
        )
      );
    }

    return validatePreparation(data);
  }

  async function getPaymentStatus():
    Promise<TossPaymentStatusResponse> {
    const { response, data } = await requestJson(
      `/api/orders/${orderId}/payment/toss/status`
    );

    if (!response.ok) {
      throw new Error(
        getApiError(
          data,
          "Unable to verify the payment status with Toss. Please try again later."
        )
      );
    }

    if (
      data === null ||
      typeof data !== "object" ||
      !("tossStatus" in data) ||
      typeof data.tossStatus !== "string" ||
      !("recoveryAllowed" in data) ||
      typeof data.recoveryAllowed !== "boolean"
    ) {
      throw new Error("Invalid Toss payment status response.");
    }

    return data as TossPaymentStatusResponse;
  }

  async function resolvePayment(): Promise<TossPrepareResponse> {
    const status = await getPaymentStatus();

    switch (status.tossStatus) {
      case "NOT_PREPARED":
        return preparePayment();

      case "EXPIRED":
        if (!status.recoveryAllowed) {
          throw new Error(
            status.message ||
              "This payment has expired and cannot be recovered."
          );
        }

        return recoverPayment();

      case "DONE":
        throw new Error(
          "Toss reports that this order has already been paid. " +
            "Please refresh the page. Do not pay again."
        );

      case "CANCELED":
      case "ABORTED":
        throw new Error(
          "The previous Toss payment was unsuccessful. " +
            "Automatic recovery is not available for this status."
        );

      default:
        throw new Error(
          `Payment status is ${status.tossStatus}. ` +
            "Checkout cannot restart until this status is resolved."
        );
    }
  }

  async function handlePayment() {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const clientKey =
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (!clientKey) {
        throw new Error(
          "Toss Payments client key is not configured."
        );
      }

      // Verify the current Toss payment before starting checkout.
      const prepared = await resolvePayment();

      const tossPayments = await loadTossPayments(clientKey);

      const payment = tossPayments.payment({
        customerKey: "ANONYMOUS",
      });

      const baseUrl = window.location.origin;

      const successUrl = new URL(
        "/payments/success",
        baseUrl
      );

      successUrl.searchParams.set(
        "agoraOrderId",
        String(orderId)
      );

      const failUrl = new URL(
        "/payments/fail",
        baseUrl
      );

      failUrl.searchParams.set(
        "agoraOrderId",
        String(orderId)
      );

      const commonOptions = {
        amount: {
          currency: "KRW" as const,
          value: prepared.amount,
        },
        orderId: prepared.tossOrderId,
        orderName:
          orderName.trim() || `Agora Order #${orderId}`,
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
        ...(customerName?.trim()
          ? { customerName: customerName.trim() }
          : {}),
      };

      if (method === "CARD") {
        await payment.requestPayment({
          method: "CARD",
          ...commonOptions,
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      } else {
        await payment.requestPayment({
          method: "CARD",
          ...commonOptions,
          card: {
            useEscrow: false,
            flowMode: "DIRECT",
            easyPay: "TOSSPAY",
          },
        });
      }
    } catch (caught) {
      console.error(
        "[TossPayment] Unable to start payment:",
        caught
      );

      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to start Toss payment. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Secure checkout
        </p>

        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Choose payment method
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Test payments are processed through Toss Payments.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => setMethod("CARD")}
          aria-pressed={method === "CARD"}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
            method === "CARD"
              ? "border-zinc-950 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-400"
          }`}
        >
          <CreditCard size={22} aria-hidden="true" />

          <span className="flex-1">
            <span className="block text-sm font-semibold">
              Credit / Debit Card
            </span>

            <span className="block text-xs text-zinc-500">
              Pay securely with your card
            </span>
          </span>

          <span
            aria-hidden="true"
            className={`h-4 w-4 rounded-full border-4 ${
              method === "CARD"
                ? "border-zinc-950"
                : "border-zinc-300"
            }`}
          />
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => setMethod("TOSSPAY")}
          aria-pressed={method === "TOSSPAY"}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
            method === "TOSSPAY"
              ? "border-zinc-950 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-400"
          }`}
        >
          <Wallet size={22} aria-hidden="true" />

          <span className="flex-1">
            <span className="block text-sm font-semibold">
              Toss Pay (토스페이)
            </span>

            <span className="block text-xs text-zinc-500">
              Pay with Toss
            </span>
          </span>

          <span
            aria-hidden="true"
            className={`h-4 w-4 rounded-full border-4 ${
              method === "TOSSPAY"
                ? "border-zinc-950"
                : "border-zinc-300"
            }`}
          />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => void handlePayment()}
        className="mt-6 min-h-12 w-full rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Verifying payment..."
          : `Pay ${formatKRW(amount)}`}
      </button>

      <p className="mt-3 text-center text-xs text-zinc-500">
        Powered by Toss Payments · Test mode
      </p>
    </section>
  );
}
