import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const perfumeId = Number(body?.perfumeId);
  const thresholdPrice = Number(body?.thresholdPrice);

  if (!Number.isFinite(perfumeId) || !Number.isFinite(thresholdPrice) || thresholdPrice <= 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { error } = await supabase.from("price_alerts").insert({
    user_id: user.id,
    perfume_id: perfumeId,
    threshold_price: thresholdPrice,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("price_alerts")
    .select("*, perfume:perfumes(name, brand)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data });
}
