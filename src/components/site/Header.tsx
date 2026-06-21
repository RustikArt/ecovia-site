import { Link } from "@tanstack/react-router";
import { Leaf, ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { siteConfig } from "@/config/site";

const linkCls = "text-sm text-forest/80 hover:text-forest transition-colors";
const activeCls = "text-forest font-medium";

export function SiteHeader() {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={siteConfig.brand.logoSrc} alt={siteConfig.brand.logoAlt} className="h-14 w-auto" />
          <div className="hidden sm:block">
            <span className="block font-display text-lg tracking-tight">{siteConfig.brand.name}</span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Décoration intérieure</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>Accueil</Link>
          <Link to="/boutique" className={linkCls} activeProps={{ className: activeCls }}>Boutique</Link>
          <Link to="/boutique#collections" className={linkCls}>Nos collections</Link>
          <Link to="/faq" className={linkCls} activeProps={{ className: activeCls }}>FAQ</Link>
          <Link to="/contact" className={linkCls} activeProps={{ className: activeCls }}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/boutique" className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors" aria-label="Recherche">
            <Search className="size-4" />
          </Link>
          <Link to="/compte" className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors" aria-label="Compte">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-forest text-primary-foreground text-[10px] grid place-items-center">{count}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
