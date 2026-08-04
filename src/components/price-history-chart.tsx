"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export type PricePoint = { date: string; price: number };

export function PriceHistoryChart({ data }: { data: PricePoint[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-foreground/50">Historique de prix insuffisant.</p>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--foreground)", fillOpacity: 0.5 }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--foreground)", fillOpacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value).toFixed(2)}€`, "Prix minimum"]}
          />
          <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
