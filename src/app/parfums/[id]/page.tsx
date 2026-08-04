import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scorePerfume } from "@/lib/scoring";
import { FAMILY_LABELS, type Family } from "@/lib/reference-data";
import type { Perfume, PerfumeOffer, Profile } from "@/lib/types";
import { FlaconIllustration } from "@/components/flacon-illustration";
import { Badge } from "@/components/ui/badge";
import { NotesPyramid } from "@/components/notes-pyramid";
import { AffiliateOffer } from "@/components/affiliate-offer";
import { CollectionStatusSelect } from "@/components/collection-status-select";
import { PriceAlertForm } from "@/components/price-alert-form";
import { PriceHistoryChart, type PricePoint } from "@/components/price-history-chart";
import { PerfumeCard } from "@/components/perfume-card";

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfumeId = Number(id);
  if (!Number.isFinite(perfumeId)) notFound();

  const supabase = await createClient();

  const [{ data: perfumeData }, { data: offersData }] = await Promise.all([
    supabase.from("perfumes").select("*").eq("id", perfumeId).maybeSingle(),
    supabase
      .from("perfume_offers")
      .select("*, retailer:retailers(*)")
      .eq("perfume_id", perfumeId)
      .order("price", { ascending: true }),
  ]);

  if (!perfumeData) notFound();
  const perfume = perfumeData as Perfume;
  const offers = (offersData ?? []) as PerfumeOffer[];
  const bestOffer = offers.find((o) => o.in_stock) ?? offers[0] ?? null;
  const avgPrice =
    offers.length > 0 ? offers.reduce((sum, o) => sum + o.price, 0) / offers.length : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let favoriteStatus: string | null = null;
  if (user) {
    const [{ data: profileData }, { data: favoriteData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("favorites")
        .select("status")
        .eq("user_id", user.id)
        .eq("perfume_id", perfumeId)
        .maybeSingle(),
    ]);
    profile = profileData as Profile | null;
    favoriteStatus = favoriteData?.status ?? null;
  }

  const compat = profile ? scorePerfume(profile, perfume) : null;

  // Alternatives : parfums partageant une famille, moins cher / plus luxueux en moyenne.
  const { data: sameFamilyData } = await supabase
    .from("perfumes")
    .select("*")
    .overlaps("families", perfume.families)
    .neq("id", perfume.id);

  const sameFamily = (sameFamilyData ?? []) as Perfume[];
  let cheaperAlt: { perfume: Perfume; avgPrice: number } | null = null;
  let luxuriousAlt: { perfume: Perfume; avgPrice: number } | null = null;

  if (sameFamily.length > 0 && avgPrice !== null) {
    const { data: altOffersData } = await supabase
      .from("perfume_offers")
      .select("perfume_id, price")
      .in(
        "perfume_id",
        sameFamily.map((p) => p.id)
      );
    const altOffers = (altOffersData ?? []) as { perfume_id: number; price: number }[];
    const avgByPerfume = new Map<number, number>();
    for (const p of sameFamily) {
      const prices = altOffers.filter((o) => o.perfume_id === p.id).map((o) => o.price);
      if (prices.length > 0) {
        avgByPerfume.set(p.id, prices.reduce((a, b) => a + b, 0) / prices.length);
      }
    }
    const cheaperCandidates = sameFamily
      .filter((p) => (avgByPerfume.get(p.id) ?? Infinity) < avgPrice)
      .sort((a, b) => (avgByPerfume.get(b.id) ?? 0) - (avgByPerfume.get(a.id) ?? 0));
    const luxCandidates = sameFamily
      .filter((p) => (avgByPerfume.get(p.id) ?? -Infinity) > avgPrice)
      .sort((a, b) => (avgByPerfume.get(a.id) ?? 0) - (avgByPerfume.get(b.id) ?? 0));

    if (cheaperCandidates[0]) {
      cheaperAlt = { perfume: cheaperCandidates[0], avgPrice: avgByPerfume.get(cheaperCandidates[0].id)! };
    }
    if (luxCandidates[0]) {
      luxuriousAlt = { perfume: luxCandidates[0], avgPrice: avgByPerfume.get(luxCandidates[0].id)! };
    }
  }

  let priceHistory: PricePoint[] = [];
  if (offers.length > 0) {
    const { data: historyData } = await supabase
      .from("price_history")
      .select("price, recorded_at")
      .in(
        "offer_id",
        offers.map((o) => o.id)
      )
      .order("recorded_at", { ascending: true });

    const byDate = new Map<string, number>();
    for (const point of (historyData ?? []) as { price: number; recorded_at: string }[]) {
      const date = new Date(point.recorded_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      const current = byDate.get(date);
      if (current === undefined || point.price < current) {
        byDate.set(date, point.price);
      }
    }
    priceHistory = Array.from(byDate.entries()).map(([date, price]) => ({ date, price }));
  }

  const dominantFamily = perfume.families[0] as Family;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="grid gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <FlaconIllustration family={dominantFamily} className="h-56 w-40" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-foreground/50">{perfume.brand}</p>
            <h1 className="font-serif text-4xl">{perfume.name}</h1>
            {perfume.description && (
              <p className="mt-3 max-w-xl text-foreground/70">{perfume.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {perfume.families.map((f) => (
              <Badge key={f} variant="accent">
                {FAMILY_LABELS[f as Family] ?? f}
              </Badge>
            ))}
            {perfume.style.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          {compat && (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-numeric text-3xl text-accent">{compat.score}%</span>
                <span className="text-sm text-foreground/60">compatible avec votre profil</span>
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-sm text-foreground/70">
                {compat.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-serif text-xl">Ma collection</h2>
            <div className="mt-3">
              <CollectionStatusSelect
                perfumeId={perfume.id}
                initialStatus={favoriteStatus}
                loggedIn={Boolean(user)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="font-serif text-2xl">Pyramide olfactive</h2>
            <div className="mt-5">
              <NotesPyramid notes={perfume.notes} />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl">Toutes les offres</h2>
            <div className="mt-5 flex flex-col gap-3">
              {offers.length === 0 && (
                <p className="text-foreground/50">Aucune offre disponible pour le moment.</p>
              )}
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between rounded-xl border border-line px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{offer.retailer?.name ?? "Revendeur"}</p>
                    <p className="text-sm text-foreground/50">
                      {offer.format ?? "50ml"} · {offer.in_stock ? "en stock" : "rupture de stock"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-numeric text-lg">{offer.price.toFixed(2)}€</span>
                    <a
                      href={offer.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-sm text-accent hover:underline"
                    >
                      Voir
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground/40">
              Liens affiliés — OSMIA peut percevoir une commission, sans surcoût pour vous.
            </p>
          </div>

          {(cheaperAlt || luxuriousAlt) && (
            <div>
              <h2 className="font-serif text-2xl">Alternatives</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {cheaperAlt && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-foreground/50">
                      Moins cher
                    </p>
                    <PerfumeCard perfume={cheaperAlt.perfume} />
                  </div>
                )}
                {luxuriousAlt && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-foreground/50">
                      Plus luxueux
                    </p>
                    <PerfumeCard perfume={luxuriousAlt.perfume} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {bestOffer && (
            <div className="rounded-2xl border border-line bg-card/60 p-6">
              <p className="mb-4 text-xs uppercase tracking-wide text-foreground/50">
                Meilleure offre
              </p>
              <AffiliateOffer offer={bestOffer} perfumeId={perfume.id} />
            </div>
          )}

          {priceHistory.length > 1 && (
            <div className="rounded-2xl border border-line p-6">
              <p className="mb-4 text-xs uppercase tracking-wide text-foreground/50">
                Historique de prix
              </p>
              <PriceHistoryChart data={priceHistory} />
            </div>
          )}

          {bestOffer && (
            <PriceAlertForm perfumeId={perfume.id} currentPrice={bestOffer.price} loggedIn={Boolean(user)} />
          )}

          <Link href="/decouverte" className="text-sm text-accent hover:underline">
            ← Retour à la découverte
          </Link>
        </div>
      </div>
    </div>
  );
}
