"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  type OrderStatus,
  type PaymentStatus,
} from "@/types/admin-order";

interface OrderStatusControlProps {
  orderId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

function orderStatusClass(
  status: OrderStatus
) {
  switch (status) {
    case "DELIVERED":
      return "text-emerald-700";

    case "SHIPPED":
      return "text-blue-700";

    case "PROCESSING":
      return "text-amber-700";

    case "CANCELLED":
      return "text-red-700";

    default:
      return "text-zinc-950";
  }
}

function paymentStatusClass(
  status: PaymentStatus
) {
  switch (status) {
    case "PAID":
      return "text-emerald-700";

    case "REFUNDED":
      return "text-blue-700";

    case "FAILED":
      return "text-red-700";

    default:
      return "text-amber-700";
  }
}

export function OrderStatusControl({
  orderId,
  status,
  paymentStatus,
}: OrderStatusControlProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const isPaid =
    paymentStatus === "PAID";

  const canStartProcessing =
    status === "PLACED" && isPaid;

  const canCancel =
    status === "PLACED" ||
    status === "PROCESSING";

  async function updateStatus(
    requestedStatus: OrderStatus
  ) {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: requestedStatus,
          }),
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to update order status"
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function startProcessing() {
    if (!canStartProcessing) {
      return;
    }

    await updateStatus(
      "PROCESSING"
    );
  }

  async function cancelOrder() {
    if (!canCancel || loading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Cancel this order? Inventory will be restored and a paid order will be marked as refunded."
      );

    if (!confirmed) {
      return;
    }

    await updateStatus(
      "CANCELLED"
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="min-w-0 rounded-xl bg-zinc-50 p-3">
          <p className="text-[11px] text-zinc-500 sm:text-xs">
            Order status
          </p>

          <p
            className={`mt-1 truncate text-xs font-semibold sm:text-sm ${orderStatusClass(
              status
            )}`}
          >
            {status}
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-zinc-50 p-3">
          <p className="text-[11px] text-zinc-500 sm:text-xs">
            Payment status
          </p>

          <p
            className={`mt-1 truncate text-xs font-semibold sm:text-sm ${paymentStatusClass(
              paymentStatus
            )}`}
          >
            {paymentStatus}
          </p>
        </div>
      </div>

      {status === "PLACED" && (
        <button
          type="button"
          onClick={startProcessing}
          disabled={
            loading ||
            !canStartProcessing
          }
          className="min-h-12 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Updating..."
            : "Mark as PROCESSING"}
        </button>
      )}

      {status === "PLACED" &&
        !isPaid && (
          <div className="rounded-xl bg-amber-50 p-3.5">
            <p className="text-xs leading-5 text-amber-800 sm:text-sm sm:leading-6">
              Payment must be confirmed
              before fulfillment. Current
              payment status:{" "}
              <span className="font-semibold">
                {paymentStatus}
              </span>
            </p>
          </div>
        )}

      {status === "PROCESSING" && (
        <p className="text-sm leading-6 text-zinc-500">
          This order is ready for
          shipment. Add the carrier and
          tracking number below.
        </p>
      )}

      {status === "SHIPPED" && (
        <p className="text-sm leading-6 text-zinc-500">
          This order has been shipped.
        </p>
      )}

      {status === "DELIVERED" && (
        <p className="text-sm leading-6 text-zinc-500">
          This order has been delivered.
        </p>
      )}

      {canCancel && (
        <div className="border-t border-zinc-200 pt-5">
          <button
            type="button"
            onClick={cancelOrder}
            disabled={loading}
            className="min-h-12 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "Updating..."
              : "Cancel order"}
          </button>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Cancelling restores
            inventory. A paid order will
            be marked as refunded.
          </p>
        </div>
      )}

      {status === "CANCELLED" && (
        <div className="rounded-xl bg-zinc-50 p-3.5">
          <p className="text-sm text-zinc-600">
            This order has been
            cancelled.
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
