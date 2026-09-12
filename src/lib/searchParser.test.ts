import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSearchTermsCsv } from "./searchParser";
import { ParseError } from "../types";

const fixturePath = resolve(__dirname, "../../fixtures/search-terms-sample.csv");
const fixture = readFileSync(fixturePath, "utf-8");

describe("parseSearchTermsCsv", () => {
  it("ignore les métadonnées avant l'en-tête et trouve les bonnes colonnes", () => {
    const result = parseSearchTermsCsv(fixture);
    expect(result.rows.length).toBe(6);
    expect(result.rows[0].searchTerm).toBe("plombier marseille pas cher");
  });

  it("exclut les lignes de synthèse (Total, Autres termes) et les compte", () => {
    const result = parseSearchTermsCsv(fixture);
    // 6 lignes de données + 4 lignes de synthèse = 10 lignes au total.
    expect(result.totalRows).toBe(10);
    expect(result.validRows).toBe(6);
    expect(result.skippedRows).toBe(4);
  });

  it("mappe les colonnes par nom, peu importe leur ordre", () => {
    const reordered = [
      "Rapport sur les termes de recherche",
      "1 janvier 2026 - 23 janvier 2026",
      "Clics,Terme de recherche,Coût,Conversions,Mot clé",
      '5,chaussures rouges,"10,00 €",1,chaussures',
    ].join("\n");
    const result = parseSearchTermsCsv(reordered);
    expect(result.rows[0].searchTerm).toBe("chaussures rouges");
    expect(result.rows[0].clicks).toBe(5);
    expect(result.rows[0].cost).toBeCloseTo(10);
  });

  it("parse les nombres au format européen (montants et pourcentages)", () => {
    const result = parseSearchTermsCsv(fixture);
    const parisTerm = result.rows.find((r) => r.searchTerm.includes("paris"));
    expect(parisTerm?.cost).toBeCloseTo(16.5);
    expect(parisTerm?.conversionValue).toBeCloseTo(150);
  });

  it("lance une ParseError explicite si aucun en-tête n'est trouvé", () => {
    const garbage = "ceci\nn'est\npas\nun export google ads";
    expect(() => parseSearchTermsCsv(garbage)).toThrow(ParseError);
    try {
      parseSearchTermsCsv(garbage);
    } catch (error) {
      expect((error as Error).message).toContain("Termes de recherche");
    }
  });
});
