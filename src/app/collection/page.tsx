import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FAVORITE_STATUSES, FAVORITE_STATUS_LABELS, type FavoriteStatusValue } from "@/lib/reference-data";
import type { Perfume } from "@/lib/types";
import { PerfumeCard } from "@/components/perfume-card";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/collection");
  }

  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("status, perfume:perfumes(*)")
    .eq("user_id", user.id);

  const favorites = (favoritesData ?? []) as unknown as { status: FavoriteStatusValue; perfume: Perfume }[];

  const grouped = new Map<FavoriteStatusValue, Perfume[]>();
  for (const status of FAVORITE_STATUSES) grouped.set(status, []);
  for (const fav of favorites) {
    if (fav.perfume) grouped.get(fav.status)?.push(fav.perfume);
  }

  const isEmpty = favorites.length === 0;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <span className="text-xs uppercase tracking-widest text-foreground/50">Ma collection</span>
      <h1 className="font-serif text-4xl">Vos parfums, organisés.</h1>
      <p className="mt-2 max-w-xl text-foreground/60">
        Suivez ceux que vous possédez, avez testés, ou souhaitez découvrir.
      </p>

      {isEmpty ? (
        <p className="mt-12 text-foreground/50">
          Votre collection est vide pour le moment. Ajoutez un parfum depuis sa fiche détaillée.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {FAVORITE_STATUSES.map((status) => {
            const perfumes = grouped.get(status) ?? [];
            if (perfumes.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="font-serif text-2xl">{FAVORITE_STATUS_LABELS[status]}</h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {perfumes.map((perfume) => (
                    <PerfumeCard key={perfume.id} perfume={perfume} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
