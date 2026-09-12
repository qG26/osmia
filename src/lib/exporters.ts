/**
 * Génération des trois formats d'export, et utilitaires de prévisualisation
 * et de téléchargement. Logique de formatage pure (testable) + un petit
 * helper de déclenchement de téléchargement qui touche le DOM.
 */
import type { ExclusionItem, ExportFormat, ToolKind } from "../types";

function escapeCsvValue(value: string): string {
  return value.replace(/"/g, '""');
}

function toCsvRow(values: string[]): string {
  return values.map((value) => `"${escapeCsvValue(value)}"`).join(",");
}

/**
 * Dédoublonne une liste d'exclusions par valeur exportée (insensible à la
 * casse et aux espaces). Si dix termes hors zone donnent tous "marseille",
 * un seul "marseille" doit apparaître dans les exports de négatifs
 * (Google Ads CSV et Liste simple). L'export détaillé, lui, garde chaque
 * ligne d'origine pour l'archivage.
 */
export function dedupeExclusions(items: ExclusionItem[]): ExclusionItem[] {
  const seen = new Map<string, ExclusionItem>();
  for (const item of items) {
    const value = exportedValue(item).trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

function exportedValue(item: ExclusionItem): string {
  return item.itemId && item.itemId.trim() ? item.itemId : item.value;
}

/** Format 1 — Google Ads (CSV) : négatifs prêts à réimporter dans l'interface. */
export function exportGoogleAdsCsv(items: ExclusionItem[], tool: ToolKind): string {
  const deduped = dedupeExclusions(items);

  if (tool === "shopping") {
    const lines = [toCsvRow(["Item ID"])];
    for (const item of deduped) {
      lines.push(toCsvRow([exportedValue(item)]));
    }
    return lines.join("\r\n");
  }

  const lines = [toCsvRow(["Keyword", "Match Type"])];
  for (const item of deduped) {
    lines.push(toCsvRow([exportedValue(item), "Broad"]));
  }
  return lines.join("\r\n");
}

/** Format 2 — Liste simple (TXT) : un élément par ligne, dédoublonné et trié. */
export function exportSimpleList(items: ExclusionItem[]): string {
  const deduped = dedupeExclusions(items);
  const values = deduped.map(exportedValue);
  values.sort((a, b) => a.localeCompare(b, "fr"));
  return values.join("\n");
}

/** Format 3 — Export détaillé (CSV) : une ligne par élément d'origine, pour archivage. */
export function exportDetailedCsv(items: ExclusionItem[]): string {
  const lines = [
    toCsvRow(["Terme / Produit", "Clics", "Coût", "Conversions", "Statut", "Raison de l'exclusion"]),
  ];
  for (const item of items) {
    lines.push(
      toCsvRow([
        item.sourceLabel,
        String(item.clicks),
        item.cost.toFixed(2),
        String(item.conversions),
        item.status,
        item.reason,
      ]),
    );
  }
  return lines.join("\r\n");
}

/** Construit le contenu du fichier pour un format donné. */
export function buildExportContent(
  items: ExclusionItem[],
  format: ExportFormat,
  tool: ToolKind,
): string {
  switch (format) {
    case "google-ads":
      return exportGoogleAdsCsv(items, tool);
    case "simple-list":
      return exportSimpleList(items);
    case "detailed":
      return exportDetailedCsv(items);
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** `AdsLens_Exclusions_Search_YYYY-MM-DD.csv` / `..._Shopping_...` */
export function exportFileName(tool: ToolKind, format: ExportFormat, date = new Date()): string {
  const dateStr = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const toolLabel = tool === "search" ? "Search" : "Shopping";
  const extension = format === "simple-list" ? "txt" : "csv";
  return `AdsLens_Exclusions_${toolLabel}_${dateStr}.${extension}`;
}

export interface ExportPreview {
  count: number;
  totalCost: number;
  firstItems: ExclusionItem[];
}

/**
 * Données affichées dans la modale de prévisualisation avant téléchargement :
 * nombre d'éléments sélectionnés, coût cumulé (non dédoublonné, pour
 * refléter la dépense réelle sur la période du fichier), et les 10 premiers.
 */
export function buildExportPreview(items: ExclusionItem[]): ExportPreview {
  return {
    count: items.length,
    totalCost: items.reduce((sum, item) => sum + item.cost, 0),
    firstItems: items.slice(0, 10),
  };
}

const MIME_TYPES: Record<ExportFormat, string> = {
  "google-ads": "text/csv;charset=utf-8;",
  "simple-list": "text/plain;charset=utf-8;",
  detailed: "text/csv;charset=utf-8;",
};

/** Déclenche le téléchargement du fichier dans le navigateur. Non testé unitairement (DOM). */
export function downloadExport(content: string, fileName: string, format: ExportFormat): void {
  // BOM UTF-8 pour qu'Excel ouvre correctement les accents dans les CSV.
  const bom = "﻿";
  const blob = new Blob([bom + content], { type: MIME_TYPES[format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
