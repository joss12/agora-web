"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

type RestoreProductButtonProps = {
  productId: number;
  productName: string;
};

export function RestoreProductButton({
  productId,
  productName,
}: RestoreProductButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  async function handleRestore() {
    const confirmed =
      window.confirm(
        `Restore "${productName}" to your store?`
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/products/${productId}/restore`,
          {
            method: "PATCH",
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ??
            "Unable to restore product"
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to restore product"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRestore}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
      >
        <RotateCcw size={14} />

        {loading
          ? "Restoring..."
          : "Restore"}
      </button>

      {error && (
        <p
          role="alert"
          className="max-w-48 text-right text-xs leading-5 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
