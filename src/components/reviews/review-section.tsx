"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { StarRating } from "./star-rating";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";

import type {
  ProductRating,
  ReviewPage,
} from "@/types/review";

interface ReviewSectionProps {
  productId: number;
  currentUserId?: number;
}

export function ReviewSection({
  productId,
  currentUserId,
}: ReviewSectionProps) {
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [reviews, setReviews] = useState<ReviewPage | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ratingResponse, reviewsResponse] = await Promise.all([
        fetch(`/api/products/${productId}/ratings`, {
          cache: "no-store",
        }),
        fetch(
          `/api/products/${productId}/reviews?page=${page}&size=5`,
          { cache: "no-store" }
        ),
      ]);

      if (!ratingResponse.ok || !reviewsResponse.ok) {
        throw new Error("Unable to load product reviews.");
      }

      const ratingData: ProductRating = await ratingResponse.json();
      const reviewsData: ReviewPage = await reviewsResponse.json();

      setRating(ratingData);
      setReviews(reviewsData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  function handleChanged() {
    setShowForm(false);
    void loadReviews();
  }

  return (
    <section
      id="reviews"
      className="mt-16 border-t border-zinc-200 pt-10 sm:mt-20"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Customer Reviews
          </h2>

          {rating && (
            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={rating.averageRating} />

              <span className="text-lg font-semibold">
                {rating.averageRating.toFixed(1)}
              </span>

              <span className="text-sm text-zinc-500">
                ({rating.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>

        {currentUserId ? (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            {showForm ? "Close form" : "Write a review"}
          </button>
        ) : (
          <Link
            href={`/login?next=/products/${productId}`}
            className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Log in to review
          </Link>
        )}
      </div>

      {showForm && currentUserId && (
        <div className="mt-8">
          <ReviewForm
            productId={productId}
            onSuccess={handleChanged}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-zinc-500">
          Loading reviews...
        </p>
      ) : reviews?.content.length ? (
        <div className="mt-8">
          {reviews.content.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onChanged={handleChanged}
            />
          ))}

          {reviews.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-zinc-600">
                Page {page + 1} of {reviews.totalPages}
              </span>

              <button
                type="button"
                disabled={page + 1 >= reviews.totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-8 rounded-xl bg-zinc-50 p-6 text-sm text-zinc-500">
          No reviews yet. Be the first to share your experience!
        </p>
      )}
    </section>
  );
}
