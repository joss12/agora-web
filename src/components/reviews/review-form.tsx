"use client";

import { useState } from "react";

import { StarRating } from "./star-rating";
import type { ProductReview, ReviewPayload } from "@/types/review";

interface ReviewFormProps {
  productId: number;
  review?: ProductReview;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  review,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [title, setTitle] = useState(review?.title ?? "");
  const [content, setContent] = useState(review?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    const payload: ReviewPayload = {
      rating,
      title: title.trim(),
      content: content.trim(),
    };

    try {
      const response = await fetch(
        review
          ? `/api/reviews/${review.id}`
          : `/api/products/${productId}/reviews`,
        {
          method: review ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : response.status === 403
              ? "Only customers with a delivered purchase can review this product."
              : response.status === 409
                ? "You have already reviewed this product."
                : "Unable to save your review."
        );
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-zinc-950">
          {review ? "Edit your review" : "Write a review"}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Reviews are available after your order has been delivered.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          Your rating
        </label>

        <StarRating
          rating={rating}
          size={25}
          interactive
          onChange={setRating}
        />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Review title
        </label>

        <input
          id="review-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={150}
          required
          placeholder="Summarize your experience"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div>
        <label
          htmlFor="review-content"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Your review
        </label>

        <textarea
          id="review-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          required
          placeholder="Tell other customers about this product..."
          className="w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : review
              ? "Save changes"
              : "Submit review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
