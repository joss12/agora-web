import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Users,
} from "lucide-react";

import { getAdminCustomers } from "@/lib/admin-api";
import { formatKRW } from "@/lib/format";

interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
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
  ).toLocaleDateString("ko-KR");
}

function getInitials(
  firstName: string,
  lastName: string
) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;

  const parsedPage = Number(
    params.page ?? "0"
  );

  const page =
    Number.isSafeInteger(
      parsedPage
    ) && parsedPage >= 0
      ? parsedPage
      : 0;

  let data;

  try {
    data =
      await getAdminCustomers(
        page,
        20
      );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      redirect(
        `/login?next=${encodeURIComponent(
          `/admin/customers?page=${page}`
        )}`
      );
    }

    throw error;
  }

  function pageUrl(
    nextPage: number
  ) {
    return `/admin/customers?page=${nextPage}`;
  }

  return (
    <div className="min-w-0">
      <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
            Customer management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            View customer accounts,
            orders, and purchase
            activity.
          </p>
        </div>

        <div className="self-start rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 sm:self-auto">
          {data.totalElements}{" "}
          {data.totalElements === 1
            ? "customer"
            : "customers"}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {data.customers.length ===
        0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Users size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-zinc-950">
              No customers yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Registered customer
              accounts will appear
              here.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 md:hidden">
              {data.customers.map(
                (customer) => (
                  <Link
                    key={customer.id}
                    href={`/admin/customers/${customer.id}`}
                    className="block p-4 transition hover:bg-zinc-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                        {getInitials(
                          customer.firstName,
                          customer.lastName
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-950">
                              {
                                customer.firstName
                              }{" "}
                              {
                                customer.lastName
                              }
                            </p>

                            <p className="mt-0.5 truncate text-xs text-zinc-500">
                              {
                                customer.email
                              }
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
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

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                              Orders
                            </p>

                            <p className="mt-1 text-sm font-semibold text-zinc-800">
                              {
                                customer.orderCount
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                              Paid
                            </p>

                            <p className="mt-1 text-sm font-semibold text-zinc-800">
                              {
                                customer.paidOrderCount
                              }
                            </p>
                          </div>

                          <div className="min-w-0 text-right">
                            <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                              Spent
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                              {formatKRW(
                                customer.totalSpent
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                          <p className="text-xs text-zinc-500">
                            Last order:{" "}
                            {formatDate(
                              customer.lastOrderAt
                            )}
                          </p>

                          <ArrowRight
                            size={15}
                            className="shrink-0 text-zinc-400"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-4 lg:px-6">
                      Customer
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right lg:px-6">
                      Orders
                    </th>

                    <th className="px-5 py-4 text-right lg:px-6">
                      Paid
                    </th>

                    <th className="px-5 py-4 text-right lg:px-6">
                      Total spent
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Last order
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right lg:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.customers.map(
                    (customer) => (
                      <tr
                        key={
                          customer.id
                        }
                        className="transition hover:bg-zinc-50/70"
                      >
                        <td className="px-5 py-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                              {getInitials(
                                customer.firstName,
                                customer.lastName
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-48 truncate font-semibold text-zinc-950">
                                {
                                  customer.firstName
                                }{" "}
                                {
                                  customer.lastName
                                }
                              </p>

                              <p className="mt-0.5 max-w-56 truncate text-xs text-zinc-500">
                                {
                                  customer.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 lg:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              customer.enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {customer.enabled
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right font-medium text-zinc-700 lg:px-6">
                          {
                            customer.orderCount
                          }
                        </td>

                        <td className="px-5 py-4 text-right font-medium text-zinc-700 lg:px-6">
                          {
                            customer.paidOrderCount
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-zinc-950 lg:px-6">
                          {formatKRW(
                            customer.totalSpent
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500 lg:px-6">
                          {formatDate(
                            customer.lastOrderAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500 lg:px-6">
                          {formatDate(
                            customer.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4 text-right lg:px-6">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
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
              Page {data.page + 1} of{" "}
              {Math.max(
                data.totalPages,
                1
              )}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {!data.first &&
              page > 0 ? (
                <Link
                  href={pageUrl(
                    page - 1
                  )}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-100 px-4 text-sm text-zinc-300">
                  Previous
                </span>
              )}

              {!data.last ? (
                <Link
                  href={pageUrl(
                    page + 1
                  )}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
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
