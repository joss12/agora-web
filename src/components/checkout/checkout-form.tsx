"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import { formatKRW } from "@/lib/format";
import { notifyCartUpdated } from "@/lib/cart-events";
import type { Cart } from "@/types/cart";

interface DeliveryDetails {
  recipientName: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  deliveryInstructions: string;
}

interface CheckoutResponse {
  id?: unknown;
  message?: string;
}

const initialDetails: DeliveryDetails = {
  recipientName: "",
  phoneNumber: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  deliveryInstructions: "",
};

const inputClass =
  "min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:bg-zinc-50 disabled:opacity-60 sm:text-sm";

export function CheckoutForm() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);

  const [details, setDetails] =
    useState<DeliveryDetails>(initialDetails);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prevent duplicate submissions before React updates state.
  const submittingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          toast.info("Please sign in to continue checkout.");

          router.replace("/login?next=/checkout");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "Checkout is available to customer accounts only."
          );
        }

        if (!response.ok) {
          throw new Error("Unable to load your cart.");
        }

        const data: Cart = await response.json();

        if (controller.signal.aborted) return;

        setCart(data);
        setError("");
      } catch (error) {
        if (controller.signal.aborted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your cart.";

        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      controller.abort();
    };
  }, [router]);

  function updateField(
    field: keyof DeliveryDetails,
    value: string
  ) {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCheckout(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      submittingRef.current ||
      !cart ||
      cart.items.length === 0
    ) {
      return;
    }

    const payload: DeliveryDetails = {
      recipientName: details.recipientName.trim(),
      phoneNumber: details.phoneNumber.trim(),
      postalCode: details.postalCode.trim(),
      address: details.address.trim(),
      addressDetail: details.addressDetail.trim(),
      deliveryInstructions:
        details.deliveryInstructions.trim(),
    };

    if (
      !payload.recipientName ||
      !payload.phoneNumber ||
      !payload.postalCode ||
      !payload.address
    ) {
      const message =
        "Please complete all required delivery fields.";

      setError(message);
      toast.error(message);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/orders/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        toast.info(
          "Your session has expired. Please sign in again."
        );

        router.replace("/login?next=/checkout");
        return;
      }

      if (response.status === 403) {
        const message =
          "Checkout is available to customer accounts. Please sign in as a customer.";

        setError(message);
        toast.error(message);
        return;
      }

      const data: CheckoutResponse | null =
        await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : "Unable to place your order.";

        throw new Error(message);
      }

      if (
        typeof data?.id !== "number" ||
        !Number.isSafeInteger(data.id) ||
        data.id <= 0
      ) {
        throw new Error(
          "The order may have been created, but its ID was missing. Check your order history before trying again."
        );
      }

      // Checkout succeeded and the backend cleared the cart.
      // Tell CustomerNav to fetch the new cart quantity.
      notifyCartUpdated();

      toast.success(
        "Order placed successfully! Complete your payment.",
        {
          autoClose: 4000,
        }
      );

      router.push(`/orders/${data.id}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to place your order.";

      setError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1440px] animate-pulse">
          <div className="h-8 w-40 rounded bg-zinc-200" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-96 rounded-2xl bg-zinc-100" />
            <div className="h-72 rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="py-12 text-center">
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error || "Your cart could not be loaded."}
        </p>

        <Link
          href="/cart"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
        >
          <ArrowLeft size={16} />
          Return to cart
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 px-5 py-12 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
          <PackageCheck
            size={24}
            className="text-zinc-600"
          />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          Your cart is empty
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Add a product before continuing to checkout.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
      <form
        onSubmit={handleCheckout}
        className="min-w-0 space-y-6"
      >
        {/* DELIVERY INFORMATION */}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <MapPin
                  size={17}
                  className="text-zinc-700"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
                  Delivery information
                </h2>

                <p className="mt-1 text-sm leading-5 text-zinc-500">
                  Enter the address where you want your
                  order delivered.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* RECIPIENT NAME */}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Recipient name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  autoComplete="name"
                  value={details.recipientName}
                  onChange={(event) =>
                    updateField(
                      "recipientName",
                      event.target.value
                    )
                  }
                  required
                  disabled={submitting}
                  placeholder="Full name"
                  className={inputClass}
                />
              </label>

              {/* PHONE NUMBER */}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Phone number
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={details.phoneNumber}
                  onChange={(event) =>
                    updateField(
                      "phoneNumber",
                      event.target.value
                    )
                  }
                  required
                  disabled={submitting}
                  placeholder="010-0000-0000"
                  className={inputClass}
                />
              </label>

              {/* POSTAL CODE */}

              <label className="block sm:max-w-52">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Postal code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  value={details.postalCode}
                  onChange={(event) =>
                    updateField(
                      "postalCode",
                      event.target.value
                    )
                  }
                  required
                  disabled={submitting}
                  placeholder="Postal code"
                  className={inputClass}
                />
              </label>

              {/* ADDRESS */}

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Address
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  autoComplete="street-address"
                  value={details.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  required
                  disabled={submitting}
                  placeholder="Street address"
                  className={inputClass}
                />
              </label>

              {/* ADDRESS DETAIL */}

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Address detail
                  <span className="ml-2 text-xs font-normal text-zinc-400">
                    Optional
                  </span>
                </span>

                <input
                  type="text"
                  autoComplete="address-line2"
                  value={details.addressDetail}
                  onChange={(event) =>
                    updateField(
                      "addressDetail",
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  placeholder="Apartment, suite, building, floor..."
                  className={inputClass}
                />
              </label>

              {/* DELIVERY INSTRUCTIONS */}

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-800">
                  Delivery instructions
                  <span className="ml-2 text-xs font-normal text-zinc-400">
                    Optional
                  </span>
                </span>

                <textarea
                  value={details.deliveryInstructions}
                  onChange={(event) =>
                    updateField(
                      "deliveryInstructions",
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  rows={4}
                  placeholder="Leave at the door, call on arrival..."
                  className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:bg-zinc-50 disabled:opacity-60 sm:text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        {/* MOBILE ORDER SUMMARY */}

        <div className="lg:hidden">
          <OrderSummary cart={cart} />
        </div>

        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-14 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
        >
          {submitting
            ? "Placing your order..."
            : `Place order — ${formatKRW(
                cart.totalPrice
              )}`}
        </button>

        <div className="flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
          <LockKeyhole
            size={14}
            className="shrink-0"
          />

          <span>Secure order processing</span>
        </div>

        <p className="text-center text-xs leading-5 text-zinc-500">
          Payment is completed after placing your order.
        </p>
      </form>

      {/* DESKTOP ORDER SUMMARY */}

      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <OrderSummary cart={cart} />
      </aside>
    </div>
  );
}

// ============================================================
// ORDER SUMMARY
// ============================================================

function OrderSummary({
  cart,
}: {
  cart: Cart;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-zinc-950">
          Order summary
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          {cart.totalQuantity}{" "}
          {cart.totalQuantity === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="px-5 sm:px-6">
        <div className="divide-y divide-zinc-200">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex min-w-0 items-start justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-5 text-zinc-900">
                  {item.productName}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Qty {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-medium text-zinc-900">
                {formatKRW(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-300 py-5">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-zinc-950">
              Total
            </span>

            <span className="text-xl font-bold tracking-tight text-zinc-950">
              {formatKRW(cart.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-5 py-4 sm:px-6">
        <div className="flex items-start gap-2">
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-zinc-500"
          />

          <p className="text-xs leading-5 text-zinc-500">
            Inventory availability is verified when
            your order is placed.
          </p>
        </div>

        <Link
          href="/cart"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
        >
          <ArrowLeft size={15} />
          Edit cart
        </Link>
      </div>
    </div>
  );
}
