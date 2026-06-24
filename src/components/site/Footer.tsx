import { Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";
import { hasRole } from "@/lib/supabase/admin";

export function SiteFooter() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      hasRole(data.session.user.id, "admin").then(setIsAdmin).catch(() => setIsAdmin(false));
    });
  }, []);

  return (
    <footer className="mt-14 md:mt-16 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={siteConfig.brand.logoSrc}
              alt={siteConfig.brand.logoAlt}
              className="h-14 w-auto"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            {siteConfig.brand.description}
          </p>
          <p className="mt-3 text-sm text-forest font-medium">{siteConfig.footer.tagline}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-forest">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/boutique" className="hover:text-forest">
                Boutique
              </Link>
            </li>
            <li>
              <Link to="/boutique" className="hover:text-forest">
                Nos collections
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Compte</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="hover:text-forest">
                Connexion
              </Link>
            </li>
            <li>
              <Link to="/compte" className="hover:text-forest">
                Panier
              </Link>
            </li>
            {isAdmin ? (
              <li>
                <Link to="/admin-5d4f7e9c2b" className="hover:text-forest font-semibold text-forest">
                  Dashboard
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Aide</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {siteConfig.footer.links.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:text-forest">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.footer.copyright}
      </div>
    </footer>
  );
}
