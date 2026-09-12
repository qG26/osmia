import { describe, expect, it } from "vitest";
import {
  findHeaderRow,
  isSummaryOrEmptyRow,
  normalizeText,
  parseEuropeanNumber,
  splitCsvLine,
} from "./csvCore";

describe("normalizeText", () => {
  it("trim, minuscule et retire les accents", () => {
    expect(normalizeText("  Coût/conv.  ")).toBe("cout/conv.");
    expect(normalizeText("Ajoutée/Exclue")).toBe("ajoutee/exclue");
  });
});

describe("parseEuropeanNumber", () => {
  it("parse un montant au format européen avec séparateur de milliers", () => {
    expect(parseEuropeanNumber("1 234,56 €")).toBeCloseTo(1234.56);
  });

  it("parse un montant avec espace insécable comme séparateur de milliers", () => {
    expect(parseEuropeanNumber("1 234,56 €")).toBeCloseTo(1234.56);
  });

  it("parse un pourcentage au format européen", () => {
    expect(parseEuropeanNumber("12,5 %")).toBeCloseTo(12.5);
  });

  it("retourne 0 pour les valeurs vides ou placeholder", () => {
    expect(parseEuropeanNumber("")).toBe(0);
    expect(parseEuropeanNumber("--")).toBe(0);
    expect(parseEuropeanNumber(undefined)).toBe(0);
    expect(parseEuropeanNumber(null)).toBe(0);
  });

  it("parse un nombre entier simple", () => {
    expect(parseEuropeanNumber("42")).toBe(42);
  });
});

describe("findHeaderRow", () => {
  it("trouve l'en-tête après des lignes de métadonnées", () => {
    const lines = [
      "Rapport sur les termes de recherche",
      "1 janvier 2026 - 23 janvier 2026",
      "Terme de recherche,Type de correspondance,Campagne,Clics,Coût",
      "chaussures rouges,Requête large,Campagne A,10,5,00 €",
    ];
    const result = findHeaderRow(lines, [
      ["terme de recherche", "search term"],
      ["clics", "clicks"],
      ["cout", "cost"],
    ]);
    expect(result).not.toBeNull();
    expect(result?.headerLineIndex).toBe(2);
  });

  it("retourne null si aucun en-tête reconnu n'est trouvé dans les 30 premières lignes", () => {
    const lines = ["ligne inconnue", "encore une ligne", "rien à voir"];
    const result = findHeaderRow(lines, [["terme de recherche", "search term"]]);
    expect(result).toBeNull();
  });
});

describe("isSummaryOrEmptyRow", () => {
  it("détecte les lignes 'Total'", () => {
    expect(isSummaryOrEmptyRow(["Total : Compte", "", "", ""])).toBe(true);
    expect(isSummaryOrEmptyRow(["Total : Performance Max", "", ""])).toBe(true);
  });

  it("détecte les lignes 'Autres termes de recherche'", () => {
    expect(isSummaryOrEmptyRow(["Autres termes de recherche", "10", "1"])).toBe(true);
  });

  it("détecte les lignes contenant '--'", () => {
    expect(isSummaryOrEmptyRow(["terme normal", "--", "5"])).toBe(true);
  });

  it("détecte les lignes entièrement vides", () => {
    expect(isSummaryOrEmptyRow(["", "", ""])).toBe(true);
  });

  it("ne signale pas une ligne de donnée valide", () => {
    expect(isSummaryOrEmptyRow(["chaussures rouges", "Requête large", "10", "5,00 €"])).toBe(
      false,
    );
  });
});

describe("splitCsvLine", () => {
  it("gère les guillemets et les valeurs contenant une virgule", () => {
    expect(splitCsvLine('a,"1,25 €",c')).toEqual(["a", "1,25 €", "c"]);
  });

  it("gère les guillemets échappés", () => {
    expect(splitCsvLine('a,"il dit ""bonjour""",c')).toEqual(["a", 'il dit "bonjour"', "c"]);
  });
});
