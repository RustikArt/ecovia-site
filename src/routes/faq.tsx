import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Ecovia" },
      {
        name: "description",
        content: "Questions fréquentes sur les plantes, la livraison et l'entretien.",
      },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-sm">
        <h1 className="font-display text-4xl text-forest">Questions fréquentes</h1>
        {siteConfig.faq.map((item) => (
          <div key={item.q}>
            <h2 className="font-display text-xl mt-8">{item.q}</h2>
            <p className="text-muted-foreground">{item.a}</p>
          </div>
        ))}
        <p className="mt-10">
          <Link to="/contact" className="text-forest underline">
            Nous contacter
          </Link>
        </p>
      </article>
    </SiteLayout>
  ),
});
