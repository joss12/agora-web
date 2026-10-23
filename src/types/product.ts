
export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  thumbnailUrl: string;
  primary: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
  primaryImageUrl: string | null;
  images: ProductImage[];
}

export interface ProductPage {
  products: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
