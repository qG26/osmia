/**
 * Parsing du rapport "Termes de recherche" exporté depuis Google Ads.
 * Voir `csvCore.ts` pour les utilitaires bas niveau partagés avec
 * `shoppingParser.ts`.
 */
import Papa from "papaparse";
import type { ParseResult, SearchTermRaw } from "../types";
import { ParseError } from "../types";
import {
  findHeaderRow,
  isSummaryOrEmptyRow,
  mapColumns,
  normalizeText,
  parseEuropeanNumber,
  readFileAsText,
  splitCsvLine,
} from "./csvCore";

/**
 * Motifs (normalisés, sans accent) reconnus pour chaque colonne du rapport
 * "Termes de recherche", en français et en anglais. La correspondance est
 * partielle (`includes`) pour tolérer les variations de libellé selon les
 * versions de l'interface Google Ads.
 */
const COLUMN_PATTERNS: Record<keyof SearchTermRaw, string[]> = {
  searchTerm: ["terme de recherche", "search term"],
  keyword: ["mot cle", "keyword"],
  matchType: ["type de correspondance", "match type"],
  campaign: ["campagne", "campaign"],
  adGroup: ["groupe d'annonces", "groupe d annonces", "ad group"],
  impressions: ["impr.", "impressions", "impr"],
  clicks: ["clics", "clicks"],
  ctr: ["ctr"],
  avgCpc: ["cpc moy", "avg. cpc", "average cpc"],
  cost: ["cout", "cost"],
  conversions: ["conversions", "conv."],
  conversionValue: ["valeur de conv", "conv. value", "conversion value"],
} as const;

/** Patterns servant à repérer la ligne d'en-tête parmi les métadonnées. */
const HEADER_DETECTION_PATTERNS = [
  ["terme de recherche", "search term"],
  ["type de correspondance", "match type"],
  ["campagne", "campaign"],
  ["clics", "clicks"],
  ["cout", "cost"],
];

export const SEARCH_REPORT_HELP =
  'Exportez le rapport "Termes de recherche" depuis Google Ads : ' +
  "Insights et rapports → Termes de recherche → colonnes Clics, Coût, " +
  "Conversions → Télécharger → CSV.";

/**
 * Parse le contenu texte d'un export "Termes de recherche". Lance une
 * `ParseError` avec un message actionnable si l'en-tête n'est pas trouvé.
 */
export function parseSearchTermsCsv(csvText: string): ParseResult<SearchTermRaw> {
  const lines = csvText.split(/\r\n|\r|\n/);
  const header = findHeaderRow(lines, HEADER_DETECTION_PATTERNS);

  if (!header) {
    throw new ParseError(
      "Impossible de trouver l'en-tête du rapport dans ce fichier. " +
        SEARCH_REPORT_HELP +
        " Vérifiez aussi que le fichier n'a pas été ouvert et réenregistré dans Excel (cela peut casser l'encodage et les en-têtes).",
    );
  }

  const columns = mapColumns(header.normalizedHeaders, COLUMN_PATTERNS);
  const missing = (Object.keys(COLUMN_PATTERNS) as (keyof SearchTermRaw)[]).filter(
    (field) => !(field in columns),
  );
  // searchTerm et cost sont indispensables pour que l'analyse ait un sens.
  if (!("searchTerm" in columns) || !("cost" in columns)) {
    throw new ParseError(
      `Les colonnes essentielles (terme de recherche, coût) sont introuvables dans l'en-tête détecté. ${SEARCH_REPORT_HELP}`,
    );
  }
  if (missing.length > 0) {
    // Colonnes secondaires manquantes : on continue avec des valeurs par défaut,
    // mais ce n'est pas bloquant (ex. un export sans la colonne "Groupe d'annonces").
  }

  const restOfFile = lines.slice(header.headerLineIndex + 1).join("\n");
  const parsed = Papa.parse<string[]>(restOfFile, {
    skipEmptyLines: false,
    delimiter: lines[header.headerLineIndex]?.includes(";") ? ";" : ",",
  });

  const rows: SearchTermRaw[] = [];
  let totalRows = 0;
  let skippedRows = 0;

  for (const rawRow of parsed.data) {
    if (!Array.isArray(rawRow)) continue;
    if (rawRow.length === 1 && rawRow[0] === "") continue; // ligne vide en fin de fichier
    totalRows++;

    if (isSummaryOrEmptyRow(rawRow)) {
      skippedRows++;
      continue;
    }

    const searchTerm = rawRow[columns.searchTerm ?? -1]?.trim() ?? "";
    if (!searchTerm) {
      skippedRows++;
      continue;
    }

    rows.push({
      searchTerm,
      keyword: rawRow[columns.keyword ?? -1]?.trim() ?? "",
      matchType: rawRow[columns.matchType ?? -1]?.trim() ?? "",
      campaign: rawRow[columns.campaign ?? -1]?.trim() ?? "",
      adGroup: rawRow[columns.adGroup ?? -1]?.trim() ?? "",
      impressions: parseEuropeanNumber(rawRow[columns.impressions ?? -1]),
      clicks: parseEuropeanNumber(rawRow[columns.clicks ?? -1]),
      ctr: parseEuropeanNumber(rawRow[columns.ctr ?? -1]),
      avgCpc: parseEuropeanNumber(rawRow[columns.avgCpc ?? -1]),
      cost: parseEuropeanNumber(rawRow[columns.cost ?? -1]),
      conversions: parseEuropeanNumber(rawRow[columns.conversions ?? -1]),
      conversionValue: parseEuropeanNumber(rawRow[columns.conversionValue ?? -1]),
    });
  }

  const notes = [
    `${totalRows} lignes lues, ${rows.length} termes valides, ${skippedRows} lignes de synthèse ignorées.`,
  ];

  if (rows.length === 0) {
    throw new ParseError(
      `Aucun terme de recherche valide n'a été trouvé dans ce fichier. ${SEARCH_REPORT_HELP}`,
    );
  }

  return {
    rows,
    totalRows,
    validRows: rows.length,
    skippedRows,
    notes,
  };
}

/** Lit et parse un `File` du navigateur (gère le décodage d'encodage). */
export async function parseSearchTermsFile(file: File): Promise<ParseResult<SearchTermRaw>> {
  const text = await readFileAsText(file);
  return parseSearchTermsCsv(text);
}

/**
 * Utilitaire ré-exporté pour les tests et pour l'UI (ex. compter les
 * colonnes détectées) sans dupliquer la logique de normalisation.
 */
export function normalizeHeaderCell(cell: string): string {
  return normalizeText(cell);
}

/** Nécessaire pour les tests unitaires de bas niveau sur le découpage CSV. */
export { splitCsvLine };
