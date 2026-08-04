import { createClient } from "@/lib/supabase/server";
import type { Perfume } from "@/lib/types";
import { DiscoveryFilters, type SortOption } from "@/components/discovery-filters";
import { NaturalSearchBar } from "@/components/natural-search-bar";
import { PerfumeCard } from "@/components/perfume-card";
import {
  BUDGET_TIERS,
  FAMILIES,
  NOTES,
  OCCASIONS,
  STYLES,
  type BudgetTier,
  type Family,
  type Style,
} from "@/lib/reference-data";

function parseList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export default async function DecouvertePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const families = parseList(params.familles) as Family[];
  const notes = parseList(params.notes);
  const styles = parseList(params.styles) as Style[];
  const budgets = parseList(params.budgets) as BudgetTier[];
  const brand = typeof params.marque === "string" ? params.marque : "";
  const season = typeof params.saison === "string" ? params.saison : "";
  const nouveautes = params.nouveautes === "1";
  const sort = (typeof params.tri === "string" ? params.tri : "popularite") as SortOption;

  const supabase = await createClient();
  let query = supabase.from("perfumes").select("*, offers:perfume_offers(price)");

  if (families.length > 0) query = query.overlaps("families", families);
  if (notes.length > 0) query = query.overlaps("notes", notes);
  if (styles.length > 0) query = query.overlaps("style", styles);
  if (budgets.length > 0) query = query.in("budget_tier", budgets);
  if (brand) query = query.ilike("brand", `%${brand}%`);
  if (season) query = query.contains("occasions", [season]);
  if (nouveautes) {
    // Server Component : lu à chaque requête, pas mémorisé côté client.
    // eslint-disable-next-line react-hooks/purity
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", cutoff);
  }

  if (sort === "popularite") query = query.order("popularity", { ascending: false });
  else if (sort === "nouveaute") query = query.order("created_at", { ascending: false });

  const { data } = await query;
  let perfumes = (data ?? []) as (Perfume & { offers: { price: number }[] })[];

  if (sort === "prix_croissant" || sort === "prix_decroissant") {
    perfumes = [...perfumes].sort((a, b) => {
      const avgA =
        a.offers.length > 0 ? a.offers.reduce((s, o) => s + o.price, 0) / a.offers.length : 0;
      const avgB =
        b.offers.length > 0 ? b.offers.reduce((s, o) => s + o.price, 0) / b.offers.length : 0;
      return sort === "prix_croissant" ? avgA - avgB : avgB - avgA;
    });
  }

  const { data: brandRows } = await supabase.from("perfumes").select("brand");
  const brands = Array.from(new Set((brandRows ?? []).map((b) => b.brand))).sort();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <span className="text-xs uppercase tracking-widest text-foreground/50">Découverte</span>
      <h1 className="font-serif text-4xl">Le catalogue, à votre façon.</h1>
      <p className="mt-2 max-w-xl text-foreground/60">
        Combinez familles, notes, budget, style et bien plus pour explorer les 18 parfums OSMIA.
      </p>

      <div className="mt-8 max-w-xl">
        <NaturalSearchBar />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <DiscoveryFilters
          families={FAMILIES}
          notes={NOTES}
          styles={STYLES}
          budgets={BUDGET_TIERS}
          occasions={OCCASIONS}
          brands={brands}
        />

        <div>
          <p className="mb-4 text-sm text-foreground/50">
            {perfumes.length} parfum{perfumes.length > 1 ? "s" : ""}
          </p>
          {perfumes.length === 0 ? (
            <p className="text-foreground/50">Aucun parfum ne correspond à ces filtres.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {perfumes.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
