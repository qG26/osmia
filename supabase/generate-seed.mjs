// Génère supabase/seed.sql à partir du jeu de données produit.
// Usage: node supabase/generate-seed.mjs > supabase/seed.sql

const perfumes = [
  {"name":"Sillage Doré","brand":"Maison Ferrand","gender":"Homme","families":["agrumes","boise"],"notes":["Bergamote","Bois de santal","Poivre rose","Musc"],"style":["elegant","discret"],"occasions":["bureau","quotidien","ete"],"budget_tier":"mid","price":75,"intensity":3,"longevity":3},
  {"name":"Nuit de Cuir","brand":"Atelier Noir","gender":"Homme","families":["cuir","oriental"],"notes":["Cuir","Ambre","Safran","Fève tonka"],"style":["puissant","sexy","luxueux"],"occasions":["soiree","rdv","hiver"],"budget_tier":"premium","price":140,"intensity":5,"longevity":5},
  {"name":"Vent Marin","brand":"Rivière & Fils","gender":"Unisexe","families":["marin","agrumes"],"notes":["Citron","Musc","Bergamote"],"style":["discret","rassurant"],"occasions":["quotidien","bureau","ete"],"budget_tier":"eco","price":45,"intensity":2,"longevity":2},
  {"name":"Jardin Secret","brand":"Maison Verlaine","gender":"Femme","families":["floral"],"notes":["Jasmin","Rose","Iris","Musc"],"style":["elegant","rassurant"],"occasions":["quotidien","rdv","ete"],"budget_tier":"mid","price":80,"intensity":3,"longevity":3},
  {"name":"Poudre d'Ambre","brand":"Atelier Noir","gender":"Femme","families":["oriental","gourmand"],"notes":["Vanille","Ambre","Fève tonka","Cardamome"],"style":["sexy","luxueux"],"occasions":["soiree","rdv","hiver"],"budget_tier":"luxe","price":220,"intensity":5,"longevity":5},
  {"name":"Bois Sauvage","brand":"Rivière & Fils","gender":"Homme","families":["boise","aromatique"],"notes":["Bois de santal","Vétiver","Cardamome"],"style":["puissant","original"],"occasions":["quotidien","hiver"],"budget_tier":"mid","price":90,"intensity":3,"longevity":3},
  {"name":"Sucre d'Orient","brand":"Maison Ferrand","gender":"Unisexe","families":["gourmand","oriental"],"notes":["Vanille","Coco","Fève tonka","Cardamome"],"style":["original","rassurant"],"occasions":["quotidien","ete"],"budget_tier":"eco","price":48,"intensity":3,"longevity":2},
  {"name":"Étoffe Noire","brand":"Atelier Noir","gender":"Homme","families":["cuir","boise"],"notes":["Cuir","Bois de santal","Patchouli"],"style":["puissant","luxueux"],"occasions":["soiree","hiver","mariage"],"budget_tier":"luxe","price":250,"intensity":5,"longevity":5},
  {"name":"Fleur Blanche","brand":"Maison Verlaine","gender":"Femme","families":["floral"],"notes":["Tubéreuse","Jasmin","Musc"],"style":["sexy","original"],"occasions":["soiree","rdv","ete"],"budget_tier":"mid","price":95,"intensity":4,"longevity":3},
  {"name":"Citron Vert & Sel","brand":"Rivière & Fils","gender":"Unisexe","families":["agrumes","marin"],"notes":["Citron","Bergamote","Musc"],"style":["discret","rassurant"],"occasions":["quotidien","bureau","ete"],"budget_tier":"eco","price":40,"intensity":2,"longevity":2},
  {"name":"Ambre Royal","brand":"Maison Ferrand","gender":"Homme","families":["oriental","boise"],"notes":["Ambre","Bois de santal","Safran","Poivre rose"],"style":["luxueux","puissant"],"occasions":["soiree","rdv","mariage","hiver"],"budget_tier":"luxe","price":210,"intensity":5,"longevity":5},
  {"name":"Iris Poudré","brand":"Maison Verlaine","gender":"Femme","families":["floral","boise"],"notes":["Iris","Bois de santal","Musc","Cardamome"],"style":["elegant","discret"],"occasions":["bureau","quotidien","rdv"],"budget_tier":"mid","price":85,"intensity":3,"longevity":3},
  {"name":"Forêt d'Hiver","brand":"Rivière & Fils","gender":"Unisexe","families":["boise","aromatique"],"notes":["Vétiver","Bois de santal","Lavande"],"style":["rassurant","discret"],"occasions":["quotidien","hiver"],"budget_tier":"eco","price":55,"intensity":2,"longevity":3},
  {"name":"Cuir & Épices","brand":"Atelier Noir","gender":"Homme","families":["cuir","oriental"],"notes":["Cuir","Safran","Cardamome","Fève tonka"],"style":["original","puissant"],"occasions":["soiree","rdv"],"budget_tier":"premium","price":150,"intensity":4,"longevity":4},
  {"name":"Rose Poivrée","brand":"Maison Verlaine","gender":"Femme","families":["floral","oriental"],"notes":["Rose","Poivre rose","Ambre"],"style":["sexy","elegant"],"occasions":["rdv","soiree","mariage"],"budget_tier":"mid","price":98,"intensity":3,"longevity":3},
  {"name":"Coco Solaire","brand":"Maison Ferrand","gender":"Unisexe","families":["gourmand","marin"],"notes":["Coco","Musc","Bergamote"],"style":["rassurant","original"],"occasions":["ete","quotidien"],"budget_tier":"eco","price":42,"intensity":2,"longevity":2},
  {"name":"Patchouli Intense","brand":"Atelier Noir","gender":"Homme","families":["boise","oriental"],"notes":["Patchouli","Ambre","Vétiver","Fève tonka"],"style":["puissant","luxueux"],"occasions":["soiree","hiver"],"budget_tier":"premium","price":160,"intensity":5,"longevity":4},
  {"name":"Muguet Frais","brand":"Maison Verlaine","gender":"Femme","families":["floral","agrumes"],"notes":["Jasmin","Bergamote","Musc"],"style":["discret","rassurant"],"occasions":["bureau","quotidien","ete"],"budget_tier":"eco","price":50,"intensity":2,"longevity":2}
];

const retailers = [
  { name: "Le Comptoir du Parfum", logo_url: null, affiliate_base_url: "https://example-retailer.com/product/{slug}?ref=osmia", commission_rate: 0.08 },
  { name: "Essence & Co", logo_url: null, affiliate_base_url: "https://example-retailer.com/product/{slug}?ref=osmia", commission_rate: 0.10 },
  { name: "Flacon Paris", logo_url: null, affiliate_base_url: "https://example-retailer.com/product/{slug}?ref=osmia", commission_rate: 0.07 },
  { name: "Nez Libre", logo_url: null, affiliate_base_url: "https://example-retailer.com/product/{slug}?ref=osmia", commission_rate: 0.09 },
];

function esc(v) {
  if (v === null || v === undefined) return "null";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function arr(values) {
  return `ARRAY[${values.map(esc).join(",")}]::text[]`;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// PRNG déterministe pour des variations de prix reproductibles entre exécutions.
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}

const lines = [];
lines.push("-- OSMIA — jeu de données de démonstration");
lines.push("-- Généré par supabase/generate-seed.mjs — ne pas éditer à la main.\n");

lines.push("truncate table price_history, perfume_offers, affiliate_clicks, price_alerts, favorites, perfumes, retailers restart identity cascade;\n");

lines.push("insert into retailers (name, logo_url, affiliate_base_url, commission_rate) values");
lines.push(
  retailers
    .map(
      (r) =>
        `  (${esc(r.name)}, ${esc(r.logo_url)}, ${esc(r.affiliate_base_url)}, ${r.commission_rate})`
    )
    .join(",\n") + ";\n"
);

lines.push("insert into perfumes (name, brand, gender, families, notes, style, occasions, budget_tier, intensity, longevity, description) values");
lines.push(
  perfumes
    .map((p) => {
      const description = `${p.name} par ${p.brand}, une composition ${p.families.join(" et ")} pensée pour ${p.occasions.slice(0, 2).join(" et ")}.`;
      return `  (${esc(p.name)}, ${esc(p.brand)}, ${esc(p.gender)}, ${arr(p.families)}, ${arr(p.notes)}, ${arr(p.style)}, ${arr(p.occasions)}, ${esc(p.budget_tier)}, ${p.intensity}, ${p.longevity}, ${esc(description)})`;
    })
    .join(",\n") + ";\n"
);

// Offres : 2 à 3 par parfum, prix variant légèrement autour du prix de référence.
const offerRows = [];
perfumes.forEach((p, i) => {
  const perfumeId = i + 1;
  const offerCount = 2 + Math.floor(rand() * 2); // 2 ou 3
  const retailerIndices = [...retailers.keys()].sort(() => rand() - 0.5).slice(0, offerCount);
  const slug = slugify(`${p.brand}-${p.name}`);
  retailerIndices.forEach((rIdx) => {
    const retailerId = rIdx + 1;
    const variation = 1 + (rand() * 0.16 - 0.08); // +/-8%
    const price = Math.max(5, Math.round(p.price * variation * 100) / 100);
    const inStock = rand() > 0.12;
    const url = retailers[rIdx].affiliate_base_url.replace("{slug}", slug);
    offerRows.push(
      `  (${perfumeId}, ${retailerId}, ${price}, '50ml', ${inStock}, ${esc(url)})`
    );
  });
});

lines.push("insert into perfume_offers (perfume_id, retailer_id, price, format, in_stock, affiliate_url) values");
lines.push(offerRows.join(",\n") + ";\n");

// Historique de prix : quelques points par offre sur les 60 derniers jours.
lines.push("insert into price_history (offer_id, price, recorded_at)");
lines.push("select o.id, greatest(5, round((o.price * (1 + (random() * 0.14 - 0.07)))::numeric, 2)), now() - (d || ' days')::interval");
lines.push("from perfume_offers o, generate_series(0, 55, 7) as d;\n");

process.stdout.write(lines.join("\n") + "\n");
