"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Rate = { laufzeit: string; zins: number; vorwoche: number | null; updated_at: string };

const LABEL: Record<string, string> = { saron: "SARON", "3": "Fest 3 Jahre", "5": "Fest 5 Jahre", "7": "Fest 7 Jahre", "10": "Fest 10 Jahre" };
const ORDER = ["saron", "3", "5", "7", "10"];
const CAL = process.env.NEXT_PUBLIC_CAL_LINK_VIDEO || process.env.NEXT_PUBLIC_CAL_LINK;

/**
 * Zinsbarometer mit den aktuellen Richtzinsen (im Admin gepflegt), dazu
 * SARON-Alarm per Mail und Videoberatung. Ohne Zinsdaten bleibt nur der
 * Alarm und die Beratung sichtbar.
 */
export function ZinsBarometer() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from("zinssaetze")
      .select("laufzeit, zins, vorwoche, updated_at")
      .then(({ data }) =>
        setRates(
          ((data as Rate[] | null) ?? [])
            .filter((r) => ORDER.includes(r.laufzeit))
            .sort((a, b) => ORDER.indexOf(a.laufzeit) - ORDER.indexOf(b.laufzeit))
        )
      );
  }, []);

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        name: email.split("@")[0],
        email,
        source: "saron-alarm",
        anliegen: "finanzieren",
        wantsFinancing: true,
        message: "Bereich: Finanzieren\nMöchte den SARON-Alarm erhalten (Meldung bei deutlicher Zinsänderung).",
      }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  const stand = rates.length ? new Date(rates.map((r) => r.updated_at).sort().at(-1) as string).toLocaleDateString("de-CH") : null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-line bg-white p-6 lg:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl text-ivory lg:text-3xl">Zinsbarometer</h2>
            {stand && <span className="text-xs text-ivory-dim">Richtzinsen, Stand {stand}</span>}
          </div>
          {rates.length === 0 ? (
            <p className="mt-3 text-sm text-ivory-dim">Die aktuellen Richtzinsen erscheinen hier, sobald sie erfasst sind. Fragen Sie uns gerne direkt nach Ihrem Zins.</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {rates.map((r) => {
                const diff = r.vorwoche != null ? r.zins - r.vorwoche : 0;
                const Icon = diff > 0.005 ? ArrowUpRight : diff < -0.005 ? ArrowDownRight : ArrowRight;
                return (
                  <div key={r.laufzeit} className="rounded-2xl bg-ink-2 p-4">
                    <div className="text-xs text-ivory-dim">{LABEL[r.laufzeit] ?? r.laufzeit}</div>
                    <div className="mt-1 font-display text-3xl text-ivory tabular-nums">{Number(r.zins).toFixed(2)}%</div>
                    <div className={`mt-1 flex items-center gap-1 text-xs ${diff > 0.005 ? "text-red-700" : diff < -0.005 ? "text-emerald-700" : "text-ivory-dim"}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      {r.vorwoche != null ? `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} zur Vorwoche` : "neu"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-4 text-xs text-ivory-dim">Richtwerte bei guter Bonität und 2/3-Belehnung. Ihr persönlicher Zins hängt von Objekt, Einkommen und Anbieter ab.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <form onSubmit={subscribe} className="rounded-[28px] bg-night p-6 text-ink">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-soft">
              <BellRing className="h-4 w-4" strokeWidth={1.75} />
              SARON-Alarm
            </div>
            <p className="mt-2 text-sm text-ink/80">Wir melden uns, wenn sich ein Wechsel lohnt, zum Beispiel von SARON in eine Festhypothek.</p>
            {state === "done" ? (
              <p className="mt-4 text-sm font-semibold text-ink">Danke, der Alarm ist aktiv.</p>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ihre E-Mail"
                  className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-ink placeholder:text-ink/50 focus:outline-none"
                />
                <button type="submit" disabled={state === "sending"} className="shrink-0 rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                  Aktivieren
                </button>
              </div>
            )}
            {state === "error" && <p className="mt-2 text-xs text-red-300">Hat nicht geklappt. Bitte später nochmals versuchen.</p>}
          </form>
          <a
            href={CAL ? `https://cal.com/${CAL}` : "#kontakt"}
            target={CAL ? "_blank" : undefined}
            rel="noreferrer"
            className="flex items-center gap-4 rounded-[28px] border border-line bg-white p-6 hover:border-amber"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber text-white">
              <Video className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-display text-xl text-ivory">Videoberatung buchen</span>
              <span className="text-sm text-ivory-dim">30 Minuten, bequem von zu Hause. Termin direkt wählen.</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
