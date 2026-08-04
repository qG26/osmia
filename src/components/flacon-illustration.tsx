import { FAMILY_COLORS, type Family } from "@/lib/reference-data";

/** Illustration vectorielle abstraite d'un flacon, teintée selon la famille olfactive dominante. */
export function FlaconIllustration({
  family,
  className,
}: {
  family: Family;
  className?: string;
}) {
  const color = FAMILY_COLORS[family];
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      role="img"
      aria-label={`Illustration d'un flacon, famille ${family}`}
    >
      <rect x="38" y="8" width="24" height="16" rx="3" fill={color} opacity="0.85" />
      <rect x="43" y="2" width="14" height="10" rx="2" fill={color} opacity="0.5" />
      <path
        d="M30 30 Q30 24 38 24 H62 Q70 24 70 30 V50 Q82 60 82 90 V122 Q82 132 72 132 H28 Q18 132 18 122 V90 Q18 60 30 50 Z"
        fill={color}
        opacity="0.18"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M30 30 Q30 24 38 24 H62 Q70 24 70 30 V50 Q82 60 82 90 V96 H18 V90 Q18 60 30 50 Z"
        fill={color}
        opacity="0.55"
      />
      <circle cx="50" cy="86" r="4" fill={color} opacity="0.9" />
    </svg>
  );
}
