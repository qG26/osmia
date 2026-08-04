import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const perfumeId = Number(body?.perfumeId);
  const retailerId = Number(body?.retailerId);

  if (!Number.isFinite(perfumeId) || !Number.isFinite(retailerId)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("affiliate_clicks").insert({
    user_id: user?.id ?? null,
    perfume_id: perfumeId,
    retailer_id: retailerId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
