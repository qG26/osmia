import { NextResponse } from "next/server";
import { interpretSearchQuery } from "@/lib/natural-search";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Requête vide." }, { status: 400 });
  }

  const filters = await interpretSearchQuery(query);
  return NextResponse.json({ filters });
}
