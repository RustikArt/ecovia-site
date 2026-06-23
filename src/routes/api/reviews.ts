import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const REVIEW_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const REVIEW_LIMIT_MAX = 6;
const reviewRateByIp = new Map<string, number[]>();

function getRequestIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

function checkAndTrackRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = reviewRateByIp.get(ip) ?? [];
  const kept = existing.filter((t) => now - t < REVIEW_LIMIT_WINDOW_MS);
  if (kept.length >= REVIEW_LIMIT_MAX) {
    reviewRateByIp.set(ip, kept);
    return false;
  }
  kept.push(now);
  reviewRateByIp.set(ip, kept);
  return true;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || (import.meta.env.VITE_SUPABASE_URL as string | undefined);
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createClient<Database>(url, key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = getRequestIp(request);

    if (!checkAndTrackRateLimit(ip)) {
      return json({ error: "Trop de tentatives. Réessayez plus tard." }, 429);
    }

    const handle = String(body.product_handle || "").trim();
    const authorName = String(body.author_name || "").trim();
    const rating = Number(body.rating);
    const comment = String(body.comment || "").trim();
    const honeypot = String(body.website || "").trim();

    if (honeypot) {
      return json({ error: "Requete invalide." }, 400);
    }

    // Validation
    if (!handle || !/^[a-z0-9][a-z0-9-]{1,120}$/.test(handle)) {
      return json({ error: "Produit manquant." }, 400);
    }
    if (!authorName || authorName.length < 2 || authorName.length > 80) {
      return json({ error: "Prénom invalide (2 à 80 caractères)." }, 400);
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json({ error: "Note invalide (1 à 5)." }, 400);
    }
    if (!comment || comment.length < 10 || comment.length > 1000) {
      return json({ error: "Commentaire trop court (min. 10 caractères)." }, 400);
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("product_reviews").insert({
      product_handle: handle,
      author_name: authorName,
      rating,
      comment,
      status: "pending",
    });

    if (error) {
      console.error("[reviews] Supabase insert error:", error.message);
      return json({ error: "Erreur lors de l'enregistrement de l'avis." }, 500);
    }

    return json({ success: true }, 200);
  } catch (err) {
    console.error("[reviews] Unexpected error:", err);
    return json({ error: "Erreur interne." }, 500);
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
