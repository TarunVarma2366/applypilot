const STAGE_STYLES: Record<string, string> = {
  SAVED: "bg-slate-50 text-slate-700 ring-slate-200",
  APPLIED: "bg-blue-50 text-blue-700 ring-blue-200",
  OA: "bg-purple-50 text-purple-700 ring-purple-200",
  INTERVIEW: "bg-amber-50 text-amber-800 ring-amber-200",
  OFFER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function StatusBadge({ stage }: { stage: string }) {
  const style = STAGE_STYLES[stage] ?? "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        style,
      ].join(" ")}
      title={`Stage: ${stage}`}
    >
      {stage}
    </span>
  );
}
