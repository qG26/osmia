/**
 * Suggestion du mot-clé négatif le plus étroit pour un terme de recherche
 * problématique. Voir AGENTS/spec produit pour l'ordre de priorité :
 * ville détectée > résidu du terme (moins le mot-clé acheté) > motif
 * toxique connu dans ce résidu > terme complet en dernier recours.
 */
import { normalizeText } from "./csvCore";

/**
 * Motifs "toxiques" connus : des mots qui, à eux seuls, expliquent presque
 * toujours un mauvais match (intention gratuite, occasion, information...).
 * Si l'un d'eux apparaît dans le résidu du terme, on le suggère seul :
 * c'est le négatif le plus large qui reste sûr.
 */
export const TOXIC_PATTERNS: readonly string[] = [
  "gratuit",
  "pas cher",
  "moins cher",
  "occasion",
  "d'occasion",
  "tuto",
  "tutoriel",
  "comment",
  "avis",
  "forum",
  "emploi",
  "recrutement",
  "salaire",
  "pdf",
  "definition",
  "wikipedia",
  "leboncoin",
  "amazon",
];

function tokenize(text: string): string[] {
  return text.split(/[^a-z0-9']+/).filter(Boolean);
}

/**
 * Retire du terme les mots présents dans le mot-clé acheté, en comparant
 * mot à mot (normalisé). Ce qui reste est le déclencheur probable du
 * mauvais match.
 */
export function residualTerm(searchTerm: string, keyword: string): string {
  const keywordWords = new Set(tokenize(normalizeText(keyword)));
  const termWords = tokenize(normalizeText(searchTerm));
  const residual = termWords.filter((word) => !keywordWords.has(word));
  return residual.join(" ");
}

/** Cherche un motif toxique connu dans un texte déjà normalisé (résidu). */
export function findToxicPattern(text: string): string | undefined {
  const normalized = normalizeText(text);
  return TOXIC_PATTERNS.find((pattern) => normalized.includes(normalizeText(pattern)));
}

/**
 * Calcule le négatif suggéré pour un terme de recherche classé `geo` ou
 * `warning`. Un terme `ok` n'a pas besoin de suggestion (chaîne vide).
 *
 * Ordre de priorité :
 * 1. Ville détectée seule (si `detectedCity` est fourni).
 * 2. Motif toxique connu dans le résidu (terme moins mot-clé acheté).
 * 3. Résidu complet, s'il n'est pas vide.
 * 4. Terme complet, en dernier recours.
 */
export function suggestNegative(params: {
  searchTerm: string;
  keyword: string;
  detectedCity?: string;
}): string {
  const { searchTerm, keyword, detectedCity } = params;

  if (detectedCity) {
    return detectedCity;
  }

  const residual = residualTerm(searchTerm, keyword);

  if (residual) {
    const toxic = findToxicPattern(residual);
    if (toxic) return toxic;
    return residual;
  }

  return searchTerm.trim();
}
