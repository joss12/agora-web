"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ImageOff,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { formatKRW } from "@/lib/format";
import { notifyCartUpdated } from "@/lib/cart-events";
import { notifyWishlistUpdated } from "@/lib/wishlist-events";

import type {
  WishlistItem,
  WishlistResponse,
} from "@/types/wishlist";

export function WishlistView() {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/login?next=/wishlist");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your wishlist.");
      }

      const data: WishlistResponse = await response.json();

      setItems(data.items);
      setError(null);
    } catch {
      setError("Unable to load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  async function removeItem(productId: number) {
    if (busyId !== null) return;

    setBusyId(productId);

    try {
      const response = await fetch(
        `/api/wishlist/${productId}`,
        { method: "DELETE" }
      );

      if (response.status === 401) {
        router.push("/login?next=/wishlist");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to remove this product.");
      }

      const data: WishlistResponse = await response.json();

      setItems(data.items);
      notifyWishlistUpdated();

      toast.success("Product removed from your wishlist.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function addToCart(productId: number) {
    if (busyId !== null) return;

    setBusyId(productId);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        router.push("/login?next=/wishlist");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Unable to add product to cart."
        );
      }

      notifyCartUpdated();
      toast.success("Product added to your cart!");

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500">
        Loading your wishlist...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void loadWishlist();
          }}
          className="mt-5 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
          <Heart size={32} className="text-zinc-400" />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          Your wishlist is empty
        </h2>

        <p className="mt-3 max-w-md text-sm text-zinc-500">
          Save products you love by clicking the heart icon.
          They'll appear here whenever you sign in.
        </p>

        <Link
          href="/#products"
          className="mt-8 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-500">
        {items.length} saved{" "}
        {items.length === 1 ? "product" : "products"}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const busy = busyId === item.productId;
          const available = item.active && item.stock > 0;

          const image =
            item.primaryImageUrl &&
            !item.primaryImageUrl
              .toLowerCase()
              .includes("loremflickr.com")
              ? item.primaryImageUrl
              : null;

          return (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-sm"
            >
              <div className="relative">
                <Link
                  href={`/products/${item.productId}`}
                  className="block"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
                        <ImageOff size={32} strokeWidth={1.5} />
                        <span className="text-sm">
                          Image coming soon
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void removeItem(item.productId)}
                  disabled={busyId !== null}
                  aria-label={`Remove ${item.name} from wishlist`}
                  title="Remove from wishlist"
                  className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Heart
                    size={20}
                    className="fill-red-500"
                  />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Link
                  href={`/products/${item.productId}`}
                  className="line-clamp-2 min-h-12 text-base font-semibold text-zinc-900 transition hover:text-zinc-500"
                >
                  {item.name}
                </Link>

                <p className="mt-1 text-xs text-zinc-400">
                  {item.sku}
                </p>

                <p className="mt-4 text-xl font-bold text-zinc-950">
                  {formatKRW(item.price)}
                </p>

                <p
                  className={`mt-2 text-xs font-medium ${
                    available
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {available
                    ? `${item.stock} available`
                    : "Currently unavailable"}
                </p>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => void addToCart(item.productId)}
                    disabled={!available || busyId !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={17} />

                    {busy
                      ? "Please wait..."
                      : available
                        ? "Add to cart"
                        : "Unavailable"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
