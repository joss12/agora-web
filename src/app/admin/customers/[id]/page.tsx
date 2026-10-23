import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  UserRound,
} from "lucide-react";

import { getAdminCustomer } from "@/lib/admin-api";
import { formatKRW } from "@/lib/format";

interface AdminCustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(
  firstName: string,
  lastName: string
) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getOrderStatusClasses(
  status: string
) {
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

function getPaymentStatusClasses(
  status: string
) {
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

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { id } = await params;

  const customerId = Number(id);

  if (
    !Number.isInteger(
      customerId
    ) ||
    customerId <= 0
  ) {
    notFound();
  }

  let customer;

  try {
    customer =
      await getAdminCustomer(
        customerId
      );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      redirect(
        `/login?next=${encodeURIComponent(
          `/admin/customers/${customerId}`
        )}`
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }

  const fullName =
    `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div className="min-w-0">
      <Link
        href="/admin/customers"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={16} />
        Customers
      </Link>

      <div className="mt-5 flex flex-col gap-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white sm:h-14 sm:w-14 sm:text-lg">
            {getInitials(
              customer.firstName,
              customer.lastName
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="max-w-full truncate text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                {fullName}
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  customer.enabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {customer.enabled
                  ? "Active"
                  : "Disabled"}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-zinc-500">
              {customer.email}
            </p>
          </div>
        </div>

        <div className="self-start rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 sm:self-auto sm:text-sm">
          Customer #{customer.id}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total orders"
          value={String(
            customer.orderCount
          )}
        />

        <MetricCard
          label="Paid orders"
          value={String(
            customer.paidOrderCount
          )}
        />

        <MetricCard
          label="Total spent"
          value={formatKRW(
            customer.totalSpent
          )}
        />

        <MetricCard
          label="Last order"
          value={formatDate(
            customer.lastOrderAt
          )}
          compact
        />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4 sm:px-6 sm:py-5">
            <h2 className="font-semibold text-zinc-950">
              Customer profile
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Account information
            </p>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <ProfileItem
              icon={
                <UserRound
                  size={16}
                />
              }
              label="Full name"
              value={fullName}
            />

            <ProfileItem
              icon={<Mail size={16} />}
              label="Email"
              value={customer.email}
              breakAll
            />

            <ProfileItem
              label="Account status"
              value={
                customer.enabled
                  ? "Active"
                  : "Disabled"
              }
            />

            <ProfileItem
              icon={
                <CalendarDays
                  size={16}
                />
              }
              label="Joined"
              value={formatDateTime(
                customer.createdAt
              )}
            />

            <ProfileItem
              label="Last updated"
              value={formatDateTime(
                customer.updatedAt
              )}
            />
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4 sm:px-6 sm:py-5">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Order history
              </h2>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {customer.orderCount}{" "}
                {customer.orderCount ===
                1
                  ? "order"
                  : "orders"}
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              <span className="hidden sm:inline">
                All orders
              </span>

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          {customer.orders.length ===
          0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-zinc-500">
                This customer has not
                placed any orders.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-100 md:hidden">
                {customer.orders.map(
                  (order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block p-4 transition hover:bg-zinc-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-950">
                            Order #
                            {order.id}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 font-semibold text-zinc-950">
                          {formatKRW(
                            order.totalAmount
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getOrderStatusClasses(
                              order.status
                            )}`}
                          >
                            {
                              order.status
                            }
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPaymentStatusClasses(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </span>
                        </div>

                        <ArrowRight
                          size={15}
                          className="shrink-0 text-zinc-400"
                        />
                      </div>
                    </Link>
                  )
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-5 py-4 font-medium lg:px-6">
                        Order
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Date
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Fulfillment
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Payment
                      </th>

                      <th className="px-4 py-4 text-right font-medium">
                        Total
                      </th>

                      <th className="px-5 py-4 text-right font-medium lg:px-6">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {customer.orders.map(
                      (order) => (
                        <tr
                          key={
                            order.id
                          }
                          className="transition hover:bg-zinc-50"
                        >
                          <td className="px-5 py-4 lg:px-6">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-semibold text-zinc-950 hover:underline"
                            >
                              #
                              {
                                order.id
                              }
                            </Link>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-zinc-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(
                                order.status
                              )}`}
                            >
                              {
                                order.status
                              }
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                                order.paymentStatus
                              )}`}
                            >
                              {
                                order.paymentStatus
                              }
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-zinc-950">
                            {formatKRW(
                              order.totalAmount
                            )}
                          </td>

                          <td className="px-5 py-4 text-right lg:px-6">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
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
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      <p className="truncate text-xs text-zinc-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-2 break-words font-semibold tracking-tight text-zinc-950 ${
          compact
            ? "text-base sm:text-lg"
            : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileItem({
  label,
  value,
  icon,
  breakAll = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {icon}
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-medium leading-6 text-zinc-800 ${
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
