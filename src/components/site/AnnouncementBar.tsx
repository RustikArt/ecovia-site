import { useState } from "react";
import { Truck, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 bg-forest text-primary-foreground">
      <div className="relative mx-auto max-w-6xl px-6 h-10 text-xs sm:text-sm">
        <div className="absolute inset-y-0 left-6 flex items-center">
          <Truck className="size-4 shrink-0" aria-hidden />
        </div>
        <div className="absolute inset-y-0 right-3 flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la bannière"
            className="rounded-full p-2 text-primary-foreground transition-colors hover:bg-white/15"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex h-full items-center justify-center">
          <span className="font-medium text-center">{siteConfig.shipping.bannerText}</span>
        </div>
      </div>
    </div>
  );
}
