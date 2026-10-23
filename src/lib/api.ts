import "server-only";

import type {
  Category,
  Product,
  ProductPage,
} from "@/types/product";

const API_URL =
  process.env.SPRING_API_URL ?? "http://localhost:8080";

interface GetProductsOptions {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Spring Commerce API error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getProducts(
  options: GetProductsOptions = {}
): Promise<ProductPage> {
  const {
    page = 0,
    size = 12,
    search,
    categoryId,
    sort = "id",
    direction = "asc",
  } = options;

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
    direction,
  });

  if (search) {
    params.set("search", search);
  }

  if (categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }

  return apiFetch<ProductPage>(
    `/api/products?${params.toString()}`
  );
}

export async function getProduct(
  id: number
): Promise<Product | null> {
  const response = await fetch(
    `${API_URL}/api/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product ${id}: ${response.status}`
    );
  }

  return response.json() as Promise<Product>;
}
