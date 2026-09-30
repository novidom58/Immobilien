import { saleDeadlineProgress } from "@/lib/dates";

export function SaleDeadlineBar({
  activatedAt,
  deadlineMonths = 4,
}: {
  activatedAt: string | null;
  deadlineMonths?: number;
}) {
  if (!activatedAt) {
    return <div className="td-light" style={{ fontSize: 11 }}>Noch nicht aktiviert — Frist läuft ab Online-Schaltung.</div>;
  }

  const { pct, remainingDays } = saleDeadlineProgress(activatedAt, deadlineMonths);

  const tone = pct >= 90 ? "alert" : pct >= 65 ? "warn" : "";
  const label =
    remainingDays > 0
      ? `Noch ${remainingDays} ${remainingDays === 1 ? "Tag" : "Tage"} bis zur ${deadlineMonths}-Monats-Frist`
      : `Frist abgelaufen (seit ${Math.abs(remainingDays)} ${Math.abs(remainingDays) === 1 ? "Tag" : "Tagen"})`;

  return (
    <div>
      <div className="crm-progress-track">
        <div className={`crm-progress-fill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="td-light" style={{ fontSize: 11, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
