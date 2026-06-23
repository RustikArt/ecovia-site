import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ecovia" },
      { name: "description", content: "Une question ? L'équipe Ecovia vous répond sous 24h ouvrées." },
      { property: "og:title", content: "Contact — Ecovia" },
      { property: "og:description", content: "Écrivez-nous, on répond sous 24h ouvrées." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      subject: String(data.get("subject") || siteConfig.contact.defaultSubject).trim(),
      message: String(data.get("message") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let result: { error?: string; success?: boolean } = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        result = {};
      }
      if (!response.ok) {
        throw new Error(result.error || "Échec de l'envoi.");
      }

      toast.success("Message envoyé. Nous revenons vers vous rapidement.");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sage">Nous écrire</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2 text-forest">Contact</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm">
            Une question sur une plante, votre commande, ou un partenariat ? Nous répondons sous 24h ouvrées.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-full bg-sage/30 grid place-items-center shrink-0">
                <Mail className="size-4 text-forest" />
              </span>
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href={`mailto:${siteConfig.contact.email}`} className="text-sm text-muted-foreground hover:text-forest">{siteConfig.contact.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-full bg-sage/30 grid place-items-center shrink-0">
                <Clock className="size-4 text-forest" />
              </span>
              <div>
                <p className="text-sm font-medium">Horaires</p>
                <p className="text-sm text-muted-foreground">{siteConfig.contact.hours}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-full bg-sage/30 grid place-items-center shrink-0">
                <MapPin className="size-4 text-forest" />
              </span>
              <div>
                <p className="text-sm font-medium">Adresse</p>
                <p className="text-sm text-muted-foreground">{siteConfig.contact.address}</p>
              </div>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" required maxLength={80} placeholder="Votre nom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={120} placeholder="vous@exemple.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required minLength={10} maxLength={2000} rows={6} placeholder="Comment pouvons-nous vous aider ?" />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              <Send className="size-4 mr-2" />
              {sending ? "Envoi…" : "Envoyer le message"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
