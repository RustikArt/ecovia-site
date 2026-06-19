import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { Toaster } from "sonner";
import { SlideCart } from "@/components/cart/SlideCart";
import { Pixels } from "@/components/tracking/Pixels";
import { useCartSync } from "@/hooks/useCartSync";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-forest">404</h1>
        <h2 className="mt-4 text-xl font-display text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page a peut-être été déplacée ou n'existe plus.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl text-foreground">Une feuille est tombée…</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cette page n'a pas pu se charger.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-forest px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90 transition"
          >
            Réessayer
          </button>
          <a href="/" className="rounded-full border border-input bg-background px-5 py-2.5 text-sm hover:bg-secondary transition">
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

const ogImage = `${siteConfig.seo.siteUrl}${siteConfig.seo.ogImage}`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteConfig.seo.defaultTitle },
      { name: "description", content: siteConfig.seo.defaultDescription },
      { property: "og:site_name", content: siteConfig.brand.name },
      { property: "og:type", content: "website" },
      { property: "og:title", content: siteConfig.seo.defaultTitle },
      { property: "og:description", content: siteConfig.seo.defaultDescription },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: siteConfig.seo.defaultTitle },
      { name: "twitter:description", content: siteConfig.seo.defaultDescription },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Figtree:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useCartSync();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <SlideCart />
      <Pixels />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
