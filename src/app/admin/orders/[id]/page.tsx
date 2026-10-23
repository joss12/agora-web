import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import {
  getAdminOrder,
} from "@/lib/admin-api";
import { formatKRW } from "@/lib/format";

import { OrderStatusControl } from "@/components/admin/order-status-control";
import { ShipmentControl } from "@/components/admin/shipment-control";

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PROCESSING":
      return "bg-amber-50 text-amber-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function paymentClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    case "REFUNDED":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default async function AdminOrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  let order;

  try {
    order = await getAdminOrder(
      Number(id)
    );
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "NOT_FOUND"
      ) {
        notFound();
      }

      if (
        error.message ===
        "UNAUTHENTICATED"
      ) {
        redirect(
          `/login?next=/admin/orders/${id}`
        );
      }
    }

    throw error;
  }

  return (
    <div className="min-w-0">
      <Link
        href="/admin/orders"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Order details
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Order #{order.id}
          </h1>

          <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-zinc-600">
            <Mail
              size={15}
              className="shrink-0"
            />

            <span className="truncate">
              {order.customerEmail}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
              order.status
            )}`}
          >
            {order.status}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentClass(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-7 grid min-w-0 gap-6 sm:mt-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
              Order items
            </h2>

            <div className="mt-5 divide-y divide-zinc-100 sm:mt-6">
              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-zinc-950">
                        {
                          item.productName
                        }
                      </p>

                      <p className="mt-1 break-all text-xs text-zinc-500 sm:text-sm">
                        SKU: {item.sku}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatKRW(
                          item.unitPrice
                        )}{" "}
                        × {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-zinc-950 sm:text-right">
                      {formatKRW(
                        item.subtotal
                      )}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-200 pt-5 sm:mt-6 sm:pt-6">
              <span className="font-semibold text-zinc-700">
                Total
              </span>

              <span className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                {formatKRW(
                  order.totalAmount
                )}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
              Delivery information
            </h2>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <User size={15} />
                  Recipient
                </dt>

                <dd className="mt-2 break-words font-medium text-zinc-950">
                  {
                    order.recipientName
                  }
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <Phone size={15} />
                  Phone
                </dt>

                <dd className="mt-2 break-words font-medium text-zinc-950">
                  {
                    order.phoneNumber
                  }
                </dd>
              </div>

              <div>
                <dt className="text-sm text-zinc-500">
                  Postal code
                </dt>

                <dd className="mt-2 font-medium text-zinc-950">
                  {order.postalCode}
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <MapPin size={15} />
                  Address
                </dt>

                <dd className="mt-2 break-words font-medium leading-6 text-zinc-950">
                  {order.address}

                  {order.addressDetail && (
                    <span className="mt-1 block">
                      {
                        order.addressDetail
                      }
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {order.deliveryInstructions && (
              <div className="mt-6 border-t border-zinc-200 pt-6">
                <p className="text-sm text-zinc-500">
                  Delivery instructions
                </p>

                <p className="mt-2 break-words text-sm leading-6 text-zinc-800 sm:text-base">
                  {
                    order.deliveryInstructions
                  }
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="min-w-0">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
              Fulfillment
            </h2>

            <div className="mt-6">
              <OrderStatusControl
                orderId={order.id}
                status={order.status}
                paymentStatus={
                  order.paymentStatus
                }
              />
            </div>

            <ShipmentControl
              orderId={order.id}
              orderStatus={
                order.status
              }
            />

            {order.paymentStatus && (
              <div className="mt-6 border-t border-zinc-200 pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Payment
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(
                    order.paymentStatus
                  )}`}
                >
                  {
                    order.paymentStatus
                  }
                </span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
