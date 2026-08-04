-- OSMIA — jeu de données de démonstration
-- Généré par supabase/generate-seed.mjs — ne pas éditer à la main.

truncate table price_history, perfume_offers, affiliate_clicks, price_alerts, favorites, perfumes, retailers restart identity cascade;

insert into retailers (name, logo_url, affiliate_base_url, commission_rate) values
  ('Le Comptoir du Parfum', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.08),
  ('Essence & Co', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.1),
  ('Flacon Paris', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.07),
  ('Nez Libre', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.09);

insert into perfumes (name, brand, gender, families, notes, style, occasions, budget_tier, intensity, longevity, description, popularity, created_at) values
  ('Sillage Doré', 'Maison Ferrand', 'Homme', ARRAY['agrumes','boise']::text[], ARRAY['Bergamote','Bois de santal','Poivre rose','Musc']::text[], ARRAY['elegant','discret']::text[], ARRAY['bureau','quotidien','ete']::text[], 'mid', 3, 3, 'Sillage Doré par Maison Ferrand, une composition agrumes et boise pensée pour bureau et quotidien.', 58, now() - interval '207 days'),
  ('Nuit de Cuir', 'Atelier Noir', 'Homme', ARRAY['cuir','oriental']::text[], ARRAY['Cuir','Ambre','Safran','Fève tonka']::text[], ARRAY['puissant','sexy','luxueux']::text[], ARRAY['soiree','rdv','hiver']::text[], 'premium', 5, 5, 'Nuit de Cuir par Atelier Noir, une composition cuir et oriental pensée pour soiree et rdv.', 91, now() - interval '279 days'),
  ('Vent Marin', 'Rivière & Fils', 'Unisexe', ARRAY['marin','agrumes']::text[], ARRAY['Citron','Musc','Bergamote']::text[], ARRAY['discret','rassurant']::text[], ARRAY['quotidien','bureau','ete']::text[], 'eco', 2, 2, 'Vent Marin par Rivière & Fils, une composition marin et agrumes pensée pour quotidien et bureau.', 75, now() - interval '275 days'),
  ('Jardin Secret', 'Maison Verlaine', 'Femme', ARRAY['floral']::text[], ARRAY['Jasmin','Rose','Iris','Musc']::text[], ARRAY['elegant','rassurant']::text[], ARRAY['quotidien','rdv','ete']::text[], 'mid', 3, 3, 'Jardin Secret par Maison Verlaine, une composition floral pensée pour quotidien et rdv.', 52, now() - interval '60 days'),
  ('Poudre d''Ambre', 'Atelier Noir', 'Femme', ARRAY['oriental','gourmand']::text[], ARRAY['Vanille','Ambre','Fève tonka','Cardamome']::text[], ARRAY['sexy','luxueux']::text[], ARRAY['soiree','rdv','hiver']::text[], 'luxe', 5, 5, 'Poudre d''Ambre par Atelier Noir, une composition oriental et gourmand pensée pour soiree et rdv.', 4, now() - interval '90 days'),
  ('Bois Sauvage', 'Rivière & Fils', 'Homme', ARRAY['boise','aromatique']::text[], ARRAY['Bois de santal','Vétiver','Cardamome']::text[], ARRAY['puissant','original']::text[], ARRAY['quotidien','hiver']::text[], 'mid', 3, 3, 'Bois Sauvage par Rivière & Fils, une composition boise et aromatique pensée pour quotidien et hiver.', 28, now() - interval '398 days'),
  ('Sucre d''Orient', 'Maison Ferrand', 'Unisexe', ARRAY['gourmand','oriental']::text[], ARRAY['Vanille','Coco','Fève tonka','Cardamome']::text[], ARRAY['original','rassurant']::text[], ARRAY['quotidien','ete']::text[], 'eco', 3, 2, 'Sucre d''Orient par Maison Ferrand, une composition gourmand et oriental pensée pour quotidien et ete.', 71, now() - interval '268 days'),
  ('Étoffe Noire', 'Atelier Noir', 'Homme', ARRAY['cuir','boise']::text[], ARRAY['Cuir','Bois de santal','Patchouli']::text[], ARRAY['puissant','luxueux']::text[], ARRAY['soiree','hiver','mariage']::text[], 'luxe', 5, 5, 'Étoffe Noire par Atelier Noir, une composition cuir et boise pensée pour soiree et hiver.', 36, now() - interval '102 days'),
  ('Fleur Blanche', 'Maison Verlaine', 'Femme', ARRAY['floral']::text[], ARRAY['Tubéreuse','Jasmin','Musc']::text[], ARRAY['sexy','original']::text[], ARRAY['soiree','rdv','ete']::text[], 'mid', 4, 3, 'Fleur Blanche par Maison Verlaine, une composition floral pensée pour soiree et rdv.', 10, now() - interval '359 days'),
  ('Citron Vert & Sel', 'Rivière & Fils', 'Unisexe', ARRAY['agrumes','marin']::text[], ARRAY['Citron','Bergamote','Musc']::text[], ARRAY['discret','rassurant']::text[], ARRAY['quotidien','bureau','ete']::text[], 'eco', 2, 2, 'Citron Vert & Sel par Rivière & Fils, une composition agrumes et marin pensée pour quotidien et bureau.', 84, now() - interval '335 days'),
  ('Ambre Royal', 'Maison Ferrand', 'Homme', ARRAY['oriental','boise']::text[], ARRAY['Ambre','Bois de santal','Safran','Poivre rose']::text[], ARRAY['luxueux','puissant']::text[], ARRAY['soiree','rdv','mariage','hiver']::text[], 'luxe', 5, 5, 'Ambre Royal par Maison Ferrand, une composition oriental et boise pensée pour soiree et rdv.', 45, now() - interval '112 days'),
  ('Iris Poudré', 'Maison Verlaine', 'Femme', ARRAY['floral','boise']::text[], ARRAY['Iris','Bois de santal','Musc','Cardamome']::text[], ARRAY['elegant','discret']::text[], ARRAY['bureau','quotidien','rdv']::text[], 'mid', 3, 3, 'Iris Poudré par Maison Verlaine, une composition floral et boise pensée pour bureau et quotidien.', 84, now() - interval '18 days'),
  ('Forêt d''Hiver', 'Rivière & Fils', 'Unisexe', ARRAY['boise','aromatique']::text[], ARRAY['Vétiver','Bois de santal','Lavande']::text[], ARRAY['rassurant','discret']::text[], ARRAY['quotidien','hiver']::text[], 'eco', 2, 3, 'Forêt d''Hiver par Rivière & Fils, une composition boise et aromatique pensée pour quotidien et hiver.', 76, now() - interval '385 days'),
  ('Cuir & Épices', 'Atelier Noir', 'Homme', ARRAY['cuir','oriental']::text[], ARRAY['Cuir','Safran','Cardamome','Fève tonka']::text[], ARRAY['original','puissant']::text[], ARRAY['soiree','rdv']::text[], 'premium', 4, 4, 'Cuir & Épices par Atelier Noir, une composition cuir et oriental pensée pour soiree et rdv.', 80, now() - interval '46 days'),
  ('Rose Poivrée', 'Maison Verlaine', 'Femme', ARRAY['floral','oriental']::text[], ARRAY['Rose','Poivre rose','Ambre']::text[], ARRAY['sexy','elegant']::text[], ARRAY['rdv','soiree','mariage']::text[], 'mid', 3, 3, 'Rose Poivrée par Maison Verlaine, une composition floral et oriental pensée pour rdv et soiree.', 33, now() - interval '259 days'),
  ('Coco Solaire', 'Maison Ferrand', 'Unisexe', ARRAY['gourmand','marin']::text[], ARRAY['Coco','Musc','Bergamote']::text[], ARRAY['rassurant','original']::text[], ARRAY['ete','quotidien']::text[], 'eco', 2, 2, 'Coco Solaire par Maison Ferrand, une composition gourmand et marin pensée pour ete et quotidien.', 5, now() - interval '107 days'),
  ('Patchouli Intense', 'Atelier Noir', 'Homme', ARRAY['boise','oriental']::text[], ARRAY['Patchouli','Ambre','Vétiver','Fève tonka']::text[], ARRAY['puissant','luxueux']::text[], ARRAY['soiree','hiver']::text[], 'premium', 5, 4, 'Patchouli Intense par Atelier Noir, une composition boise et oriental pensée pour soiree et hiver.', 50, now() - interval '307 days'),
  ('Muguet Frais', 'Maison Verlaine', 'Femme', ARRAY['floral','agrumes']::text[], ARRAY['Jasmin','Bergamote','Musc']::text[], ARRAY['discret','rassurant']::text[], ARRAY['bureau','quotidien','ete']::text[], 'eco', 2, 2, 'Muguet Frais par Maison Verlaine, une composition floral et agrumes pensée pour bureau et quotidien.', 27, now() - interval '206 days');

insert into perfume_offers (perfume_id, retailer_id, price, format, in_stock, affiliate_url) values
  (1, 1, 77.42, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sillage-dore?ref=osmia'),
  (1, 2, 78.75, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sillage-dore?ref=osmia'),
  (2, 4, 139.75, '50ml', false, 'https://example-retailer.com/product/atelier-noir-nuit-de-cuir?ref=osmia'),
  (2, 2, 132.25, '50ml', true, 'https://example-retailer.com/product/atelier-noir-nuit-de-cuir?ref=osmia'),
  (2, 3, 134.2, '50ml', true, 'https://example-retailer.com/product/atelier-noir-nuit-de-cuir?ref=osmia'),
  (3, 1, 45.78, '50ml', true, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (3, 2, 42.04, '50ml', true, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (3, 3, 41.97, '50ml', true, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (4, 4, 75.48, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-jardin-secret?ref=osmia'),
  (4, 3, 80.55, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-jardin-secret?ref=osmia'),
  (4, 2, 79.03, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-jardin-secret?ref=osmia'),
  (5, 1, 208.42, '50ml', true, 'https://example-retailer.com/product/atelier-noir-poudre-d-ambre?ref=osmia'),
  (5, 4, 221.05, '50ml', true, 'https://example-retailer.com/product/atelier-noir-poudre-d-ambre?ref=osmia'),
  (6, 4, 82.96, '50ml', true, 'https://example-retailer.com/product/riviere-fils-bois-sauvage?ref=osmia'),
  (6, 3, 90.58, '50ml', true, 'https://example-retailer.com/product/riviere-fils-bois-sauvage?ref=osmia'),
  (6, 2, 97.03, '50ml', true, 'https://example-retailer.com/product/riviere-fils-bois-sauvage?ref=osmia'),
  (7, 2, 44.9, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sucre-d-orient?ref=osmia'),
  (7, 1, 49.3, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sucre-d-orient?ref=osmia'),
  (7, 4, 50.15, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sucre-d-orient?ref=osmia'),
  (8, 4, 232.71, '50ml', true, 'https://example-retailer.com/product/atelier-noir-etoffe-noire?ref=osmia'),
  (8, 3, 243.7, '50ml', true, 'https://example-retailer.com/product/atelier-noir-etoffe-noire?ref=osmia'),
  (8, 2, 250.32, '50ml', false, 'https://example-retailer.com/product/atelier-noir-etoffe-noire?ref=osmia'),
  (9, 1, 101.62, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-fleur-blanche?ref=osmia'),
  (9, 4, 96.84, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-fleur-blanche?ref=osmia'),
  (10, 3, 40.86, '50ml', true, 'https://example-retailer.com/product/riviere-fils-citron-vert-sel?ref=osmia'),
  (10, 4, 41.29, '50ml', true, 'https://example-retailer.com/product/riviere-fils-citron-vert-sel?ref=osmia'),
  (11, 1, 201.31, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (11, 3, 224.76, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (11, 2, 194.27, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (12, 4, 80.92, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-iris-poudre?ref=osmia'),
  (12, 3, 78.8, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-iris-poudre?ref=osmia'),
  (13, 1, 53.4, '50ml', true, 'https://example-retailer.com/product/riviere-fils-foret-d-hiver?ref=osmia'),
  (13, 4, 55.44, '50ml', true, 'https://example-retailer.com/product/riviere-fils-foret-d-hiver?ref=osmia'),
  (14, 1, 157, '50ml', true, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (14, 4, 147.41, '50ml', false, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (14, 2, 139.75, '50ml', true, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (15, 1, 103.25, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-rose-poivree?ref=osmia'),
  (15, 2, 90.94, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-rose-poivree?ref=osmia'),
  (15, 3, 96.44, '50ml', false, 'https://example-retailer.com/product/maison-verlaine-rose-poivree?ref=osmia'),
  (16, 1, 43.17, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-coco-solaire?ref=osmia'),
  (16, 2, 38.8, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-coco-solaire?ref=osmia'),
  (17, 4, 147.67, '50ml', true, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (17, 3, 165.26, '50ml', false, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (17, 2, 151.38, '50ml', true, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (18, 4, 52.75, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-muguet-frais?ref=osmia'),
  (18, 3, 48.8, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-muguet-frais?ref=osmia');

insert into price_history (offer_id, price, recorded_at)
select o.id, greatest(5, round((o.price * (1 + (random() * 0.14 - 0.07)))::numeric, 2)), now() - (d || ' days')::interval
from perfume_offers o, generate_series(0, 55, 7) as d;

