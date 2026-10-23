"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { toast } from "react-toastify";

import type { Cart } from "@/types/cart";
import type { WishlistCountResponse } from "@/types/wishlist";
import { CART_UPDATED_EVENT } from "@/lib/cart-events";
import { WISHLIST_UPDATED_EVENT } from "@/lib/wishlist-events";

interface CustomerNavProps {
  firstName: string;
}

export function CustomerNav({
  firstName,
}: CustomerNavProps) {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setCartCount(0);
        }
        return;
      }

      const cart: Cart = await response.json();
      setCartCount(cart.totalQuantity);
    } catch {
      // Preserve count during temporary network errors.
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist/count", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setWishlistCount(0);
        }
        return;
      }

      const data: WishlistCountResponse = await response.json();
      setWishlistCount(data.count);
    } catch {
      // Preserve count during temporary network errors.
    }
  }, []);

  useEffect(() => {
    void loadCart();
    void loadWishlist();

    function handleCartUpdated() {
      void loadCart();
    }

    function handleWishlistUpdated() {
      void loadWishlist();
    }

    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated
    );

    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdated
      );

      window.removeEventListener(
        WISHLIST_UPDATED_EVENT,
        handleWishlistUpdated
      );
    };
  }, [loadCart, loadWishlist]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }

      setCartCount(0);
      setWishlistCount(0);
      setMenuOpen(false);

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  }

  return (
    <nav
      aria-label="Customer navigation"
      className="flex min-w-0 items-center gap-0.5 sm:gap-1.5"
    >
      {/* Shop */}
      <Link
        href="/"
        className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 lg:inline-flex"
      >
        Shop
      </Link>

      {/* Search */}
      <Link
        href="/#products"
        aria-label="Search products"
        title="Search products"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
      >
        <Search size={19} strokeWidth={1.8} />
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Wishlist with ${wishlistCount} items`}
        title="My Wishlist"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
      >
        <Heart size={20} strokeWidth={1.8} />

        {wishlistCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        aria-label={`Shopping cart with ${cartCount} items`}
        title="Shopping cart"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
      >
        <ShoppingBag size={20} strokeWidth={1.8} />

        {cartCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold leading-none text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {/* Account */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="customer-account-menu"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-10 items-center gap-2 rounded-full border border-transparent pl-1 pr-1 transition hover:border-zinc-200 hover:bg-zinc-50 sm:pl-2 sm:pr-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white">
            <User size={17} strokeWidth={1.8} />
          </span>

          <span className="hidden max-w-28 truncate text-sm font-semibold text-zinc-800 md:block">
            {firstName}
          </span>

          <ChevronDown
            size={14}
            className={`hidden text-zinc-500 transition-transform md:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div
            id="customer-account-menu"
            role="menu"
            aria-label="Account options"
            className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
          >
            <div className="border-b border-zinc-100 px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Signed in as
              </p>

              <p className="mt-1 truncate text-base font-semibold text-zinc-950">
                {firstName}
              </p>
            </div>

            <div className="py-2">
              <MenuLink
                href="/account"
                label="My Account"
                icon={<User size={17} />}
                onClick={() => setMenuOpen(false)}
              />

              <MenuLink
                href="/orders"
                label="My Orders"
                icon={<Package size={17} />}
                onClick={() => setMenuOpen(false)}
              />

              <MenuLink
                href="/wishlist"
                label="My Wishlist"
                icon={<Heart size={17} />}
                onClick={() => setMenuOpen(false)}
              />

              <MenuLink
                href="/account"
                label="Saved Addresses"
                icon={<MapPin size={17} />}
                onClick={() => setMenuOpen(false)}
              />
            </div>

            <div className="border-t border-zinc-100 pt-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function MenuLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
    >
      <span className="text-zinc-500">{icon}</span>
      {label}
    </Link>
  );
}
