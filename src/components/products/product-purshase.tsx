
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatKRW } from "@/lib/format";

interface ProductPurchaseProps {
  productId: number;
  price: number;
  stock: number;
}

export function ProductPurchase({
  productId,
  price,
  stock,
}: ProductPurchaseProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inStock = stock > 0;

  async function addToCart() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Unable to add this product to your cart.");
        return;
      }

      router.push("/cart");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 border-t border-zinc-200 pt-8">
      <p
        className={
          inStock
            ? "mb-5 text-sm font-medium text-green-700"
            : "mb-5 text-sm font-medium text-red-600"
        }
      >
        {inStock
          ? `${stock} available`
          : "Currently out of stock"}
      </p>

      {inStock && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium">
            Quantity
          </p>

          <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-300">
            <button
              type="button"
              onClick={() =>
                setQuantity((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="px-5 py-3 hover:bg-zinc-100 disabled:opacity-30"
            >
              −
            </button>

            <span className="min-w-12 text-center font-medium">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((current) =>
                  Math.min(stock, current + 1)
                )
              }
              disabled={quantity >= stock}
              aria-label="Increase quantity"
              className="px-5 py-3 hover:bg-zinc-100 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-zinc-600">
          Total
        </span>

        <span className="text-xl font-semibold">
          {formatKRW(price * quantity)}
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={!inStock || loading}
        className="w-full rounded-lg bg-zinc-900 px-6 py-4 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Final stock availability is verified at checkout.
      </p>
    </section>
  );
}

