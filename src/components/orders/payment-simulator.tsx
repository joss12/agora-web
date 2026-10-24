"use client";

import { useRef, useState } from "react";

import type { Payment } from "@/types/order";
import { formatKRW } from "@/lib/format";

interface PaymentSimulatorProps {
  orderId: number;
  payment: Payment;
  onPaymentUpdated: (payment: Payment) => void;
}

type PaymentOutcome = "SUCCESS" | "FAILURE";

interface ApiErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
}

function paymentStatusClass(status: string): string {
  switch (status.toUpperCase()) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    case "REFUNDED":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function attemptStatusClass(outcome: string): string {
  return outcome.toUpperCase() === "SUCCESS"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-red-50 text-red-700";
}

function formatAttemptDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (data === null || typeof data !== "object") {
    return fallback;
  }

  const errorData = data as ApiErrorResponse;

  if (
    typeof errorData.message === "string" &&
    errorData.message.trim()
  ) {
    return errorData.message;
  }

  if (
    typeof errorData.detail === "string" &&
    errorData.detail.trim()
  ) {
    return errorData.detail;
  }

  if (
    typeof errorData.error === "string" &&
    errorData.error.trim()
  ) {
    return errorData.error;
  }

  return fallback;
}

function isPayment(value: unknown): value is Payment {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.id === "number" &&
    typeof data.amount === "number" &&
    typeof data.status === "string"
  );
}

export function PaymentSimulator({
  orderId,
  payment,
  onPaymentUpdated,
}: PaymentSimulatorProps) {
  const [submitting, setSubmitting] =
    useState<PaymentOutcome | null>(null);

  const [error, setError] = useState<string | null>(null);

  const submittingRef = useRef(false);

  const isTossPayment = Boolean(payment.tossOrderId);

  const normalizedStatus = payment.status.toUpperCase();

  const canAttemptPayment =
    !isTossPayment &&
    (normalizedStatus === "PENDING" ||
      normalizedStatus === "FAILED");

  async function simulate(outcome: PaymentOutcome) {
    if (
      submittingRef.current ||
      !canAttemptPayment
    ) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(outcome);
    setError(null);

    try {
      const response = await fetch(
        `/api/orders/${orderId}/payment/simulate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            outcome,
          }),
          cache: "no-store",
        }
      );

      const data: unknown = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          getErrorMessage(
            data,
            "Simulated payments are disabled on this server."
          )
        );
      }

      if (response.status === 409) {
        throw new Error(
          getErrorMessage(
            data,
            "This payment can no longer be simulated. Please refresh the order."
          )
        );
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Unable to process simulated payment."
          )
        );
      }

      if (!isPayment(data)) {
        throw new Error(
          "The server returned an invalid payment response."
        );
      }

      // Update the parent component with the latest payment.
      onPaymentUpdated(data);

    } catch (err) {
      console.error(
        "[PaymentSimulator] Payment simulation failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Payment simulation failed. Please try again."
      );

    } finally {
      submittingRef.current = false;
      setSubmitting(null);
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Payment
          </p>

          <h2 className="mt-1 text-lg font-semibold text-zinc-950 sm:text-xl">
            Payment details
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${paymentStatusClass(
            payment.status
          )}`}
        >
          {payment.status}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {/* Payment amount */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-500">
            Amount
          </span>

          <span className="text-right font-semibold text-zinc-950">
            {formatKRW(payment.amount)}
          </span>
        </div>

        {/* Transaction reference */}
        {payment.transactionReference && (
          <div className="border-t border-zinc-200 pt-4">
            <p className="text-xs font-medium text-zinc-500 sm:text-sm">
              Transaction reference
            </p>

            <p className="mt-1.5 break-all text-xs leading-5 text-zinc-800 sm:text-sm">
              {payment.transactionReference}
            </p>
          </div>
        )}

        {/* Toss Payments information */}
        {isTossPayment &&
          (normalizedStatus === "PENDING" ||
            normalizedStatus === "FAILED") && (
            <div className="border-t border-zinc-200 pt-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Toss Payments
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  This order has already been prepared
                  for Toss Payments. Simulated payments
                  are unavailable for this order.
                </p>

                <p className="mt-2 text-xs leading-5 text-blue-700">
                  Complete or resolve the existing Toss
                  payment before attempting another
                  payment method.
                </p>
              </div>
            </div>
          )}

        {/* Payment simulator */}
        {canAttemptPayment && (
          <div className="border-t border-zinc-200 pt-5">
            <div className="rounded-xl bg-amber-50 p-3.5">
              <p className="text-xs leading-5 text-amber-800 sm:text-sm sm:leading-6">
                {normalizedStatus === "FAILED"
                  ? "Your previous payment attempt failed. You can try again. This is a simulation; no real money will be charged."
                  : "This is a simulated payment. No real money will be charged."}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {/* Simulate success */}
              <button
                type="button"
                disabled={
                  submitting !== null ||
                  !canAttemptPayment
                }
                onClick={() => void simulate("SUCCESS")}
                className="min-h-12 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting === "SUCCESS"
                  ? "Processing..."
                  : "Simulate successful payment"}
              </button>

              {/* Simulate failure */}
              <button
                type="button"
                disabled={
                  submitting !== null ||
                  !canAttemptPayment
                }
                onClick={() => void simulate("FAILURE")}
                className="min-h-12 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting === "FAILURE"
                  ? "Processing..."
                  : "Simulate failed payment"}
              </button>
            </div>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700"
          >
            {error}
          </p>
        )}

        {/* Payment history */}
        {payment.attempts?.length > 0 && (
          <div className="border-t border-zinc-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-zinc-950">
                Payment attempts
              </h3>

              <span className="text-xs text-zinc-400">
                {payment.attempts.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {payment.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="min-w-0 rounded-xl bg-zinc-50 p-3.5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${attemptStatusClass(
                        attempt.outcome
                      )}`}
                    >
                      {attempt.outcome}
                    </span>

                    <span className="text-xs leading-5 text-zinc-500 sm:text-right">
                      {formatAttemptDate(
                        attempt.createdAt
                      )}
                    </span>
                  </div>

                  {attempt.transactionReference && (
                    <p className="mt-3 break-all border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-600">
                      {attempt.transactionReference}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
