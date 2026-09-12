interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "orange" | "red" | "green" | "blue";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-slate-900",
  orange: "text-orange-500",
  red: "text-red-600",
  green: "text-green-600",
  blue: "text-brand-blue",
};

export default function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
