/**
 * Parsing du rapport "Produits" exporté depuis Google Ads (Shopping
 * standard ou performance produit PMax).
 */
import Papa from "papaparse";
import type { ParseResult, ProductRaw } from "../types";
import { ParseError } from "../types";
import {
  findHeaderRow,
  isSummaryOrEmptyRow,
  mapColumns,
  parseEuropeanNumber,
  readFileAsText,
} from "./csvCore";

const COLUMN_PATTERNS: Record<keyof ProductRaw, string[]> = {
  imageUrl: ["image"],
  title: ["titre", "title"],
  merchantRef: ["reference marchand", "merchant"],
  itemId: ["id de l'element", "id de l element", "item id"],
  status: ["etat", "status"],
  issues: ["problemes", "issues"],
  price: ["prix", "price"],
  clicks: ["clics", "clicks"],
  impressions: ["impr.", "impressions", "impr"],
  ctr: ["ctr"],
  avgCpc: ["cpc moy", "avg. cpc", "average cpc"],
  cost: ["cout", "cost"],
  conversions: ["conversions", "conv."],
  conversionValue: ["valeur de conv", "conv. value", "conversion value"],
} as const;

const HEADER_DETECTION_PATTERNS = [
  ["titre", "title"],
  ["id de l'element", "item id"],
  ["prix", "price"],
  ["clics", "clicks"],
];

export const SHOPPING_REPORT_HELP =
  'Exportez le rapport "Produits" depuis Google Ads : pour Shopping standard, ' +
  "Campagne → Produits → Télécharger ; pour Performance Max, Insights et " +
  "rapports → performances produit → Télécharger → CSV.";

export function parseProductsCsv(csvText: string): ParseResult<ProductRaw> {
  const lines = csvText.split(/\r\n|\r|\n/);
  const header = findHeaderRow(lines, HEADER_DETECTION_PATTERNS);

  if (!header) {
    throw new ParseError(
      "Impossible de trouver l'en-tête du rapport dans ce fichier. " + SHOPPING_REPORT_HELP,
    );
  }

  const columns = mapColumns(header.normalizedHeaders, COLUMN_PATTERNS);
  if (!("title" in columns) && !("itemId" in columns)) {
    throw new ParseError(
      `Les colonnes "Titre" et "ID de l'élément" sont introuvables dans l'en-tête détecté. ${SHOPPING_REPORT_HELP}`,
    );
  }

  const restOfFile = lines.slice(header.headerLineIndex + 1).join("\n");
  const parsed = Papa.parse<string[]>(restOfFile, {
    skipEmptyLines: false,
    delimiter: lines[header.headerLineIndex]?.includes(";") ? ";" : ",",
  });

  const rows: ProductRaw[] = [];
  let totalRows = 0;
  let skippedRows = 0;

  for (const rawRow of parsed.data) {
    if (!Array.isArray(rawRow)) continue;
    if (rawRow.length === 1 && rawRow[0] === "") continue;
    totalRows++;

    if (isSummaryOrEmptyRow(rawRow)) {
      skippedRows++;
      continue;
    }

    const title = rawRow[columns.title ?? -1]?.trim() ?? "";
    const itemId = rawRow[columns.itemId ?? -1]?.trim() ?? "";

    // Une ligne est valide si title OU itemId est renseigné.
    if (!title && !itemId) {
      skippedRows++;
      continue;
    }

    rows.push({
      imageUrl: rawRow[columns.imageUrl ?? -1]?.trim() ?? "",
      title,
      merchantRef: rawRow[columns.merchantRef ?? -1]?.trim() ?? "",
      itemId,
      status: rawRow[columns.status ?? -1]?.trim() ?? "",
      issues: rawRow[columns.issues ?? -1]?.trim() ?? "",
      price: parseEuropeanNumber(rawRow[columns.price ?? -1]),
      clicks: parseEuropeanNumber(rawRow[columns.clicks ?? -1]),
      impressions: parseEuropeanNumber(rawRow[columns.impressions ?? -1]),
      ctr: parseEuropeanNumber(rawRow[columns.ctr ?? -1]),
      avgCpc: parseEuropeanNumber(rawRow[columns.avgCpc ?? -1]),
      cost: parseEuropeanNumber(rawRow[columns.cost ?? -1]),
      conversions: parseEuropeanNumber(rawRow[columns.conversions ?? -1]),
      conversionValue: parseEuropeanNumber(rawRow[columns.conversionValue ?? -1]),
    });
  }

  if (rows.length === 0) {
    throw new ParseError(
      `Aucun produit valide n'a été trouvé dans ce fichier. ${SHOPPING_REPORT_HELP}`,
    );
  }

  const notes = [
    `${totalRows} lignes lues, ${rows.length} produits valides, ${skippedRows} lignes de synthèse ignorées.`,
  ];

  return {
    rows,
    totalRows,
    validRows: rows.length,
    skippedRows,
    notes,
  };
}

export async function parseProductsFile(file: File): Promise<ParseResult<ProductRaw>> {
  const text = await readFileAsText(file);
  return parseProductsCsv(text);
}
