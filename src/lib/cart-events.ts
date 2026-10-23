export const CART_UPDATED_EVENT = "agora:cart-updated";

export function notifyCartUpdated(): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
