export interface ProductRating {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export interface ProductReview {
  id: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPage {
  content: ProductReview[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ReviewPayload {
  rating: number;
  title: string;
  content: string;
}
