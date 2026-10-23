"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowDownUp,
  RotateCcw,
} from "lucide-react";

interface ProductFiltersProps {
  search?: string;
  categoryId?: number;
  sort: string;
  direction: "asc" | "desc";
}

export function ProductFilters({
  search,
  categoryId,
  sort,
  direction,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(
    updates: Record<string, string | null>
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    const queryString = params.toString();

    router.push(
      `${queryString ? `/?${queryString}` : "/"}#products`,
      { scroll: true }
    );
  }

  function handleSort(value: string) {
    const [nextSort, nextDirection] = value.split(":");

    navigate({
      sort: nextSort === "id" ? null : nextSort,
      direction:
        nextSort === "id" && nextDirection === "asc"
          ? null
          : nextDirection,
    });
  }

  function clearFilters() {
    router.push("/#products", {
      scroll: true,
    });
  }

  const hasFilters =
    Boolean(search) ||
    categoryId !== undefined ||
    sort !== "id" ||
    direction !== "asc";

  return (
    <div className="space-y-4">
      {/* Sorting */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-500">
          Browse our collection
        </p>

        <div className="relative flex min-h-11 shrink-0 items-center rounded-xl border border-zinc-200 bg-white">
          <ArrowDownUp
            size={16}
            className="pointer-events-none absolute left-3 text-zinc-500"
          />

          <select
            value={`${sort}:${direction}`}
            onChange={(event) =>
              handleSort(event.target.value)
            }
            aria-label="Sort products"
            className="min-h-11 w-44 cursor-pointer appearance-none bg-transparent py-2.5 pl-9 pr-7 text-sm font-medium text-zinc-800 outline-none sm:w-56"
          >
            <option value="id:asc">Default</option>

            <option value="createdAt:desc">
              Newest first
            </option>

            <option value="createdAt:asc">
              Oldest first
            </option>

            <option value="price:asc">
              Price: Low to high
            </option>

            <option value="price:desc">
              Price: High to low
            </option>

            <option value="name:asc">
              Name: A to Z
            </option>

            <option value="name:desc">
              Name: Z to A
            </option>
          </select>

          <span className="pointer-events-none absolute right-3 text-xs text-zinc-400">
            ▼
          </span>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {search && (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700">
                Search: {search}
              </span>
            )}

            {categoryId !== undefined && (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700">
                Category selected
              </span>
            )}

            {(sort !== "id" || direction !== "asc") && (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700">
                Custom sorting
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-950 sm:text-sm"
          >
            <RotateCcw size={14} />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
