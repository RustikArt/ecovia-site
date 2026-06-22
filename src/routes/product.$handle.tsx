import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductGallery } from "@/components/product/ProductGallery";
import { TrustBadges } from "@/components/product/TrustBadges";
import { BundleSelector } from "@/components/product/BundleSelector";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Check, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { fetchProductByHandle, parseBundles, parseReviews } from "@/lib/shopify/api";
import { useCartStore, formatPrice } from "@/stores/cartStore";
import { trackViewContent } from "@/lib/tracking";
import { siteConfig } from "@/config/site";
import type { BundleOffer } from "@/lib/shopify/types";

const productQO = (handle: string) => queryOptions({
  queryKey: ["shopify", "product", handle],
  queryFn: async () => {
    const p = await fetchProductByHandle(handle);
    if (!p) throw notFound();
    return p;
  },
  staleTime: 60_000,
});

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const name = params.handle.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — Ecovia` },
        { name: "description", content: `Découvrez ${name} : plante artificielle premium Ecovia. Livraison offerte, garantie 14 jours.` },
        { property: "og:title", content: `${name} — Ecovia` },
        { property: "og:description", content: "Plante artificielle premium prête à poser." },
      ],
    };
  },
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(productQO(params.handle));
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-md mx-auto py-24 text-center">
        <h1 className="font-display text-2xl text-forest">Produit introuvable</h1>
        <p className="text-sm text-muted-foreground mt-2">Ce produit n'existe pas ou a été retiré.</p>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto py-24 text-center">
          <h1 className="font-display text-2xl text-forest">Erreur de chargement</h1>
          <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>Réessayer</Button>
        </div>
      </SiteLayout>
    );
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQO(handle));
  const bundles = useMemo(() => parseBundles(product), [product]);
  const reviews = useMemo(() => parseReviews(product), [product]);

  const variants = product.variants.edges.map((e) => e.node);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | null>(bundles[1] ?? bundles[0] ?? null);
  const [manualQty, setManualQty] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    if (selectedVariant) {
      trackViewContent({
        id: product.id,
        title: product.title,
        price: selectedVariant.price,
      });
    }
  }, [product.id, product.title, selectedVariant]);

  if (!selectedVariant) {
    return <SiteLayout><div className="py-24 text-center text-muted-foreground">Aucune variante disponible.</div></SiteLayout>;
  }

  const unitPrice = parseFloat(selectedVariant.price.amount);
  const currency = selectedVariant.price.currencyCode;
  const quantity = selectedBundle?.quantity ?? manualQty;
  const totalNormal = unitPrice * quantity;
  const discountPct = selectedBundle?.discountPercent ?? 0;
  const totalDiscounted = totalNormal * (1 - discountPct / 100);

  const productInfoImages = useMemo(() => {
    if (!product.descriptionHtml) return [];
    const regex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
    const images = [] as Array<{ src: string; alt: string }>;
    let match;
    while ((match = regex.exec(product.descriptionHtml)) !== null) {
      images.push({ src: match[1], alt: "" });
    }
    return images;
  }, [product.descriptionHtml]);

  const productInfoHtml = useMemo(() => {
    if (!product.descriptionHtml) return product.description;
    return product.descriptionHtml.replace(/<img[^>]*>/g, "");
  }, [product.descriptionHtml, product.description]);

  async function handleAdd() {
    if (!selectedVariant) return;
    await addItem({
      productHandle: product.handle,
      productTitle: product.title,
      productImage: product.images.edges[0]?.node.url ?? null,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
  }

  const hasOptions = product.options.length > 0 && !(product.options.length === 1 && product.options[0].values.length === 1 && product.options[0].values[0] === "Default Title");

  return (
    <SiteLayout>
      <article className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-white/90 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-forest mb-4">Product Image</h2>
              <ProductGallery
                media={product.media?.edges.map((e) => e.node)}
                images={product.images.edges.map((e) => e.node)}
                title={product.title}
              />
            </div>
          </aside>

          <div className="space-y-8">
            <section className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-sage">{product.productType || product.vendor || "Ecovia"}</p>
              <h1 className="font-display text-3xl md:text-4xl text-forest mt-3">{product.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl text-forest">{formatPrice(totalDiscounted, currency)}</span>
                  {discountPct > 0 && (
                    <span className="text-base text-muted-foreground line-through">{formatPrice(totalNormal, currency)}</span>
                  )}
                </div>
                <span className="rounded-full bg-sage/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-forest">Livraison 2-4j</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-sage">Vendu par</p>
                  <p className="mt-2 text-sm font-medium text-forest">{product.vendor}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-sage">Catégorie</p>
                  <p className="mt-2 text-sm font-medium text-forest">{product.productType || "Décoration intérieure"}</p>
                </div>
              </div>
            </section>

            {hasOptions && variants.length > 1 && (
              <div className="space-y-3 rounded-3xl border border-border/60 bg-white/90 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.15em] text-sage">Choisissez votre variante</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={!v.availableForSale}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        v.id === selectedVariantId
                          ? "bg-forest text-primary-foreground border-forest"
                          : "border-border hover:bg-secondary"
                      } disabled:opacity-40`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bundles.length > 0 ? (
              <BundleSelector
                bundles={bundles}
                unitPrice={unitPrice}
                currency={currency}
                selectedIndex={selectedBundle?.index ?? 0}
                onSelect={setSelectedBundle}
              />
            ) : (
              <div className="grid gap-3 rounded-3xl border border-border/60 bg-white/90 p-5 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-sage">Quantité</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setManualQty(Math.max(1, manualQty - 1))} className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary">−</button>
                    <span className="w-14 text-center font-medium text-forest">{manualQty}</span>
                    <button onClick={() => setManualQty(manualQty + 1)} className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary">+</button>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleAdd}
              disabled={isLoading || !selectedVariant.availableForSale}
              size="lg"
              className="w-full bg-forest hover:bg-forest/90 text-primary-foreground rounded-full"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : !selectedVariant.availableForSale ? (
                "Indisponible"
              ) : (
                <><ShoppingBag className="size-4 mr-2" /> Ajouter au panier</>
              )}
            </Button>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Paiement sécurisé" },
                { icon: Truck, title: "Livraison suivie" },
                { icon: RefreshCw, title: "Retours simplifiés" },
              ].map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-3 rounded-3xl border border-border/60 bg-secondary/40 p-4">
                  <Icon className="size-5 text-forest" />
                  <p className="text-sm font-medium text-forest">{title}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-3xl border border-border/60 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.24em] text-sage">Détails</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {product.productType || product.vendor || "Produit Ecovia"}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3">
                  <p className="font-medium text-forest">Livraison</p>
                  <p>{siteConfig.shipping.estimatedDelay} après préparation</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3">
                  <p className="font-medium text-forest">Stock</p>
                  <p>{selectedVariant.availableForSale ? "En stock" : "Rupture de stock"}</p>
                </div>
              </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-forest">Product information</h2>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  {productInfoImages.length > 0 && (
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-3 snap-x snap-mandatory">
                        {productInfoImages.map((image, idx) => (
                          <div key={idx} className="snap-center flex-shrink-0 rounded-3xl overflow-hidden border border-border/60 bg-secondary/40">
                            <img
                              src={image.src}
                              alt={image.alt || `${product.title} info ${idx + 1}`}
                              className="h-28 w-28 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {productInfoHtml ? (
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: productInfoHtml }} />
                  ) : (
                    <p>{product.description}</p>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-forest">Packing list</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="rounded-2xl border border-border/60 bg-secondary/40 p-3">Plante artificielle premium</li>
                  <li className="rounded-2xl border border-border/60 bg-secondary/40 p-3">Pot décoratif inclus</li>
                  <li className="rounded-2xl border border-border/60 bg-secondary/40 p-3">Guide de pose et entretien</li>
                  <li className="rounded-2xl border border-border/60 bg-secondary/40 p-3">Emballage recyclé</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-8">
          <ProductReviews reviews={reviews} />
        </div>
      </article>
    </SiteLayout>
  );
}
