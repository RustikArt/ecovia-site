import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({ meta: [{ title: "Confidentialité — Ecovia" }, { name: "description", content: "Traitement des données personnelles chez Ecovia." }] }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16 space-y-3 text-muted-foreground">
        <h1 className="font-display text-4xl text-forest">Politique de confidentialité</h1>
        {siteConfig.legal.confidentialite.map((p, i) => <p key={i}>{p}</p>)}
      </article>
    </SiteLayout>
  ),
});
