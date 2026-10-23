import Link from "next/link";

import {
  ArrowRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import {
  AnimatedProductGrid,
  AnimatedProductItem,
} from "@/components/products/animated-product-grid";

import { RevealSection } from "@/components/home/reveal-section";
import { StorefrontHero } from "@/components/home/storefront-hero";

import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductPagination } from "@/components/products/product-pagination";

import { getProducts } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    sort?: string;
    direction?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams;

  const requestedPage = Number.parseInt(
    params.page ?? "1",
    10
  );

  const page =
    Number.isFinite(requestedPage) &&
    requestedPage > 0
      ? requestedPage - 1
      : 0;

  const search =
    params.search?.trim() || undefined;

  const parsedCategoryId = params.categoryId
    ? Number.parseInt(
        params.categoryId,
        10
      )
    : undefined;

  const categoryId =
    parsedCategoryId !== undefined &&
    Number.isFinite(parsedCategoryId) &&
    parsedCategoryId > 0
      ? parsedCategoryId
      : undefined;

  const allowedSorts = new Set([
    "id",
    "name",
    "price",
    "stock",
    "createdAt",
  ]);

  const sort =
    params.sort &&
    allowedSorts.has(params.sort)
      ? params.sort
      : "id";

  const direction: "asc" | "desc" =
    params.direction === "desc"
      ? "desc"
      : "asc";

  const [data, user] = await Promise.all([
    getProducts({
      page,
      size: PAGE_SIZE,
      search,
      categoryId,
      sort,
      direction,
    }),
    getCurrentUser(),
  ]);

  const isAuthenticated =
    user !== null;

  const productCount =
    data.products.length;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-10 lg:pb-24 lg:pt-8">
        {/* Hero */}
        <section
          aria-label="Agora marketplace introduction"
        >
          <StorefrontHero />
        </section>

        {/* Product marketplace */}
        <RevealSection
          id="products"
          className="mt-12 scroll-mt-24 sm:mt-16 lg:mt-20"
        >
          {/* Section heading */}
          <div className="mb-7 border-b border-zinc-200 pb-6 sm:mb-8">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Sparkles size={14} />
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Discover Agora
              </span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              {search
                ? "Search results"
                : categoryId
                  ? "Explore products"
                  : "Discover your next favorite"}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
              {search
                ? `Showing products matching "${search}".`
                : categoryId
                  ? "Browse products from your selected category."
                  : "Explore our collection of everyday essentials, technology, fashion, and more."}
            </p>
          </div>

          {/* Sorting and active filters */}
          <div className="mb-7 sm:mb-9">
            <ProductFilters
              search={search}
              categoryId={categoryId}
              sort={sort}
              direction={direction}
            />
          </div>

          {/* Empty state */}
          {productCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50/50 px-6 py-20 text-center sm:py-28">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm">
                <PackageSearch
                  size={30}
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">
                No products found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                We couldn't find products matching your search.
                Try another keyword or explore all categories.
              </p>

              <Link
                href="/#products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Browse all products

                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* Product grid */}
              <AnimatedProductGrid>
                {data.products.map(
                  (product, index) => (
                    <AnimatedProductItem
                      key={product.id}
                    >
                      <ProductCard
                        product={product}
                        priority={
                          index < 2
                        }
                        isAuthenticated={
                          isAuthenticated
                        }
                      />
                    </AnimatedProductItem>
                  )
                )}
              </AnimatedProductGrid>

              {/* Pagination */}
              <div className="mt-12 border-t border-zinc-100 pt-8 sm:mt-16 sm:pt-10">
                <ProductPagination
                  page={data.page}
                  totalPages={
                    data.totalPages
                  }
                  search={search}
                  categoryId={
                    categoryId
                  }
                  sort={sort}
                  direction={
                    direction
                  }
                />
              </div>
            </>
          )}
        </RevealSection>
      </div>
    </main>
  );
}
