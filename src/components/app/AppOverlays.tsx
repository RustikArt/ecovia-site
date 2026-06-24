import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { SlideCart } from "@/components/cart/SlideCart";
import { Pixels } from "@/components/tracking/Pixels";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { useCartSync } from "@/hooks/useCartSync";

const COOKIE_CONSENT_KEY = "ecovia-cookie-consent-v1";

export default function AppOverlays() {
  const [cookieConsent, setCookieConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      setCookieConsent(saved);
    }
  }, []);

  function handleCookieChoice(choice: "accepted" | "rejected") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    }
    setCookieConsent(choice);
  }

  useCartSync();

  return (
    <>
      <SlideCart />
      <Pixels enabled={cookieConsent === "accepted"} />
      {cookieConsent === null ? <CookieConsentBanner onChoice={handleCookieChoice} /> : null}
      <Toaster richColors position="top-center" />
    </>
  );
}