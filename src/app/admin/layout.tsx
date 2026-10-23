import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

const adminLinks = [
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

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-zinc-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-zinc-100 px-6 py-6">
          <Link
            href="/admin"
            className="text-lg font-bold tracking-tight"
          >
            AGORA
          </Link>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            Administration
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Icon
                    size={18}
                    className="shrink-0 text-zinc-500"
                  />

                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-5 border-t border-zinc-200" />

          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <Store
              size={18}
              className="shrink-0"
            />
            View storefront
          </Link>
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <p className="mb-3 truncate px-2 text-xs text-zinc-500">
            {user.firstName}
          </p>

          <LogoutButton variant="admin" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-[73px] lg:px-8 xl:px-10">
            <AdminMobileNav
              firstName={user.firstName}
            />

            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-zinc-950">
                Admin dashboard
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                Store operations
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden truncate text-sm text-zinc-600 sm:block">
                Welcome, {user.firstName}
              </span>

              <div className="lg:hidden">
                <LogoutButton variant="admin" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
