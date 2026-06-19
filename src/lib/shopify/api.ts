import { storefrontApiRequest } from "./client";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries";
import type { ShopifyProduct, ShopifyProductNode, BundleOffer, ReviewData } from "./types";

export async function fetchProducts(first = 24, query?: string): Promise<ShopifyProduct[]> {
  const res = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(
    PRODUCTS_QUERY,
    { first, query: query ?? null },
  );
  return res?.data?.products?.edges ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  const res = await storefrontApiRequest<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return res?.data?.product ?? null;
}

function getMetafield(metafields: ShopifyProductNode["metafields"], namespace: string, key: string) {
  return metafields?.find((m) => m && m.namespace === namespace && m.key === key) ?? null;
}

export function parseBundles(product: ShopifyProductNode): BundleOffer[] {
  const bundles: BundleOffer[] = [];
  for (let i = 1; i <= 3; i++) {
    const titleMf = getMetafield(product.metafields, "bundles", `discount_title_${i}`);
    const valueMf = getMetafield(product.metafields, "bundles", `discount_value_${i}`);
    if (!titleMf?.value) continue;
    let quantity = i;
    let discountPercent = 0;
    if (valueMf?.value) {
      try {
        const parsed = JSON.parse(valueMf.value);
        quantity = Number(parsed.quantity ?? i);
        discountPercent = Number(parsed.discount ?? 0);
      } catch {
        const num = Number(valueMf.value);
        if (!Number.isNaN(num)) discountPercent = num;
      }
    }
    bundles.push({ index: i, title: titleMf.value, quantity, discountPercent });
  }
  return bundles;
}

export function parseReviews(product: ShopifyProductNode): ReviewData {
  const ratingMf = getMetafield(product.metafields, "reviews", "rating");
  const countMf = getMetafield(product.metafields, "reviews", "count");
  const listMf = getMetafield(product.metafields, "reviews", "list");
  let list: ReviewData["list"] = [];
  if (listMf?.value) {
    try {
      const parsed = JSON.parse(listMf.value);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      // ignore
    }
  }
  return {
    rating: ratingMf?.value ? Number(ratingMf.value) : null,
    count: countMf?.value ? Number(countMf.value) : list.length,
    list,
  };
}
