import { describe, expect, it } from "vitest";
import { findCityInText, isCityOutsideAllowedZones, zoneMatchesCity } from "./cities";

describe("findCityInText", () => {
  it("détecte une ville sur un mot entier", () => {
    expect(findCityInText("plombier marseille pas cher")).toBe("marseille");
  });

  it("détecte une ville multi-mots (avec tiret ou espace, indifféremment)", () => {
    expect(findCityInText("hotel saint etienne centre")).toBe("saint-etienne");
    expect(findCityInText("hotel saint-etienne centre")).toBe("saint-etienne");
  });

  it("ne matche pas 'pau' dans 'paupiette'", () => {
    expect(findCityInText("paupiette de veau recette")).toBeUndefined();
  });

  it("ne matche pas 'orange' (exclue volontairement) dans 'jus d'orange'", () => {
    expect(findCityInText("acheter jus d'orange bio")).toBeUndefined();
  });

  it("retourne undefined si aucune ville n'est présente", () => {
    expect(findCityInText("plombier chauffagiste pas cher")).toBeUndefined();
  });
});

describe("zoneMatchesCity", () => {
  it("matche dans les deux sens : zone large vs ville précise", () => {
    expect(zoneMatchesCity("Paris", "paris")).toBe(true);
  });

  it("matche une zone plus précise avec une ville détectée plus large", () => {
    expect(zoneMatchesCity("Lyon 3", "lyon")).toBe(true);
  });

  it("ne matche pas des villes différentes", () => {
    expect(zoneMatchesCity("Paris", "marseille")).toBe(false);
  });
});

describe("isCityOutsideAllowedZones", () => {
  it("désactive la détection géo si aucune zone n'est saisie", () => {
    expect(isCityOutsideAllowedZones("marseille", [])).toBe(false);
  });

  it("signale une ville hors zone", () => {
    expect(isCityOutsideAllowedZones("marseille", ["Paris", "Lyon"])).toBe(true);
  });

  it("ne signale pas une ville couverte par une zone autorisée", () => {
    expect(isCityOutsideAllowedZones("paris", ["Paris"])).toBe(false);
  });
});
