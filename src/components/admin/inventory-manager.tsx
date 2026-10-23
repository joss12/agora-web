"use client";

import {
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Product } from "@/types/product";
import type { InventoryMovement } from "@/types/inventory";

interface InventoryManagerProps {
  products: Product[];
}

function getStockStatus(
  stock: number
) {
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
      "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  };
}

function formatMovementDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export function InventoryManager({
  products,
}: InventoryManagerProps) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(
    null
  );

  const [quantity, setQuantity] =
    useState("1");

  const [history, setHistory] =
    useState<
      InventoryMovement[]
    >([]);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredProducts =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            normalizedSearch
          ) ||
        product.sku
          .toLowerCase()
          .includes(
            normalizedSearch
          )
    );

  async function loadHistory(
    product: Product
  ) {
    setSelectedProduct(product);
    setQuantity("1");
    setError("");
    setHistory([]);
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `/api/admin/inventory/${product.id}/history`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to load inventory history"
        );
      }

      const data =
        (await response.json()) as InventoryMovement[];

      setHistory(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load inventory history"
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function updateStock(
    direction: "in" | "out"
  ) {
    if (
      !selectedProduct ||
      updating
    ) {
      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    if (
      direction === "out" &&
      parsedQuantity >
        selectedProduct.stock
    ) {
      setError(
        `Cannot remove ${parsedQuantity} units. Current stock is ${selectedProduct.stock}.`
      );
      return;
    }

    setUpdating(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/inventory/${selectedProduct.id}/stock/${direction}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            quantity:
              parsedQuantity,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Unable to ${
              direction === "in"
                ? "add"
                : "remove"
            } stock`
        );
      }

      const updatedProduct =
        data as Product;

      setSelectedProduct(
        updatedProduct
      );

      setQuantity("1");

      const historyResponse =
        await fetch(
          `/api/admin/inventory/${updatedProduct.id}/history`,
          {
            cache: "no-store",
          }
        );

      if (historyResponse.ok) {
        const updatedHistory =
          (await historyResponse.json()) as InventoryMovement[];

        setHistory(
          updatedHistory
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update stock"
      );
    } finally {
      setUpdating(false);
    }
  }

  function closeManager() {
    if (updating) {
      return;
    }

    setSelectedProduct(null);
    setHistory([]);
    setError("");
    setQuantity("1");
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <label
          htmlFor="inventory-search"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Search inventory
        </label>

        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            id="inventory-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by product name or SKU..."
            className="min-h-12 w-full rounded-xl border border-zinc-300 py-3 pl-10 pr-4 text-base outline-none transition focus:border-zinc-950 sm:text-sm"
          />
        </div>

        {search && (
          <p className="mt-3 text-xs text-zinc-500">
            {filteredProducts.length}{" "}
            {filteredProducts.length ===
            1
              ? "product"
              : "products"}{" "}
            found
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {filteredProducts.length ===
        0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-medium text-zinc-900">
              No products found
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              No products match your
              search.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100 md:hidden">
              {filteredProducts.map(
                (product) => {
                  const stockStatus =
                    getStockStatus(
                      product.stock
                    );

                  return (
                    <button
                      key={
                        product.id
                      }
                      type="button"
                      onClick={() =>
                        loadHistory(
                          product
                        )
                      }
                      className="block w-full p-4 text-left transition hover:bg-zinc-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-zinc-950">
                            {
                              product.name
                            }
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {product
                              .category
                              ?.name ??
                              "Uncategorized"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${stockStatus.className}`}
                        >
                          {
                            stockStatus.label
                          }
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            SKU
                          </p>

                          <p className="mt-1 truncate font-mono text-xs text-zinc-600">
                            {
                              product.sku
                            }
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            Stock
                          </p>

                          <p className="mt-1 text-xl font-semibold text-zinc-950">
                            {
                              product.stock
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-zinc-100 pt-3 text-sm font-semibold text-zinc-700">
                        Manage stock →
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-medium lg:px-6">
                      Product
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      SKU
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Stock
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Status
                    </th>

                    <th className="px-5 py-4 font-medium lg:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map(
                    (product) => {
                      const stockStatus =
                        getStockStatus(
                          product.stock
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="transition hover:bg-zinc-50"
                        >
                          <td className="px-5 py-4 lg:px-6">
                            <p className="max-w-64 font-semibold text-zinc-900">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 max-w-64 truncate text-xs text-zinc-500">
                              {product
                                .category
                                ?.name ??
                                "Uncategorized"}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-zinc-600 lg:px-6">
                            <span className="block max-w-48 truncate">
                              {
                                product.sku
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 lg:px-6">
                            <span className="text-lg font-semibold">
                              {
                                product.stock
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 lg:px-6">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.className}`}
                            >
                              {
                                stockStatus.label
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 lg:px-6">
                            <button
                              type="button"
                              onClick={() =>
                                loadHistory(
                                  product
                                )
                              }
                              className="min-h-10 rounded-lg px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                            >
                              Manage stock
                            </button>
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

      {selectedProduct && (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-4 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Manage stock
              </p>

              <h2 className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                {
                  selectedProduct.name
                }
              </h2>

              <p className="mt-1 break-all text-xs text-zinc-500 sm:text-sm">
                SKU:{" "}
                {selectedProduct.sku}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close stock manager"
              onClick={closeManager}
              disabled={updating}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40 sm:hidden"
            >
              <X size={17} />
            </button>

            <button
              type="button"
              onClick={closeManager}
              disabled={updating}
              className="hidden min-h-10 shrink-0 rounded-xl border border-zinc-300 px-4 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-40 sm:block"
            >
              Close
            </button>
          </div>

          <div className="grid min-w-0 gap-6 p-4 sm:p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="rounded-2xl bg-zinc-50 p-4 sm:p-5">
                <p className="text-sm text-zinc-500">
                  Current stock
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                    {
                      selectedProduct.stock
                    }
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStockStatus(
                      selectedProduct.stock
                    ).className}`}
                  >
                    {
                      getStockStatus(
                        selectedProduct.stock
                      ).label
                    }
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="stock-quantity"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Quantity
                </label>

                <input
                  id="stock-quantity"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={quantity}
                  disabled={updating}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 text-base outline-none transition focus:border-zinc-950 disabled:bg-zinc-100 sm:text-sm"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateStock("in")
                  }
                  className="min-h-12 rounded-xl bg-zinc-950 px-3 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                >
                  {updating
                    ? "Updating..."
                    : "Stock In"}
                </button>

                <button
                  type="button"
                  disabled={
                    updating ||
                    selectedProduct.stock ===
                      0
                  }
                  onClick={() =>
                    updateStock("out")
                  }
                  className="min-h-12 rounded-xl border border-zinc-300 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                >
                  Stock Out
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-zinc-950 sm:text-lg">
                  Inventory history
                </h3>

                <span className="shrink-0 text-xs text-zinc-500">
                  {history.length}{" "}
                  {history.length === 1
                    ? "movement"
                    : "movements"}
                </span>
              </div>

              {historyLoading ? (
                <div className="rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
                  Loading inventory
                  history...
                </div>
              ) : history.length ===
                0 ? (
                <div className="rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
                  No inventory movements
                  recorded.
                </div>
              ) : (
                <>
                  <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 md:hidden">
                    {history.map(
                      (movement) => (
                        <div
                          key={
                            movement.id
                          }
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p
                                className={
                                  movement.type ===
                                  "STOCK_IN"
                                    ? "text-sm font-semibold text-green-700"
                                    : "text-sm font-semibold text-red-700"
                                }
                              >
                                {
                                  movement.type
                                }
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {formatMovementDate(
                                  movement.created
                                )}
                              </p>
                            </div>

                            <p
                              className={`text-lg font-semibold ${
                                movement.type ===
                                "STOCK_IN"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {movement.type ===
                              "STOCK_IN"
                                ? "+"
                                : "-"}
                              {
                                movement.quantity
                              }
                            </p>
                          </div>

                          <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                              Stock change
                            </p>

                            <p className="mt-1 font-mono text-sm text-zinc-700">
                              {
                                movement.stockBefore
                              }
                              {" → "}
                              {
                                movement.stockAfter
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 md:block">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            Type
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Quantity
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Change
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-100">
                        {history.map(
                          (
                            movement
                          ) => (
                            <tr
                              key={
                                movement.id
                              }
                            >
                              <td className="px-4 py-3">
                                <span
                                  className={
                                    movement.type ===
                                    "STOCK_IN"
                                      ? "font-semibold text-green-700"
                                      : "font-semibold text-red-700"
                                  }
                                >
                                  {
                                    movement.type
                                  }
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                {movement.type ===
                                "STOCK_IN"
                                  ? "+"
                                  : "-"}
                                {
                                  movement.quantity
                                }
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                                {
                                  movement.stockBefore
                                }
                                {" → "}
                                {
                                  movement.stockAfter
                                }
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                                {formatMovementDate(
                                  movement.created
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
