import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { getCategories } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

import { LogoutButton } from "@/components/auth/logout-button";
import { CustomerNav } from "@/components/storefront/customer-nav";
import { CategoryNavigation } from "@/components/storefront/category-navigation";
import { ToastProvider } from "@/components/providers/toast-provider";
import { BackToTop } from "@/components/storefront/back-to-top";

export const metadata: Metadata = {
  title: {
    default: "Agora",
    template: "%s | Agora",
  },
  description:
    "Discover electronics, sneakers, and everyday essentials at Agora.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    getCategories(),
  ]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-white text-zinc-900 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:h-[72px] sm:gap-5 sm:px-6 lg:gap-8 lg:px-10">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Agora homepage"
              className="group inline-flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white transition-transform group-hover:scale-105">
                <ShoppingBag
                  size={18}
                  strokeWidth={1.8}
                />
              </span>

              <span className="hidden text-xl font-bold tracking-[-0.06em] text-zinc-950 sm:inline sm:text-2xl">
                agora
                <span className="text-zinc-400">
                  .
                </span>
              </span>
            </Link>

            {/* Header categories and search */}
            <div className="min-w-0 flex-1 lg:mx-auto lg:max-w-[650px]">
              <Suspense fallback={null}>
                <CategoryNavigation
                  categories={categories}
                />
              </Suspense>
            </div>

            {/* Role-based navigation */}
            <div className="shrink-0">
              {user?.role === "CUSTOMER" ? (
                <CustomerNav
                  firstName={user.firstName}
                />
              ) : user?.role === "ADMIN" ? (
                <nav
                  aria-label="Administrator navigation"
                  className="flex min-w-0 items-center gap-2 sm:gap-4"
                >
                  <Link
                    href="/"
                    className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-950 sm:block"
                  >
                    Storefront
                  </Link>

                  <Link
                    href="/admin"
                    className="rounded-xl bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-4 sm:text-sm"
                  >
                    Dashboard
                  </Link>

                  <span className="hidden text-sm text-zinc-500 lg:inline">
                    Hi, {user.firstName}
                  </span>

                  <div className="hidden sm:block">
                    <LogoutButton />
                  </div>
                </nav>
              ) : (
                <nav
                  aria-label="Guest navigation"
                  className="flex items-center gap-2 sm:gap-4"
                >
                  <Link
                    href="/#products"
                    className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-950 lg:block"
                  >
                    Shop
                  </Link>

                  <Link
                    href="/register"
                    className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-950 lg:block"
                  >
                    Create account
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-4"
                  >
                    Sign in
                  </Link>
                </nav>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="w-full flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-200 bg-zinc-50/70 sm:mt-20">
          <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-10">
            <div className="grid gap-10 border-b border-zinc-200 pb-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="lg:col-span-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <ShoppingBag size={18} />
                  </span>

                  <span className="text-2xl font-bold tracking-[-0.06em] text-zinc-950">
                    agora
                    <span className="text-zinc-400">
                      .
                    </span>
                  </span>
                </Link>

                <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-500">
                  Discover electronics, fashion, and everyday essentials
                  in one thoughtfully designed marketplace.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600">
                  <ShoppingBag size={14} />
                  Your everyday marketplace
                </div>
              </div>

              {/* Shopping */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                  Shopping
                </h2>

                <div className="mt-5 flex flex-col items-start gap-3">
                  <FooterLink href="/#products">
                    All products
                  </FooterLink>

                  <FooterLink href="/#products">
                    Categories
                  </FooterLink>

                  <FooterLink href="/cart">
                    Shopping cart
                  </FooterLink>

                  <FooterLink href="/wishlist">
                    Wishlist
                  </FooterLink>
                </div>
              </div>

              {/* Account */}
              <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                  My Agora
                </h2>

                <div className="mt-5 flex flex-col items-start gap-3">
                  <FooterLink href="/account">
                    My account
                  </FooterLink>

                  <FooterLink href="/orders">
                    My orders
                  </FooterLink>

                  <FooterLink href="/login">
                    Sign in
                  </FooterLink>

                  <FooterLink href="/register">
                    Create account
                  </FooterLink>
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div className="flex flex-col gap-4 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                © {new Date().getFullYear()} Agora. All rights reserved.
              </p>

              <p className="text-xs text-zinc-400">
                Built for a better shopping experience.
              </p>
            </div>
          </div>
        </footer>
        <BackToTop />
        <ToastProvider />
      </body>
    </html>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-950"
    >
      {children}

      <ArrowUpRight
        size={13}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}
