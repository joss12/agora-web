"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

import {
  AlertTriangle,
  CheckCircle2,
  ImageOff,
  ImagePlus,
  Star,
  Trash2,
} from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Product, ProductImage } from "@/types/product";

interface ProductImageManagerProps {
  product: Product;
}

type Confirmation =
  | {
      type: "delete";
      imageId: number;
    }
  | {
      type: "cleanup";
    }
  | null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isBrokenSeedImage(image: ProductImage): boolean {
  return [image.imageUrl, image.thumbnailUrl].some(
    (url) => url?.toLowerCase().includes("loremflickr.com")
  );
}

async function requestError(
  response: Response,
  fallback: string
): Promise<Error> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);

    if (typeof data?.message === "string" && data.message.trim()) {
      return new Error(data.message);
    }
  }

  return new Error(`${fallback} (HTTP ${response.status})`);
}

export function ProductImageManager({
  product,
}: ProductImageManagerProps) {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const [busyImageId, setBusyImageId] = useState<number | null>(
    null
  );

  const [cleaning, setCleaning] = useState(false);

  const [confirmation, setConfirmation] =
    useState<Confirmation>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const brokenImages = product.images.filter(isBrokenSeedImage);

  const validImages = product.images.filter(
    (image) => !isBrokenSeedImage(image)
  );

  const hasBrokenImages = brokenImages.length > 0;
  const hasValidImages = validImages.length > 0;

  const busy = uploading || busyImageId !== null || cleaning;

  function showError(message: string) {
    setError(message);
    setSuccess("");
    toast.error(message);
  }

  function showSuccess(message: string) {
    setSuccess(message);
    setError("");
    toast.success(message);
  }

  async function uploadImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        showError(
          `${file.name}: Only JPEG, PNG, and WebP are supported.`
        );

        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showError(`${file.name}: Maximum file size is 5 MB.`);

        event.target.value = "";
        return;
      }
    }

    setUploading(true);

    let uploadedCount = 0;

    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress(
          `Uploading ${index + 1} of ${files.length}: ${file.name}`
        );

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `/api/admin/products/${product.id}/images`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw await requestError(
            response,
            `Unable to upload ${file.name}`
          );
        }

        const uploadedImage =
          (await response.json()) as ProductImage;

        uploadedCount++;

        if (index === 0 && !hasValidImages) {
          setUploadProgress("Setting the new primary image...");

          const primaryResponse = await fetch(
            `/api/admin/products/${product.id}/images/${uploadedImage.id}`,
            {
              method: "PATCH",
            }
          );

          if (!primaryResponse.ok) {
            throw await requestError(
              primaryResponse,
              "Image uploaded, but setting it as primary failed"
            );
          }
        }
      }

      showSuccess(
        `${uploadedCount} image${
          uploadedCount === 1 ? "" : "s"
        } uploaded successfully.`
      );
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : "Unable to upload images."
      );
    } finally {
      setUploading(false);
      setUploadProgress("");
      event.target.value = "";
      router.refresh();
    }
  }

  async function setPrimary(imageId: number) {
    if (busy) {
      return;
    }

    setBusyImageId(imageId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}/images/${imageId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw await requestError(
          response,
          "Unable to set primary image"
        );
      }

      showSuccess("Primary image updated.");
      router.refresh();
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : "Unable to set primary image."
      );
    } finally {
      setBusyImageId(null);
    }
  }

  function requestDeleteImage(imageId: number) {
    if (busy) {
      return;
    }

    setConfirmation({
      type: "delete",
      imageId,
    });
  }

  async function deleteImage(imageId: number) {
    if (busy) {
      return;
    }

    setBusyImageId(imageId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw await requestError(
          response,
          "Unable to delete image"
        );
      }

      setConfirmation(null);
      showSuccess("Image deleted.");

      router.refresh();
    } catch (caught) {
      showError(
        caught instanceof Error
          ? caught.message
          : "Unable to delete image."
      );
    } finally {
      setBusyImageId(null);
    }
  }

  function requestRemoveBrokenImages() {
    if (busy) {
      return;
    }

    if (!hasValidImages) {
      showError("Upload a replacement image first.");
      return;
    }

    if (!hasBrokenImages) {
      return;
    }

    setConfirmation({
      type: "cleanup",
    });
  }

  async function removeBrokenImages() {
    if (busy) {
      return;
    }

    if (!hasValidImages) {
      showError("Upload a replacement image first.");
      return;
    }

    setCleaning(true);
    setError("");
    setSuccess("");

    let removed = 0;

    try {
      for (const image of brokenImages) {
        const response = await fetch(
          `/api/admin/products/${product.id}/images/${image.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw await requestError(
            response,
            `Unable to remove broken image ${image.id}`
          );
        }

        removed++;
      }

      setConfirmation(null);

      showSuccess(
        `${removed} broken image record${
          removed === 1 ? "" : "s"
        } removed.`
      );
    } catch (caught) {
      showError(
        caught instanceof Error
          ? `${caught.message}. Removed ${removed} of ${brokenImages.length} records.`
          : "Unable to remove broken images."
      );
    } finally {
      setCleaning(false);
      router.refresh();
    }
  }

  async function handleConfirm() {
    if (!confirmation || busy) {
      return;
    }

    if (confirmation.type === "delete") {
      await deleteImage(confirmation.imageId);
      return;
    }

    await removeBrokenImages();
  }

  const confirmationLoading =
    busyImageId !== null || cleaning;

  return (
    <>
      <section className="mt-8 min-w-0 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:mt-10">
        <div className="border-b border-zinc-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">
            Product images
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Upload product photos, choose a primary image, and
            manage images displayed in the storefront.
          </p>

          {hasBrokenImages && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">
                    {brokenImages.length} broken seed image
                    {brokenImages.length === 1 ? "" : "s"} detected
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    These images use LoremFlickr, which is no longer
                    serving them correctly. Upload replacement photos
                    to restore this product&apos;s gallery.
                  </p>

                  {hasValidImages ? (
                    <button
                      type="button"
                      onClick={requestRemoveBrokenImages}
                      disabled={busy}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-900 px-4 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50 sm:text-sm"
                    >
                      <Trash2 size={15} />

                      {cleaning
                        ? "Removing broken images..."
                        : "Remove broken images"}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-amber-900">
                      Upload at least one replacement image to enable
                      cleanup.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <label
            className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:w-auto ${
              busy
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            <ImagePlus size={17} />

            {uploading ? "Uploading..." : "Upload images"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={uploadImages}
              disabled={busy}
              className="sr-only"
            />
          </label>

          {uploadProgress && (
            <p
              role="status"
              className="mt-3 text-sm text-zinc-600"
            >
              {uploadProgress}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800"
            >
              <CheckCircle2 size={17} />
              {success}
            </div>
          )}
        </div>

        {product.images.length === 0 ? (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <ImagePlus size={19} />
            </div>

            <p className="mt-4 text-sm font-medium text-zinc-800">
              No product images
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Upload images to display this product in the storefront.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4">
            {product.images.map((image) => {
              const busyThisImage = busyImageId === image.id;
              const broken = isBrokenSeedImage(image);

              const imageUrl =
                image.thumbnailUrl || image.imageUrl;

              return (
                <div
                  key={image.id}
                  className="min-w-0 overflow-hidden rounded-xl border border-zinc-200"
                >
                  <div className="relative aspect-square bg-zinc-100">
                    {broken || !imageUrl ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                        <ImageOff
                          size={26}
                          className="text-zinc-400"
                        />

                        <span className="text-xs font-medium text-zinc-500">
                          Broken seed image
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                    )}

                    {image.primary && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2 py-1 text-[10px] font-semibold text-white">
                        <Star size={10} fill="currentColor" />
                        Primary
                      </span>
                    )}

                    {broken && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900">
                        Broken
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 p-2.5 sm:p-3">
                    {!image.primary && !broken && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setPrimary(image.id)}
                        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 sm:text-sm"
                      >
                        <Star size={14} />

                        {busyThisImage
                          ? "Updating..."
                          : "Set primary"}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => requestDeleteImage(image.id)}
                      className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:text-sm"
                    >
                      <Trash2 size={14} />

                      {busyThisImage
                        ? "Working..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && !confirmationLoading) {
            setConfirmation(null);
          }
        }}
        title={
          confirmation?.type === "cleanup"
            ? "Remove broken images?"
            : "Delete image?"
        }
        description={
          confirmation?.type === "cleanup" ? (
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-zinc-900">
                {brokenImages.length} broken image
                {brokenImages.length === 1 ? "" : "s"}
              </span>
              ? This will remove their records from the product
              gallery. Your replacement images will remain.
            </>
          ) : (
            <>
              Are you sure you want to delete this product image?
              This action cannot be undone.
            </>
          )
        }
        confirmLabel={
          confirmation?.type === "cleanup"
            ? "Remove broken images"
            : "Delete image"
        }
        cancelLabel="Cancel"
        variant="danger"
        loading={confirmationLoading}
        onConfirm={handleConfirm}
      />
    </>
  );
}
