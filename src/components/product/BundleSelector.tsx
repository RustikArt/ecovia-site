import type { BundleOffer } from "@/lib/shopify/types";
import { formatPrice } from "@/stores/cartStore";
import { Check } from "lucide-react";

interface Props {
  bundles: BundleOffer[];
  unitPrice: number;
  currency: string;
  selectedIndex: number;
  onSelect: (b: BundleOffer) => void;
}

export function BundleSelector({ bundles, unitPrice, currency, selectedIndex, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.15em] text-sage">Choisissez votre offre</p>
      <div className="space-y-2">
        {bundles.map((b) => {
          const totalNormal = unitPrice * b.quantity;
          const totalDiscounted = totalNormal * (1 - b.discountPercent / 100);
          const isPopular = b.index === 2;
          const isSelected = b.index === selectedIndex;
          return (
            <button
              key={b.index}
              type="button"
              onClick={() => onSelect(b)}
              className={`w-full text-left rounded-2xl border-2 transition px-4 py-3 flex items-center gap-3 relative ${
                isSelected ? "border-forest bg-sage/10" : "border-border hover:border-forest/40"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2 right-3 bg-forest text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                  Le plus populaire
                </span>
              )}
              <div className={`size-5 rounded-full border-2 flex-shrink-0 grid place-items-center ${isSelected ? "border-forest bg-forest" : "border-border"}`}>
                {isSelected && <Check className="size-3 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{b.title}</p>
                {b.discountPercent > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Économisez {b.discountPercent}%
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-lg text-forest">{formatPrice(totalDiscounted, currency)}</p>
                {b.discountPercent > 0 && (
                  <p className="text-xs text-muted-foreground line-through">{formatPrice(totalNormal, currency)}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
