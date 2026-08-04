"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  FAMILY_LABELS,
  STYLE_LABELS,
  BUDGET_LABELS,
  type BudgetTier,
  type Family,
  type Style,
} from "@/lib/reference-data";
import { cn } from "@/lib/utils";

export type SortOption = "popularite" | "nouveaute" | "prix_croissant" | "prix_decroissant";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularite", label: "Popularité" },
  { value: "nouveaute", label: "Nouveautés" },
  { value: "prix_croissant", label: "Prix croissant" },
  { value: "prix_decroissant", label: "Prix décroissant" },
];

export function DiscoveryFilters({
  families,
  notes,
  styles,
  budgets,
  brands,
}: {
  families: readonly Family[];
  notes: readonly string[];
  styles: readonly Style[];
  budgets: readonly BudgetTier[];
  occasions: readonly string[];
  brands: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getList(key: string): string[] {
    const value = searchParams.get(key);
    return value ? value.split(",").filter(Boolean) : [];
  }

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleListParam(key: string, value: string) {
    const current = getList(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParam(key, next.length > 0 ? next.join(",") : null);
  }

  const selectedFamilies = getList("familles");
  const selectedNotes = getList("notes");
  const selectedStyles = getList("styles");
  const selectedBudgets = getList("budgets");
  const brand = searchParams.get("marque") ?? "";
  const season = searchParams.get("saison") ?? "";
  const nouveautes = searchParams.get("nouveautes") === "1";
  const sort = (searchParams.get("tri") as SortOption) ?? "popularite";

  const hasActiveFilters =
    selectedFamilies.length > 0 ||
    selectedNotes.length > 0 ||
    selectedStyles.length > 0 ||
    selectedBudgets.length > 0 ||
    brand ||
    season ||
    nouveautes;

  return (
    <aside className="flex flex-col gap-8">
      <div>
        <label htmlFor="tri" className="text-xs uppercase tracking-wide text-foreground/50">
          Trier par
        </label>
        <select
          id="tri"
          value={sort}
          onChange={(e) => setParam("tri", e.target.value)}
          className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <FilterGroup title="Famille">
        {families.map((family) => (
          <FilterChip
            key={family}
            active={selectedFamilies.includes(family)}
            onClick={() => toggleListParam("familles", family)}
          >
            {FAMILY_LABELS[family]}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup title="Style">
        {styles.map((style) => (
          <FilterChip
            key={style}
            active={selectedStyles.includes(style)}
            onClick={() => toggleListParam("styles", style)}
          >
            {STYLE_LABELS[style]}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup title="Budget">
        {budgets.map((budget) => (
          <FilterChip
            key={budget}
            active={selectedBudgets.includes(budget)}
            onClick={() => toggleListParam("budgets", budget)}
          >
            {BUDGET_LABELS[budget].split(" · ")[0]}
          </FilterChip>
        ))}
      </FilterGroup>

      <div>
        <p className="text-xs uppercase tracking-wide text-foreground/50">Saison</p>
        <select
          value={season}
          onChange={(e) => setParam("saison", e.target.value || null)}
          className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes</option>
          <option value="ete">Été</option>
          <option value="hiver">Hiver</option>
        </select>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-foreground/50">Marque</p>
        <select
          value={brand}
          onChange={(e) => setParam("marque", e.target.value || null)}
          className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={nouveautes}
          onChange={(e) => setParam("nouveautes", e.target.checked ? "1" : null)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Nouveautés (moins de 90 jours)
      </label>

      <FilterGroup title="Notes">
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto pr-1">
          {notes.map((note) => (
            <FilterChip
              key={note}
              active={selectedNotes.includes(note)}
              onClick={() => toggleListParam("notes", note)}
            >
              {note}
            </FilterChip>
          ))}
        </div>
      </FilterGroup>

      {hasActiveFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-left text-sm text-accent hover:underline"
        >
          Réinitialiser les filtres
        </button>
      )}
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-foreground/50">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-line text-foreground/60 hover:border-accent/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
