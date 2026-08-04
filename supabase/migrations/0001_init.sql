-- OSMIA — schéma initial
-- Utilisateurs gérés par Supabase Auth (table auth.users)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  gender text check (gender in ('Homme','Femme','Unisexe')),
  ambiances text[] default '{}',
  styles text[] default '{}',
  occasions text[] default '{}',
  budget_tier text check (budget_tier in ('eco','mid','premium','luxe')),
  notes_loved text[] default '{}',
  notes_disliked text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists perfumes (
  id serial primary key,
  name text not null,
  brand text not null,
  gender text check (gender in ('Homme','Femme','Unisexe')),
  families text[] not null,
  notes text[] not null,
  style text[] not null,
  occasions text[] not null,
  budget_tier text check (budget_tier in ('eco','mid','premium','luxe')),
  intensity smallint check (intensity between 1 and 5),
  longevity smallint check (longevity between 1 and 5),
  description text
);

create table if not exists retailers (
  id serial primary key,
  name text not null,
  logo_url text,
  affiliate_base_url text,
  commission_rate numeric
);

create table if not exists perfume_offers (
  id serial primary key,
  perfume_id int references perfumes(id) on delete cascade,
  retailer_id int references retailers(id) on delete cascade,
  price numeric not null,
  format text,
  in_stock boolean default true,
  affiliate_url text not null,
  updated_at timestamptz default now()
);

create table if not exists price_history (
  id serial primary key,
  offer_id int references perfume_offers(id) on delete cascade,
  price numeric not null,
  recorded_at timestamptz default now()
);

create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  perfume_id int references perfumes(id) on delete cascade,
  status text check (status in ('possede','teste','souhaite','favori','echantillon','termine')),
  created_at timestamptz default now(),
  primary key (user_id, perfume_id)
);

create table if not exists affiliate_clicks (
  id serial primary key,
  user_id uuid references auth.users(id) on delete set null,
  perfume_id int references perfumes(id),
  retailer_id int references retailers(id),
  clicked_at timestamptz default now()
);

create table if not exists price_alerts (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  perfume_id int references perfumes(id) on delete cascade,
  threshold_price numeric not null,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists perfume_offers_perfume_id_idx on perfume_offers(perfume_id);
create index if not exists price_history_offer_id_idx on price_history(offer_id);
create index if not exists affiliate_clicks_perfume_id_idx on affiliate_clicks(perfume_id);
create index if not exists affiliate_clicks_retailer_id_idx on affiliate_clicks(retailer_id);
create index if not exists price_alerts_user_id_idx on price_alerts(user_id);

-- Row Level Security ---------------------------------------------------

alter table profiles enable row level security;
alter table favorites enable row level security;
alter table price_alerts enable row level security;

create policy "Les utilisateurs lisent leur propre profil"
  on profiles for select
  using (auth.uid() = id);

create policy "Les utilisateurs créent leur propre profil"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Les utilisateurs modifient leur propre profil"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Les utilisateurs suppriment leur propre profil"
  on profiles for delete
  using (auth.uid() = id);

create policy "Les utilisateurs lisent leurs propres favoris"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs propres favoris"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres favoris"
  on favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres favoris"
  on favorites for delete
  using (auth.uid() = user_id);

create policy "Les utilisateurs lisent leurs propres alertes"
  on price_alerts for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs propres alertes"
  on price_alerts for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres alertes"
  on price_alerts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres alertes"
  on price_alerts for delete
  using (auth.uid() = user_id);

-- Lecture publique pour le catalogue -----------------------------------

alter table perfumes enable row level security;
alter table retailers enable row level security;
alter table perfume_offers enable row level security;
alter table price_history enable row level security;

create policy "Catalogue de parfums public en lecture"
  on perfumes for select
  using (true);

create policy "Revendeurs publics en lecture"
  on retailers for select
  using (true);

create policy "Offres publiques en lecture"
  on perfume_offers for select
  using (true);

create policy "Historique de prix public en lecture"
  on price_history for select
  using (true);

-- affiliate_clicks : écriture ouverte (tracking, y compris visiteurs anonymes),
-- pas de lecture publique (réservée au service role / tableau de bord admin).
alter table affiliate_clicks enable row level security;

create policy "Tout le monde peut enregistrer un clic affilié"
  on affiliate_clicks for insert
  with check (true);

-- updated_at automatique sur profiles ----------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();
