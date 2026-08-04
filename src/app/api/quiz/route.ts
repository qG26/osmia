import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  AMBIANCES,
  BUDGET_TIERS,
  GENDERS,
  NOTES,
  OCCASIONS,
  STYLES,
} from "@/lib/reference-data";

function onlyKnown<T extends string>(values: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is T => allowed.includes(v as T));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const gender = GENDERS.includes(body.gender) ? body.gender : null;
  const budget_tier = BUDGET_TIERS.includes(body.budget_tier) ? body.budget_tier : null;

  const payload = {
    id: user.id,
    gender,
    ambiances: onlyKnown(body.ambiances, AMBIANCES),
    styles: onlyKnown(body.styles, STYLES),
    occasions: onlyKnown(body.occasions, OCCASIONS),
    budget_tier,
    notes_loved: onlyKnown(body.notes_loved, NOTES),
    notes_disliked: onlyKnown(body.notes_disliked, NOTES),
  };

  const { error } = await supabase.from("profiles").upsert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
