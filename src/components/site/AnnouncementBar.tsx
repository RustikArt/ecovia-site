import { Truck, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 bg-forest text-primary-foreground transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="relative h-10 text-xs sm:text-sm">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la bannière"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary-foreground transition-colors hover:bg-white/15"
        >
          <X className="size-4" />
        </button>
        <div className="flex h-full items-center justify-center gap-2">
          <div className="mx-auto max-w-6xl px-6 flex items-center justify-center gap-2">
            <Truck className="size-4 shrink-0" aria-hidden />
            <span className="font-medium text-center">{siteConfig.shipping.bannerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
