import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Leaf, Truck, Recycle, HeartHandshake } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchProducts } from "@/lib/shopify/api";
import { siteConfig } from "@/config/site";

const productsQO = queryOptions({
  queryKey: ["shopify", "products", "home"],
  queryFn: () => fetchProducts(6),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ecovia — Plantes d'intérieur éco-responsables" },
      { name: "description", content: "Sélection de plantes vertes en pots naturels ou recyclés, livraison zéro plastique." },
      { property: "og:title", content: "Ecovia — Plantes d'intérieur éco-responsables" },
      { property: "og:description", content: "Plantes vivantes, emballage 100% recyclé." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(productsQO); },
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQO);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-12 md:pt-20 pb-16 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sage/30 px-3 py-1 text-xs text-forest">
              <Leaf className="size-3" /> {siteConfig.brand.heroBadge}
            </span>
            <h1 className="mt-5 font-display text-5xl md:text-6xl leading-[1.05] text-forest">
              {siteConfig.brand.tagline}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-md">
              {siteConfig.brand.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/boutique" className="inline-flex items-center gap-2 rounded-full bg-forest text-primary-foreground px-6 py-3 text-sm hover:opacity-90 transition">
                Découvrir la collection <ArrowRight className="size-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary transition">
                Nous contacter
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-sage/20 rounded-[2.5rem] rotate-2" aria-hidden />
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] w-full shadow-xl bg-sage/30">
              {products[0]?.node.images.edges[0] && (
                <img
                  src={products[0].node.images.edges[0].node.url}
                  alt={products[0].node.title}
                  className="size-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Engagements éco */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, t: "Livraison neutre", d: "Compensée carbone" },
            { icon: Recycle, t: "Emballage recyclé", d: "Zéro plastique" },
            { icon: Leaf, t: "Pots naturels", d: "Terre cuite & jute" },
            { icon: HeartHandshake, t: "Conseils inclus", d: "Fiche d'entretien" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-start gap-3">
              <span className="size-10 rounded-full bg-sage/30 grid place-items-center shrink-0">
                <Icon className="size-4 text-forest" />
              </span>
              <div>
                <p className="font-medium text-sm">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aperçu boutique */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage">Sélection</p>
            <h2 className="font-display text-3xl md:text-4xl mt-2">Coups de cœur</h2>
          </div>
          <Link to="/boutique" className="text-sm text-forest hover:underline whitespace-nowrap inline-flex items-center gap-1">
            Voir toute la boutique <ArrowRight className="size-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="text-sm">Aucun produit pour le moment.</p>
            <p className="text-xs mt-2">Ajoutez vos produits depuis votre admin Shopify pour les voir apparaître ici.</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Compte */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[2rem] bg-card border border-border/60 p-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-forest">Créez votre espace</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">
            Suivez vos commandes et retrouvez vos plantes préférées dans votre compte.
          </p>
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest text-primary-foreground px-6 py-3 text-sm hover:opacity-90 transition">
            Créer un compte <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
