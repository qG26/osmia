import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecommendationsForUser } from "@/lib/get-recommendations";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { profile, recommendations } = await getRecommendationsForUser(supabase, user.id);

  if (!profile) {
    return NextResponse.json(
      { error: "Profil introuvable. Complétez le quiz d'abord." },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile, recommendations });
}
