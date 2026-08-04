import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FAVORITE_STATUSES } from "@/lib/reference-data";

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
  const status = body?.status;

  if (!Number.isFinite(perfumeId) || !FAVORITE_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id: user.id, perfume_id: perfumeId, status });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const perfumeId = Number(searchParams.get("perfumeId"));

  if (!Number.isFinite(perfumeId)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
