export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  primaryImageUrl: string | null;
  addedAt: string;
}


export interface WishlistResponse {
  items: WishlistItem[];
  count: number;
}

export interface WishlistCountResponse {
  count: number;
}

export interface WishlistStatusResponse {
  saved: boolean;
}
