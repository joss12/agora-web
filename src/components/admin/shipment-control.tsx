"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
} from "lucide-react";

import type { OrderStatus } from "@/types/admin-order";
import type { Shipment } from "@/types/shipment";

interface ShipmentControlProps {
  orderId: number;
  orderStatus: OrderStatus;
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-KR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export function ShipmentControl({
  orderId,
  orderStatus,
}: ShipmentControlProps) {
  const router = useRouter();

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [carrier, setCarrier] =
    useState("");

  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState("");

  const [
    loadingShipment,
    setLoadingShipment,
  ] = useState(
    orderStatus === "SHIPPED" ||
      orderStatus === "DELIVERED"
  );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadShipment =
    useCallback(async () => {
      if (
        orderStatus !== "SHIPPED" &&
        orderStatus !== "DELIVERED"
      ) {
        setLoadingShipment(false);
        return;
      }

      setLoadingShipment(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/orders/${orderId}/shipment`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (
          response.status === 404
        ) {
          setShipment(null);
          return;
        }

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null);

          throw new Error(
            data?.message ??
              "Unable to load shipment"
          );
        }

        const data: Shipment =
          await response.json();

        setShipment(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load shipment"
        );
      } finally {
        setLoadingShipment(false);
      }
    }, [orderId, orderStatus]);

  useEffect(() => {
    void loadShipment();
  }, [loadShipment]);

  async function createShipment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const normalizedCarrier =
      carrier.trim();

    const normalizedTracking =
      trackingNumber.trim();

    if (!normalizedCarrier) {
      setError(
        "Carrier is required."
      );
      return;
    }

    if (!normalizedTracking) {
      setError(
        "Tracking number is required."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/shipment`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            carrier:
              normalizedCarrier,
            trackingNumber:
              normalizedTracking,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to create shipment"
        );
      }

      setShipment(
        data as Shipment
      );

      setCarrier("");
      setTrackingNumber("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create shipment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function markDelivered() {
    if (submitting) {
      return;
    }

    const confirmed =
      window.confirm(
        `Mark Order #${orderId} as delivered?`
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/shipment/delivered`,
        {
          method: "PATCH",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to mark shipment as delivered"
        );
      }

      setShipment(
        data as Shipment
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update shipment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (orderStatus === "PLACED") {
    return null;
  }

  if (
    orderStatus === "CANCELLED"
  ) {
    return null;
  }

  if (
    orderStatus === "PROCESSING"
  ) {
    return (
      <div className="mt-6 border-t border-zinc-200 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <Truck size={17} />
          </span>

          <div>
            <h3 className="font-semibold text-zinc-950">
              Create shipment
            </h3>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Enter the carrier and
              tracking number before
              shipping this order.
            </p>
          </div>
        </div>

        <form
          onSubmit={createShipment}
          className="mt-5 space-y-4"
        >
          <div>
            <label
              htmlFor="carrier"
              className="text-sm font-medium text-zinc-800"
            >
              Carrier
            </label>

            <input
              id="carrier"
              type="text"
              value={carrier}
              onChange={(event) =>
                setCarrier(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="CJ Logistics"
              disabled={submitting}
              className="mt-2 min-h-12 w-full rounded-xl border border-zinc-300 px-3.5 text-base outline-none transition focus:border-zinc-950 disabled:bg-zinc-100 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="tracking-number"
              className="text-sm font-medium text-zinc-800"
            >
              Tracking number
            </label>

            <input
              id="tracking-number"
              type="text"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value
                )
              }
              maxLength={150}
              placeholder="123456789012"
              disabled={submitting}
              className="mt-2 min-h-12 w-full rounded-xl border border-zinc-300 px-3.5 text-base outline-none transition focus:border-zinc-950 disabled:bg-zinc-100 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Shipping..."
              : "Ship order"}
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <PackageCheck size={17} />
        </span>

        <h3 className="font-semibold text-zinc-950">
          Shipment
        </h3>
      </div>

      {loadingShipment ? (
        <div className="mt-4 animate-pulse rounded-xl bg-zinc-50 p-4">
          <div className="h-4 w-28 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-44 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-32 rounded bg-zinc-200" />
        </div>
      ) : shipment ? (
        <div className="mt-4 space-y-4">
          <div className="min-w-0 rounded-xl bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Carrier
                </p>

                <p className="mt-1 break-words font-semibold text-zinc-950">
                  {shipment.carrier}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${
                  shipment.status ===
                  "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {shipment.status}
              </span>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-4">
              <p className="text-xs text-zinc-500">
                Tracking number
              </p>

              <p className="mt-1.5 break-all text-sm font-medium text-zinc-950">
                {
                  shipment.trackingNumber
                }
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs text-zinc-500">
                Shipped
              </p>

              <p className="mt-1 text-sm leading-5 text-zinc-800">
                {formatDate(
                  shipment.shippedAt
                )}
              </p>
            </div>

            {shipment.deliveredAt && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500">
                  Delivered
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-800">
                  {formatDate(
                    shipment.deliveredAt
                  )}
                </p>
              </div>
            )}
          </div>

          {orderStatus ===
            "SHIPPED" && (
            <button
              type="button"
              onClick={markDelivered}
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2
                size={17}
              />

              {submitting
                ? "Updating..."
                : "Mark as delivered"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-amber-50 p-3.5 text-sm leading-6 text-amber-800">
          No shipment information is
          available for this order.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
