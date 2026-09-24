import { saleDeadlineProgress } from "@/lib/dates";

export function SaleDeadlineBar({
  activatedAt,
  deadlineMonths = 4,
}: {
  activatedAt: string | null;
  deadlineMonths?: number;
}) {
  if (!activatedAt) {
    return (
      <div className="text-xs text-ivory-dim/50">Noch nicht aktiviert — Frist läuft ab Online-Schaltung.</div>
    );
  }

  const { pct, remainingDays } = saleDeadlineProgress(activatedAt, deadlineMonths);

  const color = pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-amber" : "bg-blueprint";
  const label =
    remainingDays > 0
      ? `Noch ${remainingDays} ${remainingDays === 1 ? "Tag" : "Tage"} bis zur ${deadlineMonths}-Monats-Frist`
      : `Frist abgelaufen (seit ${Math.abs(remainingDays)} ${Math.abs(remainingDays) === 1 ? "Tag" : "Tagen"})`;

  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-3">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-ivory-dim/70">{label}</div>
    </div>
  );
}
