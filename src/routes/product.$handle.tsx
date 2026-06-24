import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { fetchProductByHandle } from "@/lib/shopify/api";

const LazyProductPage = lazy(() => import("@/pages/ProductPage"));
const LazyProductErrorComponent = lazy(() =>
  import("@/pages/ProductPage").then((module) => ({ default: module.ProductErrorComponent })),
);

export const productQO = (handle: string) =>
  queryOptions({
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
        {
          name: "description",
          content: `Découvrez ${name} : plante artificielle premium Ecovia. Livraison offerte, garantie 14 jours.`,
        },
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
        <p className="text-sm text-muted-foreground mt-2">
          Ce produit n'existe pas ou a été retiré.
        </p>
      </div>
    </SiteLayout>
  ),
  errorComponent: ProductErrorRoute,
  component: ProductPageRoute,
});

function ProductErrorRoute({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Suspense fallback={null}>
      <LazyProductErrorComponent error={error} reset={reset} />
    </Suspense>
  );
}

function ProductPageRoute() {
  const { handle } = Route.useParams();
  return (
    <Suspense fallback={null}>
      <LazyProductPage handle={handle} />
    </Suspense>
  );
}
