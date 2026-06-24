import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { fetchProducts, fetchCollections } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";

const LazyBoutiquePage = lazy(() => import("@/pages/BoutiquePage"));

export const productsQO = queryOptions({
  queryKey: ["shopify", "products", "boutique"],
  queryFn: () => fetchProducts(60),
  staleTime: 60_000,
});

export const collectionsQO = queryOptions({
  queryKey: ["shopify", "collections"],
  queryFn: () => fetchCollections(12),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique — Plantes artificielles premium | Ecovia" },
      {
        name: "description",
        content:
          "Toute la collection de plantes artificielles Ecovia : grandes plantes, petites plantes, suspensions et pots décoratifs. Livraison offerte en France.",
      },
      { property: "og:title", content: "Boutique — Ecovia" },
      {
        property: "og:description",
        content:
          "Découvrez la collection Ecovia de plantes artificielles premium avec livraison rapide en France.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO);
    context.queryClient.ensureQueryData(collectionsQO);
  },
  component: BoutiqueRoute,
});

export const SORTS = [
  { id: "popular", label: "Popularité" },
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
  { id: "title", label: "Nom A-Z" },
] as const;

export function getProductPrice(p: ShopifyProduct) {
  return parseFloat(p.node.priceRange.minVariantPrice.amount);
}

function BoutiqueRoute() {
  return (
    <Suspense fallback={null}>
      <LazyBoutiquePage />
    </Suspense>
  );
}
