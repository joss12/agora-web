"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";

import { notifyWishlistUpdated } from "@/lib/wishlist-events";
import type { WishlistStatusResponse } from "@/types/wishlist";

interface WishlistButtonProps {
  productId: number;
  isAuthenticated?: boolean;
}

export function WishlistButton({
  productId,
  isAuthenticated = false,
}: WishlistButtonProps) {
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(isAuthenticated);
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setSaved(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/wishlist/products/${productId}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        setSaved(false);
        return;
      }

      if (!response.ok) {
        return;
      }

      const data: WishlistStatusResponse =
        await response.json();

      setSaved(data.saved);
    } catch {
      // Preserve the current state if the request fails.
    } finally {
      setLoading(false);
    }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSaved(false);
      setLoading(false);
      return;
    }

    void loadStatus();

    function handleWishlistUpdated() {
      void loadStatus();
    }

    window.addEventListener(
      "agora:wishlist-updated",
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        "agora:wishlist-updated",
        handleWishlistUpdated
      );
    };
  }, [isAuthenticated, loadStatus]);

  async function handleToggle() {
    if (loading || submitting) {
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please sign in to save products.");

      router.push(
        `/login?next=${encodeURIComponent(
          `/products/${productId}`
        )}`
      );

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/wishlist/${productId}`,
        {
          method: saved ? "DELETE" : "POST",
        }
      );

      if (response.status === 401) {
        toast.info("Your session has expired. Please sign in.");

        router.push(
          `/login?next=${encodeURIComponent(
            `/products/${productId}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to update your wishlist."
        );
      }

      setSaved((previous) => !previous);

      notifyWishlistUpdated();

      toast.success(
        saved
          ? "Removed from your wishlist."
          : "Added to your wishlist!"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading || submitting}
      aria-label={
        saved
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      aria-pressed={saved}
      title={
        saved
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition hover:scale-105 hover:text-red-500 disabled:cursor-wait disabled:opacity-60"
    >
      <Heart
        size={20}
        className={
          saved
            ? "fill-red-500 text-red-500"
            : ""
        }
      />
    </button>
  );
}
