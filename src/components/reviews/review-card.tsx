"use client";

import { useState } from "react";
import { BadgeCheck, Pencil, Trash2 } from "lucide-react";

import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import type { ProductReview } from "@/types/review";

interface ReviewCardProps {
  review: ProductReview;
  currentUserId?: number;
  onChanged: () => void;
}

export function ReviewCard({
  review,
  currentUserId,
  onChanged,
}: ReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId === review.customerId;

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete your review.");
      }

      onChanged();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ReviewForm
        productId={review.productId}
        review={review}
        onSuccess={onChanged}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <article className="border-b border-zinc-100 py-6 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StarRating rating={review.rating} />

          <h3 className="mt-3 font-semibold text-zinc-950">
            {review.title}
          </h3>
        </div>

        {review.verifiedPurchase && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck size={14} />
            Verified Purchase
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-600">
        {review.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">
            {review.customerName}
          </span>

          <span className="mx-2">·</span>

          <time dateTime={review.createdAt}>
            {new Date(review.createdAt).toLocaleDateString("en-KR")}
          </time>
        </div>

        {isOwner && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </article>
  );
}
