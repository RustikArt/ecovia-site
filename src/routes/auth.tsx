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
  const [mode, setMode] = useState<"signin" | "signup" | "confirm">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          // Email confirmation not required — session ready immediately
          toast.success("Compte créé ! Bienvenue.");
          navigate({ to: "/compte" });
        } else {
          // Email confirmation required
          setMode("confirm");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/compte" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      // Make common Supabase error messages more user-friendly
      if (msg.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Vérifiez votre boîte email pour confirmer votre compte.");
      } else if (msg.includes("User already registered")) {
        toast.error("Un compte existe déjà avec cet email. Connectez-vous.");
        setMode("signin");
      } else {
        toast.error(msg);
      }
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
          // Supabase redirects back here with ?code=xxx (PKCE)
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      // Page will redirect to Google — no need to setLoading(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur Google");
      setLoading(false);
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
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-display text-2xl text-forest">Vérifiez votre email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
            Cliquez dessus pour activer votre compte.
          </p>
          <button
            onClick={() => setMode("signin")}
            className="mt-8 text-sm text-forest underline underline-offset-4"
          >
            Retour à la connexion
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
          {mode === "signin" ? "Heureux de vous revoir." : "Suivez vos commandes et gagnez du temps au prochain achat."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full border border-border bg-background hover:bg-secondary text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
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
            disabled={loading}
            className="w-full h-11 rounded-full bg-forest text-primary-foreground text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
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
