import { sendContactEmail, ContactPayload } from "@/lib/contact.server";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, endpoint: "contact" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload: ContactPayload = {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      subject: String(body.subject || "").trim(),
      message: String(body.message || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      return new Response(JSON.stringify({ error: "Tous les champs obligatoires doivent être remplis." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      return new Response(JSON.stringify({ error: "Adresse email invalide." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await sendContactEmail(payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Impossible d'envoyer le message. Réessayez plus tard." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
