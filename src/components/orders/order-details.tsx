"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import type {
  Order,
  Payment,
  Shipment,
} from "@/types/order";

import { formatKRW } from "@/lib/format";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaymentSimulator } from "./payment-simulator";
import { TossPayment } from "./toss-payment";

interface OrderDetailsProps {
  orderId: string;
}

type ConfirmationAction = "cancel" | "delivery" | null;

const ORDER_STEPS = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStepIndex(status: string) {
  return ORDER_STEPS.indexOf(
    status as (typeof ORDER_STEPS)[number]
  );
}

function formatStatus(status: string) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

export function OrderDetails({
  orderId,
}: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(
    null
  );

  const [cancelling, setCancelling] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] =
    useState(false);

  const [confirmation, setConfirmation] =
    useState<ConfirmationAction>(null);

  // ============================================================
  // LOAD ORDER
  // ============================================================

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOrder(null);
      setPayment(null);
      setShipment(null);

      const orderResponse = await fetch(
        `/api/orders/${orderId}`,
        { cache: "no-store" }
      );

      if (orderResponse.status === 401) {
        window.location.href =
          `/login?next=/orders/${orderId}`;
        return;
      }

      if (orderResponse.status === 403) {
        throw new Error(
          "You do not have permission to view this order."
        );
      }

      if (orderResponse.status === 404) {
        throw new Error("Order not found.");
      }

      if (!orderResponse.ok) {
        throw new Error("Unable to load your order.");
      }

      const orderData: Order = await orderResponse.json();
      setOrder(orderData);

      const paymentResponse = await fetch(
        `/api/orders/${orderId}/payment`,
        { cache: "no-store" }
      );

      if (paymentResponse.status === 401) {
        window.location.href =
          `/login?next=/orders/${orderId}`;
        return;
      }

      if (paymentResponse.ok) {
        const paymentData: Payment =
          await paymentResponse.json();

        setPayment(paymentData);
      }

      if (
        orderData.status === "SHIPPED" ||
        orderData.status === "DELIVERED"
      ) {
        const shipmentResponse = await fetch(
          `/api/orders/${orderId}/shipment`,
          { cache: "no-store" }
        );

        if (shipmentResponse.status === 401) {
          window.location.href =
            `/login?next=/orders/${orderId}`;
          return;
        }

        if (shipmentResponse.ok) {
          const shipmentData: Shipment =
            await shipmentResponse.json();

          setShipment(shipmentData);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  // ============================================================
  // CANCEL ORDER
  // ============================================================

  async function cancelOrder() {
    if (!order || cancelling) return;

    if (payment?.tossOrderId != null) {
      const message =
        "This order has an existing Toss payment. " +
        "Payment status must be verified before cancellation.";

      setActionError(message);
      toast.error(message);
      return;
    }

    setCancelling(true);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/orders/${order.id}/cancel`,
        { method: "PATCH" }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?next=/orders/${order.id}`;
        return;
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to cancel this order."
        );
      }

      const updatedOrder: Order = await response.json();
      setOrder(updatedOrder);

      const paymentResponse = await fetch(
        `/api/orders/${order.id}/payment`,
        { cache: "no-store" }
      );

      if (paymentResponse.ok) {
        const updatedPayment: Payment =
          await paymentResponse.json();

        setPayment(updatedPayment);
      }

      setConfirmation(null);

      toast.success(
        `Order #${order.id} cancelled successfully.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to cancel this order.";

      setActionError(message);
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }

  // ============================================================
  // CONFIRM DELIVERY
  // ============================================================

  async function confirmDelivery() {
    if (!order || confirmingDelivery) return;

    setConfirmingDelivery(true);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/orders/${order.id}/shipment/confirm-delivery`,
        { method: "PATCH" }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?next=/orders/${order.id}`;
        return;
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to confirm delivery."
        );
      }

      const updatedShipment: Shipment =
        await response.json();

      setShipment(updatedShipment);

      setOrder((current) =>
        current
          ? {
              ...current,
              status: "DELIVERED",
            }
          : current
      );

      setConfirmation(null);

      toast.success(
        `Delivery confirmed for Order #${order.id}.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to confirm delivery.";

      setActionError(message);
      toast.error(message);
    } finally {
      setConfirmingDelivery(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-gray-500">
          Loading your order...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Unable to display order
        </h1>

        <p
          role="alert"
          className="mt-3 text-sm text-red-600 sm:text-base"
        >
          {error ?? "Order unavailable."}
        </p>

        <Link
          href="/orders"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          Back to my orders
        </Link>
      </main>
    );
  }

  // ============================================================
  // DERIVED STATE
  // ============================================================

  const currentStep = getStepIndex(order.status);
  const cancelled = order.status === "CANCELLED";

  const canPayWithToss =
    order.status === "PLACED" &&
    payment !== null &&
    (payment.status === "PENDING" ||
      payment.status === "FAILED");

  const tossPaid =
    payment?.status === "PAID" &&
    payment.transactionReference !== null &&
    !payment.transactionReference.startsWith("SIM-");

  const hasTossPayment =
    payment?.tossOrderId != null;

  const orderName =
    order.items.length > 1
      ? `${order.items[0].productName} + ${
          order.items.length - 1
        } more`
      : order.items[0]?.productName ?? "Agora order";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* BREADCRUMB */}

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex min-w-0 items-center gap-2 text-sm text-gray-500"
      >
        <Link
          href="/orders"
          className="shrink-0 transition-colors hover:text-black"
        >
          My Orders
        </Link>

        <span className="text-gray-300">/</span>

        <span className="truncate">
          Order #{order.id}
        </span>
      </nav>

      {/* ORDER HEADER */}

      <div className="mb-7 sm:mb-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Order details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:mt-2 sm:text-3xl">
              Order #{order.id}
            </h1>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
              cancelled
                ? "bg-red-50 text-red-700"
                : order.status === "DELIVERED"
                  ? "bg-green-50 text-green-700"
                  : order.status === "SHIPPED"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      {/* ORDER PROGRESS */}

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:mb-8 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">
          Order progress
        </h2>

        {cancelled ? (
          <div className="mt-5 rounded-xl bg-red-50 p-4">
            <p className="font-medium text-red-700">
              This order was cancelled.
            </p>

            {payment?.status === "REFUNDED" && (
              <p className="mt-1 text-sm text-red-600">
                Your payment has been refunded.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-2">
            {ORDER_STEPS.map((step, index) => {
              const complete = index <= currentStep;

              return (
                <div key={step} className="min-w-0">
                  <div
                    className={`h-1.5 rounded-full sm:h-2 ${
                      complete
                        ? "bg-black"
                        : "bg-gray-200"
                    }`}
                  />

                  <p
                    className={`mt-2 truncate text-[10px] font-medium sm:mt-3 sm:text-sm ${
                      complete
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  >
                    {formatStatus(step)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SHIPMENT */}

      {shipment && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                Shipment
              </p>

              <h2 className="mt-1 break-words text-lg font-semibold sm:text-xl">
                {shipment.carrier}
              </h2>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${
                shipment.status === "DELIVERED"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {shipment.status}
            </span>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-gray-500">
                Tracking number
              </dt>

              <dd className="mt-1 break-all font-semibold">
                {shipment.trackingNumber}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">
                Shipped
              </dt>

              <dd className="mt-1 text-sm sm:text-base">
                {formatDate(shipment.shippedAt)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">
                Delivered
              </dt>

              <dd className="mt-1 text-sm sm:text-base">
                {formatDate(shipment.deliveredAt)}
              </dd>
            </div>
          </dl>

          {order.status === "SHIPPED" && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                type="button"
                disabled={confirmingDelivery}
                onClick={() => setConfirmation("delivery")}
                className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {confirmingDelivery
                  ? "Confirming..."
                  : "Confirm delivery"}
              </button>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Confirm only after you have received
                your package.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ACTION ERROR */}

      {actionError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mb-8"
        >
          {actionError}
        </div>
      )}

      {/* MAIN CONTENT */}

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* LEFT COLUMN */}

        <div className="min-w-0 space-y-6 sm:space-y-8 lg:col-span-2">
          {/* ORDER ITEMS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">
              Order items
            </h2>

            <div className="mt-5 divide-y divide-gray-200 sm:mt-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.productId}`}
                      className="break-words font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatKRW(item.unitPrice)}
                      {" × "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold sm:text-right">
                    {formatKRW(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-gray-200 pt-5 text-base font-semibold sm:text-lg">
              <span>Total</span>

              <span className="text-right">
                {formatKRW(order.totalAmount)}
              </span>
            </div>
          </section>

          {/* DELIVERY DETAILS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">
              Delivery details
            </h2>

            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">
                  Recipient
                </dt>

                <dd className="mt-1 break-words font-medium">
                  {order.recipientName}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Phone number
                </dt>

                <dd className="mt-1 break-words">
                  {order.phoneNumber}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-500">
                  Address
                </dt>

                <dd className="mt-1 break-words leading-6">
                  <p>
                    [{order.postalCode}]{" "}
                    {order.address}
                  </p>

                  {order.addressDetail && (
                    <p className="mt-1">
                      {order.addressDetail}
                    </p>
                  )}
                </dd>
              </div>

              {order.deliveryInstructions && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-gray-500">
                    Delivery instructions
                  </dt>

                  <dd className="mt-1 break-words leading-6">
                    {order.deliveryInstructions}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* RIGHT COLUMN */}

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          {/* TOSS PAYMENTS */}

          {canPayWithToss && payment && (
            <TossPayment
              orderId={order.id}
              amount={payment.amount}
              orderName={orderName}
              customerName={order.recipientName}
            />
          )}

          {/* PAYMENT DETAILS */}

          {payment ? (
            <PaymentSimulator
              orderId={order.id}
              payment={payment}
              onPaymentUpdated={(updatedPayment) => {
                setPayment(updatedPayment);
                void loadOrder();
              }}
            />
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">
                Payment
              </h2>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                Payment information is currently unavailable.
              </p>
            </section>
          )}

          {/* TOSS PAYMENT NOTICE */}

          {tossPaid && order.status === "PLACED" && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
              <h2 className="font-semibold text-amber-950">
                Toss payment completed
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Your payment has been confirmed through
                Toss Payments. Automatic cancellation
                and refunds are not available yet.
              </p>
            </section>
          )}

          {/* CANCEL ORDER */}

          {order.status === "PLACED" &&
            !hasTossPayment &&
            payment !== null && (
              <section className="rounded-2xl border border-red-200 bg-white p-4 sm:p-6">
                <h2 className="font-semibold">
                  Cancel order
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  You can cancel this order before
                  processing begins.
                </p>

                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setConfirmation("cancel")}
                  className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel order"}
                </button>
              </section>
            )}

          {/* NAVIGATION */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/orders"
              className="flex min-h-12 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium transition hover:bg-gray-50"
            >
              My orders
            </Link>

            <Link
              href="/products"
              className="flex min-h-12 items-center justify-center rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>

      {/* CUSTOM CONFIRMATION DIALOG */}

      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (
            !open &&
            !cancelling &&
            !confirmingDelivery
          ) {
            setConfirmation(null);
          }
        }}
        title={
          confirmation === "cancel"
            ? `Cancel Order #${order.id}?`
            : "Confirm delivery?"
        }
        description={
          confirmation === "cancel"
            ? "Are you sure you want to cancel this order? This action cannot be undone."
            : "Please confirm that you have received your package. The order will be marked as delivered."
        }
        confirmLabel={
          confirmation === "cancel"
            ? "Cancel order"
            : "Confirm delivery"
        }
        cancelLabel="Go back"
        variant={
          confirmation === "cancel"
            ? "danger"
            : "default"
        }
        loading={cancelling || confirmingDelivery}
        onConfirm={async () => {
          if (confirmation === "cancel") {
            await cancelOrder();
          } else if (confirmation === "delivery") {
            await confirmDelivery();
          }
        }}
      />
    </main>
  );
}
