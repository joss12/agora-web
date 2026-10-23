"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 18,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const filled = value <= Math.round(rating);

        if (interactive) {
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange?.(value)}
              aria-label={`Rate ${value} stars`}
              aria-pressed={rating === value}
              className="rounded p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <Star
                size={size}
                className={
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300"
                }
              />
            </button>
          );
        }

        return (
          <Star
            key={value}
            size={size}
            className={
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-300"
            }
          />
        );
      })}
    </div>
  );
}
