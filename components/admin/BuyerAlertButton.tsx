"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { notifyMatchingBuyers } from "@/app/admin/actions";

/**
 * Käufer-Alarm für ein Inserat: erst zählen, wer passt, dann mit zweitem
 * Klick an alle vorgemerkten Käufer mit aktivem Alarm senden.
 */
export function BuyerAlertButton({ listingId, active }: { listingId: string; active: boolean }) {
  const [state, setState] = useState<{ step: "idle" | "counting" | "confirm" | "sending" | "done"; matches: number; sent: number; error: string | null }>({
    step: "idle",
    matches: 0,
    sent: 0,
    error: null,
  });

  if (!active) return null;

  async function count() {
    setState({ step: "counting", matches: 0, sent: 0, error: null });
    const res = await notifyMatchingBuyers(listingId, true);
    setState({ step: res.error ? "done" : "confirm", matches: res.matches, sent: 0, error: res.error });
  }

  async function send() {
    setState((s) => ({ ...s, step: "sending" }));
    const res = await notifyMatchingBuyers(listingId, false);
    setState({ step: "done", matches: res.matches, sent: res.sent, error: res.error });
  }

  const linkStyle = { background: "none", border: "none", color: "var(--blue)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 } as const;

  return (
    <span className="flex items-center gap-1.5 td-light">
      <BellRing className="h-3 w-3" strokeWidth={1.75} />
      {state.step === "idle" && (
        <button type="button" onClick={count} style={linkStyle}>
          Käufer-Alarm
        </button>
      )}
      {state.step === "counting" && "zählt …"}
      {state.step === "confirm" &&
        (state.matches === 0 ? (
          "Keine neuen passenden Käufer"
        ) : (
          <>
            {state.matches} passende Käufer ·{" "}
            <button type="button" onClick={send} style={linkStyle}>
              jetzt informieren
            </button>
          </>
        ))}
      {state.step === "sending" && "sendet …"}
      {state.step === "done" && (state.error ? <span style={{ color: "var(--red)" }}>{state.error}</span> : `${state.sent} informiert`)}
    </span>
  );
}
