import { useState } from "react";
import type { ReactNode } from "react";
import { SiteHeader } from "./Header";
import { SiteFooter } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type SiteLayoutProps = {
  children: ReactNode;
  showFooterBottomBar?: boolean;
};

export function SiteLayout({ children, showFooterBottomBar = true }: SiteLayoutProps) {
  const isScrollVisible = useScrollDirection();
  const [isBannerOpen, setIsBannerOpen] = useState(true);
  const bannerVisible = isBannerOpen && isScrollVisible;

  return (
    <div className="min-h-screen flex flex-col">
      {isBannerOpen ? <div aria-hidden className="h-10 shrink-0" /> : null}
      <AnnouncementBar visible={bannerVisible} onClose={() => setIsBannerOpen(false)} />
      <SiteHeader bannerVisible={bannerVisible} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <SiteFooter showBottomBar={showFooterBottomBar} />
    </div>
  );
}
