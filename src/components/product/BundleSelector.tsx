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
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-forest">Choisissez votre offre</p>
      <div className="space-y-2">
        {bundles.map((b) => {
          const totalNormal = unitPrice * b.quantity;
          const totalDiscounted = totalNormal * (1 - b.discountPercent / 100);
          const unitPriceDiscounted = totalDiscounted / b.quantity;
          const isPopular = b.index === 2;
          const isSelected = b.index === selectedIndex;
          return (
            <button
              key={b.index}
              type="button"
              onClick={() => onSelect(b)}
              className={`w-full text-left rounded-2xl border-2 transition-all px-4 py-3.5 flex items-center gap-3 relative ${
                isSelected
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-border bg-white hover:border-forest/40"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-forest text-primary-foreground text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                  ✦ Le plus populaire
                </span>
              )}
              {/* Radio dot */}
              <div
                className={`size-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? "border-forest bg-forest" : "border-border"
                }`}
              >
                {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
              </div>

              {/* Label + per-unit price */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm ${isSelected ? "text-forest" : "text-foreground"}`}
                >
                  {b.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPrice(unitPriceDiscounted, currency)} / unité
                  {b.discountPercent > 0 && (
                    <span className="ml-1.5 text-sage font-medium">−{b.discountPercent}%</span>
                  )}
                </p>
              </div>

              {/* Total price */}
              <div className="text-right flex-shrink-0">
                <p
                  className={`font-display text-xl leading-none ${isSelected ? "text-forest" : "text-foreground"}`}
                >
                  {formatPrice(totalDiscounted, currency)}
                </p>
                {b.discountPercent > 0 && (
                  <p className="text-xs text-muted-foreground line-through mt-0.5">
                    {formatPrice(totalNormal, currency)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
