import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Shield } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { siteConfig } from "@/config/site";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { hasRole } from "@/lib/supabase/admin";

const linkCls = "text-sm text-forest/80 hover:text-forest transition-colors";
const activeCls = "text-forest font-medium";

export function SiteHeader({ bannerVisible }: { bannerVisible: boolean }) {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const setOpen = useCartStore((s) => s.setOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      hasRole(data.session.user.id, "admin").then(setIsAdmin).catch(() => setIsAdmin(false));
    });
  }, []);

  const navLinks = [
    { to: "/", label: "Accueil", exact: true },
    { to: "/boutique", label: "Boutique" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header
      className="fixed left-0 right-0 z-40 backdrop-blur bg-background/80 border-b border-border/60 transition-[top] duration-300 ease-in-out"
      style={{ top: bannerVisible ? 40 : 0 }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={siteConfig.brand.logoSrc}
            alt={siteConfig.brand.logoAlt}
            className="h-14 w-auto"
          />
          <div className="hidden sm:block">
            <span className="block font-display text-lg tracking-tight">
              {siteConfig.brand.name}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Décoration intérieure
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkCls}
              activeProps={{ className: activeCls }}
              activeOptions={item.exact ? { exact: true } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6">
              <SheetTitle className="font-display text-xl text-forest">Menu</SheetTitle>
              <nav className="mt-6 space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-forest hover:bg-secondary transition-colors"
                    activeProps={{ className: "block rounded-xl border border-forest/30 bg-sage/15 px-4 py-3 text-sm font-medium text-forest" }}
                    activeOptions={item.exact ? { exact: true } : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          {isAdmin ? (
            <Link
              to="/admin-5d4f7e9c2b"
              className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
              aria-label="Dashboard admin"
            >
              <Shield className="size-4" />
            </Link>
          ) : (
            <div className="size-10" aria-hidden="true" />
          )}
          <Link
            to="/compte"
            className="size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
            aria-label="Compte"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative size-10 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-forest text-primary-foreground text-[10px] grid place-items-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
