type CookieConsentChoice = "accepted" | "rejected";

type CookieConsentBannerProps = {
  onChoice: (choice: CookieConsentChoice) => void;
};

export function CookieConsentBanner({ onChoice }: CookieConsentBannerProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur">
      <p className="text-sm font-medium text-foreground">Respect de votre vie privée</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Nous utilisons des cookies techniques pour le fonctionnement du site. Les cookies
        publicitaires (Meta/TikTok) ne sont activés qu'avec votre accord.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoice("rejected")}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => onChoice("accepted")}
          className="rounded-full bg-forest px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-forest/90"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
