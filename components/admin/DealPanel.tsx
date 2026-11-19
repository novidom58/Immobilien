"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Deal = { sold_price: number | null; commission_pct: number | null; sold_at: string | null; self_acquired: boolean; bringer?: string | null };

/**
 * Vertrauliche Abschlussdaten pro Objekt (nur Partner): Verkaufspreis,
 * Provision in %, Abschlussdatum und wer das Objekt gebracht hat. Der
 * Verkäufer (Berater des Inserats) erhält seinen Stufen-Anteil, der Bringer
 * 20 % der Provision; beides fliesst direkt in das Guthaben unter «Karriere».
 */
export function DealPanel({
  listingId,
  offerType,
  verkaeufer,
  beraterOptions,
}: {
  listingId: string;
  offerType: string;
  /** Berater des Inserats = wer verkauft */
  verkaeufer: string | null;
  beraterOptions: string[];
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({ sold_price: "", commission_pct: "", sold_at: "", bringer: "" });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !supabase) return;
    supabase
      .from("listing_deals")
      .select("*")
      .eq("listing_id", listingId)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setError(loadError.message.includes("listing_deals") ? "Bitte zuerst in Supabase das SQL «Rollen und Mitarbeitende» ausführen." : loadError.message);
          return;
        }
        const d = (data as Deal | null) ?? null;
        setDeal(d);
        setForm({
          sold_price: d?.sold_price ? String(d.sold_price) : "",
          commission_pct: d?.commission_pct ? String(d.commission_pct) : "",
          sold_at: d?.sold_at ?? "",
          // Ältere Abschlüsse ohne Bringer: «selbst akquiriert» heisst Bringer = Verkäufer
          bringer: d?.bringer ?? (d?.self_acquired && verkaeufer ? verkaeufer : ""),
        });
      });
    // supabase ist pro Render neu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listingId]);

  if (!supabase) return null;

  async function save() {
    if (!supabase) return;
    setState("saving");
    setError(null);
    const price = Number(form.sold_price.replace(/[^\d]/g, ""));
    const pct = Number(form.commission_pct.replace(",", "."));
    const row = {
      listing_id: listingId,
      sold_price: price > 0 ? price : null,
      commission_pct: pct > 0 && pct < 20 ? pct : null,
      sold_at: form.sold_at || null,
      bringer: form.bringer || null,
      self_acquired: Boolean(form.bringer && form.bringer === verkaeufer),
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await supabase.from("listing_deals").upsert(row, { onConflict: "listing_id" });
    if (saveError) {
      setState("error");
      setError(
        saveError.message.includes("bringer")
          ? "Bitte zuerst in Supabase das SQL «Bringer» ausführen."
          : saveError.message.includes("listing_deals")
            ? "Bitte zuerst in Supabase das SQL «Rollen und Mitarbeitende» ausführen."
            : saveError.message
      );
      return;
    }
    setDeal(row);
    setState("saved");
  }

  const provisionChf = deal?.sold_price && deal.commission_pct ? (deal.sold_price * deal.commission_pct) / 100 : 0;
  const provision = provisionChf ? Math.round(provisionChf).toLocaleString("de-CH") : null;
  const bringerAnteil = provisionChf && deal?.bringer ? Math.round(provisionChf * 0.2).toLocaleString("de-CH") : null;

  return (
    <div style={{ width: "100%" }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
        {open ? "Abschluss schliessen" : "Abschluss & Provision"}
      </button>
      {open && (
        <div style={{ marginTop: 10, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", alignItems: "end" }}>
          <label className="field-label" style={{ display: "grid", gap: 4 }}>
            {offerType === "miete" ? "Monatsmiete (CHF)" : "Verkaufspreis effektiv (CHF)"}
            <input className="field-input" inputMode="numeric" value={form.sold_price} onChange={(e) => setForm({ ...form, sold_price: e.target.value })} />
          </label>
          <label className="field-label" style={{ display: "grid", gap: 4 }}>
            Provision in %
            <input className="field-input" inputMode="decimal" placeholder="z.B. 0.95" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: e.target.value })} />
          </label>
          <label className="field-label" style={{ display: "grid", gap: 4 }}>
            Abschluss am
            <input className="field-input" type="date" value={form.sold_at} onChange={(e) => setForm({ ...form, sold_at: e.target.value })} />
          </label>
          <label className="field-label" style={{ display: "grid", gap: 4 }}>
            Gebracht von (20 %)
            <select className="field-select" value={form.bringer} onChange={(e) => setForm({ ...form, bringer: e.target.value })}>
              <option value="">Niemand / Firma</option>
              {beraterOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                  {b === verkaeufer ? " (verkauft auch)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3" style={{ gridColumn: "1 / -1" }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={state === "saving"} onClick={save}>
              {state === "saving" ? "…" : "Speichern"}
            </button>
            {state === "saved" && <span style={{ fontSize: 12, color: "var(--green)" }}>Gespeichert.</span>}
            {provision && (
              <span className="td-light" style={{ fontSize: 12 }}>
                Provision: CHF {provision}
                {bringerAnteil ? ` · davon Bringer ${deal?.bringer}: CHF ${bringerAnteil}` : ""}
              </span>
            )}
            {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
