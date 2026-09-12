import { useState } from "react";
import { Link } from "react-router-dom";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Mes données CSV sont-elles envoyées quelque part ?",
    answer:
      "Non. Le fichier est lu et analysé entièrement dans votre navigateur, avec JavaScript. Aucune requête réseau n'est déclenchée par l'analyse, aucun serveur ne reçoit vos données. Seule exception, facultative et désactivée par défaut : dans l'analyseur Shopping, si vous cochez « Afficher les vignettes produit », votre navigateur va chercher ces images chez Google, qui les héberge. Même dans ce cas, rien du contenu de votre fichier n'est transmis.",
  },
  {
    question: "AdsLens est-il vraiment gratuit ?",
    answer: "Oui, sans limite d'usage pour l'instant : pas de compte, pas de quota, pas de paiement.",
  },
  {
    question: "Faut-il connecter mon compte Google Ads ?",
    answer:
      "Non, aucune connexion ni autorisation API n'est requise. Vous exportez un fichier CSV depuis l'interface Google Ads, puis vous l'importez manuellement ici.",
  },
  {
    question: "Quels formats de fichiers sont acceptés ?",
    answer:
      "Les exports CSV du rapport « Termes de recherche » et du rapport « Produits » (Shopping standard ou Performance Max) depuis Google Ads.",
  },
  {
    question: "La détection géographique couvre-t-elle d'autres pays ?",
    answer:
      "Pour l'instant, la détection de villes est limitée à la France. D'autres zones pourront être ajoutées par la suite.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800"
      >
        {question}
        <span className="ml-4 text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">{answer}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Repérez les dépenses publicitaires inutiles
          <br />
          <span className="bg-clip-text text-transparent brand-gradient">dans vos exports Google Ads</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          AdsLens analyse vos rapports CSV Google Ads directement dans votre navigateur. Aucune
          donnée n'est envoyée à un serveur : tout reste sur votre machine.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/search-analyzer"
            className="brand-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm"
          >
            Analyser mes termes de recherche
          </Link>
          <Link
            to="/shopping-analyzer"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700"
          >
            Analyser mon flux Shopping / PMax
          </Link>
        </div>
      </section>

      {/* Outils */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2 sm:px-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-black text-slate-900">Analyseur de termes de recherche</h2>
            <p className="mt-2 text-sm text-slate-600">
              Importez votre rapport « Termes de recherche ». AdsLens détecte les requêtes hors de
              vos zones géographiques et les dépenses sans conversion, puis suggère les mots-clés
              négatifs les plus étroits à exclure.
            </p>
            <Link to="/search-analyzer" className="mt-4 inline-block text-sm font-bold text-brand-blue">
              Ouvrir l'outil →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-black text-slate-900">Analyseur Shopping / PMax</h2>
            <p className="mt-2 text-sm text-slate-600">
              Importez votre rapport « Produits ». AdsLens calcule le ROAS de chaque produit et
              identifie les « zombies » : ceux qui dépensent au-delà d'un seuil sans jamais
              convertir.
            </p>
            <Link to="/shopping-analyzer" className="mt-4 inline-block text-sm font-bold text-brand-blue">
              Ouvrir l'outil →
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-black text-slate-900">Comment ça marche</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Exporter depuis Google Ads",
              text: "Téléchargez le rapport concerné au format CSV depuis l'interface Google Ads.",
            },
            {
              step: "2",
              title: "Analyser dans AdsLens",
              text: "Déposez le fichier : l'analyse se fait en quelques secondes, localement.",
            },
            {
              step: "3",
              title: "Réimporter les exclusions",
              text: "Exportez les négatifs ou produits à exclure au format Google Ads, et réimportez-les.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full brand-gradient font-black text-white">
                {item.step}
              </div>
              <h3 className="mt-3 font-bold text-slate-800">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-black text-slate-900">Questions fréquentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
