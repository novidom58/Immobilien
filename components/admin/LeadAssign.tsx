"use client";

import { useState, useTransition } from "react";
import { assignLead } from "@/app/admin/actions";

/** Auswahl, wem ein Lead zugeteilt ist (nur für Partner sichtbar). */
export function LeadAssign({ leadId, value, options }: { leadId: string; value: string; options: string[] }) {
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ marginTop: 6 }}>
      <select
        value={current}
        disabled={pending}
        aria-label="Zuteilen an"
        className="filter-select"
        style={{ fontSize: 11.5, padding: "3px 6px", maxWidth: 150 }}
        onChange={(e) => {
          const next = e.target.value;
          const before = current;
          setCurrent(next);
          setError(null);
          startTransition(async () => {
            const res = await assignLead(leadId, next);
            if (res.error) {
              setError(res.error);
              setCurrent(before);
            }
          });
        }}
      >
        <option value="">Nicht zugeteilt</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 3, maxWidth: 180 }}>{error}</div>}
    </div>
  );
}
