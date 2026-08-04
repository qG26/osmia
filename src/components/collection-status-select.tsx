"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { FAVORITE_STATUSES, FAVORITE_STATUS_LABELS } from "@/lib/reference-data";
import { cn } from "@/lib/utils";

export function CollectionStatusSelect({
  perfumeId,
  initialStatus,
  loggedIn,
}: {
  perfumeId: number;
  initialStatus: string | null;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <p className="text-sm text-foreground/50">
        <a href="/login" className="text-accent hover:underline">
          Connectez-vous
        </a>{" "}
        pour ajouter ce parfum à votre collection.
      </p>
    );
  }

  async function setValue(next: string | null) {
    setStatus(next);
    startTransition(async () => {
      if (next === null) {
        await fetch(`/api/favorites?perfumeId=${perfumeId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ perfumeId, status: next }),
        });
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FAVORITE_STATUSES.map((s) => {
        const active = status === s;
        return (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => setValue(active ? null : s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50",
              active
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-foreground/60 hover:border-accent/60 hover:text-foreground"
            )}
          >
            {FAVORITE_STATUS_LABELS[s]}
          </button>
        );
      })}
      {status && (
        <button
          type="button"
          onClick={() => setValue(null)}
          disabled={pending}
          className="inline-flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground/70"
        >
          <X size={12} /> retirer
        </button>
      )}
    </div>
  );
}
