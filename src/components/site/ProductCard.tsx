import { Link } from "@tanstack/react-router";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatPrice } from "@/stores/cartStore";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const node = product.node;
  const img = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="group relative flex flex-col"
    >
      <article className="flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary/60">
          {img ? (
            <img
              src={img.url}
              alt={img.altText ?? node.title}
              loading="lazy"
              className="size-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="size-full grid place-items-center text-muted-foreground text-xs">
              Pas d'image
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-lg leading-tight">{node.title}</h3>
          <span className="font-display text-lg whitespace-nowrap">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
        </div>
        {node.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{node.description}</p>
        )}
      </article>
    </Link>
  );
}
