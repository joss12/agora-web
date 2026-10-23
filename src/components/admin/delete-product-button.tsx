"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: number;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    if (
      !window.confirm(
        `Permanently delete "${productName}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Deletion failed"
        );
      }

      router.refresh();
    } catch {
      setError(
        "Unable to delete this product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 size={14} />

        {loading
          ? "Deleting..."
          : "Delete"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 max-w-48 text-xs leading-5 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
