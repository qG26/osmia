import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";

function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

type ClickRow = { perfume_id: number; retailer_id: number };
type PerfumeRow = { id: number; name: string; brand: string };
type RetailerRow = { id: number; name: string };
type FavoriteRow = { perfume_id: number; status: string };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");
  if (!isAdmin(user.email)) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Accès réservé.</h1>
        <p className="mt-2 text-foreground/60">
          Cette page est réservée aux administrateurs OSMIA.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: clicksData }, { data: perfumesData }, { data: retailersData }, { data: favoritesData }] =
    await Promise.all([
      admin.from("affiliate_clicks").select("perfume_id, retailer_id"),
      admin.from("perfumes").select("id, name, brand"),
      admin.from("retailers").select("id, name"),
      admin.from("favorites").select("perfume_id, status").eq("status", "possede"),
    ]);

  const clicks = (clicksData ?? []) as ClickRow[];
  const perfumes = (perfumesData ?? []) as PerfumeRow[];
  const retailers = (retailersData ?? []) as RetailerRow[];
  const owned = (favoritesData ?? []) as FavoriteRow[];

  const clicksByRetailer = new Map<number, number>();
  const clicksByPerfume = new Map<number, number>();
  for (const click of clicks) {
    clicksByRetailer.set(click.retailer_id, (clicksByRetailer.get(click.retailer_id) ?? 0) + 1);
    clicksByPerfume.set(click.perfume_id, (clicksByPerfume.get(click.perfume_id) ?? 0) + 1);
  }

  const ownedByPerfume = new Map<number, number>();
  for (const fav of owned) {
    ownedByPerfume.set(fav.perfume_id, (ownedByPerfume.get(fav.perfume_id) ?? 0) + 1);
  }

  const retailerRows = retailers
    .map((r) => ({ ...r, clicks: clicksByRetailer.get(r.id) ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks);

  const perfumeRows = perfumes
    .map((p) => {
      const perfumeClicks = clicksByPerfume.get(p.id) ?? 0;
      const conversions = ownedByPerfume.get(p.id) ?? 0;
      const rate = perfumeClicks > 0 ? (conversions / perfumeClicks) * 100 : 0;
      return { ...p, clicks: perfumeClicks, conversions, rate };
    })
    .filter((p) => p.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <span className="text-xs uppercase tracking-widest text-foreground/50">Admin</span>
      <h1 className="font-serif text-4xl">Tableau de bord.</h1>
      <p className="mt-2 text-foreground/60">
        Clics affiliés et taux de conversion estimé (parfums marqués « possédé » suite à un clic).
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-serif text-xl">Clics par revendeur</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {retailerRows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 text-right font-numeric">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl">Clics par parfum</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground/50">
                <th className="py-2 font-normal">Parfum</th>
                <th className="py-2 text-right font-normal">Clics</th>
                <th className="py-2 text-right font-normal">Conv. estimée</th>
              </tr>
            </thead>
            <tbody>
              {perfumeRows.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-2">
                    {p.name}
                    <span className="block text-xs text-foreground/40">{p.brand}</span>
                  </td>
                  <td className="py-2 text-right font-numeric">{p.clicks}</td>
                  <td className="py-2 text-right font-numeric">{p.rate.toFixed(0)}%</td>
                </tr>
              ))}
              {perfumeRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-foreground/40">
                    Aucun clic enregistré pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
