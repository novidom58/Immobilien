"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { endOffMarket, startOffMarket } from "@/app/admin/actions";
import { OFFMARKET_HOURS, offmarketHoursLeft } from "@/lib/offmarket";

/** Off-Market-Vorverkauf starten oder vorzeitig öffentlich schalten. */
export function OffMarketControl({ listingId, status, until }: { listingId: string; status: string; until: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hours = offmarketHoursLeft(until);

  if (status !== "draft" && status !== "active") return null;
  const linkStyle = { background: "none", border: "none", color: "var(--blue)", cursor: "pointer" } as const;

  async function start() {
    if (!window.confirm(`Off-Market starten? Das Objekt wird aktiv, ist ${OFFMARKET_HOURS} Stunden nur für angemeldete Käufer sichtbar und alle passenden Käufer mit Alarm erhalten sofort eine Mail.`)) return;
    setBusy(true);
    const res = await startOffMarket(listingId);
    setBusy(false);
    setMessage(res.error ?? `${res.sent} Käufer informiert`);
    router.refresh();
  }

  async function end() {
    setBusy(true);
    const res = await endOffMarket(listingId);
    setBusy(false);
    setMessage(res.error);
    router.refresh();
  }

  return (
    <span className="flex items-center gap-1.5 td-light">
      <Lock className="h-3 w-3" strokeWidth={1.75} />
      {hours ? (
        <>
          <span className="badge badge-gold">Off-Market noch {hours}h</span>
          <button type="button" disabled={busy} onClick={end} style={linkStyle}>
            jetzt öffentlich
          </button>
        </>
      ) : (
        <button type="button" disabled={busy} onClick={start} style={linkStyle}>
          Off-Market {OFFMARKET_HOURS}h starten
        </button>
      )}
      {message && <span>· {message}</span>}
    </span>
  );
}
