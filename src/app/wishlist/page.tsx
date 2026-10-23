import type { Metadata } from "next";

import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved products on Agora.",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Your favorites
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          My Wishlist
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          All the products you've saved, in one place.
        </p>
      </div>

      <WishlistView />
    </main>
  );
}
