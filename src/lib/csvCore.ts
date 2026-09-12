/**
 * Utilitaires bas niveau partagés par les deux parsers CSV (Search et
 * Shopping) : décodage robuste, détection de l'en-tête réel au milieu des
 * métadonnées d'export Google Ads, normalisation des en-têtes et des
 * nombres au format européen. Aucune dépendance à React ni au DOM (hors
 * `TextDecoder`, disponible aussi bien dans le navigateur que dans Node).
 */

/** Nombre de lignes scannées depuis le début du fichier pour trouver l'en-tête. */
export const HEADER_SEARCH_WINDOW = 30;

const REPLACEMENT_CHAR = "�";

function countReplacementChars(text: string): number {
  let count = 0;
  for (const char of text) {
    if (char === REPLACEMENT_CHAR) count++;
  }
  return count;
}

/**
 * Décode un buffer en essayant l'UTF-8 en priorité. Si le résultat contient
 * des caractères de remplacement (signe d'un mauvais encodage), retente en
 * windows-1252 (encodage courant des exports Google Ads faits depuis
 * Windows/Excel) et garde la version la plus propre.
 */
export function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const utf8Errors = countReplacementChars(utf8);
  if (utf8Errors === 0) return utf8;

  try {
    const windows1252 = new TextDecoder("windows-1252", { fatal: false }).decode(buffer);
    const windows1252Errors = countReplacementChars(windows1252);
    return windows1252Errors < utf8Errors ? windows1252 : utf8;
  } catch {
    return utf8;
  }
}

/** Lit un `File` du navigateur en texte, avec la détection d'encodage ci-dessus. */
export async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return decodeCsvBuffer(buffer);
}

/** trim + minuscules + suppression des accents. Utilisé pour comparer en-têtes et villes. */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Découpe naïvement une ligne CSV (virgule, guillemets doubles avec
 * échappement `""`). Suffisant pour scanner les 30 premières lignes à la
 * recherche de l'en-tête, avant de passer la main à PapaParse pour le
 * parsing complet (qui gère aussi le point-virgule et les cas limites).
 */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === "," || char === ";") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export interface HeaderDetectionResult {
  /** Index (0-based) de la ligne d'en-tête dans le texte complet. */
  headerLineIndex: number;
  /** En-têtes normalisés trouvés sur cette ligne. */
  normalizedHeaders: string[];
}

/**
 * Scanne les `HEADER_SEARCH_WINDOW` premières lignes du fichier pour
 * trouver celle qui contient l'en-tête réel, en cherchant une ligne dont
 * les cellules normalisées matchent un nombre suffisant des en-têtes
 * attendus (peu importe leur ordre, qui varie selon la configuration du
 * compte Google Ads).
 */
export function findHeaderRow(
  lines: string[],
  expectedHeaderPatterns: string[][],
  minMatches = 3,
): HeaderDetectionResult | null {
  const scanLimit = Math.min(lines.length, HEADER_SEARCH_WINDOW);
  for (let i = 0; i < scanLimit; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cells = splitCsvLine(line).map(normalizeText);
    if (cells.length < 2) continue;

    // Nombre de colonnes attendues (parmi `expectedHeaderPatterns`) dont au
    // moins une cellule de cette ligne matche un des motifs. Une ligne de
    // métadonnées ("Rapport sur les termes de recherche") ne matchera
    // quasiment jamais aucune colonne ; la vraie ligne d'en-tête en matche
    // plusieurs simultanément.
    const matchedColumns = expectedHeaderPatterns.filter((patterns) =>
      cells.some((cell) => patterns.some((pattern) => cell.includes(pattern))),
    ).length;

    if (matchedColumns >= minMatches) {
      return { headerLineIndex: i, normalizedHeaders: cells };
    }
  }
  return null;
}

/**
 * Construit un index "en-tête normalisé -> index de colonne" en acceptant
 * une correspondance partielle (le libellé réel peut contenir davantage de
 * texte, ex. "Coût/conv." vs le pattern "cout").
 */
export function mapColumns(
  normalizedHeaders: string[],
  columnPatterns: Record<string, string[]>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [field, patterns] of Object.entries(columnPatterns)) {
    const index = normalizedHeaders.findIndex((header) =>
      patterns.some((pattern) => header.includes(pattern)),
    );
    if (index !== -1) result[field] = index;
  }
  return result;
}

/**
 * Parse un nombre au format européen des exports Google Ads :
 * `"1 234,56 €"` -> `1234.56`, `"12,5 %"` -> `12.5`, `"--"` ou `""` -> `0`.
 * Retire les espaces (dont les insécables), remplace la virgule décimale
 * par un point, puis retire tout ce qui n'est ni chiffre, ni point, ni signe.
 */
export function parseEuropeanNumber(raw: string | undefined | null): number {
  if (!raw) return 0;
  let value = raw.replace(/[\s\u00A0\u202F]/g, "");
  if (value === "" || value === "--" || value === "-") return 0;
  value = value.replace(",", ".");
  value = value.replace(/[^0-9.-]/g, "");
  // Une seule virgule/point décimal attendu ; si plusieurs points restent
  // (ex. séparateur de milliers non retiré), ne garder que le dernier comme décimal.
  const parts = value.split(".");
  if (parts.length > 2) {
    const decimal = parts.pop();
    value = parts.join("") + "." + decimal;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Une ligne est une ligne de synthèse (à exclure) si une de ses valeurs
 * contient "total", "autres termes", ou vaut "--". Une ligne entièrement
 * vide est également exclue.
 */
export function isSummaryOrEmptyRow(cells: string[]): boolean {
  const nonEmpty = cells.some((cell) => cell.trim() !== "");
  if (!nonEmpty) return true;
  return cells.some((cell) => {
    const normalized = normalizeText(cell);
    return (
      normalized.includes("total") ||
      normalized.includes("autres termes") ||
      normalized === "--"
    );
  });
}
