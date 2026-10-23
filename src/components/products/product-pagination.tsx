import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  search?: string;
  categoryId?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export function ProductPagination({
  page,
  totalPages,
  search,
  categoryId,
  sort,
  direction,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function createHref(targetPage: number) {
    const params = new URLSearchParams();

    params.set("page", String(targetPage + 1));

    if (search) {
      params.set("search", search);
    }

    if (categoryId !== undefined) {
      params.set(
        "categoryId",
        String(categoryId)
      );
    }

    if (sort && sort !== "id") {
      params.set("sort", sort);
    }

    if (direction && direction !== "asc") {
      params.set("direction", direction);
    }

    return `/?${params.toString()}#products`;
  }

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index
  ).filter(
    (pageNumber) =>
      pageNumber === 0 ||
      pageNumber === totalPages - 1 ||
      Math.abs(pageNumber - page) <= 2
  );

  return (
    <nav
      aria-label="Product pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12"
    >
      {page > 0 ? (
        <Link
          href={createHref(page - 1)}
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <ChevronLeft size={17} />
        </Link>
      ) : (
        <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-zinc-100 text-zinc-300">
          <ChevronLeft size={17} />
        </span>
      )}

      {visiblePages.map(
        (pageNumber, index) => {
          const previous =
            visiblePages[index - 1];

          const showEllipsis =
            previous !== undefined &&
            pageNumber - previous > 1;

          return (
            <div
              key={pageNumber}
              className="flex items-center gap-2"
            >
              {showEllipsis && (
                <span className="px-1 text-sm text-zinc-400">
                  …
                </span>
              )}

              <Link
                href={createHref(pageNumber)}
                aria-current={
                  pageNumber === page
                    ? "page"
                    : undefined
                }
                className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                  pageNumber === page
                    ? "bg-zinc-950 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {pageNumber + 1}
              </Link>
            </div>
          );
        }
      )}

      {page < totalPages - 1 ? (
        <Link
          href={createHref(page + 1)}
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <ChevronRight size={17} />
        </Link>
      ) : (
        <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-zinc-100 text-zinc-300">
          <ChevronRight size={17} />
        </span>
      )}
    </nav>
  );
}
