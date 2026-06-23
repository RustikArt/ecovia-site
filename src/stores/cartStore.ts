import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storefrontApiRequest, formatCheckoutUrl } from "@/lib/shopify/client";
import {
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "@/lib/shopify/queries";
import { trackAddToCart } from "@/lib/tracking";

const CART_STORAGE_KEY = "ecovia-shopify-cart";
const CART_BACKUP_STORAGE_KEY = "ecovia-shopify-cart-backup";

type CartSnapshot = {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
};

function readBackupCart(): CartSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CART_BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartSnapshot;
    if (!Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items,
      cartId: typeof parsed.cartId === "string" ? parsed.cartId : null,
      checkoutUrl: typeof parsed.checkoutUrl === "string" ? parsed.checkoutUrl : null,
    };
  } catch {
    return null;
  }
}

function writeBackupCart(snapshot: CartSnapshot) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_BACKUP_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota/storage errors
  }
}

export interface CartItem {
  lineId: string | null;
  productHandle: string;
  productTitle: string;
  productImage: string | null;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

interface UserError {
  field: string[] | null;
  message: string;
}

function isCartNotFoundError(userErrors: UserError[]): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist"),
  );
}

async function createShopifyCart(item: Omit<CartItem, "lineId">) {
  const data = await storefrontApiRequest<any>(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  const errs = data?.data?.cartCreate?.userErrors || [];
  if (errs.length) {
    console.error(errs);
    return null;
  }
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLineToShopifyCart(cartId: string, item: Omit<CartItem, "lineId">) {
  const data = await storefrontApiRequest<any>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const errs = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length) {
    console.error(errs);
    return { success: false };
  }
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: any) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest<any>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const errs = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length) {
    console.error(errs);
    return { success: false };
  }
  return { success: true };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest<any>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
  const errs = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length) {
    console.error(errs);
    return { success: false };
  }
  return { success: true };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: readBackupCart()?.items ?? [],
      cartId: readBackupCart()?.cartId ?? null,
      checkoutUrl: readBackupCart()?.checkoutUrl ?? null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart(item);
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId ?? null }],
                isOpen: true,
              });
              trackAddToCart(item);
            }
          } else if (existing) {
            const newQty = existing.quantity + item.quantity;
            if (!existing.lineId) return;
            const res = await updateShopifyCartLine(cartId, existing.lineId, newQty);
            if (res.success) {
              set({
                items: get().items.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQty } : i,
                ),
                isOpen: true,
              });
              trackAddToCart(item);
            } else if (res.cartNotFound) clearCart();
          } else {
            const res = await addLineToShopifyCart(cartId, item);
            if (res.success) {
              set({
                items: [...get().items, { ...item, lineId: res.lineId ?? null }],
                isOpen: true,
              });
              trackAddToCart(item);
            } else if (res.cartNotFound) clearCart();
          }
        } catch (err) {
          console.error("Failed to add item:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const res = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (res.success) {
            set({
              items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            });
          } else if (res.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const res = await removeLineFromShopifyCart(cartId, item.lineId);
          if (res.success) {
            const newItems = get().items.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) clearCart();
            else set({ items: newItems });
          } else if (res.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<any>(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (err) {
          console.error("Sync failed:", err);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  useCartStore.subscribe((state) => {
    writeBackupCart({
      items: state.items,
      cartId: state.cartId,
      checkoutUrl: state.checkoutUrl,
    });
  });
}

export function formatPrice(amount: string | number, currency = "EUR"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);
}
