import type { BudgetTier, Family, Gender, Occasion, Style } from "@/lib/reference-data";

export type Profile = {
  id: string;
  gender: Gender | null;
  ambiances: string[];
  styles: string[];
  occasions: string[];
  budget_tier: BudgetTier | null;
  notes_loved: string[];
  notes_disliked: string[];
  created_at: string;
  updated_at: string;
};

export type Perfume = {
  id: number;
  name: string;
  brand: string;
  gender: Gender;
  families: Family[];
  notes: string[];
  style: Style[];
  occasions: Occasion[];
  budget_tier: BudgetTier;
  intensity: number;
  longevity: number;
  description: string | null;
};

export type Retailer = {
  id: number;
  name: string;
  logo_url: string | null;
  affiliate_base_url: string | null;
  commission_rate: number | null;
};

export type PerfumeOffer = {
  id: number;
  perfume_id: number;
  retailer_id: number;
  price: number;
  format: string | null;
  in_stock: boolean;
  affiliate_url: string;
  updated_at: string;
  retailer?: Retailer;
};

export type PriceHistoryPoint = {
  id: number;
  offer_id: number;
  price: number;
  recorded_at: string;
};

export type FavoriteStatus =
  | "possede"
  | "teste"
  | "souhaite"
  | "favori"
  | "echantillon"
  | "termine";

export type Favorite = {
  user_id: string;
  perfume_id: number;
  status: FavoriteStatus;
  created_at: string;
};

export type PriceAlert = {
  id: number;
  user_id: string;
  perfume_id: number;
  threshold_price: number;
  active: boolean;
  created_at: string;
};

export type ScoredPerfume = {
  perfume: Perfume;
  score: number;
  reasons: string[];
};
