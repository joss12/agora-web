import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  LayoutGrid,
} from "lucide-react";

import type { Category } from "@/types/product";

interface CategoryStripProps {
  categories: Category[];
  activeCategoryId?: number;
}

export function CategoryStrip({
  categories,
  activeCategoryId,
}: CategoryStripProps) {
  if (categories.length === 0) {
    return null;
  }

  const allProductsActive = activeCategoryId === undefined;

  const categoryLink = (active: boolean) =>
    `group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all duration-200 lg:w-full ${
      active
        ? "border-zinc-950 bg-zinc-950 font-semibold text-white"
        : "border-zinc-200 bg-white font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
    }`;

  const iconClasses = (active: boolean) =>
    `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
      active
        ? "bg-white/15 text-white"
        : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
    }`;

  return (
    <nav
      aria-label="Product categories"
      className="w-full"
    >
      {/* Sidebar heading */}
      <div className="mb-5 hidden lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Explore Agora
        </p>

        <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">
          Categories
        </h2>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Browse our collections.
        </p>
      </div>

      {/* Mobile heading */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Shop by category
        </h2>

        <Link
          href="/#products"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600"
        >
          Browse all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category links */}
      <div
        className="
          flex gap-2 overflow-x-auto pb-2
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0
        "
      >
        {/* All products */}
        <Link
          href="/#products"
          aria-current={allProductsActive ? "page" : undefined}
          className={categoryLink(allProductsActive)}
        >
          <span className={iconClasses(allProductsActive)}>
            <LayoutGrid size={16} />
          </span>

          <span className="whitespace-nowrap">
            All products
          </span>
        </Link>

        {/* Dynamic categories */}
        {categories.map((category) => {
          const active = category.id === activeCategoryId;

          return (
            <Link
              key={category.id}
              href={`/?categoryId=${category.id}#products`}
              aria-current={active ? "page" : undefined}
              className={categoryLink(active)}
            >
              <span className={iconClasses(active)}>
                <Boxes size={16} />
              </span>

              <span className="whitespace-nowrap lg:whitespace-normal">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Sidebar footer */}
      <div className="mt-6 hidden border-t border-zinc-100 pt-5 lg:block">
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-950"
        >
          View all products
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}
