import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, Truck } from "lucide-react";
import { useCartStore, formatPrice } from "@/stores/cartStore";
import { fetchProducts } from "@/lib/shopify/api";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { trackInitiateCheckout } from "@/lib/tracking";
import { siteConfig } from "@/config/site";

export function SlideCart() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const checkoutUrl = useCartStore((s) => s.checkoutUrl);
  const syncCart = useCartStore((s) => s.syncCart);

  const [upsells, setUpsells] = useState<ShopifyProduct[]>([]);
  const currency = items[0]?.price.currencyCode || "EUR";
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0),
    [items],
  );


  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  useEffect(() => {
    if (!isOpen || upsells.length > 0) return;
    fetchProducts(4, "tag:upsell").then((p) => {
      const filtered = p.filter((u) => !items.some((it) => it.productHandle === u.node.handle)).slice(0, 2);
      setUpsells(filtered);
    }).catch(() => undefined);
  }, [isOpen, items, upsells.length]);

  function handleCheckout() {
    if (!checkoutUrl) return;
    trackInitiateCheckout(
      subtotal,
      currency,
      items.map((i) => i.variantId),
    );
    window.open(checkoutUrl, "_blank");
    setOpen(false);
  }

  async function quickAdd(p: ShopifyProduct) {
    const variant = p.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      productHandle: p.node.handle,
      productTitle: p.node.title,
      productImage: p.node.images.edges[0]?.node.url ?? null,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b border-border/60">
          <SheetTitle className="font-display text-xl text-forest">Votre panier</SheetTitle>
        </SheetHeader>

        {/* Free shipping banner */}
        <div className="px-5 py-3 border-b border-border/60 bg-sage/10">
          <div className="flex items-center gap-2 text-xs text-forest">
            <Truck className="size-3.5 flex-shrink-0" />
            <span>{siteConfig.shipping.bannerText}</span>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
              <ShoppingBag className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 p-5">
                  <div className="size-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productTitle} className="size-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.productTitle}</h4>
                    {item.selectedOptions.length > 0 && item.variantTitle !== "Default Title" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.selectedOptions.map((o) => o.value).join(" • ")}
                      </p>
                    )}
                    <p className="font-medium text-sm mt-1">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="size-7 rounded-full border border-border grid place-items-center hover:bg-secondary disabled:opacity-50" disabled={isLoading}>
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="size-7 rounded-full border border-border grid place-items-center hover:bg-secondary disabled:opacity-50" disabled={isLoading}>
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Supprimer">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Upsells */}
          {items.length > 0 && upsells.length > 0 && (
            <div className="px-5 py-4 border-t border-border/60">
              <p className="text-xs uppercase tracking-[0.15em] text-sage mb-3">Ils complètent votre panier</p>
              <div className="space-y-2">
                {upsells.map((u) => {
                  const variant = u.node.variants.edges[0]?.node;
                  if (!variant) return null;
                  return (
                    <div key={u.node.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/40">
                      <div className="size-12 rounded-lg overflow-hidden bg-background flex-shrink-0">
                        {u.node.images.edges[0] && (
                          <img src={u.node.images.edges[0].node.url} alt={u.node.title} className="size-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.node.title}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(variant.price.amount, variant.price.currencyCode)}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => quickAdd(u)} disabled={isLoading}>
                        <Plus className="size-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/60 px-5 py-4 space-y-3 bg-background">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium">{formatPrice(subtotal, currency)}</span>
            </div>
            <Button
              className="w-full bg-forest hover:bg-forest/90 text-primary-foreground rounded-full"
              size="lg"
              disabled={isLoading || isSyncing || !checkoutUrl}
              onClick={handleCheckout}
            >
              {isLoading || isSyncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <><ExternalLink className="size-4 mr-2" /> Passer au paiement</>
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">Paiement sécurisé via Shopify</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
