import {
  AMBIANCE_TO_FAMILIES,
  BUDGET_ORDER,
  FAMILIES,
  NOTE_TO_FAMILY,
  type Family,
  type BudgetTier,
  type Ambiance,
} from "@/lib/reference-data";
import type { Perfume, Profile, ScoredPerfume } from "@/lib/types";

const FAMILY_DESCRIPTORS: Record<Family, string> = {
  agrumes: "fraîches et pétillantes",
  boise: "boisées et chaudes",
  floral: "florales et délicates",
  oriental: "orientales et enveloppantes",
  aromatique: "aromatiques et vives",
  gourmand: "gourmandes et sucrées",
  marin: "marines et iodées",
  cuir: "cuirées et affirmées",
};

const STYLE_DESCRIPTORS: Record<string, string> = {
  elegant: "élégant",
  sexy: "sensuel",
  discret: "discret",
  luxueux: "luxueux",
  original: "original",
  rassurant: "rassurant",
  puissant: "puissant",
};

const OCCASION_DESCRIPTORS: Record<string, string> = {
  bureau: "le bureau",
  quotidien: "le quotidien",
  soiree: "les soirées",
  rdv: "les rendez-vous",
  mariage: "les mariages",
  ete: "l'été",
  hiver: "l'hiver",
};

type Contribution = {
  points: number;
  sentence: string;
};

/** Calcule, pour chaque famille olfactive, le nombre d'ambiances du profil qui y contribuent. */
export function computeFamilyWeights(ambiances: string[]): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const ambiance of ambiances) {
    const families = AMBIANCE_TO_FAMILIES[ambiance as Ambiance];
    if (!families) continue;
    for (const family of families) {
      weights[family] = (weights[family] ?? 0) + 1;
    }
  }
  return weights;
}

function budgetDelta(profileTier: BudgetTier, perfumeTier: BudgetTier): number {
  if (profileTier === perfumeTier) return 12;
  const a = BUDGET_ORDER.indexOf(profileTier);
  const b = BUDGET_ORDER.indexOf(perfumeTier);
  if (Math.abs(a - b) === 1) return 4;
  return -6;
}

export type ScoreResult = {
  score: number;
  reasons: string[];
  excluded: boolean;
};

/**
 * Calcule le score de compatibilité entre un profil olfactif et un parfum.
 * Retourne un score normalisé sur 100 (borné entre 28 et 98), et des phrases d'explication.
 */
export function scorePerfume(profile: Profile, perfume: Perfume): ScoreResult {
  const dislikedMatches = (profile.notes_disliked ?? []).filter((n) =>
    perfume.notes.includes(n)
  );
  if (dislikedMatches.length >= 2) {
    return { score: 0, reasons: [], excluded: true };
  }

  const contributions: Contribution[] = [];
  let raw = 0;
  let maxPossible = 0;

  // 1. Familles, pondérées par le nombre d'ambiances qui y contribuent.
  const familyWeights = computeFamilyWeights(profile.ambiances ?? []);
  const matchedFamilies: Family[] = [];
  for (const family of perfume.families) {
    const weight = familyWeights[family] ?? 0;
    maxPossible += 4;
    if (weight > 0) {
      const points = 4 * weight;
      raw += points;
      matchedFamilies.push(family);
      contributions.push({
        points,
        sentence: `Vous appréciez les notes ${FAMILY_DESCRIPTORS[family]}.`,
      });
    }
  }

  // 2. Styles.
  const matchedStyles: string[] = [];
  for (const style of perfume.style) {
    maxPossible += 14;
    if ((profile.styles ?? []).includes(style)) {
      raw += 14;
      matchedStyles.push(style);
    }
  }
  if (matchedStyles.length > 0) {
    const labels = matchedStyles.map((s) => STYLE_DESCRIPTORS[s] ?? s);
    contributions.push({
      points: matchedStyles.length * 14,
      sentence:
        labels.length === 1
          ? `Son caractère ${labels[0]} correspond à votre style.`
          : `Son caractère ${labels.slice(0, -1).join(", ")} et ${labels[labels.length - 1]} correspond à votre style.`,
    });
  }

  // 3. Occasions.
  const matchedOccasions: string[] = [];
  for (const occasion of perfume.occasions) {
    maxPossible += 10;
    if ((profile.occasions ?? []).includes(occasion)) {
      raw += 10;
      matchedOccasions.push(occasion);
    }
  }
  if (matchedOccasions.length > 0) {
    const labels = matchedOccasions.map((o) => OCCASION_DESCRIPTORS[o] ?? o);
    contributions.push({
      points: matchedOccasions.length * 10,
      sentence: `Il est taillé pour ${labels.join(", ")}.`,
    });
  }

  // 4. Notes aimées.
  const matchedNotesLoved = (profile.notes_loved ?? []).filter((n) =>
    perfume.notes.includes(n)
  );
  maxPossible += perfume.notes.length * 9;
  if (matchedNotesLoved.length > 0) {
    raw += matchedNotesLoved.length * 9;
    contributions.push({
      points: matchedNotesLoved.length * 9,
      sentence:
        matchedNotesLoved.length === 1
          ? `Vous aimez la note ${matchedNotesLoved[0]}, bien présente ici.`
          : `Vous aimez les notes ${matchedNotesLoved.join(", ")}, bien présentes ici.`,
    });
  }

  // 5. Notes évitées (pénalité, sans compter dans maxPossible).
  if (dislikedMatches.length === 1) {
    raw -= 20;
  }

  // 6. Budget.
  maxPossible += 12;
  if (profile.budget_tier) {
    const delta = budgetDelta(profile.budget_tier, perfume.budget_tier);
    raw += delta;
    if (delta === 12) {
      contributions.push({
        points: 12,
        sentence: "Son prix correspond exactement à votre budget.",
      });
    } else if (delta === 4) {
      contributions.push({
        points: 4,
        sentence: "Son prix reste proche de votre budget habituel.",
      });
    }
  }

  // 7. Normalisation sur 100, bornée entre 28 et 98.
  const ratio = maxPossible > 0 ? raw / maxPossible : 0;
  const score = Math.round(Math.min(98, Math.max(28, ratio * 100)));

  // 8. Explication : 2 à 4 phrases, triées par contribution décroissante.
  const reasons = contributions
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((c) => c.sentence);

  if (reasons.length < 2) {
    reasons.push(
      "Sa signature olfactive complète les parfums que vous appréciez déjà."
    );
  }

  return { score, reasons, excluded: false };
}

export function scoreAllPerfumes(profile: Profile, perfumes: Perfume[]): ScoredPerfume[] {
  return perfumes
    .map((perfume) => {
      const result = scorePerfume(profile, perfume);
      return { perfume, score: result.score, reasons: result.reasons, excluded: result.excluded };
    })
    .filter((r) => !r.excluded)
    .sort((a, b) => b.score - a.score)
    .map(({ perfume, score, reasons }) => ({ perfume, score, reasons }));
}

/** Empreinte olfactive : répartition du profil sur les 8 familles, pour le radar chart. */
export function computeOlfactoryFootprint(profile: Profile): Record<Family, number> {
  const weights = computeFamilyWeights(profile.ambiances ?? []);
  const result: Record<string, number> = {};
  for (const family of FAMILIES) {
    result[family] = weights[family] ?? 0;
  }
  for (const note of profile.notes_loved ?? []) {
    const family = NOTE_TO_FAMILY[note as keyof typeof NOTE_TO_FAMILY];
    if (family) result[family] = (result[family] ?? 0) + 1;
  }
  return result as Record<Family, number>;
}
