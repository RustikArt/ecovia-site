import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Shield, Star, UserRound, X } from "lucide-react";
import { toast } from "sonner";
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
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={index < rating ? "size-4 text-amber-400" : "size-4 text-border/80"}
    />
  ));
}

export const Route = createFileRoute("/admin-5d4f7e9c2b")({
  head: () => ({
    meta: [
      { title: "Dashboard admin - Ecovia" },
      {
        name: "description",
        content: "Moderation des avis et gestion simple des comptes clients Ecovia.",
      },
    ],
  }),
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUserId(data.session?.user?.id ?? null);
    });
  }, []);

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

  const pendingCount = useMemo(
    () => reviewsQuery.data?.filter((review) => review.status === "pending").length ?? 0,
    [reviewsQuery.data],
  );

  async function updateReviewStatus(id: string, status: ReviewRow["status"]) {
    setSavingId(id);
    try {
      const { error } = await supabase.from("product_reviews").update({ status }).eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    } finally {
      setSavingId(null);
    }
  }

  async function updateAccountStatus(id: string, status: AccountRow["status"]) {
    setSavingId(id);
    try {
      const { error } = await supabase.from("accounts").update({ status }).eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin_accounts"] });
      toast.success(`Compte ${status === "suspended" ? "suspendu" : "activé"}`);
    } catch (error) {
      toast.error("Impossible de mettre à jour le compte.");
      console.error(error);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <SiteLayout>
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
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-4 text-forest" />
              <h2 className="font-semibold text-forest">Avis clients</h2>
            </div>
            <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
              {reviewsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement des avis...
                </p>
              ) : (reviewsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
              ) : (
                reviewsQuery.data?.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-foreground">{review.author_name}</p>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/product/${review.product_handle}`}
                            className="text-sm font-medium text-forest hover:underline"
                          >
                            {formatProductTitle(review.product_handle)}
                          </Link>
                          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            Voir
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {review.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1">{renderStars(review.rating)}</div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">{review.rating} étoiles</p>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="size-4 text-forest" />
              <h2 className="font-semibold text-forest">Comptes clients</h2>
            </div>
            <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
              {accountsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement des comptes...
                </p>
              ) : (accountsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun compte trouve.</p>
              ) : (
                accountsQuery.data?.map((account) => (
                  <article key={account.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-foreground">{account.full_name || account.email}</p>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      </div>
                      <span className={
                        `rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide ${
                          account.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`
                      }>
                        {account.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Telephone: {account.phone || "-"}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full bg-forest hover:bg-forest/90"
                          disabled={
                            savingId === account.id ||
                            account.status === "active" ||
                            !sessionUserId
                          }
                          onClick={() => updateAccountStatus(account.id, "active")}
                        >
                          Activer
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={
                            savingId === account.id ||
                            account.status === "suspended" ||
                            !sessionUserId
                          }
                          onClick={() => updateAccountStatus(account.id, "suspended")}
                        >
                          Suspendre
                        </Button>
                      </div>
                    </div>
                    {!sessionUserId ? (
                      <p className="mt-3 text-xs text-rose-600">Connecte-toi pour activer la gestion des comptes.</p>
                    ) : null}
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
