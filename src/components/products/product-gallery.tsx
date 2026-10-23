"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react";

import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const orderedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.primary && !b.primary) return -1;
      if (!a.primary && b.primary) return 1;

      return a.displayOrder - b.displayOrder;
    });
  }, [images]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeSelectedIndex =
    selectedIndex >= 0 &&
    selectedIndex < orderedImages.length
      ? selectedIndex
      : 0;

  const selectedImage = orderedImages[safeSelectedIndex];

  function showPrevious() {
    if (orderedImages.length < 2) return;

    setSelectedIndex(
      (current) =>
        (current - 1 + orderedImages.length) %
        orderedImages.length
    );
  }

  function showNext() {
    if (orderedImages.length < 2) return;

    setSelectedIndex(
      (current) => (current + 1) % orderedImages.length
    );
  }

  if (!selectedImage) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-50 text-zinc-400">
        <ImageOff size={32} strokeWidth={1.5} />

        <p className="text-sm">
          No image available
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Main product image */}

      <div className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white sm:aspect-[5/4] lg:aspect-[4/3]">
        <Image
          key={`${selectedImage.id}-${safeSelectedIndex}`}
          src={selectedImage.imageUrl}
          alt={`${productName} — image ${
            safeSelectedIndex + 1
          }`}
          fill
          unoptimized
          priority={safeSelectedIndex === 0}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 90vw, 55vw"
          className="object-contain"
        />

        {/* Navigation arrows */}

        {orderedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous product image"
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-800 shadow-sm transition hover:bg-zinc-950 hover:text-white sm:left-3"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next product image"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-800 shadow-sm transition hover:bg-zinc-950 hover:text-white sm:right-3"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image counter */}

            <span className="absolute bottom-3 right-3 z-10 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm">
              {safeSelectedIndex + 1} /{" "}
              {orderedImages.length}
            </span>
          </>
        )}
      </div>

      {/* Product thumbnails */}

      {orderedImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 sm:gap-3">
          {orderedImages.map((image, index) => {
            const selected =
              index === safeSelectedIndex;

            return (
              <button
                key={`${image.id}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`View ${productName} image ${
                  index + 1
                }`}
                aria-pressed={selected}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition sm:h-20 sm:w-20 ${
                  selected
                    ? "border-zinc-950 ring-1 ring-zinc-950"
                    : "border-zinc-200 hover:border-zinc-500"
                }`}
              >
                <Image
                  src={
                    image.thumbnailUrl ||
                    image.imageUrl
                  }
                  alt={`${productName} thumbnail ${
                    index + 1
                  }`}
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 64px, 80px"
                  className="pointer-events-none object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
