import { Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-sage/30 grid place-items-center">
              <Leaf className="size-4 text-forest" />
            </span>
            <span className="font-display text-xl">{siteConfig.brand.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            {siteConfig.brand.description}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Boutique</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-forest">Accueil</Link></li>
            <li><Link to="/boutique" className="hover:text-forest">Boutique</Link></li>
            <li><Link to="/compte" className="hover:text-forest">Mon compte</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Aide</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href={`mailto:${siteConfig.contact.email}`} className="hover:text-forest">{siteConfig.contact.email}</a></li>
            {siteConfig.footer.links.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:text-forest">{link.label}</Link>
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
