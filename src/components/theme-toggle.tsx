"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    const resolved =
      current === "dark" || current === "light"
        ? current
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    // Lecture ponctuelle de l'état DOM/OS au montage, pas un effet miroir continu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("osmia-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le mode sombre"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground/70 transition hover:text-foreground hover:border-accent"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
