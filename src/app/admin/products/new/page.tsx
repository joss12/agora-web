import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/api";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="min-w-0">
      <Link
        href="/admin/products"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={16} />
        Products
      </Link>

      <div className="mb-7 mt-5 sm:mb-8 sm:mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
          Product management
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Add product
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Create a new product for Agora.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
