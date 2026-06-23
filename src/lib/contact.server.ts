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
  const RESEND_API_KEY = env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const CONTACT_FROM_EMAIL =
    env?.CONTACT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || "no-reply@ecovia.fr";
  const CONTACT_TO_EMAIL =
    env?.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || siteConfig.contact.email;

  if (!RESEND_API_KEY) {
    throw new Error(
      "Aucune cle Resend n'est configuree. Definissez RESEND_API_KEY dans votre environnement.",
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Ecovia Contact <${CONTACT_FROM_EMAIL}>`,
      to: [CONTACT_TO_EMAIL],
      reply_to: payload.email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend ${response.status}: ${errorText || response.statusText}`);
  }
}
