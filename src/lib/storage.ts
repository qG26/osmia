/**
 * Sauvegarde locale (localStorage) après chaque analyse, par outil. Ne
 * sert qu'à proposer une reprise ("bannière discrète") au chargement
 * suivant de la page — jamais de restauration automatique.
 */
import type { StorageBackup, ToolKind } from "../types";

const STORAGE_KEYS: Record<ToolKind, string> = {
  search: "adslens.backup.search",
  shopping: "adslens.backup.shopping",
};

export const BACKUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Enregistre l'état courant d'une analyse. Échoue silencieusement (stockage indisponible/quota). */
export function saveBackup<T>(tool: ToolKind, backup: StorageBackup<T>): void {
  try {
    localStorage.setItem(STORAGE_KEYS[tool], JSON.stringify(backup));
  } catch {
    // Navigation privée, quota dépassé, etc. : ce n'est qu'une commodité de
    // reprise, pas une fonctionnalité critique — on n'interrompt jamais l'analyse pour ça.
  }
}

/** Lit la dernière sauvegarde pour un outil, ou `null` si absente/corrompue. */
export function loadBackup<T>(tool: ToolKind): StorageBackup<T> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[tool]);
    if (!raw) return null;
    return JSON.parse(raw) as StorageBackup<T>;
  } catch {
    return null;
  }
}

/** Supprime la sauvegarde d'un outil (après "Ignorer", ou une nouvelle analyse). */
export function clearBackup(tool: ToolKind): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[tool]);
  } catch {
    // idem : pas bloquant.
  }
}

/** Une sauvegarde est proposée en reprise seulement si elle a moins de 24h. */
export function isBackupFresh(backup: StorageBackup<unknown> | null): boolean {
  if (!backup) return false;
  return Date.now() - backup.timestamp < BACKUP_MAX_AGE_MS;
}
