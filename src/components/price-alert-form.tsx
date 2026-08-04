"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PriceAlertForm({
  perfumeId,
  currentPrice,
  loggedIn,
}: {
  perfumeId: number;
  currentPrice: number;
  loggedIn: boolean;
}) {
  const [threshold, setThreshold] = useState(String(Math.floor(currentPrice * 0.9)));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!loggedIn) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(threshold);
    if (!Number.isFinite(value) || value <= 0) return;
    setStatus("saving");
    const res = await fetch("/api/price-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfumeId, thresholdPrice: value }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-line p-6"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Bell size={15} className="text-accent" />
        Alerte de prix
      </div>
      <p className="text-xs text-foreground/50">
        Soyez prévenu quand ce parfum passe sous le prix que vous fixez.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="threshold" className="text-xs text-foreground/50">
            Prix seuil (€)
          </Label>
          <Input
            id="threshold"
            type="number"
            min={1}
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={status === "saving"}>
          {status === "saved" ? <Check size={15} /> : "Activer"}
        </Button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600">Impossible d&apos;enregistrer l&apos;alerte.</p>
      )}
    </form>
  );
}
