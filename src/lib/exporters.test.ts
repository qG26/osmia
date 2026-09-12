import { describe, expect, it } from "vitest";
import {
  buildExportPreview,
  dedupeExclusions,
  exportDetailedCsv,
  exportFileName,
  exportGoogleAdsCsv,
  exportSimpleList,
} from "./exporters";
import type { ExclusionItem } from "../types";

function item(overrides: Partial<ExclusionItem>): ExclusionItem {
  return {
    key: "marseille",
    value: "marseille",
    sourceLabel: "plombier marseille",
    clicks: 5,
    cost: 10,
    conversions: 0,
    status: "geo",
    reason: "Ville hors zone détectée : marseille",
    ...overrides,
  };
}

describe("dedupeExclusions", () => {
  it("dédoublonne par valeur exportée, insensible à la casse", () => {
    const items = [
      item({ value: "marseille", sourceLabel: "terme 1" }),
      item({ value: "Marseille", sourceLabel: "terme 2" }),
      item({ value: "lyon", sourceLabel: "terme 3", key: "lyon" }),
    ];
    const result = dedupeExclusions(items);
    expect(result.length).toBe(2);
  });
});

describe("exportGoogleAdsCsv", () => {
  it("génère l'en-tête Keyword/Match Type et une ligne Broad par négatif (search)", () => {
    const items = [item({ value: "marseille" }), item({ value: "marseille" })];
    const csv = exportGoogleAdsCsv(items, "search");
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe('"Keyword","Match Type"');
    expect(lines.length).toBe(2); // en-tête + 1 ligne dédoublonnée
    expect(lines[1]).toBe('"marseille","Broad"');
  });

  it("génère une colonne Item ID pour Shopping", () => {
    const items = [item({ value: "1001", itemId: "1001" })];
    const csv = exportGoogleAdsCsv(items, "shopping");
    expect(csv.split("\r\n")[0]).toBe('"Item ID"');
  });
});

describe("exportSimpleList", () => {
  it("dédoublonne et trie", () => {
    const items = [item({ value: "marseille" }), item({ value: "lyon" }), item({ value: "marseille" })];
    const list = exportSimpleList(items);
    expect(list.split("\n")).toEqual(["lyon", "marseille"]);
  });
});

describe("exportDetailedCsv", () => {
  it("ne dédoublonne pas : une ligne par élément d'origine", () => {
    const items = [
      item({ value: "marseille", sourceLabel: "terme A" }),
      item({ value: "marseille", sourceLabel: "terme B" }),
    ];
    const csv = exportDetailedCsv(items);
    const lines = csv.split("\r\n");
    expect(lines.length).toBe(3); // en-tête + 2 lignes
  });
});

describe("buildExportPreview", () => {
  it("calcule le coût cumulé et garde les 10 premiers éléments", () => {
    const items = Array.from({ length: 15 }, (_, i) => item({ cost: 10, sourceLabel: `terme ${i}` }));
    const preview = buildExportPreview(items);
    expect(preview.count).toBe(15);
    expect(preview.totalCost).toBe(150);
    expect(preview.firstItems.length).toBe(10);
  });
});

describe("exportFileName", () => {
  it("nomme le fichier selon l'outil et le format", () => {
    const date = new Date(2026, 8, 12); // 12 septembre 2026
    expect(exportFileName("search", "google-ads", date)).toBe(
      "AdsLens_Exclusions_Search_2026-09-12.csv",
    );
    expect(exportFileName("shopping", "simple-list", date)).toBe(
      "AdsLens_Exclusions_Shopping_2026-09-12.txt",
    );
  });
});
