import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Droplets,
  ThumbsUp,
  Clock,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Star,
  ChevronRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchCollectionProducts } from "@/lib/shopify/api";
import { siteConfig } from "@/config/site";

type HomepageReview = {
  name: string;
  text: string;
};

const HOMEPAGE_REVIEW_POOL: HomepageReview[] = [
  {
    name: "Camille D.",
    text: "Le rendu est bluffant. Tout le monde croit que mes plantes sont vraies, et zéro entretien à gérer !",
  },
  {
    name: "Antoine R.",
    text: "Livraison rapide et soignée. La qualité est largement au niveau du prix.",
  },
  { name: "Sophie B.", text: "Une vraie touche déco. J'ai recommandé Ecovia à toute ma famille." },
  {
    name: "Nora P.",
    text: "Je voulais un salon plus chaleureux sans contrainte. Mission accomplie dès le premier colis.",
  },
  {
    name: "Mehdi L.",
    text: "Top pour mon bureau, effet naturel immédiat. Produit conforme aux photos.",
  },
  {
    name: "Laura M.",
    text: "Emballage propre, livraison dans les délais, et surtout superbe finition.",
  },
  {
    name: "Thomas G.",
    text: "J'étais sceptique sur l'aspect artificiel, mais de loin comme de près c'est très réussi.",
  },
  {
    name: "Inès V.",
    text: "Super expérience client, réponse rapide et plante très élégante dans mon entrée.",
  },
  {
    name: "Rayan C.",
    text: "Rapport qualité-prix solide. Le panier et le paiement Shopify sont fluides.",
  },
  {
    name: "Julie A.",
    text: "J'ai pris deux modèles différents et le rendu est harmonieux. Très contente.",
  },
  {
    name: "Baptiste N.",
    text: "Parfait pour louer un appart meublé sans entretien. Effet décoratif garanti.",
  },
  {
    name: "Léa T.",
    text: "Belle surprise à l'ouverture, matériaux de qualité et couleur très naturelle.",
  },
  {
    name: "Kenza F.",
    text: "Service client sérieux, produit bien protégé et installation en 2 minutes.",
  },
  { name: "Hugo S.", text: "Commande simple, livraison suivie, rendu premium. Rien à redire." },
  {
    name: "Élise W.",
    text: "J'ai transformé mon coin lecture avec une seule plante. Le style est immédiat.",
  },
];

function pickRandomReviews(pool: HomepageReview[], count: number): HomepageReview[] {
  const cloned = [...pool];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned.slice(0, Math.min(count, cloned.length));
}

const collectionQO = queryOptions({
  queryKey: ["shopify", "collection", siteConfig.featuredCollectionHandle],
  queryFn: () => fetchCollectionProducts(siteConfig.featuredCollectionHandle, 6),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ecovia — Plantes d'intérieur éco-responsables" },
      {
        name: "description",
        content:
          "Sélection de plantes artificielles premium livrées en France métropolitaine, sans entretien et sans minimum d'achat.",
      },
      { property: "og:title", content: "Ecovia — Plantes d'intérieur éco-responsables" },
      { property: "og:description", content: "Plantes artificielles premium, emballage recyclé." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collectionQO);
  },
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(collectionQO);
  const products = data.products;
  const [reviewsToShow, setReviewsToShow] = useState<HomepageReview[]>(
    HOMEPAGE_REVIEW_POOL.slice(0, 3),
  );

  useEffect(() => {
    setReviewsToShow(pickRandomReviews(HOMEPAGE_REVIEW_POOL, 3));
  }, []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-14 md:pt-24 pb-20 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sage/20 px-3 py-1 text-xs text-forest uppercase tracking-[0.32em]">
              {siteConfig.brand.heroBadge}
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl leading-[1.02] text-forest">
              <>              
                {siteConfig.brand.tagline.split("sans entretien")[0]}
                <span className="underline decoration-forest/40 decoration-[1px] underline-offset-4">
                  sans entretien
                </span>
                {siteConfig.brand.tagline.split("sans entretien")[1]}
              </>
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-8">
              {siteConfig.brand.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 text-sm font-medium text-primary-foreground shadow-xl shadow-forest/10 hover:bg-forest/90 transition"
              >
                Découvrir la collection <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-medium text-forest hover:bg-secondary transition"
              >
                Nous contacter
              </Link>
            </div>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_120px_rgba(61,107,79,0.12)]">
            <img
              src="https://pipcke.fr/idees-deco/wp-content/uploads/2024/08/plantes-artificielles-dinterieur-sur-un-table-en-bois-scaled.jpg"
              alt="Salon moderne avec plantes artificielles"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Paiement sécurisé",
              desc: "Transactions protégées par Shopify.",
            },
            { icon: Truck, title: "Livraison suivie", desc: "Suivi colis 2-4 jours ouvrés." },
            { icon: RefreshCw, title: "Retours simples", desc: "Retour ou échange en 14 jours." },
            {
              icon: Headphones,
              title: "Service client réactif",
              desc: "Réponse sous 24h ouvrées.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm"
            >
              <span className="size-12 rounded-3xl bg-sage/20 grid place-items-center text-forest">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-sm text-forest">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aperçu boutique */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage">Sélection</p>
            <h2 className="font-display text-3xl md:text-4xl mt-2">{data.title}</h2>
          </div>
          <Link
            to="/boutique"
            className="text-sm text-forest hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            Voir toute la boutique <ArrowRight className="size-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="text-sm">Aucun produit disponible dans cette collection.</p>
            <p className="text-xs mt-2">
              Veuillez vérifier votre sélection Shopify ou le handle de la collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-[2rem] border border-border/60 bg-white/90 p-10 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-sage">Créez votre espace</p>
              <h2 className="font-display text-3xl text-forest">
                Votre intérieur prend vie sans entretien
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Profitez d’un style naturel et chaleureux avec des plantes artificielles haut de
                gamme, apportant immédiatement du caractère à votre salon, bureau ou entrée.
              </p>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-forest px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-forest/90 transition"
            >
              Créer un compte <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir nos plantes ? */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">Nos engagements</p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mt-3">
            Pourquoi choisir nos plantes ?
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Sélectionnées pour leur réalisme et leur durabilité, nos plantes artificielles
            transforment votre intérieur sans contrainte.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Droplets,
              title: "Aucun entretien",
              desc: "Ni eau, ni lumière, ni taille requise.",
            },
            {
              icon: Sparkles,
              title: "Aspect ultra réaliste",
              desc: "Matériaux premium pour un rendu naturel.",
            },
            {
              icon: Clock,
              title: "Longue durée de vie",
              desc: "Conçues pour durer plusieurs années.",
            },
            {
              icon: ThumbsUp,
              title: "Décoration immédiate",
              desc: "Prêtes à poser dès la livraison.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-border/60 bg-white/80 p-6 text-center shadow-sm"
            >
              <span className="mx-auto size-12 rounded-3xl bg-sage/20 grid place-items-center text-forest mb-4">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display text-lg text-forest">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Avis clients */}
      <section className="bg-secondary/30 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.24em] text-sage">Ils nous font confiance</p>
            <h2 className="font-display text-3xl md:text-4xl text-forest mt-3">Avis clients</h2>
            <div className="mt-4 inline-flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5</span>
              <span className="text-sm text-muted-foreground">
                basé sur les retours de nos clients
              </span>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviewsToShow.map((r) => (
              <article
                key={r.name}
                className="rounded-3xl bg-white border border-border/60 p-6 shadow-sm"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">“{r.text}”</p>
                <p className="mt-4 text-sm font-medium text-forest">{r.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">Questions fréquentes</p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mt-3">
            Tout ce que vous devez savoir
          </h2>
        </div>
        <div className="space-y-3">
          {siteConfig.faq.slice(0, 4).map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/60 bg-white px-6 py-4 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-forest">
                {item.q}
                <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/faq"
            className="text-sm text-forest hover:underline inline-flex items-center gap-1"
          >
            Voir toutes les questions <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
