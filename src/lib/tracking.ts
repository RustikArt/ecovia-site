/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, params?: any) => void };
  }
}

function safe(fn: () => void) {
  try { fn(); } catch (e) { console.warn("[tracking]", e); }
}

export function trackViewContent(p: { id?: string; title?: string; price?: { amount: string; currencyCode: string } }) {
  safe(() => window.fbq?.("track", "ViewContent", {
    content_ids: p.id ? [p.id] : undefined,
    content_name: p.title,
    content_type: "product",
    value: p.price ? parseFloat(p.price.amount) : undefined,
    currency: p.price?.currencyCode,
  }));
  safe(() => window.ttq?.track("ViewContent", {
    content_id: p.id,
    content_name: p.title,
    value: p.price ? parseFloat(p.price.amount) : undefined,
    currency: p.price?.currencyCode,
  }));
}

export function trackAddToCart(item: { variantId?: string; productTitle?: string; price?: { amount: string; currencyCode: string }; quantity?: number }) {
  safe(() => window.fbq?.("track", "AddToCart", {
    content_ids: item.variantId ? [item.variantId] : undefined,
    content_name: item.productTitle,
    content_type: "product",
    value: item.price ? parseFloat(item.price.amount) * (item.quantity ?? 1) : undefined,
    currency: item.price?.currencyCode,
  }));
  safe(() => window.ttq?.track("AddToCart", {
    content_id: item.variantId,
    content_name: item.productTitle,
    quantity: item.quantity,
    value: item.price ? parseFloat(item.price.amount) * (item.quantity ?? 1) : undefined,
    currency: item.price?.currencyCode,
  }));
}

export function trackInitiateCheckout(value: number, currency: string, ids: string[]) {
  safe(() => window.fbq?.("track", "InitiateCheckout", {
    content_ids: ids,
    value,
    currency,
    num_items: ids.length,
  }));
  safe(() => window.ttq?.track("InitiateCheckout", { value, currency, content_id: ids[0] }));
}
