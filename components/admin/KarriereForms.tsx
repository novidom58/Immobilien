"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addErtrag, confirmErtrag, deleteErtrag, setAnstellung } from "@/app/admin/(dashboard)/karriere/actions";

type Action = (formData: FormData) => Promise<{ error: string | null }>;

function useAction(action: Action, onDone?: () => void) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (formData: FormData) =>
    start(async () => {
      setError(null);
      const res = await action(formData);
      if (res.error) setError(res.error);
      else {
        onDone?.();
        router.refresh();
      }
    });
  return { pending, error, run };
}

/** Versicherungs- oder Hypothekar-Abschluss erfassen. */
export function ErtragForm({ berater, isPartner }: { berater: string; isPartner: boolean }) {
  const [art, setArt] = useState<"versicherung" | "hypothek">("hypothek");
  const [key, setKey] = useState(0);
  const { pending, error, run } = useAction(addErtrag, () => setKey((k) => k + 1));
  return (
    <form key={key} action={run} style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
      <input type="hidden" name="berater" value={berater} />
      <select name="art" className="field-select" value={art} onChange={(e) => setArt(e.target.value as typeof art)} aria-label="Art">
        <option value="hypothek">Hypothek</option>
        <option value="versicherung">Versicherung</option>
      </select>
      <input name="kunde" className="field-input" placeholder="Kunde" aria-label="Kunde" />
      <input
        name="volumen"
        className="field-input"
        inputMode="numeric"
        placeholder={art === "hypothek" ? "Hypothekarvolumen CHF" : "Jahresprämie CHF"}
        aria-label={art === "hypothek" ? "Hypothekarvolumen" : "Jahresprämie"}
      />
      <input
        name="ertrag"
        className="field-input"
        inputMode="numeric"
        placeholder={art === "hypothek" ? "Entschädigung CHF (sonst 0,3 %)" : "Courtage CHF (falls bekannt)"}
        aria-label="Ertrag für NoviDom"
      />
      <input name="datum" type="date" className="field-input" aria-label="Abschlussdatum" defaultValue={new Date().toISOString().slice(0, 10)} />
      <input name="notiz" className="field-input" placeholder="Notiz (optional)" aria-label="Notiz" />
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Speichert …" : "Abschluss erfassen"}
        </button>
        <span className="td-light" style={{ fontSize: 12 }}>
          {isPartner ? "Von Partnern erfasst zählt sofort, sobald ein Ertrag eingetragen ist." : "Zählt, sobald ein Partner den Eintrag bestätigt hat."}
        </span>
        {error && <span style={{ color: "var(--red)", fontSize: 13 }}>{error}</span>}
      </div>
    </form>
  );
}

/** Partner: offenen Eintrag mit definitivem Ertrag bestätigen. */
export function ConfirmErtrag({ id, vorschlag }: { id: string; vorschlag: number | null }) {
  const { pending, error, run } = useAction(confirmErtrag);
  return (
    <form action={run} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={id} />
      <input name="ertrag" className="field-input" style={{ width: 120 }} inputMode="numeric" defaultValue={vorschlag ?? ""} placeholder="Ertrag CHF" aria-label="Ertrag CHF" />
      <button className="btn btn-green btn-sm" disabled={pending}>
        Bestätigen
      </button>
      {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
    </form>
  );
}

export function DeleteErtrag({ id }: { id: string }) {
  const { pending, run } = useAction(deleteErtrag);
  return (
    <form
      action={(fd) => {
        if (confirm("Eintrag löschen?")) run(fd);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-ghost btn-sm" disabled={pending} aria-label="Löschen">
        ✕
      </button>
    </form>
  );
}

/** Partner: Freelancer oder angestellt (Angestellte je Stufe 5 Punkte tiefer). */
export function AnstellungSelect({ berater, value }: { berater: string; value: string }) {
  const { pending, error, run } = useAction(setAnstellung);
  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <select
        className="field-select"
        defaultValue={value}
        disabled={pending}
        aria-label="Anstellung"
        onChange={(e) => {
          const fd = new FormData();
          fd.set("berater", berater);
          fd.set("anstellung", e.target.value);
          run(fd);
        }}
      >
        <option value="freelancer">Freelancer</option>
        <option value="angestellt">Angestellt (−5 Punkte)</option>
      </select>
      {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
    </span>
  );
}
