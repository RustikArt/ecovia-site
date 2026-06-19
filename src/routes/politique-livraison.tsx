import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/politique-livraison")({
  head: () => ({ meta: [{ title: "Politique de livraison — Ecovia" }, { name: "description", content: "Délais, frais et zones de livraison." }] }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-forest">Politique de livraison</h1>
        <p className="mt-4 text-muted-foreground">{siteConfig.legal.livraison.intro}</p>
        <h2 className="font-display text-xl mt-8">Préparation</h2>
        <p className="text-muted-foreground">{siteConfig.legal.livraison.preparation}</p>
        <h2 className="font-display text-xl mt-6">Suivi</h2>
        <p className="text-muted-foreground">{siteConfig.legal.livraison.suivi}</p>
      </article>
    </SiteLayout>
  ),
});
