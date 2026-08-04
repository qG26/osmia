import { Badge } from "@/components/ui/badge";

function splitNotes(notes: string[]) {
  if (notes.length <= 1) {
    return { tete: notes, coeur: [], fond: [] };
  }
  if (notes.length === 2) {
    return { tete: [notes[0]], coeur: [], fond: [notes[1]] };
  }
  const tete = [notes[0]];
  const fond = [notes[notes.length - 1]];
  const coeur = notes.slice(1, -1);
  return { tete, coeur, fond };
}

export function NotesPyramid({ notes }: { notes: string[] }) {
  const { tete, coeur, fond } = splitNotes(notes);

  const tiers = [
    { label: "Notes de tête", values: tete },
    { label: "Notes de cœur", values: coeur },
    { label: "Notes de fond", values: fond },
  ].filter((tier) => tier.values.length > 0);

  return (
    <div className="flex flex-col gap-5">
      {tiers.map((tier) => (
        <div key={tier.label} className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-foreground/50">{tier.label}</p>
          <div className="flex flex-wrap gap-2">
            {tier.values.map((note) => (
              <Badge key={note}>{note}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
