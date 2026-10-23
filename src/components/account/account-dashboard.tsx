"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import type {
  Order,
  Shipment,
} from "@/types/order";
import { formatKRW } from "@/lib/format";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PROCESSING":
    case "PLACED":
      return "bg-amber-50 text-amber-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function progressState(
  currentStatus: string,
  targetStatus: string
) {
  const steps = [
    "PLACED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentIndex = steps.indexOf(
    currentStatus
  );

  const targetIndex = steps.indexOf(
    targetStatus
  );

  if (currentIndex === -1) {
    return "future";
  }

  if (targetIndex < currentIndex) {
    return "complete";
  }

  if (targetIndex === currentIndex) {
    return "current";
  }

  return "future";
}

export function AccountDashboard() {
  const [orders, setOrders] = useState<
    Order[]
  >([]);

  const [activeShipment, setActiveShipment] =
    useState<Shipment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadAccount =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/orders",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          window.location.href =
            "/login?next=/account";
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "Your account cannot access customer orders."
          );
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load your account."
          );
        }

        const data: Order[] =
          await response.json();

        setOrders(data);

        const shippedOrder = data.find(
          (order) =>
            order.status === "SHIPPED"
        );

        if (!shippedOrder) {
          setActiveShipment(null);
          return;
        }

        const shipmentResponse =
          await fetch(
            `/orders/${shippedOrder.id}/shipment`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (
          shipmentResponse.status === 401
        ) {
          window.location.href =
            "/login?next=/account";
          return;
        }

        if (
          shipmentResponse.status === 404
        ) {
          setActiveShipment(null);
          return;
        }

        if (!shipmentResponse.ok) {
          throw new Error(
            "Unable to load shipment information."
          );
        }

        const shipmentData: Shipment =
          await shipmentResponse.json();

        setActiveShipment(
          shipmentData
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your account."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const processingOrders =
    orders.filter(
      (order) =>
        order.status === "PLACED" ||
        order.status === "PROCESSING"
    );

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "SHIPPED"
  );

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "DELIVERED"
    );

  const completedValue =
    deliveredOrders.reduce(
      (total, order) =>
        total + order.totalAmount,
      0
    );

  const recentOrders =
    orders.slice(0, 4);

  const activeOrder =
    activeShipment
      ? orders.find(
          (order) =>
            order.id ===
            activeShipment.orderId
        ) ?? null
      : null;

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="animate-pulse">
          <div className="h-8 w-44 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-72 max-w-full rounded bg-zinc-100" />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-zinc-100 sm:h-32"
                />
              )
            )}
          </div>

          <div className="mt-8 h-80 rounded-2xl bg-zinc-100" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <h1 className="text-lg font-semibold text-red-800 sm:text-xl">
            Unable to load account
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-700 sm:text-base">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadAccount()
            }
            className="mt-5 min-h-11 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-sm">
            Agora
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            My Account
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
            Manage your purchases,
            deliveries, and order history.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
        >
          Continue shopping
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={String(orders.length)}
          icon={<ShoppingBag size={18} />}
        />

        <StatCard
          label="Processing"
          value={String(
            processingOrders.length
          )}
          icon={<Box size={18} />}
        />

        <StatCard
          label="On the way"
          value={String(
            shippedOrders.length
          )}
          icon={<Truck size={18} />}
        />

        <StatCard
          label="Delivered value"
          value={formatKRW(
            completedValue
          )}
          icon={<Package size={18} />}
          compact
        />
      </section>

      {activeShipment &&
        activeOrder && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:mt-10">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-xs">
                  Active delivery
                </p>

                <h2 className="mt-1 truncate text-lg font-semibold text-zinc-950 sm:text-xl">
                  Order #{activeOrder.id}
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:px-3 sm:text-xs">
                {activeShipment.status}
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-base font-semibold text-zinc-950 sm:text-lg">
                    {activeOrder.items[0]
                      ?.productName ??
                      `Order #${activeOrder.id}`}
                  </p>

                  {activeOrder.items.length >
                    1 && (
                    <p className="mt-1 text-sm text-zinc-500">
                      +
                      {activeOrder.items
                        .length - 1}{" "}
                      more{" "}
                      {activeOrder.items
                        .length -
                        1 ===
                      1
                        ? "item"
                        : "items"}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                    {formatDate(
                      activeOrder.createdAt
                    )}
                  </p>
                </div>

                <p className="shrink-0 text-xl font-bold tracking-tight text-zinc-950">
                  {formatKRW(
                    activeOrder.totalAmount
                  )}
                </p>
              </div>

              <div className="mt-6 grid gap-4 rounded-xl bg-zinc-50 p-4 sm:mt-8 sm:grid-cols-2 sm:p-5">
                <DeliveryDetail
                  label="Carrier"
                  value={
                    activeShipment.carrier
                  }
                />

                <DeliveryDetail
                  label="Tracking number"
                  value={
                    activeShipment.trackingNumber
                  }
                  breakAll
                />

                <DeliveryDetail
                  label="Shipped"
                  value={
                    activeShipment.shippedAt
                      ? formatDate(
                          activeShipment.shippedAt
                        )
                      : "—"
                  }
                />

                <DeliveryDetail
                  label="Destination"
                  value={`[${activeOrder.postalCode}] ${activeOrder.address}`}
                />
              </div>

              <div className="mt-7 sm:mt-8">
                <DeliveryProgress
                  status={
                    activeOrder.status
                  }
                />
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                <Link
                  href={`/orders/${activeOrder.id}`}
                  className="flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-5"
                >
                  Track order
                </Link>

                <Link
                  href="/orders"
                  className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-zinc-50 sm:px-5"
                >
                  All orders
                </Link>
              </div>
            </div>
          </section>
        )}

      <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:items-center sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
                Recent orders
              </h2>

              <p className="mt-1 hidden text-sm text-zinc-500 sm:block">
                Your latest purchases and
                their current status.
              </p>
            </div>

            <Link
              href="/orders"
              className="shrink-0 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-4 py-12 text-center sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <ShoppingBag
                  size={21}
                  className="text-zinc-500"
                />
              </div>

              <h3 className="mt-4 font-semibold">
                No orders yet
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Your purchases will appear
                here.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {recentOrders.map(
                (order) => (
                  <article
                    key={order.id}
                    className="p-4 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-semibold text-zinc-950 hover:underline"
                          >
                            Order #{order.id}
                          </Link>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${statusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm font-medium text-zinc-900 sm:text-base">
                          {order.items[0]
                            ?.productName ??
                            "Order"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 sm:text-sm">
                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <span className="hidden sm:inline">
                            ·
                          </span>

                          <span>
                            {
                              order.items
                                .length
                            }{" "}
                            {order.items
                              .length === 1
                              ? "item"
                              : "items"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-zinc-950 sm:text-base">
                          {formatKRW(
                            order.totalAmount
                          )}
                        </p>

                        <Link
                          href={`/orders/${order.id}`}
                          aria-label={`View order ${order.id}`}
                          className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-950 sm:hidden"
                        >
                          <ArrowRight
                            size={16}
                          />
                        </Link>

                        <Link
                          href={`/orders/${order.id}`}
                          className="mt-2 hidden text-sm font-semibold hover:underline sm:inline-block"
                        >
                          View order →
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold text-zinc-950">
              Orders
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <SidebarRow
                label="Processing"
                value={
                  processingOrders.length
                }
              />

              <SidebarRow
                label="Shipped"
                value={
                  shippedOrders.length
                }
              />

              <SidebarRow
                label="Delivered"
                value={
                  deliveredOrders.length
                }
              />
            </div>

            <Link
              href="/orders"
              className="mt-6 flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-zinc-50"
            >
              My orders
            </Link>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold text-zinc-950">
              Account
            </h2>

            <div className="mt-4 space-y-1">
              <Link
                href="/orders"
                className="block rounded-lg px-3 py-2.5 text-sm transition hover:bg-zinc-50"
              >
                Order history
              </Link>

              <div className="rounded-lg px-3 py-2.5 text-sm text-zinc-400">
                Saved addresses
                <span className="ml-2 text-[10px] uppercase tracking-wide">
                  Soon
                </span>
              </div>

              <div className="rounded-lg px-3 py-2.5 text-sm text-zinc-400">
                Profile settings
                <span className="ml-2 text-[10px] uppercase tracking-wide">
                  Soon
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-zinc-500 sm:text-sm">
          {label}
        </p>

        <span className="hidden text-zinc-400 sm:block">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 truncate font-bold tracking-tight text-zinc-950 ${
          compact
            ? "text-lg sm:text-2xl"
            : "text-2xl sm:text-3xl"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function DeliveryDetail({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-medium leading-6 text-zinc-900 ${
          breakAll
            ? "break-all"
            : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DeliveryProgress({
  status,
}: {
  status: string;
}) {
  const steps = [
    "PLACED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  return (
    <div className="grid grid-cols-4">
      {steps.map((step, index) => {
        const state =
          progressState(
            status,
            step
          );

        return (
          <div
            key={step}
            className="relative min-w-0 text-center"
          >
            {index > 0 && (
              <div
                className={`absolute right-1/2 top-2.5 h-0.5 w-full ${
                  state === "complete"
                    ? "bg-zinc-950"
                    : "bg-zinc-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 mx-auto h-5 w-5 rounded-full border-2 ${
                state === "complete"
                  ? "border-zinc-950 bg-zinc-950"
                  : state ===
                      "current"
                    ? "border-zinc-950 bg-white"
                    : "border-zinc-300 bg-white"
              }`}
            />

            <p
              className={`mt-2 truncate px-0.5 text-[9px] font-medium min-[380px]:text-[10px] sm:mt-3 sm:text-xs ${
                state === "future"
                  ? "text-zinc-400"
                  : "text-zinc-900"
              }`}
            >
              {step.charAt(0) +
                step
                  .slice(1)
                  .toLowerCase()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SidebarRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">
        {label}
      </span>

      <span className="font-semibold text-zinc-950">
        {value}
      </span>
    </div>
  );
}
