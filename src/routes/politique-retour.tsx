import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/politique-retour")({
  head: () => ({ meta: [{ title: "Retours — Ecovia" }, { name: "description", content: "Notre garantie plante vivante et conditions de retour." }] }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-forest">Retours & garantie</h1>
        <p className="mt-4 text-muted-foreground">{siteConfig.legal.retours.garantie}</p>
        <h2 className="font-display text-xl mt-8">Droit de rétractation</h2>
        <p className="text-muted-foreground">{siteConfig.legal.retours.retractation}</p>
      </article>
    </SiteLayout>
  ),
});
