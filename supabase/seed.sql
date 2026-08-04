-- OSMIA — jeu de données de démonstration
-- Généré par supabase/generate-seed.mjs — ne pas éditer à la main.

truncate table price_history, perfume_offers, affiliate_clicks, price_alerts, favorites, perfumes, retailers restart identity cascade;

insert into retailers (name, logo_url, affiliate_base_url, commission_rate) values
  ('Le Comptoir du Parfum', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.08),
  ('Essence & Co', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.1),
  ('Flacon Paris', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.07),
  ('Nez Libre', null, 'https://example-retailer.com/product/{slug}?ref=osmia', 0.09);

insert into perfumes (name, brand, gender, families, notes, style, occasions, budget_tier, intensity, longevity, description) values
  ('Sillage Doré', 'Maison Ferrand', 'Homme', ARRAY['agrumes','boise']::text[], ARRAY['Bergamote','Bois de santal','Poivre rose','Musc']::text[], ARRAY['elegant','discret']::text[], ARRAY['bureau','quotidien','ete']::text[], 'mid', 3, 3, 'Sillage Doré par Maison Ferrand, une composition agrumes et boise pensée pour bureau et quotidien.'),
  ('Nuit de Cuir', 'Atelier Noir', 'Homme', ARRAY['cuir','oriental']::text[], ARRAY['Cuir','Ambre','Safran','Fève tonka']::text[], ARRAY['puissant','sexy','luxueux']::text[], ARRAY['soiree','rdv','hiver']::text[], 'premium', 5, 5, 'Nuit de Cuir par Atelier Noir, une composition cuir et oriental pensée pour soiree et rdv.'),
  ('Vent Marin', 'Rivière & Fils', 'Unisexe', ARRAY['marin','agrumes']::text[], ARRAY['Citron','Musc','Bergamote']::text[], ARRAY['discret','rassurant']::text[], ARRAY['quotidien','bureau','ete']::text[], 'eco', 2, 2, 'Vent Marin par Rivière & Fils, une composition marin et agrumes pensée pour quotidien et bureau.'),
  ('Jardin Secret', 'Maison Verlaine', 'Femme', ARRAY['floral']::text[], ARRAY['Jasmin','Rose','Iris','Musc']::text[], ARRAY['elegant','rassurant']::text[], ARRAY['quotidien','rdv','ete']::text[], 'mid', 3, 3, 'Jardin Secret par Maison Verlaine, une composition floral pensée pour quotidien et rdv.'),
  ('Poudre d''Ambre', 'Atelier Noir', 'Femme', ARRAY['oriental','gourmand']::text[], ARRAY['Vanille','Ambre','Fève tonka','Cardamome']::text[], ARRAY['sexy','luxueux']::text[], ARRAY['soiree','rdv','hiver']::text[], 'luxe', 5, 5, 'Poudre d''Ambre par Atelier Noir, une composition oriental et gourmand pensée pour soiree et rdv.'),
  ('Bois Sauvage', 'Rivière & Fils', 'Homme', ARRAY['boise','aromatique']::text[], ARRAY['Bois de santal','Vétiver','Cardamome']::text[], ARRAY['puissant','original']::text[], ARRAY['quotidien','hiver']::text[], 'mid', 3, 3, 'Bois Sauvage par Rivière & Fils, une composition boise et aromatique pensée pour quotidien et hiver.'),
  ('Sucre d''Orient', 'Maison Ferrand', 'Unisexe', ARRAY['gourmand','oriental']::text[], ARRAY['Vanille','Coco','Fève tonka','Cardamome']::text[], ARRAY['original','rassurant']::text[], ARRAY['quotidien','ete']::text[], 'eco', 3, 2, 'Sucre d''Orient par Maison Ferrand, une composition gourmand et oriental pensée pour quotidien et ete.'),
  ('Étoffe Noire', 'Atelier Noir', 'Homme', ARRAY['cuir','boise']::text[], ARRAY['Cuir','Bois de santal','Patchouli']::text[], ARRAY['puissant','luxueux']::text[], ARRAY['soiree','hiver','mariage']::text[], 'luxe', 5, 5, 'Étoffe Noire par Atelier Noir, une composition cuir et boise pensée pour soiree et hiver.'),
  ('Fleur Blanche', 'Maison Verlaine', 'Femme', ARRAY['floral']::text[], ARRAY['Tubéreuse','Jasmin','Musc']::text[], ARRAY['sexy','original']::text[], ARRAY['soiree','rdv','ete']::text[], 'mid', 4, 3, 'Fleur Blanche par Maison Verlaine, une composition floral pensée pour soiree et rdv.'),
  ('Citron Vert & Sel', 'Rivière & Fils', 'Unisexe', ARRAY['agrumes','marin']::text[], ARRAY['Citron','Bergamote','Musc']::text[], ARRAY['discret','rassurant']::text[], ARRAY['quotidien','bureau','ete']::text[], 'eco', 2, 2, 'Citron Vert & Sel par Rivière & Fils, une composition agrumes et marin pensée pour quotidien et bureau.'),
  ('Ambre Royal', 'Maison Ferrand', 'Homme', ARRAY['oriental','boise']::text[], ARRAY['Ambre','Bois de santal','Safran','Poivre rose']::text[], ARRAY['luxueux','puissant']::text[], ARRAY['soiree','rdv','mariage','hiver']::text[], 'luxe', 5, 5, 'Ambre Royal par Maison Ferrand, une composition oriental et boise pensée pour soiree et rdv.'),
  ('Iris Poudré', 'Maison Verlaine', 'Femme', ARRAY['floral','boise']::text[], ARRAY['Iris','Bois de santal','Musc','Cardamome']::text[], ARRAY['elegant','discret']::text[], ARRAY['bureau','quotidien','rdv']::text[], 'mid', 3, 3, 'Iris Poudré par Maison Verlaine, une composition floral et boise pensée pour bureau et quotidien.'),
  ('Forêt d''Hiver', 'Rivière & Fils', 'Unisexe', ARRAY['boise','aromatique']::text[], ARRAY['Vétiver','Bois de santal','Lavande']::text[], ARRAY['rassurant','discret']::text[], ARRAY['quotidien','hiver']::text[], 'eco', 2, 3, 'Forêt d''Hiver par Rivière & Fils, une composition boise et aromatique pensée pour quotidien et hiver.'),
  ('Cuir & Épices', 'Atelier Noir', 'Homme', ARRAY['cuir','oriental']::text[], ARRAY['Cuir','Safran','Cardamome','Fève tonka']::text[], ARRAY['original','puissant']::text[], ARRAY['soiree','rdv']::text[], 'premium', 4, 4, 'Cuir & Épices par Atelier Noir, une composition cuir et oriental pensée pour soiree et rdv.'),
  ('Rose Poivrée', 'Maison Verlaine', 'Femme', ARRAY['floral','oriental']::text[], ARRAY['Rose','Poivre rose','Ambre']::text[], ARRAY['sexy','elegant']::text[], ARRAY['rdv','soiree','mariage']::text[], 'mid', 3, 3, 'Rose Poivrée par Maison Verlaine, une composition floral et oriental pensée pour rdv et soiree.'),
  ('Coco Solaire', 'Maison Ferrand', 'Unisexe', ARRAY['gourmand','marin']::text[], ARRAY['Coco','Musc','Bergamote']::text[], ARRAY['rassurant','original']::text[], ARRAY['ete','quotidien']::text[], 'eco', 2, 2, 'Coco Solaire par Maison Ferrand, une composition gourmand et marin pensée pour ete et quotidien.'),
  ('Patchouli Intense', 'Atelier Noir', 'Homme', ARRAY['boise','oriental']::text[], ARRAY['Patchouli','Ambre','Vétiver','Fève tonka']::text[], ARRAY['puissant','luxueux']::text[], ARRAY['soiree','hiver']::text[], 'premium', 5, 4, 'Patchouli Intense par Atelier Noir, une composition boise et oriental pensée pour soiree et hiver.'),
  ('Muguet Frais', 'Maison Verlaine', 'Femme', ARRAY['floral','agrumes']::text[], ARRAY['Jasmin','Bergamote','Musc']::text[], ARRAY['discret','rassurant']::text[], ARRAY['bureau','quotidien','ete']::text[], 'eco', 2, 2, 'Muguet Frais par Maison Verlaine, une composition floral et agrumes pensée pour bureau et quotidien.');

insert into perfume_offers (perfume_id, retailer_id, price, format, in_stock, affiliate_url) values
  (1, 1, 78.04, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sillage-dore?ref=osmia'),
  (1, 2, 75.25, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sillage-dore?ref=osmia'),
  (1, 3, 69.59, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sillage-dore?ref=osmia'),
  (2, 1, 136.91, '50ml', true, 'https://example-retailer.com/product/atelier-noir-nuit-de-cuir?ref=osmia'),
  (2, 2, 131.14, '50ml', true, 'https://example-retailer.com/product/atelier-noir-nuit-de-cuir?ref=osmia'),
  (3, 1, 48.33, '50ml', true, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (3, 4, 42.23, '50ml', true, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (3, 3, 46.08, '50ml', false, 'https://example-retailer.com/product/riviere-fils-vent-marin?ref=osmia'),
  (4, 1, 80.99, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-jardin-secret?ref=osmia'),
  (4, 2, 81.94, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-jardin-secret?ref=osmia'),
  (5, 1, 207.31, '50ml', true, 'https://example-retailer.com/product/atelier-noir-poudre-d-ambre?ref=osmia'),
  (5, 4, 212.6, '50ml', false, 'https://example-retailer.com/product/atelier-noir-poudre-d-ambre?ref=osmia'),
  (5, 2, 219.6, '50ml', false, 'https://example-retailer.com/product/atelier-noir-poudre-d-ambre?ref=osmia'),
  (6, 1, 94.42, '50ml', true, 'https://example-retailer.com/product/riviere-fils-bois-sauvage?ref=osmia'),
  (6, 3, 91.73, '50ml', false, 'https://example-retailer.com/product/riviere-fils-bois-sauvage?ref=osmia'),
  (7, 2, 45.86, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-sucre-d-orient?ref=osmia'),
  (7, 4, 44.71, '50ml', false, 'https://example-retailer.com/product/maison-ferrand-sucre-d-orient?ref=osmia'),
  (8, 4, 244.2, '50ml', true, 'https://example-retailer.com/product/atelier-noir-etoffe-noire?ref=osmia'),
  (8, 2, 246.63, '50ml', false, 'https://example-retailer.com/product/atelier-noir-etoffe-noire?ref=osmia'),
  (9, 2, 96.96, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-fleur-blanche?ref=osmia'),
  (9, 3, 93.75, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-fleur-blanche?ref=osmia'),
  (9, 1, 87.57, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-fleur-blanche?ref=osmia'),
  (10, 2, 42.9, '50ml', true, 'https://example-retailer.com/product/riviere-fils-citron-vert-sel?ref=osmia'),
  (10, 1, 40.61, '50ml', true, 'https://example-retailer.com/product/riviere-fils-citron-vert-sel?ref=osmia'),
  (10, 4, 37.41, '50ml', true, 'https://example-retailer.com/product/riviere-fils-citron-vert-sel?ref=osmia'),
  (11, 2, 197.5, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (11, 1, 195.47, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (11, 4, 204.71, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-ambre-royal?ref=osmia'),
  (12, 3, 78.6, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-iris-poudre?ref=osmia'),
  (12, 4, 90.92, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-iris-poudre?ref=osmia'),
  (12, 2, 86.65, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-iris-poudre?ref=osmia'),
  (13, 3, 56.18, '50ml', true, 'https://example-retailer.com/product/riviere-fils-foret-d-hiver?ref=osmia'),
  (13, 4, 56.78, '50ml', true, 'https://example-retailer.com/product/riviere-fils-foret-d-hiver?ref=osmia'),
  (14, 1, 143.79, '50ml', true, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (14, 3, 160.54, '50ml', true, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (14, 2, 138.76, '50ml', true, 'https://example-retailer.com/product/atelier-noir-cuir-epices?ref=osmia'),
  (15, 4, 93.29, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-rose-poivree?ref=osmia'),
  (15, 3, 90.86, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-rose-poivree?ref=osmia'),
  (16, 1, 40.78, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-coco-solaire?ref=osmia'),
  (16, 4, 42.33, '50ml', true, 'https://example-retailer.com/product/maison-ferrand-coco-solaire?ref=osmia'),
  (17, 1, 167.47, '50ml', true, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (17, 4, 157.24, '50ml', false, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (17, 2, 149.07, '50ml', true, 'https://example-retailer.com/product/atelier-noir-patchouli-intense?ref=osmia'),
  (18, 1, 52.68, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-muguet-frais?ref=osmia'),
  (18, 2, 46.4, '50ml', true, 'https://example-retailer.com/product/maison-verlaine-muguet-frais?ref=osmia'),
  (18, 3, 49.2, '50ml', false, 'https://example-retailer.com/product/maison-verlaine-muguet-frais?ref=osmia');

insert into price_history (offer_id, price, recorded_at)
select o.id, greatest(5, round((o.price * (1 + (random() * 0.14 - 0.07)))::numeric, 2)), now() - (d || ' days')::interval
from perfume_offers o, generate_series(0, 55, 7) as d;

