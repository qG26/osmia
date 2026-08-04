import {
  BUDGET_TIERS,
  FAMILIES,
  NOTES,
  STYLES,
  type BudgetTier,
  type Family,
  type Style,
} from "@/lib/reference-data";

export type SearchFilters = {
  familles: Family[];
  styles: Style[];
  budgets: BudgetTier[];
  notes: string[];
  saison: "ete" | "hiver" | null;
};

const EMPTY_FILTERS: SearchFilters = {
  familles: [],
  styles: [],
  budgets: [],
  notes: [],
  saison: null,
};

/**
 * Interprète une recherche en langage naturel en filtres de découverte.
 * Utilise l'API Anthropic si une clé est configurée, sinon retombe sur un
 * appariement par mots-clés simple.
 */
export async function interpretSearchQuery(query: string): Promise<SearchFilters> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      return await interpretWithClaude(query, apiKey);
    } catch {
      return interpretWithKeywords(query);
    }
  }
  return interpretWithKeywords(query);
}

async function interpretWithClaude(query: string, apiKey: string): Promise<SearchFilters> {
  const model = process.env.ANTHROPIC_SEARCH_MODEL || "claude-opus-5";

  const schema = {
    type: "object",
    properties: {
      familles: { type: "array", items: { type: "string", enum: [...FAMILIES] } },
      styles: { type: "array", items: { type: "string", enum: [...STYLES] } },
      budgets: { type: "array", items: { type: "string", enum: [...BUDGET_TIERS] } },
      notes: { type: "array", items: { type: "string", enum: [...NOTES] } },
      saison: { type: ["string", "null"], enum: ["ete", "hiver", null] },
    },
    required: ["familles", "styles", "budgets", "notes", "saison"],
    additionalProperties: false,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: `Traduis cette recherche de parfum en filtres structurés : "${query}"\n\nFamilles possibles : ${FAMILIES.join(", ")}\nStyles possibles : ${STYLES.join(", ")}\nBudgets possibles : ${BUDGET_TIERS.join(", ")}\nNotes possibles : ${NOTES.join(", ")}\n\nNe renseigne que ce qui est explicitement ou clairement suggéré par la recherche.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock) throw new Error("Réponse Anthropic invalide");

  const parsed = JSON.parse(textBlock.text);
  return {
    familles: (parsed.familles ?? []).filter((f: string) => FAMILIES.includes(f as Family)),
    styles: (parsed.styles ?? []).filter((s: string) => STYLES.includes(s as Style)),
    budgets: (parsed.budgets ?? []).filter((b: string) => BUDGET_TIERS.includes(b as BudgetTier)),
    notes: (parsed.notes ?? []).filter((n: string) => NOTES.includes(n as (typeof NOTES)[number])),
    saison: parsed.saison === "ete" || parsed.saison === "hiver" ? parsed.saison : null,
  };
}

const KEYWORD_MAP: Record<string, Partial<SearchFilters>> = {
  boisé: { familles: ["boise"] },
  boise: { familles: ["boise"] },
  bois: { familles: ["boise"] },
  fleur: { familles: ["floral"] },
  floral: { familles: ["floral"] },
  agrume: { familles: ["agrumes"] },
  citron: { familles: ["agrumes"] },
  marin: { familles: ["marin"] },
  frais: { familles: ["marin", "agrumes"] },
  cuir: { familles: ["cuir"] },
  oriental: { familles: ["oriental"] },
  ambre: { familles: ["oriental"] },
  gourmand: { familles: ["gourmand"] },
  vanille: { familles: ["gourmand"] },
  été: { saison: "ete" },
  ete: { saison: "ete" },
  hiver: { saison: "hiver" },
  élégant: { styles: ["elegant"] },
  elegant: { styles: ["elegant"] },
  discret: { styles: ["discret"] },
  puissant: { styles: ["puissant"] },
  sexy: { styles: ["sexy"] },
  luxueux: { styles: ["luxueux"] },
  "pas cher": { budgets: ["eco"] },
  économique: { budgets: ["eco"] },
  abordable: { budgets: ["eco"] },
  luxe: { budgets: ["luxe"] },
};

function interpretWithKeywords(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = { ...EMPTY_FILTERS, familles: [], styles: [], budgets: [], notes: [] };

  for (const [keyword, partial] of Object.entries(KEYWORD_MAP)) {
    if (!q.includes(keyword)) continue;
    if (partial.familles) filters.familles.push(...partial.familles);
    if (partial.styles) filters.styles.push(...partial.styles);
    if (partial.budgets) filters.budgets.push(...partial.budgets);
    if (partial.saison) filters.saison = partial.saison;
  }

  for (const note of NOTES) {
    if (q.includes(note.toLowerCase())) filters.notes.push(note);
  }

  filters.familles = [...new Set(filters.familles)];
  filters.styles = [...new Set(filters.styles)];
  filters.budgets = [...new Set(filters.budgets)];
  return filters;
}
