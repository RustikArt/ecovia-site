import { useState } from "react";
import { Truck, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 bg-forest text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 h-10 flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Truck className="size-4 shrink-0" aria-hidden />
          <span className="font-medium">{siteConfig.shipping.bannerText}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer la bannière"
          className="rounded-full p-2 hover:bg-forest/20 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
