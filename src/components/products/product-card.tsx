import Image from "next/image";
import Link from "next/link";
import { ImageOff, Check, ArrowUpRight } from "lucide-react";

import { formatKRW } from "@/lib/format";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  isAuthenticated?: boolean;
}

export function ProductCard({
  product,
  priority = false,
  isAuthenticated = false,
}: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.primary);

  const imageUrl =
    primaryImage?.imageUrl ??
    product.images[0]?.imageUrl ??
    product.primaryImageUrl ??
    null;

  const image =
    imageUrl &&
    !imageUrl.toLowerCase().includes("loremflickr.com")
      ? imageUrl
      : null;

  const inStock = product.stock > 0;

  return (
    <article className="group relative min-w-0">
      <Link
        href={`/products/${product.id}`}
        className="block min-w-0"
      >
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-inset ring-zinc-100 transition-all duration-300 group-hover:bg-zinc-100/70 group-hover:ring-zinc-200">
          {image ? (
            <Image
              unoptimized
              src={image}
              alt={product.name}
              fill
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 639px) 50vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
              className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.045] sm:p-4"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm sm:h-16 sm:w-16">
                <ImageOff size={26} strokeWidth={1.5} />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500 sm:text-sm">
                  Image coming soon
                </p>

                <p className="mt-1 hidden text-xs text-zinc-400 sm:block">
                  Product preview unavailable
                </p>
              </div>
            </div>
          )}

          {/* Sold out badge */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
              <span className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Sold out
              </span>
            </div>
          )}

          {/* View product indicator */}
          <div className="pointer-events-none absolute bottom-3 left-3 hidden translate-y-2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-zinc-900 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:inline-flex">
            View product
            <ArrowUpRight size={13} />
          </div>
        </div>

        {/* Product information */}
        <div className="mt-3 min-w-0 space-y-1 sm:mt-4">
          {/* Category */}
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:text-[11px]">
            {product.category?.name ?? "Uncategorized"}
          </p>

          {/* Product name */}
          <h2 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-zinc-800 transition-colors duration-200 group-hover:text-zinc-950 sm:text-sm">
            {product.name}
          </h2>

          {/* Price */}
          <p className="pt-1 text-base font-bold tracking-tight text-zinc-950 sm:text-lg">
            {formatKRW(product.price)}
          </p>

          {/* Stock */}
          {inStock ? (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-emerald-700">
              <Check size={13} strokeWidth={2.5} />
              <span>In stock</span>
            </div>
          ) : (
            <p className="pt-1 text-[11px] font-medium text-red-600">
              Currently unavailable
            </p>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
        <WishlistButton
          productId={product.id}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  );
}
