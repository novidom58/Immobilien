"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Deal = { sold_price: number | null; commission_pct: number | null; sold_at: string | null; self_acquired: boolean };

/**
 * Vertrauliche Abschlussdaten pro Objekt (nur Partner): Verkaufspreis,
 * Provision in %, Abschlussdatum und ob das Mandat selbst akquiriert wurde.
 * Grundlage für Umsatz und Karrierestufe in der Mitarbeiter-Übersicht.
 */
export function DealPanel({ listingId, offerType }: { listingId: string; offerType: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({ sold_price: "", commission_pct: "", sold_at: "", self_acquired: false });
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
          self_acquired: Boolean(d?.self_acquired),
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
      self_acquired: form.self_acquired,
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await supabase.from("listing_deals").upsert(row, { onConflict: "listing_id" });
    if (saveError) {
      setState("error");
      setError(saveError.message.includes("listing_deals") ? "Bitte zuerst in Supabase das SQL «Rollen und Mitarbeitende» ausführen." : saveError.message);
      return;
    }
    setDeal(row);
    setState("saved");
  }

  const provision =
    deal?.sold_price && deal.commission_pct ? Math.round((deal.sold_price * deal.commission_pct) / 100).toLocaleString("de-CH") : null;

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
          <label className="flex items-center gap-2" style={{ fontSize: 13 }}>
            <input type="checkbox" checked={form.self_acquired} onChange={(e) => setForm({ ...form, self_acquired: e.target.checked })} />
            Mandat selbst akquiriert
          </label>
          <div className="flex items-center gap-3" style={{ gridColumn: "1 / -1" }}>
            <button type="button" className="btn btn-primary btn-sm" disabled={state === "saving"} onClick={save}>
              {state === "saving" ? "…" : "Speichern"}
            </button>
            {state === "saved" && <span style={{ fontSize: 12, color: "var(--green)" }}>Gespeichert.</span>}
            {provision && <span className="td-light" style={{ fontSize: 12 }}>Provision: CHF {provision}</span>}
            {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
