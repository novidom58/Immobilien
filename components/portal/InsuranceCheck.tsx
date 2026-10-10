"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { saveInsuranceCheck } from "@/app/dashboard/actions";

type Answers = {
  situation: "" | "miete" | "kauf" | "eigentum";
  objekt: "" | "wohnung" | "haus";
  umbau: boolean;
  wertsachen: boolean;
  tiere: boolean;
};

type Recommendation = { title: string; why: string };

// Empfehlungen nach Lebenssituation, bewusst einfach gehalten. Die
// konkrete Offerte und der Vergleich kommen von unserem Team.
function recommend(a: Answers): Recommendation[] {
  const list: Recommendation[] = [];
  if (!a.situation) return list;
  list.push({ title: "Privathaftpflicht", why: "Deckt Schäden, die Sie anderen verursachen. Gehört in jeden Haushalt." });
  list.push({
    title: "Hausrat",
    why: a.wertsachen
      ? "Ihre Einrichtung zum Neuwert, Wertsachen separat und ausreichend versichern."
      : "Ihre Einrichtung zum Neuwert. Nach einem Umzug die Versicherungssumme anpassen.",
  });
  if (a.situation === "miete") {
    list.push({ title: "Mieterkautions-Versicherung", why: "Statt mehrere Monatsmieten auf einem Sperrkonto zu blockieren." });
  }
  if (a.situation === "kauf" || a.situation === "eigentum") {
    list.push({
      title: "Gebäudeversicherung",
      why: "Feuer und Elementarschäden. Je nach Kanton über die kantonale Gebäudeversicherung geregelt, Lücken prüfen wir.",
    });
    list.push({ title: "Gebäudewasser & Glas", why: "Leitungswasser- und Glasbruchschäden am Gebäude sind oft nicht automatisch gedeckt." });
    if (a.objekt === "haus") list.push({ title: "Gebäudehaftpflicht", why: "Als Eigentümer haften Sie z.B., wenn jemand auf Ihrem Grundstück verunfallt." });
    list.push({ title: "Rechtsschutz Immobilien", why: "Bei Streit mit Handwerkern, Nachbarn oder rund um den Kaufvertrag." });
  }
  if (a.umbau) {
    list.push({ title: "Bauherrenhaftpflicht & Bauwesen", why: "Während des Umbaus haften Sie als Bauherr, Schäden am Bau sind separat zu versichern." });
  }
  if (a.tiere) list.push({ title: "Tierhalterhaftpflicht prüfen", why: "Ist bei vielen Privathaftpflicht-Policen dabei, aber nicht immer für alle Tiere." });
  return list;
}

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-night bg-night text-ink" : "border-line bg-white text-ivory hover:border-ivory"}`;

export function InsuranceCheck({ initial, user }: { initial: Partial<Answers> | null; user: { name: string; email: string } }) {
  const [a, setA] = useState<Answers>({ situation: "", objekt: "", umbau: false, wertsachen: false, tiere: false, ...initial });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const recs = recommend(a);

  async function handleRequest() {
    setState("sending");
    await saveInsuranceCheck(a);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        source: "portal-versicherung",
        name: user.name,
        email: user.email,
        message: [`Versicherungs-Check aus dem Kundenportal, bitte Offerten vergleichen:`, ...recs.map((r) => `• ${r.title}`)].join("\n"),
      }),
    });
    setState(res.ok ? "sent" : "error");
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-5">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ivory-dim">Ihre Situation</div>
          <div className="flex flex-wrap gap-2">
            {[
              ["miete", "Ich miete"],
              ["kauf", "Ich kaufe bald"],
              ["eigentum", "Ich besitze Eigentum"],
            ].map(([value, text]) => (
              <button key={value} type="button" className={chip(a.situation === value)} onClick={() => setA({ ...a, situation: value as Answers["situation"] })}>
                {text}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ivory-dim">Objekt</div>
          <div className="flex flex-wrap gap-2">
            {[
              ["wohnung", "Wohnung"],
              ["haus", "Haus"],
            ].map(([value, text]) => (
              <button key={value} type="button" className={chip(a.objekt === value)} onClick={() => setA({ ...a, objekt: value as Answers["objekt"] })}>
                {text}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          {[
            ["umbau", "Umbau oder Renovation geplant"],
            ["wertsachen", "Wertsachen (Schmuck, Kunst, Velos über CHF 3'000)"],
            ["tiere", "Haustiere"],
          ].map(([key, text]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-ivory">
              <input
                type="checkbox"
                checked={a[key as "umbau" | "wertsachen" | "tiere"]}
                onChange={(e) => setA({ ...a, [key]: e.target.checked })}
                className="h-4 w-4 accent-amber"
              />
              {text}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ivory-dim">
          <ShieldCheck className="h-4 w-4 text-amber" strokeWidth={1.5} />
          Unsere Empfehlung
        </div>
        {recs.length === 0 ? (
          <p className="mt-3 text-sm text-ivory-dim">Wählen Sie links Ihre Situation, dann sehen Sie sofort, was Sie brauchen.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {recs.map((r) => (
                <li key={r.title}>
                  <div className="font-semibold text-ivory">{r.title}</div>
                  <div className="text-sm text-ivory-dim">{r.why}</div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleRequest}
              disabled={state === "sending" || state === "sent"}
              className="mt-6 rounded-full bg-night px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-amber disabled:opacity-60"
            >
              {state === "sending" ? "Wird gesendet …" : "Offerten vergleichen lassen"}
            </button>
            {state === "sent" && <p className="mt-3 text-sm text-emerald-700">Danke! Wir vergleichen die Angebote und melden uns.</p>}
            {state === "error" && <p className="mt-3 text-sm text-red-700">Senden fehlgeschlagen. Bitte später nochmals versuchen.</p>}
          </>
        )}
      </div>
    </div>
  );
}
