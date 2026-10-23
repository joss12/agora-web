"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface LogoutButtonProps {
  variant?: "admin" | "storefront";
}

export function LogoutButton({
  variant = "storefront",
}: LogoutButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const submittingRef = useRef(false);

  async function handleLogout() {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }

      toast.success("You have signed out successfully.");

      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      className={
        variant === "admin"
          ? "w-full rounded-lg border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          : "text-sm font-medium text-zinc-600 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
