import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/cgv")({
  head: () => ({ meta: [{ title: "CGV — Ecovia" }, { name: "description", content: "Conditions générales de vente d'Ecovia." }] }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16 space-y-3 text-muted-foreground">
        <h1 className="font-display text-4xl text-forest">Conditions générales de vente</h1>
        <p>{siteConfig.legal.cgv.intro}</p>
        <h2 className="font-display text-xl text-forest mt-6">Prix</h2>
        <p>{siteConfig.legal.cgv.prix}</p>
        <h2 className="font-display text-xl text-forest mt-6">Paiement</h2>
        <p>{siteConfig.legal.cgv.paiement}</p>
        <h2 className="font-display text-xl text-forest mt-6">Livraison</h2>
        <p>Voir la <a className="text-forest underline" href="/politique-livraison">politique de livraison</a>.</p>
        <h2 className="font-display text-xl text-forest mt-6">Garantie</h2>
        <p>Voir la <a className="text-forest underline" href="/politique-retour">politique de retour</a>.</p>
      </article>
    </SiteLayout>
  ),
});
