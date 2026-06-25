import { createFileRoute } from "@tanstack/react-router";

const CONTACT_FORWARD_URL = "https://formsubmit.co/ajax/390c3a42564b0e28a615296136e9aad0";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const name = String(body.name || "").trim();
          const email = String(body.email || "").trim();
          const message = String(body.message || "").trim();
          const subject = String(body.subject || "Demande d'aide").trim();
          const honeypot = String(body.website || "").trim();
          const elapsedMs = Number(body.elapsedMs || 0);

          if (honeypot || elapsedMs < 2500) {
            return json({ error: "Envoi bloqué. Veuillez réessayer." }, 400);
          }

          if (!name || name.length > 80) {
            return json({ error: "Nom invalide." }, 400);
          }
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
            return json({ error: "Email invalide." }, 400);
          }
          if (!message || message.length < 10 || message.length > 2000) {
            return json({ error: "Message invalide." }, 400);
          }

          const forwardedBody = new URLSearchParams({
            name,
            email,
            message,
            subject,
            _subject: subject,
            _captcha: "true",
            _template: "table",
          });

          const response = await fetch(CONTACT_FORWARD_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: forwardedBody,
          });

          const raw = await response.text();
          let result: { error?: string } = {};
          try {
            result = raw ? JSON.parse(raw) : {};
          } catch {
            result = {};
          }

          if (!response.ok) {
            return json({ error: result.error || "Échec de l'envoi." }, 502);
          }

          return json({ success: true }, 200);
        } catch (err) {
          console.error("[contact] Unexpected error:", err);
          return json({ error: "Erreur interne." }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
