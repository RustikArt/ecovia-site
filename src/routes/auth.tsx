import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [sending, setSending] = useState(false);
  // Handles OAuth PKCE callback: Supabase redirects back to /auth?code=xxx
  const [exchanging, setExchanging] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (!code) return;

    // Exchange the PKCE authorization code for a session
    setExchanging(true);
    supabase.auth.exchangeCodeForSession(window.location.search).then(({ error }) => {
      if (error) {
        toast.error("Échec de la connexion. Veuillez réessayer.");
        setExchanging(false);
        // Clean up URL
        window.history.replaceState({}, "", "/auth");
      } else {
        navigate({ to: "/compte", replace: true });
      }
    });
  }, [navigate]);

  async function onMagicLink() {
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // No confirmation mail: create session immediately when allowed in Supabase settings.
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.error("La création du compte nécessite une confirmation email côté Supabase. Désactivez-la pour un accès immédiat.");
          return;
        }
        toast.success("Compte créé !");
        navigate({ to: "/compte", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/compte", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      if (msg.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (msg.includes("User already registered")) {
        toast.error("Un compte existe déjà avec cet email.");
        setMode("signin");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  }
  }

  // OAuth code exchange in progress
  if (exchanging) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-forest" />
          <p className="text-sm">Connexion en cours…</p>
        </div>
      </SiteLayout>
    );
  }

  // Email confirmation sent
  if (mode === "confirm") {
  // Email confirmation sent
  if (mode === "confirm") {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-display text-2xl text-forest">Vérifiez votre email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Un lien de connexion a été envoyé à <strong>{email}</strong>.<br />
            Cliquez dessus pour accéder à votre compte.
          </p>
          <button
            type="button"
            onClick={() => setMode("form")}
            className="mt-8 text-sm text-forest underline underline-offset-4"
          >
            Utiliser une autre adresse email
          </button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl text-forest">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Heureux de vous revoir."
            : "Créez votre compte sans confirmation email."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
              className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm outline-none focus:border-forest transition"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm outline-none focus:border-forest transition"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full h-11 px-4 rounded-full bg-background border border-border text-sm outline-none focus:border-forest transition"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full h-11 rounded-full bg-forest text-primary-foreground text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
        <p className="mt-5 text-sm text-center text-muted-foreground">
          {mode === "signin" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-forest underline underline-offset-4"
          >
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
