export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyMedia {
  id: string;
  mediaContentType: "IMAGE" | "VIDEO" | "EXTERNAL_VIDEO" | "MODEL_3D";
  previewImage?: { url: string } | null;
  image?: ShopifyImage | null;
  sources?: Array<{ url: string; mimeType: string; format: string }>;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage | null;
}

export interface ShopifyMetafield {
  key: string;
  namespace: string;
  type: string;
  value: string;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  tags: string[];
  vendor: string;
  productType: string;
  featuredImage?: ShopifyImage | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: ShopifyImage }> };
  media?: { edges: Array<{ node: ShopifyMedia }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
  metafields?: Array<ShopifyMetafield | null>;
}

export interface ShopifyProduct {
  node: ShopifyProductNode;
}

export interface BundleOffer {
  index: number;
  title: string;
  quantity: number;
  discountPercent: number;
}

export interface ReviewItem {
  name: string;
  rating: number;
  comment: string;
  image_url?: string;
  date?: string;
}

export interface ReviewData {
  rating: number | null;
  count: number;
  list: ReviewItem[];
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  image?: ShopifyImage | null;
}
