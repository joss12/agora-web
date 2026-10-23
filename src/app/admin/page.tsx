import Link from "next/link";

import {
  ArrowRight,
  Archive,
  Boxes,
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { getProducts } from "@/lib/api";
import { formatKRW } from "@/lib/format";

export default async function AdminDashboard() {
  // Fetch the latest product information.
  // getProducts expects an options object.
  const productPage = await getProducts({
    page: 0,
    size: 5,
    sort: "id",
    direction: "desc",
  });

  const products = productPage.products ?? [];
  const totalProducts = productPage.totalElements ?? 0;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  );

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      description: "Products in your store",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length.toString(),
      description: "Among the 5 displayed products",
      icon: Boxes,
      href: "/admin/inventory",
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length.toString(),
      description: "Among the 5 displayed products",
      icon: Archive,
      href: "/admin/inventory",
    },
  ];

  return (
    <div className="min-w-0 space-y-8">
      {/* HEADER */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            Dashboard
          </h1>

          <p className="mt-3 text-sm text-zinc-600">
            Welcome back! Here&apos;s what&apos;s happening
            with your Agora store.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <Plus size={17} />
          Add product
        </Link>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                  <Icon size={21} />
                </div>

                <ArrowRight
                  size={17}
                  className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900"
                />
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-zinc-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  {stat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-zinc-950">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your store operations.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
          >
            <Package size={19} className="text-zinc-600" />
            <span className="text-sm font-semibold">
              Manage Products
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
          >
            <Boxes size={19} className="text-zinc-600" />
            <span className="text-sm font-semibold">
              Inventory
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
          >
            <ShoppingBag
              size={19}
              className="text-zinc-600"
            />

            <span className="text-sm font-semibold">
              Orders
            </span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
          >
            <LayoutDashboard
              size={19}
              className="text-zinc-600"
            />

            <span className="text-sm font-semibold">
              Dashboard
            </span>
          </Link>
        </div>
      </section>

      {/* RECENT PRODUCTS */}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Recent Products
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Your five most recently added products.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950"
          >
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Package
              size={30}
              className="mx-auto text-zinc-400"
            />

            <p className="mt-4 text-sm text-zinc-500">
              No products available.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
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
                    Stock
                  </th>

                  <th className="px-5 py-4 text-right font-semibold sm:px-6">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {products.map((product) => {
                  const stockLabel =
                    product.stock === 0
                      ? "Out of stock"
                      : product.stock <= 5
                        ? "Low stock"
                        : "In stock";

                  const stockClass =
                    product.stock === 0
                      ? "bg-red-50 text-red-700"
                      : product.stock <= 5
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700";

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

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="font-semibold text-zinc-950">
                            {product.stock}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stockClass}`}
                          >
                            {stockLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right sm:px-6">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-zinc-950"
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
