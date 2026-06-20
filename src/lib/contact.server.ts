import { siteConfig } from "@/config/site";

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(
  payload: ContactPayload,
  env?: Record<string, string> | undefined,
): Promise<void> {
  const SENDGRID_API_KEY = env?.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
  const CONTACT_FROM_EMAIL =
    env?.CONTACT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || "no-reply@ecovia.fr";
  const CONTACT_TO_EMAIL =
    env?.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || siteConfig.contact.email;

  if (!SENDGRID_API_KEY) {
    throw new Error(
      "Aucun jeton SendGrid n'est configuré. Définissez SENDGRID_API_KEY dans votre environnement.",
    );
  }

  const subject = payload.subject || `${siteConfig.contact.defaultSubject} — ${payload.name}`;
  const html = `
    <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1F2937; line-height:1.6;">
      <h2>Nouveau message via le formulaire de contact Ecovia</h2>
      <p><strong>Nom :</strong> ${payload.name}</p>
      <p><strong>Email :</strong> ${payload.email}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <div style="margin-top:16px;"><strong>Message :</strong></div>
      <p>${payload.message.replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: CONTACT_TO_EMAIL }], subject }],
      from: { email: CONTACT_FROM_EMAIL, name: "Ecovia Contact" },
      reply_to: { email: payload.email, name: payload.name },
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid ${response.status}: ${errorText || response.statusText}`);
  }
}
