// Données de référence pour le quiz, le scoring et l'affichage.

export const FAMILIES = [
  "agrumes",
  "boise",
  "floral",
  "oriental",
  "aromatique",
  "gourmand",
  "marin",
  "cuir",
] as const;

export type Family = (typeof FAMILIES)[number];

export const FAMILY_LABELS: Record<Family, string> = {
  agrumes: "Agrumes",
  boise: "Boisé",
  floral: "Floral",
  oriental: "Oriental",
  aromatique: "Aromatique",
  gourmand: "Gourmand",
  marin: "Marin",
  cuir: "Cuir",
};

// Teinte associée à chaque famille dominante, utilisée pour les illustrations de flacons.
export const FAMILY_COLORS: Record<Family, string> = {
  agrumes: "#C9A94A",
  boise: "#8A6D4B",
  floral: "#C598A6",
  oriental: "#9C5B3C",
  aromatique: "#7E9A7A",
  gourmand: "#B98655",
  marin: "#6E93A0",
  cuir: "#5C4A3D",
};

export const GENDERS = ["Homme", "Femme", "Unisexe"] as const;
export type Gender = (typeof GENDERS)[number];

export const AMBIANCES = [
  "foret",
  "plage",
  "montagne",
  "bibliotheque",
  "cafe",
  "patisserie",
  "jardin_fleuri",
] as const;
export type Ambiance = (typeof AMBIANCES)[number];

export const AMBIANCE_LABELS: Record<Ambiance, string> = {
  foret: "Forêt",
  plage: "Plage",
  montagne: "Montagne",
  bibliotheque: "Bibliothèque",
  cafe: "Café",
  patisserie: "Pâtisserie",
  jardin_fleuri: "Jardin fleuri",
};

// Une ambiance peut contribuer à plusieurs familles ; ce poids sert au calcul du score de famille.
export const AMBIANCE_TO_FAMILIES: Record<Ambiance, Family[]> = {
  foret: ["boise", "aromatique"],
  plage: ["marin", "agrumes"],
  montagne: ["boise", "aromatique"],
  bibliotheque: ["cuir", "boise"],
  cafe: ["gourmand", "oriental"],
  patisserie: ["gourmand"],
  jardin_fleuri: ["floral"],
};

export const STYLES = [
  "elegant",
  "sexy",
  "discret",
  "luxueux",
  "original",
  "rassurant",
  "puissant",
] as const;
export type Style = (typeof STYLES)[number];

export const STYLE_LABELS: Record<Style, string> = {
  elegant: "Élégant",
  sexy: "Sexy",
  discret: "Discret",
  luxueux: "Luxueux",
  original: "Original",
  rassurant: "Rassurant",
  puissant: "Puissant",
};

export const OCCASIONS = [
  "bureau",
  "quotidien",
  "soiree",
  "rdv",
  "mariage",
  "ete",
  "hiver",
] as const;
export type Occasion = (typeof OCCASIONS)[number];

export const OCCASION_LABELS: Record<Occasion, string> = {
  bureau: "Bureau",
  quotidien: "Quotidien",
  soiree: "Soirée",
  rdv: "Rendez-vous",
  mariage: "Mariage",
  ete: "Été",
  hiver: "Hiver",
};

export const BUDGET_TIERS = ["eco", "mid", "premium", "luxe"] as const;
export type BudgetTier = (typeof BUDGET_TIERS)[number];

export const BUDGET_LABELS: Record<BudgetTier, string> = {
  eco: "Éco · moins de 50€",
  mid: "Milieu de gamme · 50-100€",
  premium: "Premium · 100-200€",
  luxe: "Luxe · 200€ et plus",
};

// Ordre des tiers pour déterminer l'adjacence lors du scoring budget.
export const BUDGET_ORDER: BudgetTier[] = ["eco", "mid", "premium", "luxe"];

export const NOTES = [
  "Bergamote",
  "Citron",
  "Iris",
  "Tubéreuse",
  "Jasmin",
  "Rose",
  "Vanille",
  "Fève tonka",
  "Coco",
  "Ambre",
  "Cardamome",
  "Poivre rose",
  "Safran",
  "Bois de santal",
  "Patchouli",
  "Vétiver",
  "Oud",
  "Cuir",
  "Musc",
  "Lavande",
] as const;
export type Note = (typeof NOTES)[number];

export const NOTE_TO_FAMILY: Record<Note, Family> = {
  Bergamote: "agrumes",
  Citron: "agrumes",
  Iris: "floral",
  Tubéreuse: "floral",
  Jasmin: "floral",
  Rose: "floral",
  Vanille: "gourmand",
  "Fève tonka": "gourmand",
  Coco: "gourmand",
  Ambre: "oriental",
  Cardamome: "oriental",
  "Poivre rose": "oriental",
  Safran: "oriental",
  "Bois de santal": "boise",
  Patchouli: "boise",
  Vétiver: "boise",
  Oud: "cuir",
  Cuir: "cuir",
  Musc: "aromatique",
  Lavande: "aromatique",
};
