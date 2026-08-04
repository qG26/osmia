"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AMBIANCES,
  AMBIANCE_LABELS,
  BUDGET_LABELS,
  BUDGET_TIERS,
  GENDERS,
  NOTES,
  OCCASIONS,
  OCCASION_LABELS,
  STYLES,
  STYLE_LABELS,
} from "@/lib/reference-data";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChipSelect } from "@/components/quiz/chip-select";

type QuizState = {
  gender: string[];
  ambiances: string[];
  styles: string[];
  occasions: string[];
  budget_tier: string[];
  notes_loved: string[];
  notes_disliked: string[];
};

function buildInitialState(profile?: Profile | null): QuizState {
  return {
    gender: profile?.gender ? [profile.gender] : [],
    ambiances: profile?.ambiances ?? [],
    styles: profile?.styles ?? [],
    occasions: profile?.occasions ?? [],
    budget_tier: profile?.budget_tier ? [profile.budget_tier] : [],
    notes_loved: profile?.notes_loved ?? [],
    notes_disliked: profile?.notes_disliked ?? [],
  };
}

const STEP_COUNT = 7;

export function QuizWizard({ initialProfile }: { initialProfile?: Profile | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<QuizState>(() => buildInitialState(initialProfile));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = ((step + 1) / STEP_COUNT) * 100;

  function update<K extends keyof QuizState>(key: K, values: string[]) {
    setState((prev) => ({ ...prev, [key]: values }));
  }

  const steps: {
    key: keyof QuizState;
    title: string;
    subtitle: string;
    options: { value: string; label: string }[];
    multiple: boolean;
    required: boolean;
  }[] = [
    {
      key: "gender",
      title: "Pour qui cherchez-vous un parfum ?",
      subtitle: "Cela affine les compositions que nous vous proposons.",
      options: GENDERS.map((g) => ({ value: g, label: g })),
      multiple: false,
      required: true,
    },
    {
      key: "ambiances",
      title: "Quelles ambiances vous attirent ?",
      subtitle: "Choisissez celles qui évoquent le mieux votre univers.",
      options: AMBIANCES.map((a) => ({ value: a, label: AMBIANCE_LABELS[a] })),
      multiple: true,
      required: true,
    },
    {
      key: "styles",
      title: "Quel style vous ressemble ?",
      subtitle: "Sélectionnez un ou plusieurs mots qui vous définissent.",
      options: STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] })),
      multiple: true,
      required: true,
    },
    {
      key: "occasions",
      title: "Pour quelles occasions ?",
      subtitle: "Quand porterez-vous votre parfum le plus souvent ?",
      options: OCCASIONS.map((o) => ({ value: o, label: OCCASION_LABELS[o] })),
      multiple: true,
      required: true,
    },
    {
      key: "budget_tier",
      title: "Quel est votre budget ?",
      subtitle: "Nous privilégierons les offres dans cette fourchette.",
      options: BUDGET_TIERS.map((b) => ({ value: b, label: BUDGET_LABELS[b] })),
      multiple: false,
      required: true,
    },
    {
      key: "notes_loved",
      title: "Quelles notes aimez-vous ?",
      subtitle: "Les notes que vous recherchez systématiquement.",
      options: NOTES.map((n) => ({ value: n, label: n })),
      multiple: true,
      required: false,
    },
    {
      key: "notes_disliked",
      title: "Quelles notes évitez-vous ?",
      subtitle: "Nous écarterons les parfums qui en contiennent trop.",
      options: NOTES.filter((n) => !state.notes_loved.includes(n)).map((n) => ({
        value: n,
        label: n,
      })),
      multiple: true,
      required: false,
    },
  ];

  const current = steps[step];
  const currentValue = state[current.key];
  const canContinue = !current.required || currentValue.length > 0;
  const isLastStep = step === steps.length - 1;

  async function handleNext() {
    if (!canContinue) return;
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: state.gender[0] ?? null,
          ambiances: state.ambiances,
          styles: state.styles,
          occasions: state.occasions,
          budget_tier: state.budget_tier[0] ?? null,
          notes_loved: state.notes_loved,
          notes_disliked: state.notes_disliked,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Impossible d'enregistrer votre profil.");
      }
      router.push("/resultats");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span className="font-numeric">
            Étape {step + 1} / {STEP_COUNT}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-3xl">{current.title}</h1>
          <p className="mt-2 text-foreground/60">{current.subtitle}</p>
        </div>

        <ChipSelect
          options={current.options}
          selected={currentValue}
          onChange={(values) => update(current.key, values)}
          multiple={current.multiple}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
          Retour
        </Button>
        <Button onClick={handleNext} disabled={!canContinue || submitting}>
          {submitting ? "Enregistrement…" : isLastStep ? "Voir mes résultats" : "Continuer"}
        </Button>
      </div>
    </div>
  );
}
