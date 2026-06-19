import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ReviewData } from "@/lib/shopify/types";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
          />
        );
      })}
    </div>
  );
}

export function ProductReviews({ reviews }: { reviews: ReviewData }) {
  const { list, rating, count } = reviews;

  if (list.length === 0) {
    return (
      <section className="border-t border-border/60 mt-12 pt-10">
        <h2 className="font-display text-2xl text-forest mb-2">Avis clients</h2>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <p className="text-sm">Aucun avis pour le moment</p>
          <p className="text-xs mt-1">Soyez le premier à donner votre avis</p>
        </div>
      </section>
    );
  }

  const computedRating = rating ?? list.reduce((s, r) => s + r.rating, 0) / list.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: (list.filter((r) => Math.round(r.rating) === star).length / list.length) * 100,
  }));

  return (
    <section className="border-t border-border/60 mt-12 pt-10">
      <h2 className="font-display text-2xl text-forest mb-6">Avis clients</h2>
      <div className="grid md:grid-cols-[260px_1fr] gap-8 mb-8">
        <div className="text-center md:text-left">
          <p className="font-display text-5xl text-forest">{computedRating.toFixed(1)}</p>
          <div className="mt-2 inline-flex"><Stars value={computedRating} size={18} /></div>
          <p className="text-sm text-muted-foreground mt-1">{count} avis</p>
        </div>
        <div className="space-y-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-xs">
              <span className="w-6 text-muted-foreground">{d.star}★</span>
              <Progress value={d.pct} className="h-2 flex-1" />
              <span className="w-10 text-right text-muted-foreground">{Math.round(d.pct)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((r, i) => (
          <article key={i} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">{r.name}</p>
              {r.date && <span className="text-[11px] text-muted-foreground">{r.date}</span>}
            </div>
            <Stars value={r.rating} />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
            {r.image_url && (
              <img src={r.image_url} alt="" className="mt-3 rounded-lg max-h-40 object-cover" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
