import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Ecovia" },
      { name: "description", content: "Informations légales et éditeur du site Ecovia." },
      { property: "og:title", content: "Mentions légales — Ecovia" },
      {
        property: "og:description",
        content: "Informations légales et mention de l'hébergeur du site Ecovia.",
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <SiteLayout>
      <article className="max-w-4xl mx-auto px-6 py-16 space-y-6 text-muted-foreground">
        <h1 className="font-display text-4xl text-forest">Mentions légales</h1>
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Éditeur</h2>
          <p>{siteConfig.legal.mentionsLegales.editeur}</p>
          <p>
            Directeur de la publication : {siteConfig.legal.mentionsLegales.directeurPublication}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Hébergeur</h2>
          <p>{siteConfig.legal.mentionsLegales.hebergeur}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Contact</h2>
          <p>
            Pour toute question concernant le site, écrivez à{" "}
            <a
              href={`mailto:${siteConfig.legal.mentionsLegales.contact}`}
              className="text-forest underline"
            >
              {siteConfig.legal.mentionsLegales.contact}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-forest">Statut et identification</h2>
          <p>{siteConfig.legal.mentionsLegales.societaire}</p>
          <p>SIRET : {siteConfig.legal.mentionsLegales.siret}</p>
          <p>TVA intracommunautaire : {siteConfig.legal.mentionsLegales.tva}</p>
        </section>
      </article>
    </SiteLayout>
  );
}
