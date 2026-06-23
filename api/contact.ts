type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: (body?: string) => void;
};

function sendJson(res: Res, status: number, body: unknown) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.json(body);
}

function parseBody(body: unknown): Record<string, unknown> {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof body === "object") return body as Record<string, unknown>;
  return {};
}

export default async function handler(req: Req, res: Res) {
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.status(204);
    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.end();
  }

  if (method === "GET") {
    return sendJson(res, 200, { ok: true, endpoint: "contact" });
  }

  if (method !== "POST") {
    return sendJson(res, 405, { error: "Méthode non autorisée." });
  }

  const body = parseBody(req.body);
  const payload = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    subject: String(body.subject || "").trim(),
    message: String(body.message || "").trim(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    return sendJson(res, 400, { error: "Tous les champs obligatoires doivent être remplis." });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
    return sendJson(res, 400, { error: "Adresse email invalide." });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "no-reply@ecovia.fr";
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "ecovia-off@proton.me";

  if (!RESEND_API_KEY) {
    return sendJson(res, 500, { error: "RESEND_API_KEY manquante." });
  }

  const subject = payload.subject || `Demande d'aide — ${payload.name}`;
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
    return sendJson(res, 500, {
      error: `Resend ${response.status}: ${errorText || response.statusText}`,
    });
  }

  return sendJson(res, 200, { success: true });
}
