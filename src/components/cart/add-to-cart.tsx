"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

import { formatKRW } from "@/lib/format";
import { notifyCartUpdated } from "@/lib/cart-events";

interface AddToCartProps {
  productId: number;
  price: number;
  stock: number;
}

export function AddToCart({
  productId,
  price,
  stock,
}: AddToCartProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const available = stock > 0;

  async function handleAddToCart() {
    if (!available || submitting) return;

    setSubmitting(true);

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
        toast.info("Please sign in to add products to your cart.");

        router.push(
          `/login?next=${encodeURIComponent(
            `/products/${productId}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to add this product to your cart."
        );
      }

      notifyCartUpdated();

      toast.success(
        quantity === 1
          ? "Product added to your cart!"
          : `${quantity} items added to your cart!`
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
      {/* Quantity */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            Quantity
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {available
              ? `${stock} available`
              : "Currently unavailable"}
          </p>
        </div>

        <div className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          <button
            type="button"
            disabled={quantity <= 1 || submitting || !available}
            onClick={() =>
              setQuantity((current) =>
                Math.max(1, current - 1)
              )
            }
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="min-w-9 text-center text-sm font-semibold text-zinc-950">
            {quantity}
          </span>

          <button
            type="button"
            disabled={quantity >= stock || submitting || !available}
            onClick={() =>
              setQuantity((current) =>
                Math.min(stock, current + 1)
              )
            }
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
        <span className="text-sm text-zinc-500">
          Subtotal
        </span>

        <span className="text-2xl font-bold tracking-tight text-zinc-950">
          {formatKRW(price * quantity)}
        </span>
      </div>

      {/* Add to cart */}
      <button
        type="button"
        disabled={!available || submitting}
        onClick={() => void handleAddToCart()}
        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Adding to cart...
          </>
        ) : available ? (
          <>
            <ShoppingBag size={18} />
            Add to cart
          </>
        ) : (
          "Out of stock"
        )}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-400">
        Review your order before checkout.
      </p>
    </div>
  );
}
