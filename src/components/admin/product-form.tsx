"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  X,
} from "lucide-react";

import type {
  Category,
  Product,
} from "@/types/product";
import type { ProductFormData } from "@/types/admin-product";

interface ProductFormProps {
  categories: Category[];
  initialValues?: ProductFormData;
  productId?: number;
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function ProductForm({
  categories,
  initialValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<ProductFormData>(
      initialValues ?? {
        name: "",
        sku: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId:
          categories[0]?.id ?? 0,
      }
    );

  const [
    pendingImages,
    setPendingImages,
  ] = useState<PendingImage[]>([]);

  const pendingImagesRef =
    useRef<PendingImage[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const editing =
    productId !== undefined;

  useEffect(() => {
    pendingImagesRef.current =
      pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      for (const image of pendingImagesRef.current) {
        URL.revokeObjectURL(
          image.previewUrl
        );
      }
    };
  }, []);

  function updateField<
    K extends keyof ProductFormData,
  >(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const images = files.filter(
      (file) =>
        file.type.startsWith(
          "image/"
        )
    );

    if (
      images.length !== files.length
    ) {
      setError(
        "Only image files can be uploaded."
      );
    } else {
      setError("");
    }

    const selected = images.map(
      (file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl:
          URL.createObjectURL(file),
      })
    );

    setPendingImages(
      (current) => [
        ...current,
        ...selected,
      ]
    );

    event.target.value = "";
  }

  function removePendingImage(
    id: string
  ) {
    setPendingImages(
      (current) => {
        const image = current.find(
          (item) => item.id === id
        );

        if (image) {
          URL.revokeObjectURL(
            image.previewUrl
          );
        }

        return current.filter(
          (item) => item.id !== id
        );
      }
    );
  }

  async function uploadImages(
    createdProductId: number
  ) {
    for (const image of pendingImages) {
      const formData =
        new FormData();

      formData.append(
        "file",
        image.file
      );

      const response =
        await fetch(
          `/api/admin/products/${createdProductId}/images`,
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        let message =
          `Unable to upload ${image.file.name}.`;

        try {
          const data =
            await response.json();

          if (
            typeof data?.message ===
              "string" &&
            data.message.length > 0
          ) {
            message = data.message;
          }
        } catch {}

        throw new Error(message);
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.categoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (
      form.price < 0 ||
      form.stock < 0
    ) {
      setError(
        "Price and stock cannot be negative."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          editing
            ? `/api/admin/products/${productId}`
            : "/api/admin/products",
          {
            method: editing
              ? "PUT"
              : "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              form
            ),
          }
        );

      if (!response.ok) {
        let message = editing
          ? "Unable to update product."
          : "Unable to create product.";

        try {
          const data =
            await response.json();

          if (
            typeof data?.message ===
              "string" &&
            data.message.length > 0
          ) {
            message = data.message;
          }
        } catch {}

        throw new Error(message);
      }

      const savedProduct =
        (await response.json()) as Product;

      if (
        !editing &&
        pendingImages.length > 0
      ) {
        await uploadImages(
          savedProduct.id
        );
      }

      router.push(
        "/admin/products"
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 disabled:bg-zinc-100 sm:text-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white"
    >
      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="min-w-0">
            <label
              htmlFor="name"
              className="text-sm font-medium text-zinc-800"
            >
              Product name
            </label>

            <input
              id="name"
              required
              maxLength={200}
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Air Jordan 12 Retro"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="sku"
              className="text-sm font-medium text-zinc-800"
            >
              SKU
            </label>

            <input
              id="sku"
              required
              value={form.sku}
              onChange={(event) =>
                updateField(
                  "sku",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="AJ12-RETRO-001"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-800"
          >
            Description
          </label>

          <textarea
            id="description"
            rows={6}
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            className={`${inputClass} resize-y`}
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div>
            <label
              htmlFor="price"
              className="text-sm font-medium text-zinc-800"
            >
              Price (KRW)
            </label>

            <input
              id="price"
              type="number"
              inputMode="numeric"
              required
              min={0}
              step={1}
              value={form.price}
              onChange={(event) =>
                updateField(
                  "price",
                  Number(
                    event.target.value
                  )
                )
              }
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="text-sm font-medium text-zinc-800"
            >
              Initial stock
            </label>

            <input
              id="stock"
              type="number"
              inputMode="numeric"
              required
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) =>
                updateField(
                  "stock",
                  Number(
                    event.target.value
                  )
                )
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-800"
          >
            Category
          </label>

          <select
            id="category"
            required
            value={
              form.categoryId || ""
            }
            onChange={(event) =>
              updateField(
                "categoryId",
                Number(
                  event.target.value
                )
              )
            }
            className={inputClass}
          >
            {categories.length ===
              0 && (
              <option value="">
                No categories
                available
              </option>
            )}

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>
        </div>

        {!editing && (
          <div className="border-t border-zinc-200 pt-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                Product images
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Select multiple
                product images. They
                will automatically
                upload when the
                product is created.
              </p>
            </div>

            <div className="mt-5">
              <label className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold transition hover:bg-zinc-50 sm:w-auto">
                <ImagePlus
                  size={17}
                />

                Select images

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    selectImages
                  }
                  disabled={loading}
                  className="sr-only"
                />
              </label>
            </div>

            {pendingImages.length >
              0 && (
              <>
                <p className="mt-4 text-sm text-zinc-500">
                  {
                    pendingImages.length
                  }{" "}
                  {pendingImages.length ===
                  1
                    ? "image"
                    : "images"}{" "}
                  selected
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {pendingImages.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={
                          image.id
                        }
                        className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white"
                      >
                        <div className="relative aspect-square bg-zinc-100">
                          <Image
                            src={
                              image.previewUrl
                            }
                            alt={`Selected product image ${
                              index +
                              1
                            }`}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, 200px"
                            className="object-cover"
                          />

                          {index ===
                            0 && (
                            <span className="absolute left-2 top-2 rounded-full bg-zinc-950 px-2 py-1 text-[10px] font-semibold text-white sm:text-xs">
                              Primary
                            </span>
                          )}

                          <button
                            type="button"
                            aria-label={`Remove ${image.file.name}`}
                            disabled={
                              loading
                            }
                            onClick={() =>
                              removePendingImage(
                                image.id
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition hover:bg-white disabled:opacity-50"
                          >
                            <X
                              size={
                                15
                              }
                            />
                          </button>
                        </div>

                        <div className="min-w-0 p-2.5 sm:p-3">
                          <p
                            className="truncate text-[11px] text-zinc-500 sm:text-xs"
                            title={
                              image
                                .file
                                .name
                            }
                          >
                            {
                              image
                                .file
                                .name
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50/70 p-4 sm:flex sm:justify-end sm:p-6">
        <button
          type="submit"
          disabled={
            loading ||
            categories.length === 0
          }
          className="min-h-12 w-full rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading
            ? editing
              ? "Saving..."
              : pendingImages.length >
                  0
                ? "Creating & uploading..."
                : "Creating..."
            : editing
              ? "Save changes"
              : "Create product"}
        </button>
      </div>
    </form>
  );
}
