import "server-only";

import type {
  ProductRating,
  ReviewPage,
} from "@/types/review";

const API_URL =
  process.env.SPRING_API_URL ?? "http://localhost:8080";

export async function getProductRating(
  productId: number
): Promise<ProductRating> {
  const response = await fetch(
    `${API_URL}/api/v1/products/${productId}/ratings`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product rating: ${response.status}`
    );
  }

  return response.json() as Promise<ProductRating>;
}

export async function getProductReviews(
  productId: number,
  page = 0,
  size = 5
): Promise<ReviewPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_URL}/api/v1/products/${productId}/reviews?${params}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product reviews: ${response.status}`
    );
  }

  return response.json() as Promise<ReviewPage>;
}
