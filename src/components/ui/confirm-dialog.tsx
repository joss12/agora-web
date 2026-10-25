"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

type ConfirmDialogVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const danger = variant === "danger";
  const warning = variant === "warning";

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out"
        />

        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl outline-none sm:p-7"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                danger
                  ? "bg-red-50 text-red-600"
                  : warning
                    ? "bg-amber-50 text-amber-600"
                    : "bg-zinc-100 text-zinc-900"
              }`}
            >
              <AlertTriangle size={23} strokeWidth={1.8} />
            </div>

            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </AlertDialog.Cancel>
          </div>

          <AlertDialog.Title className="text-xl font-bold tracking-tight text-zinc-950">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-3 text-sm leading-6 text-zinc-500">
            {description}
          </AlertDialog.Description>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={loading}
                onClick={(event) => {
                  event.preventDefault();
                  void onConfirm();
                }}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  danger
                    ? "bg-red-600 hover:bg-red-700"
                    : warning
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-zinc-950 hover:bg-zinc-800"
                }`}
              >
                {loading && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {loading ? "Please wait..." : confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
