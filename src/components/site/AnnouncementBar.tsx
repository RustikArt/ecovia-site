import { Truck } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 bg-forest text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 h-10 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <Truck className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{siteConfig.shipping.bannerText}</span>
      </div>
    </div>
  );
}
