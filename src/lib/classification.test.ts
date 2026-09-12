import { describe, expect, it } from "vitest";
import { classifyProducts, classifySearchTerms, computeRoas } from "./classification";
import type { ProductRaw, SearchTermRaw } from "../types";

function searchRow(overrides: Partial<SearchTermRaw>): SearchTermRaw {
  return {
    searchTerm: "plombier",
    keyword: "plombier",
    matchType: "Requête large",
    campaign: "Campagne",
    adGroup: "Groupe",
    impressions: 100,
    clicks: 5,
    ctr: 5,
    avgCpc: 1,
    cost: 5,
    conversions: 0,
    conversionValue: 0,
    ...overrides,
  };
}

function productRow(overrides: Partial<ProductRaw>): ProductRaw {
  return {
    imageUrl: "",
    title: "Produit",
    merchantRef: "REF",
    itemId: "1",
    status: "Approuvé",
    issues: "",
    price: 10,
    clicks: 5,
    impressions: 100,
    ctr: 5,
    avgCpc: 1,
    cost: 5,
    conversions: 0,
    conversionValue: 0,
    ...overrides,
  };
}

describe("classifySearchTerms", () => {
  it("classe geo si une ville hors zone est détectée, même avec des conversions", () => {
    const rows = [
      searchRow({ searchTerm: "plombier lyon urgence", conversions: 2, conversionValue: 100 }),
    ];
    const result = classifySearchTerms(rows, ["Paris"]);
    expect(result[0].status).toBe("geo");
    expect(result[0].detectedCity).toBe("lyon");
  });

  it("ne classe jamais un terme geo si aucune zone n'est saisie", () => {
    const rows = [searchRow({ searchTerm: "plombier marseille" })];
    const result = classifySearchTerms(rows, []);
    expect(result[0].status).not.toBe("geo");
  });

  it("classe warning si conversions=0 et cost>0.10", () => {
    const rows = [searchRow({ searchTerm: "plombier tuto", cost: 5, conversions: 0 })];
    const result = classifySearchTerms(rows, []);
    expect(result[0].status).toBe("warning");
  });

  it("classe ok sinon", () => {
    const rows = [
      searchRow({ searchTerm: "plombier urgence", cost: 5, conversions: 1, conversionValue: 50 }),
    ];
    const result = classifySearchTerms(rows, []);
    expect(result[0].status).toBe("ok");
  });

  it("ville couverte par une zone autorisée -> pas geo", () => {
    const rows = [searchRow({ searchTerm: "plombier paris 15", conversions: 1 })];
    const result = classifySearchTerms(rows, ["Paris"]);
    expect(result[0].status).toBe("ok");
  });
});

describe("computeRoas", () => {
  it("calcule conversionValue / cost", () => {
    expect(computeRoas(10, 50)).toBe(5);
  });

  it("retourne 0 si cost est nul", () => {
    expect(computeRoas(0, 50)).toBe(0);
  });
});

describe("classifyProducts", () => {
  const params = { roasTarget: 3, zombieThreshold: 15 };

  it("classe zombie si cost > seuil et conversions = 0", () => {
    const rows = [productRow({ cost: 20, conversions: 0 })];
    const result = classifyProducts(rows, params);
    expect(result[0].statusClass).toBe("zombie");
  });

  it("ne classe pas zombie un produit sous le seuil même sans conversion", () => {
    const rows = [productRow({ cost: 2, conversions: 0 })];
    const result = classifyProducts(rows, params);
    expect(result[0].statusClass).toBe("neutral");
  });

  it("classe top si roas >= cible", () => {
    const rows = [productRow({ cost: 10, conversions: 2, conversionValue: 40 })];
    const result = classifyProducts(rows, params);
    expect(result[0].statusClass).toBe("top");
  });

  it("classe underperforming si conversions > 0 mais roas < cible", () => {
    const rows = [productRow({ cost: 10, conversions: 1, conversionValue: 15 })];
    const result = classifyProducts(rows, params);
    expect(result[0].statusClass).toBe("underperforming");
  });

  it("le seuil zombie est ajustable", () => {
    const rows = [productRow({ cost: 12, conversions: 0 })];
    expect(classifyProducts(rows, { roasTarget: 3, zombieThreshold: 15 })[0].statusClass).toBe(
      "neutral",
    );
    expect(classifyProducts(rows, { roasTarget: 3, zombieThreshold: 10 })[0].statusClass).toBe(
      "zombie",
    );
  });
});
