export const WISHLIST_UPDATED_EVENT = "agora:wishlist-updated";

export function notifyWishlistUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
  }
}
