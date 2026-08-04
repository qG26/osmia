import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaconIllustration } from "@/components/flacon-illustration";
import { AffiliateOffer } from "@/components/affiliate-offer";
import { FAMILY_LABELS, type Family } from "@/lib/reference-data";
import type { Perfume, PerfumeOffer } from "@/lib/types";

export function PerfumeCard({
  perfume,
  score,
  reasons,
  bestOffer,
}: {
  perfume: Perfume;
  score?: number;
  reasons?: string[];
  bestOffer?: PerfumeOffer | null;
}) {
  const dominantFamily = perfume.families[0] as Family;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={`/parfums/${perfume.id}`} className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <FlaconIllustration family={dominantFamily} className="h-20 w-14 shrink-0" />
          {score !== undefined && (
            <div className="text-right">
              <span className="font-numeric text-3xl text-accent">{score}%</span>
              <p className="text-xs text-foreground/50">compatibilité</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">{perfume.brand}</p>
          <h3 className="font-serif text-xl">{perfume.name}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {perfume.families.map((family) => (
            <Badge key={family}>{FAMILY_LABELS[family as Family] ?? family}</Badge>
          ))}
        </div>

        {reasons && reasons.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-sm text-foreground/70">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </Link>

      {bestOffer && (
        <div className="mt-auto border-t border-line p-6 pt-5">
          <AffiliateOffer offer={bestOffer} perfumeId={perfume.id} />
        </div>
      )}
    </Card>
  );
}
