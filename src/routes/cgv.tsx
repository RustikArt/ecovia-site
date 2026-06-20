import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/cgv")({
  head: () => ({ meta: [{ title: "CGV — Ecovia" }, { name: "description", content: "Conditions générales de vente d'Ecovia." }] }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16 space-y-6 text-muted-foreground">
        <h1 className="font-display text-4xl text-forest">Conditions générales de vente</h1>
        <p>{siteConfig.legal.cgv.intro}</p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Prix</h2>
          <p>{siteConfig.legal.cgv.prix}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Paiement</h2>
          <p>{siteConfig.legal.cgv.paiement}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Livraison</h2>
          <p>{siteConfig.legal.cgv.livraison}</p>
          <p>Consultez notre <a className="text-forest underline" href="/politique-livraison">politique de livraison</a> pour les détails de délais et de suivi.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Retours</h2>
          <p>{siteConfig.legal.cgv.retours}</p>
          <p>En savoir plus sur la procédure dans notre <a className="text-forest underline" href="/politique-retour">politique de retour</a>.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Droit applicable</h2>
          <p>{siteConfig.legal.cgv.droitApplicable}</p>
        </section>
      </article>
    </SiteLayout>
  ),
});
