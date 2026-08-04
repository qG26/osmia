"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { FAMILIES, FAMILY_LABELS, type Family } from "@/lib/reference-data";

type TickProps = {
  x: number;
  y: number;
  cx: number;
  cy: number;
  payload: { value: string };
};

// Positionne chaque label le long de son propre rayon (plutôt qu'avec un
// simple décalage x/y fixe) pour maximiser l'écart entre labels voisins —
// notamment "Gourmand" et "Aromatique", proches à 45° l'un de l'autre — et
// garantir qu'aucun, y compris "Aromatique" (le mot le plus long), ne soit
// jamais tronqué ni chevauché, même dans une carte étroite (colonne latérale).
function FamilyTick({ x, y, cx, cy, payload }: TickProps) {
  const label = FAMILY_LABELS[payload.value as Family];
  const dxFromCenter = x - cx;
  const dyFromCenter = y - cy;
  const angle = Math.atan2(dyFromCenter, dxFromCenter);

  // Pousse le label plus loin le long de son rayon : l'écart entre deux
  // labels voisins croît avec la distance au centre, donc ce décalage
  // radial sépare mieux les points proches qu'un simple padding fixe.
  const radialPush = 16;
  const px = x + Math.cos(angle) * radialPush;
  const py = y + Math.sin(angle) * radialPush;

  const isRight = dxFromCenter > 8;
  const isLeft = dxFromCenter < -8;
  const anchor: "start" | "end" | "middle" = isRight ? "start" : isLeft ? "end" : "middle";

  return (
    <text
      x={px}
      y={py + 4}
      textAnchor={anchor}
      fill="var(--foreground)"
      fillOpacity={0.7}
      style={{ fontFamily: "var(--font-manrope)", fontSize: 11 }}
    >
      {label}
    </text>
  );
}

export function OlfactoryRadarChart({ data }: { data: Record<Family, number> }) {
  const max = Math.max(1, ...FAMILIES.map((f) => data[f] ?? 0));
  const chartData = FAMILIES.map((family) => ({ family, value: data[family] ?? 0 }));

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          outerRadius="55%"
          margin={{ top: 24, right: 40, bottom: 24, left: 40 }}
        >
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis dataKey="family" tick={<FamilyTick x={0} y={0} cx={0} cy={0} payload={{ value: "" }} />} />
          <PolarRadiusAxis angle={90} domain={[0, max]} tick={false} axisLine={false} tickCount={4} />
          <Radar
            name="Votre profil"
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
