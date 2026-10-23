import Link from "next/link";
import { OrderHistory } from "@/components/orders/order-history";

export const metadata = {
  title: "My Orders | Agora",
  description: "View your order history and order details.",
};

export default function OrdersPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500"
      >
        <Link
          href="/"
          className="transition-colors hover:text-gray-900"
        >
          Home
        </Link>

        <span className="text-gray-300">/</span>

        <span className="font-medium text-gray-900">
          My Orders
        </span>
      </nav>

      <div className="mb-7 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
          My Orders
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
          Track your purchases and view payment details.
        </p>
      </div>

      <OrderHistory />
    </main>
  );
}
