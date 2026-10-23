import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { getCategories, getProduct } from "@/lib/api";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getProduct(Number(id)),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-w-0">
      <Link
        href="/admin/products"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={16} />
        Products
      </Link>

      <div className="mb-7 mt-5 min-w-0 sm:mb-8 sm:mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
          Product management
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Edit product
        </h1>

        <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-zinc-600 sm:text-base">
          Update{" "}
          <span className="font-medium text-zinc-800">
            {product.name}
          </span>{" "}
          and manage its images.
        </p>
      </div>

      <ProductForm
        productId={product.id}
        categories={categories}
        initialValues={{
          name: product.name,
          sku: product.sku,
          description: product.description ?? "",
          price: product.price,
          stock: product.stock,
          categoryId: product.category?.id ?? 0,
        }}
      />

      <ProductImageManager product={product} />
    </div>
  );
}
