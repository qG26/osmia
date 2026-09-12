/**
 * Types partagés entre `lib/` et l'UI. Aucune dépendance à React ici :
 * ce fichier doit rester importable depuis du code purement fonctionnel.
 */

/** Statut d'un terme de recherche après classification (outil 1). */
export type SearchTermStatus = "geo" | "warning" | "ok";

/** Statut d'un produit après classification (outil 2, Shopping/PMax). */
export type ShoppingStatus = "zombie" | "underperforming" | "top" | "neutral";

/** Formats d'export disponibles pour les deux outils. */
export type ExportFormat = "google-ads" | "simple-list" | "detailed";

/** Outil concerné, utilisé comme clé de stockage et pour le nommage des exports. */
export type ToolKind = "search" | "shopping";

/** Champs bruts extraits d'une ligne du rapport "Termes de recherche". */
export interface SearchTermRaw {
  searchTerm: string;
  keyword: string;
  matchType: string;
  campaign: string;
  adGroup: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  conversionValue: number;
}

/** Ligne de terme de recherche après classification. */
export interface SearchTermAnalyzed extends SearchTermRaw {
  /** Identifiant stable pour la sélection et le tri (index d'origine). */
  id: string;
  status: SearchTermStatus;
  /** Ville détectée dans le terme, si `status === 'geo'`. */
  detectedCity?: string;
  /** Négatif suggéré automatiquement (voir lib/negatives.ts). */
  suggestedNegative: string;
}

/** Champs bruts extraits d'une ligne du rapport "Produits" (Shopping/PMax). */
export interface ProductRaw {
  imageUrl: string;
  title: string;
  merchantRef: string;
  itemId: string;
  status: string;
  issues: string;
  price: number;
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  conversionValue: number;
}

/** Ligne de produit après calcul du ROAS et classification. */
export interface ProductAnalyzed extends ProductRaw {
  id: string;
  roas: number;
  statusClass: ShoppingStatus;
}

/** Résultat générique d'un parsing CSV, avec le décompte des lignes ignorées. */
export interface ParseResult<T> {
  rows: T[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
  /** Messages informatifs (non bloquants) à afficher à l'utilisateur. */
  notes: string[];
}

/** Erreur de parsing avec un message actionnable pour l'utilisateur. */
export class ParseError extends Error {}

/** Un élément sélectionné pour exclusion, indépendamment de l'outil d'origine. */
export interface ExclusionItem {
  /** Identifiant unique après dédoublonnage (ex: la ville seule, ou l'itemId). */
  key: string;
  /** Négatif / identifiant à exporter (éditable par l'utilisateur). */
  value: string;
  /** Libellé d'origine (terme de recherche ou titre produit) pour l'export détaillé. */
  sourceLabel: string;
  clicks: number;
  cost: number;
  conversions: number;
  status: SearchTermStatus | ShoppingStatus;
  reason: string;
  /** Identifiant d'élément Shopping, si applicable. */
  itemId?: string;
}

/** États explicites du cycle de vie d'une page outil. */
export type ProcessState = "idle" | "reading" | "analyzing" | "success" | "error";

/** Sauvegarde locale d'une analyse, par outil. */
export interface StorageBackup<T> {
  timestamp: number;
  fileName: string;
  data: T[];
  exclusions: ExclusionItem[];
  /** État additionnel propre à l'outil (zones autorisées, négatifs édités, seuils...). */
  meta?: Record<string, unknown>;
}

/** Directions de tri utilisées par les tableaux. */
export type SortDirection = "asc" | "desc";
