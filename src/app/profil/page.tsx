import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeOlfactoryFootprint } from "@/lib/scoring";
import { OlfactoryRadarChart } from "@/components/olfactory-radar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AMBIANCE_LABELS,
  BUDGET_LABELS,
  OCCASION_LABELS,
  STYLE_LABELS,
  type Ambiance,
  type BudgetTier,
  type Occasion,
  type Style,
} from "@/lib/reference-data";
import type { Profile } from "@/lib/types";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profil");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/quiz");
  }

  const p = profile as Profile;
  const footprint = computeOlfactoryFootprint(p);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-foreground/50">
            Mon profil
          </span>
          <h1 className="font-serif text-4xl">Votre empreinte olfactive.</h1>
          <p className="mt-2 text-foreground/60">{user.email}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/quiz">Modifier</Link>
        </Button>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-card/60 p-6">
        <OlfactoryRadarChart data={footprint} />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <ProfileSection title="Genre" values={p.gender ? [p.gender] : []} />
        <ProfileSection
          title="Ambiances"
          values={(p.ambiances ?? []).map((a) => AMBIANCE_LABELS[a as Ambiance] ?? a)}
        />
        <ProfileSection
          title="Styles"
          values={(p.styles ?? []).map((s) => STYLE_LABELS[s as Style] ?? s)}
        />
        <ProfileSection
          title="Occasions"
          values={(p.occasions ?? []).map((o) => OCCASION_LABELS[o as Occasion] ?? o)}
        />
        <ProfileSection
          title="Budget"
          values={p.budget_tier ? [BUDGET_LABELS[p.budget_tier as BudgetTier]] : []}
        />
        <ProfileSection title="Notes aimées" values={p.notes_loved ?? []} />
        <ProfileSection title="Notes évitées" values={p.notes_disliked ?? []} />
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/resultats">Voir mes recommandations</Link>
        </Button>
      </div>
    </div>
  );
}

function ProfileSection({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-foreground/50">{title}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v}>{v}</Badge>
        ))}
      </div>
    </div>
  );
}
