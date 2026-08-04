-- Champs utilisés par la page de découverte (popularité, nouveautés).
-- La popularité est un compteur dénormalisé, à terme alimenté par un job
-- (service role) agrégeant favorites/affiliate_clicks — ces tables sont
-- protégées par RLS et illisibles publiquement pour l'agrégation en direct.

alter table perfumes add column if not exists popularity int not null default 0;
alter table perfumes add column if not exists created_at timestamptz not null default now();

create index if not exists perfumes_popularity_idx on perfumes(popularity desc);
create index if not exists perfumes_created_at_idx on perfumes(created_at desc);
