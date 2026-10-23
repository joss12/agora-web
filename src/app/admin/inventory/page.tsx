import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Package,
  PackageX,
} from "lucide-react";

import { getProducts } from "@/lib/api";
import { formatKRW } from "@/lib/format";

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

export default async function AdminInventoryPage() {
  // FIX:
  // getProducts() expects an options object.
  const data = await getProducts({
    page: 0,
    size: 100,
    sort: "id",
    direction: "asc",
  });

  const products = data.products ?? [];

  const totalProducts = data.totalElements;

  const inStockProducts = products.filter(
    (product) => product.stock > 5
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.stock > 0 && product.stock <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  );

  const totalUnits = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      description: "Products in your store",
      icon: Package,
    },
    {
      title: "In Stock",
      value: inStockProducts.length.toLocaleString(),
      description: "Products with more than 5 units",
      icon: Boxes,
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length.toLocaleString(),
      description: "Products with 1–5 units",
      icon: AlertTriangle,
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length.toLocaleString(),
      description: "Products with no remaining stock",
      icon: PackageX,
    },
  ];

  return (
    <div className="min-w-0 space-y-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Store operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            Inventory
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Monitor product availability and stock levels.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Manage Products
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* INVENTORY STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                <Icon size={21} />
              </div>

              <p className="mt-5 text-sm font-medium text-zinc-500">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* INVENTORY SUMMARY */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-950">
          Inventory Overview
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Summary of the products loaded on this page.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-5">
            <p className="text-sm text-zinc-500">
              Total Units Available
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-950">
              {totalUnits.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-5">
            <p className="text-sm text-zinc-500">
              Products Loaded
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-950">
              {products.length.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* INVENTORY TABLE */}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-zinc-200 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-zinc-950">
            Stock Management
          </h2>

          <p className="text-sm text-zinc-500">
            Showing {products.length} of {totalProducts} products.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package
              size={30}
              className="mx-auto text-zinc-400"
            />

            <h3 className="mt-4 font-semibold text-zinc-950">
              No inventory available
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Add products to start tracking inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-semibold sm:px-6">
                    Product
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Price
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Quantity
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {products.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock
                  );

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-zinc-50"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <p className="max-w-56 truncate font-semibold text-zinc-950">
                          {product.name}
                        </p>

                        <p className="mt-1 max-w-56 truncate font-mono text-xs text-zinc-500">
                          {product.sku}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {product.category?.name ??
                          "Uncategorized"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-900">
                        {formatKRW(product.price)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-zinc-950">
                        {product.stock}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right sm:px-6">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950"
                        >
                          Edit
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
