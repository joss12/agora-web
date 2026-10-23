"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { formatKRW } from "@/lib/format";
import { notifyCartUpdated } from "@/lib/cart-events";
import type { Cart } from "@/types/cart";

type ProductImages = Record<number, string | null>;

export function CartView() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [images, setImages] = useState<ProductImages>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] =
    useState<number | null>(null);

  const loadCart = useCallback(async () => {
    setError("");

    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/login?next=/cart");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your cart.");
      }

      const data: Cart = await response.json();

      setCart(data);
      notifyCartUpdated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!cart?.items.length) {
      return;
    }

    const controller = new AbortController();

    const productIds = [
      ...new Set(cart.items.map((item) => item.productId)),
    ];

    async function loadImages() {
      try {
        const params = new URLSearchParams({
          ids: productIds.join(","),
        });

        const response = await fetch(
          `/api/cart/product-images?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) return;

        const data: ProductImages = await response.json();

        if (!controller.signal.aborted) {
          setImages(data);
        }
      } catch {
        // Product thumbnails are optional.
        // Cart functionality must remain available.
      }
    }

    void loadImages();

    return () => {
      controller.abort();
    };
  }, [cart]);

  async function updateQuantity(
    itemId: number,
    quantity: number
  ) {
    if (quantity < 1 || updatingItemId !== null) return;

    setUpdatingItemId(itemId);
    setError("");

    try {
      const response = await fetch(
        `/api/cart/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (response.status === 401) {
        router.replace("/login?next=/cart");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Unable to update this item."
        );
      }

      const data: Cart = await response.json();

      setCart(data);
      notifyCartUpdated();

      toast.success("Cart updated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function removeItem(itemId: number) {
    if (updatingItemId !== null) return;

    setUpdatingItemId(itemId);
    setError("");

    try {
      const response = await fetch(
        `/api/cart/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        router.replace("/login?next=/cart");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Unable to remove this item."
        );
      }

      const data: Cart = await response.json();

      setCart(data);
      notifyCartUpdated();

      toast.success("Product removed from cart.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="animate-pulse">
          <div className="h-4 w-28 rounded bg-zinc-100" />
          <div className="mt-4 h-10 w-48 rounded bg-zinc-200" />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl bg-zinc-100"
                />
              ))}
            </div>

            <div className="h-80 rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold text-zinc-950">
          Unable to load your cart
        </h1>

        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void loadCart();
          }}
          className="mt-6 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!cart) return null;

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-[1440px] items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
            <ShoppingBag
              size={30}
              strokeWidth={1.5}
              className="text-zinc-700"
            />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Your shopping bag
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Your cart is empty
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-500">
            Your next favorite find is waiting.
            Explore Agora and discover something new.
          </p>

          <Link
            href="/#products"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Explore products
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-7 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
      {/* Breadcrumb */}

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-xs text-zinc-500 sm:text-sm"
      >
        <Link
          href="/"
          className="transition hover:text-zinc-950"
        >
          Home
        </Link>

        <span className="text-zinc-300">/</span>

        <span className="font-medium text-zinc-950">
          Shopping cart
        </span>
      </nav>

      {/* Heading */}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Your selection
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Shopping cart
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Review your products before checkout.
          </p>
        </div>

        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700">
          {cart.totalQuantity}{" "}
          {cart.totalQuantity === 1 ? "item" : "items"}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        {/* Cart products */}

        <section
          aria-label="Cart items"
          className="min-w-0"
        >
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-zinc-950">
                Your items
              </h2>

              <span className="text-xs text-zinc-500">
                {cart.items.length}{" "}
                {cart.items.length === 1
                  ? "product"
                  : "products"}
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {cart.items.map((item) => {
                const updating =
                  updatingItemId === item.id;

                const imageUrl = images[item.productId];

                return (
                  <article
                    key={item.id}
                    className="p-4 sm:p-6"
                  >
                    <div className="flex min-w-0 gap-4 sm:gap-6">
                      {/* Product thumbnail */}

                      <Link
                        href={`/products/${item.productId}`}
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 sm:h-32 sm:w-32"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.productName}
                            width={160}
                            height={160}
                            unoptimized
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <ImageOff
                            size={24}
                            strokeWidth={1.5}
                            className="text-zinc-300"
                          />
                        )}
                      </Link>

                      {/* Product information */}

                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/products/${item.productId}`}
                          className="line-clamp-2 text-sm font-semibold leading-6 text-zinc-950 transition hover:text-zinc-600 sm:text-base"
                        >
                          {item.productName}
                        </Link>

                        <p className="mt-1 text-xs text-zinc-400">
                          SKU: {item.sku}
                        </p>

                        <p className="mt-3 text-xs text-zinc-500">
                          Unit price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                          {formatKRW(item.unitPrice)}
                        </p>

                        <p className="mt-3 text-base font-bold tracking-tight text-zinc-950 sm:text-lg">
                          {formatKRW(item.subtotal)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity and remove */}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                      <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.productName} quantity`}
                          disabled={
                            updatingItemId !== null ||
                            item.quantity <= 1
                          }
                          onClick={() =>
                            void updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="flex h-full w-11 items-center justify-center transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="min-w-10 text-center text-sm font-semibold text-zinc-950">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.productName} quantity`}
                          disabled={updatingItemId !== null}
                          onClick={() =>
                            void updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="flex h-full w-11 items-center justify-center transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {updating && (
                          <span className="text-xs text-zinc-400">
                            Updating…
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={updatingItemId !== null}
                          onClick={() =>
                            void removeItem(item.id)
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <Link
            href="/#products"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>
        </section>

        {/* Order summary */}

        <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
              Order summary
            </h2>

            <ShoppingBag
              size={19}
              className="text-zinc-400"
            />
          </div>

          <div className="mt-7 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">
                Items
              </span>

              <span className="font-medium text-zinc-900">
                {cart.totalQuantity}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">
                Subtotal
              </span>

              <span className="font-semibold text-zinc-950">
                {formatKRW(cart.totalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">
                Shipping
              </span>

              <span className="text-right text-xs text-zinc-500">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="my-7 border-t border-zinc-200" />

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Total
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                Before shipping
              </p>
            </div>

            <p className="text-2xl font-bold tracking-tight text-zinc-950">
              {formatKRW(cart.totalPrice)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Proceed to checkout
            <ArrowRight size={17} />
          </Link>

          <div className="mt-5 flex items-start gap-2 border-t border-zinc-200 pt-5">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-zinc-500"
            />

            <p className="text-xs leading-5 text-zinc-500">
              Your order is reviewed before payment.
              Final inventory availability is verified
              during checkout.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
