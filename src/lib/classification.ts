/**
 * Classification des lignes analysées : statut `geo` / `warning` / `ok`
 * pour les termes de recherche, et `zombie` / `underperforming` / `top` /
 * `neutral` pour les produits Shopping/PMax. Logique pure, sans React.
 */
import { findCityInText, isCityOutsideAllowedZones } from "./cities";
import { suggestNegative } from "./negatives";
import type {
  ExclusionItem,
  ProductAnalyzed,
  ProductRaw,
  SearchTermAnalyzed,
  SearchTermRaw,
  ShoppingStatus,
} from "../types";

/** Seuil de coût au-delà duquel une conversion nulle devient un `warning`. */
export const WARNING_COST_THRESHOLD = 0.1;

/**
 * Classe l'ensemble des termes de recherche bruts en fonction des zones
 * autorisées saisies par l'utilisateur. Si `allowedZones` est vide, la
 * détection géographique est désactivée : aucun terme ne peut être `geo`.
 */
export function classifySearchTerms(
  rows: SearchTermRaw[],
  allowedZones: string[],
): SearchTermAnalyzed[] {
  return rows.map((row, index) => {
    const detectedCity = allowedZones.length > 0 ? findCityInText(row.searchTerm) : undefined;
    const isGeo = !!detectedCity && isCityOutsideAllowedZones(detectedCity, allowedZones);

    let status: SearchTermAnalyzed["status"];
    if (isGeo) {
      status = "geo";
    } else if (row.conversions === 0 && row.cost > WARNING_COST_THRESHOLD) {
      status = "warning";
    } else {
      status = "ok";
    }

    const suggestedNegative =
      status === "ok"
        ? ""
        : suggestNegative({
            searchTerm: row.searchTerm,
            keyword: row.keyword,
            detectedCity: isGeo ? detectedCity : undefined,
          });

    return {
      ...row,
      id: `search-${index}`,
      status,
      detectedCity: isGeo ? detectedCity : undefined,
      suggestedNegative,
    };
  });
}

export interface ShoppingClassificationParams {
  roasTarget: number;
  zombieThreshold: number;
}

/** `roas = conversionValue / cost` si `cost > 0`, sinon `0`. */
export function computeRoas(cost: number, conversionValue: number): number {
  return cost > 0 ? conversionValue / cost : 0;
}

function classifyProductStatus(
  row: ProductRaw,
  roas: number,
  { roasTarget, zombieThreshold }: ShoppingClassificationParams,
): ShoppingStatus {
  if (row.cost > zombieThreshold && row.conversions === 0) {
    return "zombie";
  }
  if (row.conversions > 0) {
    return roas >= roasTarget ? "top" : "underperforming";
  }
  // Conversions === 0 et cost <= zombieThreshold : pas assez de données.
  return "neutral";
}

/** Classe l'ensemble des produits bruts selon le ROAS cible et le seuil "zombie". */
export function classifyProducts(
  rows: ProductRaw[],
  params: ShoppingClassificationParams,
): ProductAnalyzed[] {
  return rows.map((row, index) => {
    const roas = computeRoas(row.cost, row.conversionValue);
    return {
      ...row,
      id: `product-${index}`,
      roas,
      statusClass: classifyProductStatus(row, roas, params),
    };
  });
}

/** Raison lisible de l'exclusion d'un terme de recherche, pour l'export détaillé. */
export function searchExclusionReason(row: SearchTermAnalyzed): string {
  if (row.status === "geo") {
    return `Ville hors zone détectée : ${row.detectedCity ?? ""}`;
  }
  if (row.status === "warning") {
    return `Aucune conversion pour ${row.cost.toFixed(2)} € dépensés`;
  }
  return "";
}

/** Construit l'élément d'exclusion pour un terme de recherche, avec la valeur éditée par l'utilisateur. */
export function buildSearchExclusionItem(
  row: SearchTermAnalyzed,
  editedNegative: string,
): ExclusionItem {
  const value = editedNegative.trim() || row.suggestedNegative;
  return {
    key: value.toLowerCase(),
    value,
    sourceLabel: row.searchTerm,
    clicks: row.clicks,
    cost: row.cost,
    conversions: row.conversions,
    status: row.status,
    reason: searchExclusionReason(row),
  };
}

/** Raison lisible de l'exclusion d'un produit, pour l'export détaillé. */
export function productExclusionReason(row: ProductAnalyzed, roasTarget: number): string {
  if (row.statusClass === "zombie") {
    return `${row.cost.toFixed(2)} € dépensés sans conversion`;
  }
  if (row.statusClass === "underperforming") {
    return `ROAS ${row.roas.toFixed(2)} < cible ${roasTarget.toFixed(2)}`;
  }
  return "";
}

/** Construit l'élément d'exclusion pour un produit (l'identifiant exporté est l'Item ID s'il existe). */
export function buildProductExclusionItem(row: ProductAnalyzed, roasTarget: number): ExclusionItem {
  const value = row.itemId || row.title;
  return {
    key: value.toLowerCase(),
    value,
    sourceLabel: row.title || row.itemId,
    clicks: row.clicks,
    cost: row.cost,
    conversions: row.conversions,
    status: row.statusClass,
    reason: productExclusionReason(row, roasTarget),
    itemId: row.itemId,
  };
}
