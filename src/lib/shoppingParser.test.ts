import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseProductsCsv } from "./shoppingParser";
import { ParseError } from "../types";

const fixturePath = resolve(__dirname, "../../fixtures/products-sample.csv");
const fixture = readFileSync(fixturePath, "utf-8");

describe("parseProductsCsv", () => {
  it("ignore les métadonnées et parse les produits valides", () => {
    const result = parseProductsCsv(fixture);
    expect(result.rows.length).toBe(5);
    expect(result.rows[0].title).toBe("Chaussures de randonnée Alpina");
    expect(result.rows[0].itemId).toBe("1001");
  });

  it("exclut la ligne de synthèse 'Total : Compte'", () => {
    const result = parseProductsCsv(fixture);
    expect(result.skippedRows).toBeGreaterThanOrEqual(1);
  });

  it("parse le prix et le coût au format européen", () => {
    const result = parseProductsCsv(fixture);
    const shoes = result.rows.find((r) => r.itemId === "1001");
    expect(shoes?.price).toBeCloseTo(89.9);
    expect(shoes?.cost).toBeCloseTo(36);
  });

  it("garde une ligne avec Problèmes non vide", () => {
    const result = parseProductsCsv(fixture);
    const jacket = result.rows.find((r) => r.itemId === "1003");
    expect(jacket?.issues).toBe("Image de mauvaise qualité");
  });

  it("lance une ParseError explicite si l'en-tête est introuvable", () => {
    expect(() => parseProductsCsv("rien\nà\nvoir\nici")).toThrow(ParseError);
  });
});
