"use client";

import { cn } from "@/lib/utils";

export function ChipSelect({
  options,
  selected,
  onChange,
  multiple = true,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}) {
  function toggle(value: string) {
    if (!multiple) {
      onChange([value]);
      return;
    }
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm transition-colors",
              active
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-foreground/70 hover:border-accent/60 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
