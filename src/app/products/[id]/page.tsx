import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { getProduct } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { formatKRW } from "@/lib/format";

import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductGallery } from "@/components/products/product-gallery";
import { ReviewSection } from "@/components/reviews/review-section";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (
    !Number.isSafeInteger(productId) ||
    productId <= 0
  ) {
    notFound();
  }

  const [product, user] = await Promise.all([
    getProduct(productId),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-10">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex min-w-0 items-center gap-2 text-xs text-zinc-500 sm:mb-8 sm:text-sm"
        >
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-zinc-950"
          >
            Home
          </Link>

          <ChevronRight
            size={14}
            className="shrink-0 text-zinc-300"
          />

          <Link
            href="/#products"
            className="shrink-0 transition-colors hover:text-zinc-950"
          >
            Shop
          </Link>

          <ChevronRight
            size={14}
            className="shrink-0 text-zinc-300"
          />

          <span className="min-w-0 truncate font-medium text-zinc-900">
            {product.name}
          </span>
        </nav>

        {/* Mobile back button */}
        <Link
          href="/#products"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 sm:hidden"
        >
          <ChevronLeft size={17} />
          Continue shopping
        </Link>

        {/* Main product layout */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">

          {/* Gallery */}
          <section
            aria-label="Product images"
            className="min-w-0"
          >
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </section>

          {/* Product information */}
          <section className="min-w-0">

            {/* Category and SKU */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                {product.category?.name ?? "Uncategorized"}
              </span>

              <span className="text-xs text-zinc-400">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product name */}
            <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-3xl lg:text-[2.5rem] lg:leading-[1.15]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-6 border-b border-zinc-100 pb-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Price
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                {formatKRW(product.price)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Final total is calculated at checkout.
              </p>
            </div>

            {/* Availability */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {inStock ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={15} />
                  In stock
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  Out of stock
                </div>
              )}

              {inStock && (
                <span className="text-sm text-zinc-500">
                  {product.stock} available
                </span>
              )}
            </div>

            {/* Purchase section */}
            <div className="mt-7">
              <AddToCart
                productId={product.id}
                price={product.price}
                stock={product.stock}
              />
            </div>

            {/* Shopping information */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* Secure checkout */}
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-800 shadow-sm">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Secure checkout
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Review your order before payment.
                  </p>
                </div>
              </div>

              {/* Stock availability */}
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-800 shadow-sm">
                  <Package size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Stock availability
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Inventory is verified during checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Continue shopping */}
            <Link
              href="/#products"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              <ShoppingBag size={16} />
              Continue shopping
              <ChevronRight size={15} />
            </Link>
          </section>
        </div>

        {/* ==========================================
            PRODUCT DESCRIPTION
            Removed unnecessary top border
            Reduced excessive spacing
           ========================================== */}

        {product.description && (
          <section className="mt-12 sm:mt-14">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Product information
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                Product details
              </h2>
            </div>

            <div className="max-w-4xl rounded-2xl bg-zinc-50 p-5 sm:rounded-3xl sm:p-8">
              <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">
                {product.description}
              </p>
            </div>
          </section>
        )}

        {/* ==========================================
            CUSTOMER REVIEWS
            Removed unnecessary top border
            Reduced spacing
           ========================================== */}

        <section
          aria-label="Customer reviews"
          className="mt-12 sm:mt-14"
        >
          <ReviewSection
            productId={product.id}
            currentUserId={user?.id}
          />
        </section>

      </div>
    </main>
  );
}
