import { ShieldCheck, Truck, Headphones } from "lucide-react";

export function TrustBadges() {
  const items = [
    { icon: ShieldCheck, label: "Paiement sécurisé", desc: "SSL via Shopify" },
    { icon: Truck, label: "Livraison suivie", desc: "48-72h en France" },
    { icon: Headphones, label: "Support 24/7", desc: "Réponse sous 24h" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {items.map(({ icon: Icon, label, desc }) => (
        <div
          key={label}
          className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/40 border border-border/60"
        >
          <Icon className="size-5 text-forest mb-1.5" />
          <p className="text-[11px] font-medium leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      ))}
    </div>
  );
}
