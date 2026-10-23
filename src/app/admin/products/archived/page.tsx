import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
} from "lucide-react";

import { RestoreProductButton } from "@/components/admin/restore-product-button";
import { backendFetch } from "@/lib/backend";
import { formatKRW } from "@/lib/format";

type ArchivedProduct = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: {
    id: number;
    name: string;
  } | null;
  primaryImageUrl: string | null;
  images: {
    id: number;
    thumbnailUrl: string | null;
  }[];
};

type ArchivedProductPageResponse = {
  products: ArchivedProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export const dynamic =
  "force-dynamic";

export default async function ArchivedProductsPage() {
  const response =
    await backendFetch(
      "/api/admin/products/archived?page=0&size=50"
    );

  if (!response.ok) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <h1 className="text-lg font-semibold text-red-900 sm:text-xl">
          Unable to load archived
          products
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-700">
          The backend returned HTTP{" "}
          {response.status}. Check that
          the archive endpoints are
          running.
        </p>
      </div>
    );
  }

  const data =
    (await response.json()) as ArchivedProductPageResponse;

  return (
    <div className="min-w-0">
      <Link
        href="/admin/products"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={16} />
        Products
      </Link>

      <div className="mb-7 mt-5 flex flex-col gap-4 sm:mb-8 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
            Product management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Archived Products
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            {data.totalElements}{" "}
            archived{" "}
            {data.totalElements === 1
              ? "product"
              : "products"}
            . Restore a product to make
            it available again.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {data.products.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Archive size={20} />
            </div>

            <h2 className="mt-4 font-semibold text-zinc-950">
              No archived products
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Products you archive
              will appear here.
            </p>

            <Link
              href="/admin/products"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700"
            >
              Return to Products
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 md:hidden">
              {data.products.map(
                (product) => {
                  const image =
                    product.primaryImageUrl ??
                    product.images[0]
                      ?.thumbnailUrl;

                  return (
                    <div
                      key={
                        product.id
                      }
                      className="p-4"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                          {image ? (
                            <Image
                              src={
                                image
                              }
                              alt={
                                product.name
                              }
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-zinc-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 font-semibold text-zinc-950">
                              {
                                product.name
                              }
                            </p>

                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                              Archived
                            </span>
                          </div>

                          <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                            {
                              product.sku
                            }
                          </p>

                          <p className="mt-2 truncate text-xs text-zinc-500">
                            {product
                              .category
                              ?.name ??
                              "Uncategorized"}
                          </p>

                          <p className="mt-2 font-semibold text-zinc-950">
                            {formatKRW(
                              product.price
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                        <span className="text-xs text-zinc-500">
                          {
                            product.stock
                          }{" "}
                          units in stock
                        </span>

                        <RestoreProductButton
                          productId={
                            product.id
                          }
                          productName={
                            product.name
                          }
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 lg:px-6">
                      Product
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Category
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Price
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Stock
                    </th>

                    <th className="px-5 py-4 lg:px-6">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right lg:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.products.map(
                    (product) => {
                      const image =
                        product.primaryImageUrl ??
                        product
                          .images[0]
                          ?.thumbnailUrl;

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="transition hover:bg-zinc-50"
                        >
                          <td className="px-5 py-4 lg:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                                {image ? (
                                  <Image
                                    src={
                                      image
                                    }
                                    alt={
                                      product.name
                                    }
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                    No
                                    image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-64 truncate font-semibold text-zinc-950">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-1 max-w-64 truncate font-mono text-xs text-zinc-500">
                                  {
                                    product.sku
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-zinc-600 lg:px-6">
                            {product
                              .category
                              ?.name ??
                              "—"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium lg:px-6">
                            {formatKRW(
                              product.price
                            )}
                          </td>

                          <td className="px-5 py-4 lg:px-6">
                            {
                              product.stock
                            }
                          </td>

                          <td className="px-5 py-4 lg:px-6">
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Archived
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right lg:px-6">
                            <RestoreProductButton
                              productId={
                                product.id
                              }
                              productName={
                                product.name
                              }
                            />
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
