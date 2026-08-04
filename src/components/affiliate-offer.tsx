"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PerfumeOffer } from "@/lib/types";

export function AffiliateOffer({
  offer,
  perfumeId,
}: {
  offer: PerfumeOffer;
  perfumeId: number;
}) {
  function handleClick() {
    const payload = JSON.stringify({ perfumeId, retailerId: offer.retailer_id });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/affiliate-click", blob);
    } else {
      fetch("/api/affiliate-click", { method: "POST", body: payload, keepalive: true });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-numeric text-2xl">{offer.price.toFixed(2)}€</span>
        <span className="text-sm text-foreground/60">
          {offer.retailer?.name ?? "Revendeur partenaire"}
          {offer.format ? ` · ${offer.format}` : ""}
        </span>
      </div>
      <Button asChild onClick={handleClick} className="w-full">
        <a href={offer.affiliate_url} target="_blank" rel="noopener noreferrer sponsored">
          Voir l&apos;offre <ExternalLink size={15} />
        </a>
      </Button>
      <p className="text-center text-xs text-foreground/40">
        Lien affilié — OSMIA peut percevoir une commission, sans surcoût pour vous.
      </p>
    </div>
  );
}
