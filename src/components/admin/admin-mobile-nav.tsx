"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  Boxes,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";

interface AdminMobileNavProps {
  firstName: string;
}

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/products/archived",
    label: "Archived Products",
    icon: Archive,
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: Boxes,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
];

export function AdminMobileNav({
  firstName,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <button
          type="button"
          aria-label="Open admin navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white transition hover:bg-zinc-50"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            Admin
          </p>

          <p className="truncate text-xs text-zinc-500">
            {firstName}
          </p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-5">
              <div>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="font-bold tracking-tight"
                >
                  AGORA
                </Link>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Administration
                </p>
              </div>

              <button
                type="button"
                aria-label="Close admin navigation"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-zinc-100"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {links.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() =>
                        setOpen(false)
                      }
                      className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      <Icon
                        size={18}
                        className="shrink-0"
                      />

                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="my-4 border-t border-zinc-200" />

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <Store
                  size={18}
                  className="shrink-0"
                />
                View storefront
              </Link>
            </nav>

            <div className="border-t border-zinc-200 p-4">
              <p className="text-xs text-zinc-400">
                Signed in as
              </p>

              <p className="mt-1 truncate text-sm font-semibold">
                {firstName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
