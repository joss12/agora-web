import { NextRequest, NextResponse } from "next/server";

import { getProduct } from "@/lib/api";

export async function GET(request: NextRequest) {
  const rawIds = request.nextUrl.searchParams.get("ids");

  if (!rawIds) {
    return NextResponse.json({});
  }

  const ids = [
    ...new Set(
      rawIds
        .split(",")
        .map(Number)
        .filter(
          (id) => Number.isSafeInteger(id) && id > 0
        )
    ),
  ].slice(0, 50);

  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const product = await getProduct(id);

      if (!product) {
        return { id, imageUrl: null };
      }

      const primaryImage =
        product.images?.find((image) => image.primary)
          ?.imageUrl ??
        product.images?.[0]?.imageUrl ??
        product.primaryImageUrl ??
        null;

      const imageUrl =
        primaryImage &&
        !primaryImage.includes("loremflickr.com")
          ? primaryImage
          : null;

      return { id, imageUrl };
    })
  );

  const images: Record<number, string | null> = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      images[result.value.id] = result.value.imageUrl;
    }
  }

  return NextResponse.json(images, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
