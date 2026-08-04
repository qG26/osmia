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

// Positionne chaque label en fonction de son angle pour qu'il ne soit jamais
// tronqué, y compris "Aromatique" (le mot le plus long des 8 familles).
function FamilyTick({ x, y, cx, cy, payload }: TickProps) {
  const label = FAMILY_LABELS[payload.value as Family];
  const dxFromCenter = x - cx;
  const dyFromCenter = y - cy;
  const isRight = dxFromCenter > 8;
  const isLeft = dxFromCenter < -8;
  const anchor: "start" | "end" | "middle" = isRight ? "start" : isLeft ? "end" : "middle";
  const dx = isRight ? 8 : isLeft ? -8 : 0;
  const dy = dyFromCenter > 8 ? 12 : dyFromCenter < -8 ? -4 : 4;

  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor={anchor}
      fill="var(--foreground)"
      fillOpacity={0.7}
      style={{ fontFamily: "var(--font-manrope)", fontSize: 12 }}
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
          margin={{ top: 32, right: 72, bottom: 32, left: 72 }}
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
