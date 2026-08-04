import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecommendationsForUser } from "@/lib/get-recommendations";
import { computeOlfactoryFootprint } from "@/lib/scoring";
import { OlfactoryRadarChart } from "@/components/olfactory-radar-chart";
import { PerfumeCard } from "@/components/perfume-card";
import { Button } from "@/components/ui/button";

export default async function ResultatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/resultats");
  }

  const { profile, recommendations } = await getRecommendationsForUser(supabase, user.id);

  if (!profile) {
    redirect("/quiz");
  }

  const footprint = computeOlfactoryFootprint(profile);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-foreground/50">
          Vos résultats
        </span>
        <h1 className="font-serif text-4xl">
          Voici ce qui vous <em className="italic">correspond</em>.
        </h1>
        <p className="max-w-xl text-foreground/60">
          Ces recommandations sont calculées à partir de vos réponses au quiz.
          Modifiez-les à tout moment pour affiner vos résultats.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          {recommendations.length === 0 ? (
            <p className="text-foreground/60">
              Aucun parfum ne correspond suffisamment à votre profil pour le moment.
              Essayez d&apos;élargir vos notes évitées.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {recommendations.map((rec) => (
                <PerfumeCard
                  key={rec.perfume.id}
                  perfume={rec.perfume}
                  score={rec.score}
                  reasons={rec.reasons}
                  bestOffer={rec.bestOffer}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-card/60 p-6">
            <h2 className="font-serif text-xl">Votre empreinte olfactive</h2>
            <OlfactoryRadarChart data={footprint} />
          </div>
          <Button asChild variant="outline">
            <Link href="/quiz">Refaire le quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
