import { Truck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export function AnnouncementBar() {
  const isVisible = useScrollDirection();
  return (
    <div role="status" aria-live="polite" className={`fixed top-0 left-0 right-0 z-50 bg-forest text-primary-foreground transition-transform duration-300 ease-in-out ${
      isVisible ? "translate-y-0" : "-translate-y-full"
    }`}>
      <div className="mx-auto max-w-6xl px-6 h-10 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <Truck className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{siteConfig.shipping.bannerText}</span>
      </div>
    </div>
  );
}
