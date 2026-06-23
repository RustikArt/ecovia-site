import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { fetchProducts, fetchCollections, fetchCollectionProducts } from "@/lib/shopify/api";
import { formatPrice, useCartStore } from "@/stores/cartStore";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify/types";

const productsQO = queryOptions({
  queryKey: ["shopify", "products", "boutique"],
  queryFn: () => fetchProducts(60),
  staleTime: 60_000,
});

const collectionsQO = queryOptions({
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
  component: Boutique,
});

const SORTS = [
  { id: "popular", label: "Popularité" },
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
  { id: "title", label: "Nom A-Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function getProductPrice(p: ShopifyProduct) {
  return parseFloat(p.node.priceRange.minVariantPrice.amount);
}

function Boutique() {
  const { data: allProducts } = useSuspenseQuery(productsQO);
  const { data: collections } = useSuspenseQuery(collectionsQO);

  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [sort, setSort] = useState<SortId>("popular");
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const collectionQuery = useQuery({
    queryKey: ["shopify", "collection", activeCollection],
    queryFn: () => fetchCollectionProducts(activeCollection!, 60),
    enabled: !!activeCollection,
    staleTime: 60_000,
  });

  const baseProducts = activeCollection ? (collectionQuery.data?.products ?? []) : allProducts;

  const priceCeiling = useMemo(() => {
    const max = baseProducts.reduce((m, p) => Math.max(m, getProductPrice(p)), 0);
    return Math.ceil(max);
  }, [baseProducts]);

  const effectiveMax = maxPrice > 0 ? maxPrice : priceCeiling;

  const filtered = useMemo(() => {
    let list = baseProducts.filter((p) => getProductPrice(p) <= effectiveMax);
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "title":
        list = [...list].sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      default:
        break;
    }
    return list;
  }, [baseProducts, effectiveMax, sort]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">Catalogue</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2 text-forest">Boutique</h1>
          <p className="mt-3 text-muted-foreground max-w-xl text-sm">
            {filtered.length} {filtered.length > 1 ? "produits disponibles" : "produit disponible"}{" "}
            — livraison offerte en France métropolitaine.
          </p>
        </header>

        {/* Catégories Shopify dynamiques */}
        <div id="collections" className="mb-8 -mx-2 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCollection(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm border transition ${
              activeCollection === null
                ? "bg-forest text-primary-foreground border-forest"
                : "border-border hover:bg-secondary"
            }`}
          >
            Toutes les plantes
          </button>
          {collections.map((c) => (
            <button
              key={c.handle}
              onClick={() => setActiveCollection(c.handle)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm border transition ${
                activeCollection === c.handle
                  ? "bg-forest text-primary-foreground border-forest"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar Filtres */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="size-4 text-forest" />
                <h2 className="font-display text-base text-forest">Filtres</h2>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Prix maximum
                </p>
                <input
                  type="range"
                  min={0}
                  max={priceCeiling || 100}
                  value={maxPrice || priceCeiling}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-forest"
                />
                <p className="mt-2 text-sm text-forest">
                  Jusqu’à {formatPrice(effectiveMax, "EUR")}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Tri
                </p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setActiveCollection(null);
                  setMaxPrice(0);
                  setSort("popular");
                }}
                className="mt-6 w-full rounded-full border border-border bg-background px-4 py-2 text-xs hover:bg-secondary transition"
              >
                Réinitialiser
              </button>
            </div>
            <div className="rounded-3xl bg-forest text-primary-foreground p-5 text-sm space-y-2">
              <p className="font-display text-lg">Besoin d’aide ?</p>
              <p className="text-primary-foreground/80 text-xs">
                Nos conseillers vous répondent sous 24h ouvrées.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-xs underline hover:opacity-80"
              >
                Nous contacter →
              </Link>
            </div>
          </aside>

          {/* Grille produit */}
          {activeCollection && collectionQuery.isLoading ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <p className="text-sm">Chargement de la collection…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <p className="text-sm">Aucun produit ne correspond à votre sélection.</p>
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <BoutiqueCard key={p.node.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function BoutiqueCard({ product }: { product: ShopifyProduct }) {
  const node = product.node;
  const img = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants.edges[0]?.node;
  const compareAt = firstVariant?.compareAtPrice;
  const hasPromo = !!compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const hasMultipleVariants = node.variants.edges.length > 1;

  async function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!firstVariant) return;
    if (hasMultipleVariants) return;
    await addItem({
      productHandle: node.handle,
      productTitle: node.title,
      productImage: img?.url ?? null,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });
  }

  return (
    <Link to="/product/$handle" params={{ handle: node.handle }} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/60">
        {img ? (
          <img
            src={img.url}
            alt={img.altText ?? node.title}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full grid place-items-center text-muted-foreground text-xs">
            Pas d'image
          </div>
        )}
        {hasPromo && (
          <span className="absolute top-3 left-3 rounded-full bg-forest text-primary-foreground px-3 py-1 text-[11px] font-medium">
            Promo
          </span>
        )}
        <button
          onClick={quickAdd}
          disabled={isLoading || hasMultipleVariants || !firstVariant?.availableForSale}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-forest shadow opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
          aria-label={hasMultipleVariants ? "Voir le produit" : "Ajouter rapidement au panier"}
        >
          <ShoppingBag className="size-3" />
          {hasMultipleVariants ? "Voir" : "Ajouter"}
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h2 className="font-display text-sm leading-tight line-clamp-2">{node.title}</h2>
        <div className="text-right whitespace-nowrap">
          <span className="font-display text-sm">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          {hasPromo && compareAt && (
            <span className="block text-[11px] text-muted-foreground line-through">
              {formatPrice(compareAt.amount, compareAt.currencyCode)}
            </span>
          )}
        </div>
      </div>
      {node.productType && <p className="mt-1 text-xs text-muted-foreground">{node.productType}</p>}
    </Link>
  );
}
