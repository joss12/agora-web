"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteProductButtonProps {
  productId: number;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Deletion failed");
      }

      setOpen(false);

      toast.success("Product deleted successfully.");

      router.refresh();
    } catch {
      toast.error("Unable to delete this product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 size={14} />

        {loading ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete product?"
        description={
          <>
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-zinc-900">
              &quot;{productName}&quot;
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete product"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
