import { Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Leaf,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BundleSelector } from "@/components/product/BundleSelector";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductInfoSection } from "@/components/product/ProductInfoSection";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { parseBundles, parseReviews } from "@/lib/shopify/api";
import { trackViewContent } from "@/lib/tracking";
import { formatPrice, useCartStore } from "@/stores/cartStore";
import { productQO } from "@/routes/product.$handle";
import type { BundleOffer } from "@/lib/shopify/types";

export function ProductErrorComponent({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <SiteLayout>
      <div className="max-w-md mx-auto py-24 text-center">
        <h1 className="font-display text-2xl text-forest">Erreur de chargement</h1>
        <Button
          className="mt-4"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Réessayer
        </Button>
      </div>
    </SiteLayout>
  );
}

export default function ProductPage({ handle }: { handle: string }) {
  const { data: product } = useSuspenseQuery(productQO(handle));
  const bundles = useMemo(() => parseBundles(product), [product]);
  const reviews = useMemo(() => parseReviews(product), [product]);

  const variants = product.variants.edges.map((e) => e.node);
  const defaultVariant = variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const displayVariant = selectedVariant ?? defaultVariant;
  const imageVariantLinks = useMemo(
    () =>
      variants.reduce<Record<string, { variantId: string; variantLabel: string }>>((acc, variant) => {
        const imageUrl = variant.image?.url;
        if (!imageUrl) return acc;
        acc[imageUrl] = {
          variantId: variant.id,
          variantLabel: variant.title,
        };
        return acc;
      }, {}),
    [variants],
  );

  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | null>(
    bundles[1] ?? bundles[0] ?? null,
  );
  const [manualQty, setManualQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayVariant) {
      trackViewContent({
        id: product.id,
        title: product.title,
        price: displayVariant.price,
      });
    }
  }, [product.id, product.title, displayVariant]);

  if (!displayVariant) {
    return (
      <SiteLayout>
        <div className="py-24 text-center text-muted-foreground">Aucune variante disponible.</div>
      </SiteLayout>
    );
  }

  const unitPrice = parseFloat(displayVariant.price.amount);
  const currency = displayVariant.price.currencyCode;
  const quantity = selectedBundle?.quantity ?? manualQty;
  const totalNormal = unitPrice * quantity;
  const discountPct = selectedBundle?.discountPercent ?? 0;
  const totalDiscounted = totalNormal * (1 - discountPct / 100);
  const savings = totalNormal - totalDiscounted;

  const hasOptions =
    product.options.length > 0 &&
    !(
      product.options.length === 1 &&
      product.options[0].values.length === 1 &&
      product.options[0].values[0] === "Default Title"
    );

  const reviewRating =
    reviews.rating ??
    (reviews.list.length > 0
      ? reviews.list.reduce((sum, review) => sum + review.rating, 0) / reviews.list.length
      : null);

  async function handleAdd() {
    if (!selectedVariant) return;
    await addItem({
      productHandle: product.handle,
      productTitle: product.title,
      productImage: selectedVariant.image?.url ?? product.images.edges[0]?.node.url ?? null,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  return (
    <SiteLayout>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-0">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-forest transition-colors">
              Accueil
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3" />
          </li>
          <li>
            <Link to="/boutique" className="hover:text-forest transition-colors">
              Boutique
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3" />
          </li>
          <li className="text-forest font-medium truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        <div className="grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-8 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              media={product.media?.edges.map((e) => e.node)}
              images={product.images.edges.map((e) => e.node)}
              title={product.title}
              activeImageUrl={selectedVariant.image?.url ?? null}
              imageVariantLinks={imageVariantLinks}
              onImageVariantSelect={(variantId) => setSelectedVariantId(variantId)}
            />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">
                {product.productType || product.vendor || "Ecovia"}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl text-forest mt-1.5 leading-tight">
                {product.title}
              </h1>

              {reviewRating !== null && reviews.list.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="mt-2 flex items-center gap-1.5 hover:opacity-75 transition-opacity"
                >
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${i < Math.round(reviewRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground underline underline-offset-2">
                    {reviewRating.toFixed(1)} ({reviews.count} avis)
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 py-4 border-y border-border/60">
              <span className="font-display text-4xl text-forest leading-none">
                {formatPrice(totalDiscounted, currency)}
              </span>
              {selectedVariant.availableForSale && (
                <span className="rounded-full border border-sage/30 bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-forest leading-none">
                  En stock
                </span>
              )}
              {discountPct > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through leading-none">
                    {formatPrice(totalNormal, currency)}
                  </span>
                  <span className="rounded-full bg-forest text-primary-foreground text-xs font-semibold px-2.5 py-1">
                    −{discountPct}%
                  </span>
                </>
              )}
              {savings > 0.5 && (
                <span className="text-xs text-sage font-medium">
                  Économie de {formatPrice(savings, currency)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-sage/15 border border-sage/30 px-3 py-2.5">
              <Truck className="size-4 text-forest flex-shrink-0" />
              <p className="text-xs font-medium text-forest">{siteConfig.shipping.bannerText}</p>
            </div>

            {hasOptions && variants.length > 1 && (
              <div className="space-y-2.5">
                <p className="text-sm font-medium text-forest">
                  {product.options[0]?.name ?? "Variante"} :{" "}
                  <span className="font-normal text-muted-foreground">
                      {variants.find((v) => v.id === selectedVariantId)?.title ??
                        "Aucun style choisi"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={!v.availableForSale}
                      className={`px-4 py-2 rounded-full text-sm border-2 font-medium transition-all ${
                        v.id === selectedVariantId
                          ? "bg-forest text-primary-foreground border-forest"
                          : "border-border hover:border-forest/50 bg-white"
                      } disabled:opacity-35 disabled:cursor-not-allowed`}
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
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-forest">Quantité</p>
                <div className="flex items-center border border-border rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setManualQty(Math.max(1, manualQty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-forest text-sm">{manualQty}</span>
                  <button
                    type="button"
                    onClick={() => setManualQty(manualQty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAdd}
              disabled={isLoading || !selectedVariant || !selectedVariant.availableForSale || addedFeedback}
              size="lg"
              className={`w-full rounded-full text-base font-semibold h-14 transition-all ${
                addedFeedback
                  ? "bg-sage text-forest"
                  : !selectedVariant
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-forest hover:bg-forest/90 text-primary-foreground"
              }`}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : !selectedVariant ? (
                "Vous devez choisir un style pour ajouter l'article"
              ) : !selectedVariant.availableForSale ? (
                "Indisponible"
              ) : addedFeedback ? (
                <>
                  <span className="text-lg mr-2">✓</span> Ajouté au panier
                </>
              ) : (
                <>
                  <ShoppingBag className="size-5 mr-2" /> Ajouter au panier — {formatPrice(totalDiscounted, currency)}
                </>
              )}
            </Button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: ShieldCheck, label: "Paiement sécurisé", sub: "SSL Shopify" },
                { icon: Truck, label: "Livraison suivie", sub: siteConfig.shipping.estimatedDelay },
                { icon: RefreshCw, label: "Retours 14j", sub: "Sans justificatif" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl bg-secondary/50 border border-border/50"
                >
                  <Icon className="size-4 text-forest" />
                  <p className="text-[11px] font-semibold text-forest leading-tight">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-sage">Contenu de la boîte</p>
              <ul className="space-y-1.5">
                {[
                  { icon: Leaf, text: "Plante artificielle premium" },
                  { icon: Package, text: "Emballage protecteur recyclé" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-forest">
                    <Icon className="size-3.5 text-sage flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ProductInfoSection
          descriptionHtml={product.descriptionHtml}
          description={product.description}
          tags={product.tags}
          title={product.title}
        />

        <div ref={reviewsRef} className="mt-4">
          <ProductReviews reviews={reviews} productHandle={product.handle} />
        </div>
      </article>
    </SiteLayout>
  );
}