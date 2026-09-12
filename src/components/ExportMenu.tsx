import { useEffect, useRef, useState } from "react";
import type { ExportFormat } from "../types";

interface ExportMenuProps {
  disabled?: boolean;
  onSelectFormat: (format: ExportFormat) => void;
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; description: string }[] = [
  {
    format: "google-ads",
    label: "Google Ads (CSV)",
    description: "Prêt à réimporter dans l'interface Google Ads",
  },
  {
    format: "simple-list",
    label: "Liste simple (TXT)",
    description: "Un élément par ligne, pour copier-coller",
  },
  {
    format: "detailed",
    label: "Export détaillé (CSV)",
    description: "Pour archivage et justification client",
  },
];

/** Menu déroulant de sélection du format d'export. */
export default function ExportMenu({ disabled = false, onSelectFormat }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="brand-gradient w-full rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Exporter la sélection ▾
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:w-80"
        >
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelectFormat(option.format);
              }}
              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100"
            >
              <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
              <span className="block text-xs text-slate-500">{option.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
