import { describe, expect, it } from "vitest";
import { residualTerm, suggestNegative } from "./negatives";

describe("residualTerm", () => {
  it("retire les mots du mot-clé acheté", () => {
    expect(residualTerm("plombier pas cher", "plombier")).toBe("pas cher");
  });

  it("retourne une chaîne vide si le terme est identique au mot-clé", () => {
    expect(residualTerm("plombier", "plombier")).toBe("");
  });
});

describe("suggestNegative", () => {
  it("priorité 1 : suggère la ville seule si détectée", () => {
    const result = suggestNegative({
      searchTerm: "plombier marseille pas cher",
      keyword: "plombier",
      detectedCity: "marseille",
    });
    expect(result).toBe("marseille");
  });

  it("priorité 3 : suggère le motif toxique trouvé dans le résidu", () => {
    const result = suggestNegative({
      searchTerm: "plombier pas cher",
      keyword: "plombier",
    });
    expect(result).toBe("pas cher");
  });

  it("priorité 2 : suggère le résidu si aucun motif toxique ne matche", () => {
    const result = suggestNegative({
      searchTerm: "plombier urgence dimanche",
      keyword: "plombier",
    });
    expect(result).toBe("urgence dimanche");
  });

  it("priorité 4 : suggère le terme complet en dernier recours", () => {
    const result = suggestNegative({
      searchTerm: "plombier",
      keyword: "plombier",
    });
    expect(result).toBe("plombier");
  });
});
