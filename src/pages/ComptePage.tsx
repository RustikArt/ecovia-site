import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { hasRole } from "@/lib/supabase/admin";

export default function ComptePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const admin = await hasRole(data.user.id, "admin");
      setIsAdmin(admin);
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-display text-3xl text-forest">Mon compte</h1>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Se déconnecter
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
          <p className="text-xs uppercase tracking-[0.15em] text-sage">Profil</p>
          <p className="mt-2 text-sm">
            <span className="text-muted-foreground">Email : </span>
            <span className="font-medium">{email || "—"}</span>
          </p>
          {isAdmin && (
            <Link
              to="/admin-5d4f7e9c2b"
              className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Ouvrir le dashboard admin
            </Link>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Vos commandes</p>
          <p className="mt-2">
            Vos commandes sont gérées par Shopify. Vous recevez les emails de confirmation et de
            suivi directement dans votre boîte mail.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}