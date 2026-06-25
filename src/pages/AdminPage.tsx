import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Loader2, Shield, Trash2, UserRound, X } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ReviewRow {
  id: string;
  product_handle: string;
  author_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface AccountRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "admin" | "customer";
  status: "active" | "suspended";
  last_sign_in_at: string | null;
  created_at: string;
}

function formatProductTitle(handle: string) {
  return handle
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 60);
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < rating;
    return (
      <span
        key={index}
        className={`text-lg leading-none ${filled ? "text-amber-400" : "text-border/80"}`}
      >
        {filled ? "★" : "☆"}
      </span>
    );
  });
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"new" | "all">("new");

  const reviewsQuery = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, product_handle, author_name, rating, comment, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReviewRow[];
    },
  });

  const accountsQuery = useQuery({
    queryKey: ["admin_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, email, full_name, phone, role, status, last_sign_in_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AccountRow[];
    },
  });

  const filteredAccounts = useMemo(() => {
    const accounts = accountsQuery.data ?? [];
    const search = accountSearch.trim().toLowerCase();
    if (!search) return accounts;

    return accounts.filter((account) => {
      const fullName = account.full_name ?? "";
      return account.email.toLowerCase().includes(search) || fullName.toLowerCase().includes(search);
    });
  }, [accountsQuery.data, accountSearch]);

  const pendingCount = useMemo(
    () => reviewsQuery.data?.filter((review) => review.status === "pending").length ?? 0,
    [reviewsQuery.data],
  );

  const visibleReviews = useMemo(() => {
    const reviews = reviewsQuery.data ?? [];
    if (reviewFilter === "new") {
      return reviews.filter((review) => review.status === "pending");
    }
    return reviews;
  }, [reviewsQuery.data, reviewFilter]);

  async function updateReviewStatus(id: string, status: ReviewRow["status"]) {
    const previousReviews = queryClient.getQueryData<ReviewRow[]>(["admin_reviews"]);

    setSavingId(id);
    queryClient.setQueryData<ReviewRow[]>(["admin_reviews"], (current) =>
      (current ?? []).map((review) => (review.id === id ? { ...review, status } : review)),
    );

    try {
      const { error } = await supabase.from("product_reviews").update({ status }).eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    } catch (error) {
      queryClient.setQueryData(["admin_reviews"], previousReviews);
      throw error;
    } finally {
      setSavingId(null);
    }
  }

  async function deleteReview(id: string) {
    const previousReviews = queryClient.getQueryData<ReviewRow[]>(["admin_reviews"]);

    setSavingId(id);
    queryClient.setQueryData<ReviewRow[]>(["admin_reviews"], (current) =>
      (current ?? []).filter((review) => review.id !== id),
    );

    try {
      const { error } = await supabase.from("product_reviews").delete().eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    } catch (error) {
      queryClient.setQueryData(["admin_reviews"], previousReviews);
      throw error;
    } finally {
      setSavingId(null);
    }
  }

  return (
    <SiteLayout showFooterBottomBar={false}>
      <section className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage">Dashboard admin</p>
            <h1 className="mt-2 font-display text-4xl text-forest">Modération et comptes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {pendingCount} avis en attente • {accountsQuery.data?.length ?? 0} comptes chargés
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Voir la boutique</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-forest" />
                <h2 className="font-semibold text-forest">Avis clients</h2>
              </div>
              <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={reviewFilter === "new" ? "default" : "ghost"}
                  className="rounded-full px-3"
                  onClick={() => setReviewFilter("new")}
                >
                  Nouveaux
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={reviewFilter === "all" ? "default" : "ghost"}
                  className="rounded-full px-3"
                  onClick={() => setReviewFilter("all")}
                >
                  Tous les avis
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
              {reviewsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement des avis...
                </p>
              ) : visibleReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {reviewFilter === "new"
                    ? "Aucun nouvel avis en attente."
                    : "Aucun avis pour le moment."}
                </p>
              ) : (
                visibleReviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{review.author_name}</p>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/product/${review.product_handle}`}
                            className="text-sm font-medium text-forest hover:underline"
                          >
                            {formatProductTitle(review.product_handle)}
                          </Link>
                        </div>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {review.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1">{renderStars(review.rating)}</div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      {reviewFilter === "all" ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-muted-foreground hover:text-destructive"
                          disabled={savingId === review.id}
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Supprimer l'avis</span>
                        </Button>
                      ) : null}
                      {review.status === "pending" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full bg-forest hover:bg-forest/90"
                            disabled={savingId === review.id}
                            onClick={() => updateReviewStatus(review.id, "approved")}
                          >
                            <Check className="size-4" />
                            Valider
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={savingId === review.id}
                            onClick={() => updateReviewStatus(review.id, "rejected")}
                          >
                            <X className="size-4" />
                            Decliner
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-forest" />
                <h2 className="font-semibold text-forest">Comptes clients</h2>
              </div>
              <input
                type="search"
                value={accountSearch}
                onChange={(event) => setAccountSearch(event.target.value)}
                placeholder="Rechercher par email ou nom"
                className="w-full max-w-sm rounded-full border border-border/80 bg-background px-4 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>
            <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
              {accountsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement des comptes...
                </p>
              ) : filteredAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun compte trouvé.</p>
              ) : (
                filteredAccounts.map((account) => (
                  <article key={account.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-foreground">{account.full_name || account.email}</p>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide ${
                          account.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {account.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Telephone: {account.phone || "-"}</p>
                      <span className="text-xs text-muted-foreground">{account.role}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </SiteLayout>
  );
}