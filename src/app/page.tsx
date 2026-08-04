import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlaconIllustration } from "@/components/flacon-illustration";
import type { Family } from "@/lib/reference-data";

const SHOWCASE_FAMILIES: Family[] = ["boise", "floral", "oriental", "agrumes", "cuir"];

const STEPS = [
  {
    title: "Répondez au quiz",
    text: "Sept étapes courtes sur vos ambiances, votre style et votre budget.",
  },
  {
    title: "Recevez votre empreinte",
    text: "Un radar olfactif qui traduit vos goûts en huit familles lisibles.",
  },
  {
    title: "Comparez les offres",
    text: "Chaque recommandation pointe vers la meilleure offre disponible.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <span className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-widest text-foreground/60">
          Recommandation olfactive par IA
        </span>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
          Votre goût du parfum, <em className="italic">enfin lisible.</em>
        </h1>
        <p className="max-w-xl text-lg text-foreground/70">
          OSMIA apprend votre profil olfactif en quelques minutes, calcule une
          compatibilité pour chaque parfum, explique pourquoi il vous
          correspond, et affiche la meilleure offre du moment.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/quiz">Commencer le quiz</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/decouverte">Explorer le catalogue</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-line bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-5">
          {SHOWCASE_FAMILIES.map((family) => (
            <div key={family} className="flex flex-col items-center gap-3">
              <FlaconIllustration family={family} className="h-24 w-16" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <h2 className="font-serif text-3xl">Comment ça marche</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="font-numeric text-sm text-accent">
                0{i + 1}
              </span>
              <h3 className="font-serif text-xl">{step.title}</h3>
              <p className="text-foreground/60">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
