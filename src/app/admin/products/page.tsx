import Image from "next/image";
import Link from "next/link";

import {
  Archive,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { getCategories, getProducts } from "@/lib/api";
import { formatKRW } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    size?: string;
    search?: string;
    categoryId?: string;
  }>;
}

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className:
        "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    };
  }

  if (stock <= 5) {
    return {
      label: "Low stock",
      className:
        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    };
  }

  return {
    label: "In stock",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  };
}

function createPageUrl(
  page: number,
  size: number,
  search?: string,
  categoryId?: number
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search) {
    params.set("search", search);
  }

  if (categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }

  return `/admin/products?${params.toString()}`;
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const parsedPage = Number(params.page);
  const parsedSize = Number(params.size);
  const parsedCategoryId = Number(params.categoryId);

  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const pageSize = [10, 20, 50].includes(parsedSize)
    ? parsedSize
    : 20;

  const search = params.search?.trim() ?? "";

  const categoryId =
    params.categoryId &&
    Number.isInteger(parsedCategoryId) &&
    parsedCategoryId > 0
      ? parsedCategoryId
      : undefined;


  const [data, categories] = await Promise.all([
    getProducts({
      page: currentPage - 1,
      size: pageSize,
      search: search || undefined,
      categoryId,
    }),
    getCategories(),
  ]);

  const totalPages = data.totalPages;
  const totalElements = data.totalElements;

  const startItem =
    totalElements === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    totalElements
  );

  const previousUrl = createPageUrl(
    currentPage - 1,
    pageSize,
    search,
    categoryId
  );

  const nextUrl = createPageUrl(
    currentPage + 1,
    pageSize,
    search,
    categoryId
  );

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pageNumbers = Array.from(
    {
      length: Math.min(5, totalPages),
    },
    (_, index) => {
      const start = Math.max(
        1,
        Math.min(currentPage - 2, totalPages - 4)
      );

      return start + index;
    }
  );

  return (
    <div className="min-w-0">
      {/* PAGE HEADER */}

      <div className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
            Product management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Products
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
            {totalElements}{" "}
            {totalElements === 1 ? "product" : "products"}{" "}
            found.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Link
            href="/admin/products/archived"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:px-4"
          >
            <Archive size={16} />
            Archived
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-4"
          >
            <Plus size={16} />
            Add product
          </Link>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}

      <form
        action="/admin/products"
        method="GET"
        className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search products by name or SKU..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <select
              name="categoryId"
              defaultValue={categoryId?.toString() ?? ""}
              className="h-11 w-full min-w-44 rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-zinc-400 lg:w-auto"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="hidden"
            name="page"
            value="1"
          />

          <input
            type="hidden"
            name="size"
            value={pageSize}
          />

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Apply filters
          </button>

          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* PRODUCT TABLE */}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {data.products.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Package size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-zinc-950">
              No products found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Try changing your search or category filters.
            </p>

            <Link
              href="/admin/products"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW */}

            <div className="divide-y divide-zinc-100 md:hidden">
              {data.products.map((product) => {
                const image =
                  product.primaryImageUrl ??
                  product.images?.[0]?.thumbnailUrl;

                const stockStatus = getStockStatus(
                  product.stock
                );

                return (
                  <div
                    key={product.id}
                    className="p-4"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
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
                        <p className="line-clamp-2 font-semibold leading-5 text-zinc-950">
                          {product.name}
                        </p>

                        <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                          {product.sku}
                        </p>

                        <p className="mt-2 truncate text-xs text-zinc-500">
                          {product.category?.name ??
                            "Uncategorized"}
                        </p>

                        <p className="mt-2 font-semibold text-zinc-950">
                          {formatKRW(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>

                        <span className="text-xs text-zinc-500">
                          {product.stock} units
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex min-h-10 items-center rounded-lg border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Edit
                        </Link>

                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE */}

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

                    <th className="px-5 py-4 text-right lg:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.products.map((product) => {
                    const image =
                      product.primaryImageUrl ??
                      product.images?.[0]?.thumbnailUrl;

                    const stockStatus = getStockStatus(
                      product.stock
                    );

                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-zinc-50/70"
                      >
                        <td className="px-5 py-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={product.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-64 truncate font-semibold text-zinc-950">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-64 truncate font-mono text-xs text-zinc-500">
                                {product.sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-zinc-600 lg:px-6">
                          <span className="block max-w-44 truncate">
                            {product.category?.name ?? "—"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-900 lg:px-6">
                          {formatKRW(product.price)}
                        </td>

                        <td className="px-5 py-4 lg:px-6">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="font-semibold text-zinc-950">
                              {product.stock}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stockStatus.className}`}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 lg:px-6">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                            >
                              Edit
                            </Link>

                            <DeleteProductButton
                              productId={product.id}
                              productName={product.name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* PAGINATION */}

      {totalPages > 0 && (
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-zinc-600">
            Showing{" "}
            <span className="font-semibold text-zinc-950">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-950">
              {totalElements}
            </span>{" "}
            products
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* PAGE SIZE */}

            <span className="mr-1 text-xs text-zinc-500">
              Per page:
            </span>

            {[10, 20, 50].map((size) => (
              <Link
                key={size}
                href={createPageUrl(
                  1,
                  size,
                  search,
                  categoryId
                )}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                  pageSize === size
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {size}
              </Link>
            ))}

            <div className="mx-2 hidden h-6 w-px bg-zinc-200 sm:block" />

            {/* PREVIOUS */}

            {hasPrevious ? (
              <Link
                href={previousUrl}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-lg border border-zinc-100 px-3 text-xs text-zinc-300">
                Previous
              </span>
            )}

            {/* PAGE NUMBERS */}

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((page) => (
                <Link
                  key={page}
                  href={createPageUrl(
                    page,
                    pageSize,
                    search,
                    categoryId
                  )}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    page === currentPage
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>

            <span className="px-1 text-xs text-zinc-500 sm:hidden">
              {currentPage} / {totalPages}
            </span>

            {/* NEXT */}

            {hasNext ? (
              <Link
                href={nextUrl}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-lg border border-zinc-100 px-3 text-xs text-zinc-300">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
