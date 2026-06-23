import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, PenLine, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewData } from "@/lib/shopify/types";

interface Props {
  reviews: ReviewData;
  productHandle: string;
}

function Stars({ value, size = 14, interactive = false, onRate }: { value: number; size?: number; interactive?: boolean; onRate?: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;
  const full = Math.floor(display);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={`transition-colors ${i <= full ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer" : ""}`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

function ReviewForm({ productHandle, onSuccess }: { productHandle: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setErrorMsg("Veuillez sélectionner une note."); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_handle: productHandle, author_name: name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Erreur lors de l'envoi."); setStatus("error"); return; }
      setStatus("success");
      setTimeout(onSuccess, 2000);
    } catch {
      setErrorMsg("Impossible d'envoyer l'avis. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="size-12 rounded-full bg-sage/20 flex items-center justify-center">
          <Check className="size-6 text-forest" />
        </div>
        <p className="font-medium text-forest">Merci pour votre avis !</p>
        <p className="text-sm text-muted-foreground">Il sera publié après validation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-forest" htmlFor="review-name">Votre prénom</label>
        <input
          id="review-name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marie"
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-forest">Votre note</p>
        <Stars value={rating} size={28} interactive onRate={setRating} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-forest" htmlFor="review-comment">Votre avis</label>
        <textarea
          id="review-comment"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez votre expérience avec ce produit…"
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/1000</p>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-forest hover:bg-forest/90 text-primary-foreground rounded-full"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Envoyer mon avis"}
      </Button>
      <p className="text-xs text-center text-muted-foreground">Votre avis sera visible après modération.</p>
    </form>
  );
}

export function ProductReviews({ reviews: shopifyReviews, productHandle }: Props) {
  const [showForm, setShowForm] = useState(false);

  const { data: supabaseReviews = [], refetch } = useQuery({
    queryKey: ["product_reviews", productHandle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("author_name, rating, comment, created_at")
        .eq("product_handle", productHandle)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []).map((r) => ({
        name: r.author_name,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }),
      }));
    },
    staleTime: 60_000,
  });

  // Merge: Supabase approved reviews first, then Shopify metafield reviews (legacy)
  const allReviews = [
    ...supabaseReviews,
    ...shopifyReviews.list,
  ];
  const count = allReviews.length;
  const computedRating = count > 0 ? allReviews.reduce((s, r) => s + r.rating, 0) / count : null;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: count > 0 ? (allReviews.filter((r) => Math.round(r.rating) === star).length / count) * 100 : 0,
  }));

  return (
    <section className="border-t border-border/60 mt-12 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-forest">Avis clients</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-forest border border-forest/30 rounded-full px-4 py-2 hover:bg-sage/10 transition-colors"
        >
          <PenLine className="size-3.5" />
          {showForm ? "Annuler" : "Laisser un avis"}
        </button>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5 mb-8">
          <h3 className="text-sm font-semibold text-forest mb-4">Partagez votre expérience</h3>
          <ReviewForm
            productHandle={productHandle}
            onSuccess={() => { setShowForm(false); refetch(); }}
          />
        </div>
      )}

      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <p className="text-sm">Aucun avis pour le moment.</p>
          <p className="text-xs mt-1">Soyez le premier à partager votre expérience.</p>
        </div>
      ) : (
        <>
          {/* Rating summary */}
          <div className="grid md:grid-cols-[220px_1fr] gap-8 mb-8 p-5 rounded-2xl bg-secondary/30 border border-border/40">
            <div className="text-center md:text-left">
              <p className="font-display text-5xl text-forest">{computedRating!.toFixed(1)}</p>
              <div className="mt-2 inline-flex"><Stars value={computedRating!} size={18} /></div>
              <p className="text-sm text-muted-foreground mt-1">{count} avis</p>
            </div>
            <div className="space-y-1.5 self-center">
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-3 text-xs">
                  <span className="w-6 text-muted-foreground shrink-0">{d.star}★</span>
                  <Progress value={d.pct} className="h-2 flex-1" />
                  <span className="w-8 text-right text-muted-foreground">{Math.round(d.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {allReviews.map((r, i) => (
              <article key={i} className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{r.name}</p>
                  {r.date && <span className="text-[11px] text-muted-foreground">{r.date}</span>}
                </div>
                <Stars value={r.rating} />
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
