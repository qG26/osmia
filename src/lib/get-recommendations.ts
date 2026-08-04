import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreAllPerfumes } from "@/lib/scoring";
import type { Perfume, PerfumeOffer, Profile, ScoredPerfume } from "@/lib/types";

export type RecommendedPerfume = ScoredPerfume & {
  bestOffer: PerfumeOffer | null;
};

/**
 * Fonction de scoring réutilisable : calcule les recommandations pour un utilisateur donné.
 * Utilisée à la fois par la route API `/api/recommendations` et par la page résultats (SSR).
 */
export async function getRecommendationsForUser(
  supabase: SupabaseClient,
  userId: string,
  limit = 6
): Promise<{ profile: Profile | null; recommendations: RecommendedPerfume[] }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return { profile: null, recommendations: [] };
  }

  const { data: perfumes } = await supabase.from("perfumes").select("*");

  const scored = scoreAllPerfumes(profile as Profile, (perfumes ?? []) as Perfume[]);
  const top = scored.slice(0, limit);

  if (top.length === 0) {
    return { profile: profile as Profile, recommendations: [] };
  }

  const perfumeIds = top.map((s) => s.perfume.id);
  const { data: offers } = await supabase
    .from("perfume_offers")
    .select("*, retailer:retailers(*)")
    .in("perfume_id", perfumeIds)
    .eq("in_stock", true);

  const recommendations: RecommendedPerfume[] = top.map(({ perfume, score, reasons }) => {
    const perfumeOffers = ((offers ?? []) as PerfumeOffer[]).filter(
      (o) => o.perfume_id === perfume.id
    );
    const bestOffer =
      perfumeOffers.length > 0
        ? perfumeOffers.reduce((min, o) => (o.price < min.price ? o : min))
        : null;
    return { perfume, score, reasons, bestOffer };
  });

  return { profile: profile as Profile, recommendations };
}
