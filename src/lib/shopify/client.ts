import { toast } from "sonner";

export const SHOPIFY_API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || "2025-07";
export const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

function getStorefrontUrl(): string {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error(
      `Missing Shopify environment variables. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in your .env file and your Netlify environment settings, then rebuild.`,
    );
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
): Promise<{ data?: T } | undefined> {
  const SHOPIFY_STOREFRONT_URL = getStorefrontUrl();
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify : abonnement requis", {
      description: "L'accès à l'API Shopify nécessite un plan payant actif.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`Shopify HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`Shopify : ${json.errors.map((e: any) => e.message).join(", ")}`);
  }
  return json;
}

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
