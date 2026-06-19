import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-50 overflow-hidden bg-forest text-primary-foreground transition-all duration-300 ease-out ${
        collapsed ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-10 flex items-center justify-center gap-2 text-xs sm:text-sm">
        <Truck className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{siteConfig.shipping.bannerText}</span>
      </div>
    </div>
  );
}
