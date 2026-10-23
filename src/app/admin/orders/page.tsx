import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  PackageSearch,
} from "lucide-react";

import {
  getAdminOrders,
} from "@/lib/admin-api";
import { formatKRW } from "@/lib/format";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/types/admin-order";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;

  const parsedPage = Number(
    params.page ?? "0"
  );

  const page =
    Number.isInteger(parsedPage) &&
    parsedPage >= 0
      ? parsedPage
      : 0;

  const selectedStatus =
    ORDER_STATUSES.find(
      (value) =>
        value === params.status
    ) ?? null;

  let data;

  try {
    data = await getAdminOrders(
      page,
      20,
      selectedStatus ?? undefined
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHENTICATED"
    ) {
      redirect(
        "/login?next=/admin/orders"
      );
    }

    throw error;
  }

  function pageHref(
    targetPage: number
  ) {
    const query =
      new URLSearchParams();

    query.set(
      "page",
      String(targetPage)
    );

    if (selectedStatus) {
      query.set(
        "status",
        selectedStatus
      );
    }

    return `/admin/orders?${query.toString()}`;
  }

  return (
    <div className="min-w-0">
      <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
            Order management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Orders
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            Manage payments,
            fulfillment, shipments, and
            deliveries.
          </p>
        </div>

        <p className="text-sm font-medium text-zinc-500">
          {data.totalElements}{" "}
          {data.totalElements === 1
            ? "order"
            : "orders"}
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto border-b border-zinc-200">
          <div className="flex min-w-max gap-2 p-3 sm:p-4">
            <Link
              href="/admin/orders"
              className={`flex min-h-10 items-center rounded-xl px-4 text-sm font-medium transition ${
                selectedStatus === null
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              All
            </Link>

            {ORDER_STATUSES.map(
              (
                value: OrderStatus
              ) => (
                <Link
                  key={value}
                  href={`/admin/orders?status=${value}`}
                  className={`flex min-h-10 items-center rounded-xl px-4 text-sm font-medium transition ${
                    selectedStatus ===
                    value
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {value}
                </Link>
              )
            )}
          </div>
        </div>

        {data.content.length === 0 ? (
          <div className="px-5 py-14 text-center sm:p-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <PackageSearch
                size={21}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-zinc-950">
              No orders found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              There are no orders
              matching this filter.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 md:hidden">
              {data.content.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block p-4 transition hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-950">
                          Order #
                          {order.id}
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm font-medium text-zinc-700">
                          {
                            order.customerName
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {
                            order.customerEmail
                          }
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-zinc-950">
                          {formatKRW(
                            order.totalAmount
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-zinc-400">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                            order.status
                          )}`}
                        >
                          {
                            order.status
                          }
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${paymentClass(
                            order.paymentStatus
                          )}`}
                        >
                          {
                            order.paymentStatus
                          }
                        </span>
                      </div>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
                        <ArrowRight
                          size={15}
                        />
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-medium lg:px-6">
                      Order
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Date
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Fulfillment
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Payment
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Total
                    </th>

                    <th className="px-5 py-4 text-right font-medium lg:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.content.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-zinc-50"
                      >
                        <td className="px-5 py-5 lg:px-6">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold hover:underline"
                          >
                            #{order.id}
                          </Link>
                        </td>

                        <td className="px-5 py-5 lg:px-6">
                          <p className="max-w-48 truncate font-medium">
                            {
                              order.customerName
                            }
                          </p>

                          <p className="mt-1 max-w-56 truncate text-xs text-zinc-500">
                            {
                              order.customerEmail
                            }
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-zinc-600 lg:px-6">
                          {formatDate(
                            order.createdAt
                          )}
                        </td>

                        <td className="px-5 py-5 lg:px-6">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              order.status
                            )}`}
                          >
                            {
                              order.status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5 lg:px-6">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 font-semibold lg:px-6">
                          {formatKRW(
                            order.totalAmount
                          )}
                        </td>

                        <td className="px-5 py-5 text-right lg:px-6">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-zinc-700 hover:text-zinc-950 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {data.totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <p className="text-center text-xs text-zinc-500 sm:text-left sm:text-sm">
              Page {data.number + 1} of{" "}
              {data.totalPages}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {data.number > 0 ? (
                <Link
                  href={pageHref(
                    data.number - 1
                  )}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium transition hover:bg-zinc-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-100 px-4 text-sm text-zinc-300">
                  Previous
                </span>
              )}

              {data.number + 1 <
              data.totalPages ? (
                <Link
                  href={pageHref(
                    data.number + 1
                  )}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium transition hover:bg-zinc-50"
                >
                  Next
                </Link>
              ) : (
                <span className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-100 px-4 text-sm text-zinc-300">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
