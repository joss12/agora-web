"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import {
  ArrowRight,
  Package,
  Trash2,
  XCircle,
} from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatKRW } from "@/lib/format";
import type { Order } from "@/types/order";

// ============================================================
// TYPES
// ============================================================

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
}

type Confirmation =
  | {
      type: "cancel";
      order: Order;
    }
  | {
      type: "remove";
      order: Order;
    }
  | null;

// ============================================================
// HELPERS
// ============================================================

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string): string {
  switch (status.toUpperCase()) {
    case "PAID":
    case "DELIVERED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PENDING":
    case "CREATED":
    case "PLACED":
    case "PROCESSING":
      return "bg-amber-50 text-amber-700";

    case "CANCELLED":
    case "FAILED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const data: ApiError | null = await response
    .json()
    .catch(() => null);

  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  return fallback;
}

// ============================================================
// ORDER HISTORY COMPONENT
// ============================================================

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [actionErrors, setActionErrors] = useState<
    Record<number, string>
  >({});

  const [processingOrderId, setProcessingOrderId] =
    useState<number | null>(null);

  const [confirmation, setConfirmation] =
    useState<Confirmation>(null);

  // ============================================================
  // LOAD ORDERS
  // ============================================================

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        setError(
          "Please sign in to view your orders."
        );
        return;
      }

      if (response.status === 403) {
        setError(
          "Your account does not have permission to view orders."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Unable to load your orders."
          )
        );
      }

      const data: Order[] = await response.json();

      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  // ============================================================
  // CLEAR ORDER ACTION ERROR
  // ============================================================

  function clearActionError(orderId: number) {
    setActionErrors((current) => {
      const updated = { ...current };

      delete updated[orderId];

      return updated;
    });
  }

  // ============================================================
  // SHOW CONFIRMATION DIALOG
  // ============================================================

  function requestCancelOrder(order: Order) {
    if (processingOrderId !== null) {
      return;
    }

    if (
      order.status !== "PLACED" &&
      order.status !== "PROCESSING"
    ) {
      return;
    }

    clearActionError(order.id);

    setConfirmation({
      type: "cancel",
      order,
    });
  }

  function requestRemoveFromHistory(order: Order) {
    if (processingOrderId !== null) {
      return;
    }

    if (order.status !== "CANCELLED") {
      return;
    }

    clearActionError(order.id);

    setConfirmation({
      type: "remove",
      order,
    });
  }

  // ============================================================
  // CANCEL ORDER
  // ============================================================

  async function cancelOrder(order: Order) {
    if (processingOrderId !== null) {
      return;
    }

    // Allow cancellation before shipment.
    // Both PLACED and PROCESSING are supported.

    if (
      order.status !== "PLACED" &&
      order.status !== "PROCESSING"
    ) {
      setConfirmation(null);
      return;
    }

    setProcessingOrderId(order.id);
    clearActionError(order.id);

    try {
      const response = await fetch(
        `/api/orders/${order.id}/cancel`,
        {
          method: "PATCH",
        }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?next=${encodeURIComponent("/orders")}`;

        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Unable to cancel this order."
          )
        );
      }

      const updatedOrder: Order =
        await response.json();

      setOrders((current) =>
        current.map((item) =>
          item.id === updatedOrder.id
            ? updatedOrder
            : item
        )
      );

      setConfirmation(null);

      toast.success(
        `Order #${order.id} cancelled successfully.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to cancel this order.";

      setActionErrors((current) => ({
        ...current,
        [order.id]: message,
      }));

      toast.error(message);
    } finally {
      setProcessingOrderId(null);
    }
  }

  // ============================================================
  // REMOVE FROM HISTORY
  // ============================================================

  async function removeFromHistory(order: Order) {
    if (processingOrderId !== null) {
      return;
    }

    // Only cancelled orders can be hidden.

    if (order.status !== "CANCELLED") {
      setConfirmation(null);
      return;
    }

    setProcessingOrderId(order.id);
    clearActionError(order.id);

    try {
      const response = await fetch(
        `/api/orders/${order.id}/history`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?next=${encodeURIComponent("/orders")}`;

        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Unable to remove this order from history."
          )
        );
      }

      setOrders((current) =>
        current.filter(
          (item) => item.id !== order.id
        )
      );

      setConfirmation(null);

      toast.success(
        `Order #${order.id} removed from your history.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to remove this order.";

      setActionErrors((current) => ({
        ...current,
        [order.id]: message,
      }));

      toast.error(message);
    } finally {
      setProcessingOrderId(null);
    }
  }

  // ============================================================
  // HANDLE CONFIRMATION
  // ============================================================

  async function handleConfirm() {
    if (!confirmation || processingOrderId !== null) {
      return;
    }

    if (confirmation.type === "cancel") {
      await cancelOrder(confirmation.order);
      return;
    }

    if (confirmation.type === "remove") {
      await removeFromHistory(confirmation.order);
    }
  }

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div
        role="status"
        className="space-y-4"
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white"
          >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 bg-zinc-50 p-4 sm:p-5">
              <div>
                <div className="h-5 w-28 rounded bg-zinc-200" />

                <div className="mt-2 h-3 w-36 rounded bg-zinc-200" />
              </div>

              <div className="h-6 w-20 rounded-full bg-zinc-200" />
            </div>

            <div className="p-4 sm:p-5">
              <div className="h-4 w-3/5 rounded bg-zinc-100" />

              <div className="mt-3 h-4 w-2/5 rounded bg-zinc-100" />

              <div className="mt-6 h-12 rounded bg-zinc-100" />
            </div>
          </div>
        ))}

        <span className="sr-only">
          Loading your orders...
        </span>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <p className="font-medium text-red-700">
          {error}
        </p>

        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="min-h-11 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Try again
          </button>

          <Link
            href="/login"
            className="flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-red-100"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-12 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
          <Package
            size={23}
            className="text-zinc-500"
          />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-zinc-950 sm:text-2xl">
          No orders yet
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 sm:text-base">
          Your purchases will appear here after checkout.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Browse products
        </Link>
      </div>
    );
  }

  // ============================================================
  // ORDER HISTORY
  // ============================================================

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        {orders.map((order) => {
          const isProcessing =
            processingOrderId === order.id;

          const hasActionInProgress =
            processingOrderId !== null;

          // Orders can be cancelled before shipping.

          const canCancel =
            order.status === "PLACED" ||
            order.status === "PROCESSING";

          // Cancelled orders can be hidden from history.

          const canRemove =
            order.status === "CANCELLED";

          const actionError =
            actionErrors[order.id];

          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              {/* ====================================================
                  ORDER HEADER
              ==================================================== */}

              <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:items-center sm:p-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-zinc-950 sm:text-lg">
                    Order #{order.id}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${statusClass(
                    order.status
                  )}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* ====================================================
                  ORDER BODY
              ==================================================== */}

              <div className="p-4 sm:p-5">
                <div className="divide-y divide-zinc-100">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.productId}`}
                          className="line-clamp-2 text-sm font-medium leading-5 text-zinc-900 transition hover:text-zinc-600 sm:text-base"
                        >
                          {item.productName}
                        </Link>

                        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                          {item.quantity} ×{" "}
                          {formatKRW(item.unitPrice)}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-zinc-950 sm:text-base">
                        {formatKRW(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ==================================================
                    ORDER TOTAL
                ================================================== */}

                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">
                        Order total
                      </p>

                      <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                        {formatKRW(order.totalAmount)}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      aria-label={`View order ${order.id}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800 sm:hidden"
                    >
                      <ArrowRight size={17} />
                    </Link>

                    <Link
                      href={`/orders/${order.id}`}
                      className="hidden min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:inline-flex"
                    >
                      View order
                    </Link>
                  </div>
                </div>

                {/* ==================================================
                    ACTION ERROR
                ================================================== */}

                {actionError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
                  >
                    {actionError}
                  </div>
                )}

                {/* ==================================================
                    ORDER ACTIONS
                ================================================== */}

                {(canCancel || canRemove) && (
                  <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:flex-wrap">
                    {/* CANCEL ORDER */}

                    {canCancel && (
                      <button
                        type="button"
                        disabled={hasActionInProgress}
                        onClick={() =>
                          requestCancelOrder(order)
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={17} />

                        {isProcessing
                          ? "Cancelling..."
                          : "Cancel order"}
                      </button>
                    )}

                    {/* REMOVE FROM HISTORY */}

                    {canRemove && (
                      <button
                        type="button"
                        disabled={hasActionInProgress}
                        onClick={() =>
                          requestRemoveFromHistory(order)
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={17} />

                        {isProcessing
                          ? "Removing..."
                          : "Remove from history"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ============================================================
          CUSTOM AGORA CONFIRMATION DIALOG
      ============================================================ */}

      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && processingOrderId === null) {
            setConfirmation(null);
          }
        }}
        title={
          confirmation?.type === "cancel"
            ? `Cancel Order #${confirmation.order.id}?`
            : `Remove Order #${confirmation?.order.id} from history?`
        }
        description={
          confirmation?.type === "cancel" ? (
            <>
              Are you sure you want to cancel this order?
              <br />
              <br />
              If cancellation succeeds, the reserved products
              will be returned to inventory.
              <br />
              <br />
              If payment was completed, a refund will be
              requested.
            </>
          ) : (
            <>
              This will hide the order from your account.
              <br />
              <br />
              Your payment and transaction records will
              remain unchanged.
            </>
          )
        }
        confirmLabel={
          confirmation?.type === "cancel"
            ? "Cancel order"
            : "Remove order"
        }
        cancelLabel="Go back"
        variant="danger"
        loading={processingOrderId !== null}
        onConfirm={handleConfirm}
      />
    </>
  );
}
