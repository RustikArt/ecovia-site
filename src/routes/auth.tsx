import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Ecovia" },
      { name: "description", content: "Connectez-vous à votre compte Ecovia ou créez-en un en quelques secondes." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre boîte mail si nécessaire.");
        navigate({ to: "/compte" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/compte" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/compte`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur Google");
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl text-forest">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin" ? "Heureux de vous revoir." : "Suivez vos commandes et gagnez du temps au prochain achat."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full border border-border bg-background hover:bg-secondary text-sm flex items-center justify-center gap-2"
        >
          Continuer avec Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> ou <span className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
              className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            minLength={6}
            className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm"
          />
          <button
            disabled={loading}
            className="w-full h-11 rounded-full bg-forest text-primary-foreground text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-muted-foreground">
          {mode === "signin" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-forest underline">
            {mode === "signin" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
        <p className="mt-8 text-xs text-center text-muted-foreground">
          <Link to="/" className="hover:underline">← Retour à la boutique</Link>
        </p>
      </section>
    </SiteLayout>
  );
}
