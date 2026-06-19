import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/Layout";
import { fetchProducts } from "@/lib/shopify/api";
import { formatPrice } from "@/stores/cartStore";

const productsQO = queryOptions({
  queryKey: ["shopify", "products", "boutique"],
  queryFn: () => fetchProducts(60),
  staleTime: 60_000,
});

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique — Ecovia" },
      { name: "description", content: "Toutes nos plantes d'intérieur éco-responsables, livrées en emballage sans plastique." },
      { property: "og:title", content: "Boutique — Ecovia" },
      { property: "og:description", content: "Découvrez la collection complète Ecovia." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(productsQO); },
  component: Boutique,
});

function Boutique() {
  const { data: products } = useSuspenseQuery(productsQO);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-sage">Catalogue</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2 text-forest">Boutique</h1>
          <p className="mt-3 text-muted-foreground max-w-xl text-sm">
            {products.length} {products.length > 1 ? "plantes disponibles" : "plante disponible"} — livraison neutre, emballage 100% recyclé.
          </p>
        </header>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="text-sm">Aucun produit pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const node = p.node;
              const img = node.images.edges[0]?.node;
              const price = node.priceRange.minVariantPrice;
              return (
                <Link
                  key={node.id}
                  to="/product/$handle"
                  params={{ handle: node.handle }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/60">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText ?? node.title}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full grid place-items-center text-muted-foreground text-xs">Pas d'image</div>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <h2 className="font-display text-sm leading-tight line-clamp-2">{node.title}</h2>
                    <span className="font-display text-sm whitespace-nowrap">{formatPrice(price.amount, price.currencyCode)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
