"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SearchFilters } from "@/lib/natural-search";

export function NaturalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const filters: SearchFilters = data.filters;

      const params = new URLSearchParams();
      if (filters.familles.length) params.set("familles", filters.familles.join(","));
      if (filters.styles.length) params.set("styles", filters.styles.join(","));
      if (filters.budgets.length) params.set("budgets", filters.budgets.join(","));
      if (filters.notes.length) params.set("notes", filters.notes.join(","));
      if (filters.saison) params.set("saison", filters.saison);

      router.push(`/decouverte?${params.toString()}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ex : un boisé discret pour l'hiver, pas cher"
        aria-label="Recherche en langage naturel"
      />
      <Button type="submit" size="icon" disabled={loading} aria-label="Rechercher">
        <Search size={16} />
      </Button>
    </form>
  );
}
