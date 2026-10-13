"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BellRing, Check, Home, RefreshCw, TrendingUp } from "lucide-react";
import { checkFinance } from "@/lib/finance";

// Funnel in drei Schritten wie bei hypotheken-analyse.ch: Anliegen wählen,
// Eckdaten, Kontakt. Die Anfrage geht über /api/leads (Quelle «hypocasa-…»)
// direkt an HypoCasa und landet in der gemeinsamen Kundenakte.

export type Anliegen = "kauf" | "verlaengerung" | "aufstockung";

const ANLIEGEN: { key: Anliegen; title: string; text: string; icon: typeof Home }[] = [
  { key: "kauf", title: "Kauf", text: "Neue Hypothek für Wohnung oder Haus", icon: Home },
  { key: "verlaengerung", title: "Verlängerung", text: "Hypothek läuft aus oder Wechsel der Bank", icon: RefreshCw },
  { key: "aufstockung", title: "Aufstockung", text: "Mehr Hypothek für Umbau oder Sanierung", icon: TrendingUp },
];

const STEPS = ["Anliegen", "Eckdaten", "Kontakt"];

function format(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("de-CH").replace(/[’,\s]/g, "'") : "";
}
function parse(value: string) {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function chf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-[#c0392b] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

function Money({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">CHF</span>
        <input inputMode="numeric" value={value} onChange={(e) => onChange(format(e.target.value))} placeholder={placeholder} className={`${field} pl-12`} />
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`rounded-full border px-3.5 py-2 text-sm transition ${
              value === o ? "border-[#c0392b] bg-[#c0392b] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-[#c0392b]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function isAnliegen(v: string | null): v is Anliegen {
  return v === "kauf" || v === "verlaengerung" || v === "aufstockung";
}

export function HypoFunnel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [anliegen, setAnliegen] = useState<Anliegen | null>(null);
  const [quelle, setQuelle] = useState("");

  // Kauf
  const [objekt, setObjekt] = useState("Wohnung");
  const [stand, setStand] = useState("Objekt gefunden");
  const [preis, setPreis] = useState("");
  const [eigenmittel, setEigenmittel] = useState("");
  const [pk, setPk] = useState("");
  const [einkommen, setEinkommen] = useState("");
  // Verlängerung
  const [ablauf, setAblauf] = useState("");
  const [betrag, setBetrag] = useState("");
  const [bank, setBank] = useState("");
  const [modell, setModell] = useState("Festhypothek");
  // Aufstockung
  const [wert, setWert] = useState("");
  const [zusatz, setZusatz] = useState("");
  const [zweck, setZweck] = useState("Umbau / Renovation");
  // Kontakt
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zeit, setZeit] = useState("Egal");
  const [saron, setSaron] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function start(a: Anliegen) {
    setAnliegen(a);
    setStep(1);
    setError(null);
  }

  // Einstieg von aussen: Links wie «#analyse-verlaengerung» auf dieser Seite
  // oder «?anliegen=kauf&quelle=novidom-pass» aus dem NoviDom-Portal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("anliegen");
    const q = params.get("quelle");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL is only readable post-mount; keeps the page static and hydration-safe
    if (q) setQuelle(q.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40));
    if (isAnliegen(fromQuery)) start(fromQuery);

    function onHash() {
      const m = window.location.hash.match(/^#analyse-(\w+)$/);
      // «#analyse-saron»: SARON-Alarm gehört zur laufenden Hypothek, also Verlängerung.
      const a = m ? (m[1] === "saron" ? "verlaengerung" : m[1]) : null;
      if (m?.[1] === "saron") setSaron(true);
      if (isAnliegen(a)) {
        start(a);
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const finance = checkFinance({ income: parse(einkommen), savings: parse(eigenmittel), pension: parse(pk), price: parse(preis) });
  const belehnung = parse(wert) > 0 ? (parse(betrag) + parse(zusatz)) / parse(wert) : null;

  function eckdatenError(): string | null {
    if (anliegen === "kauf" && (!parse(preis) || !parse(eigenmittel) || !parse(einkommen))) return "Bitte Kaufpreis, Eigenmittel und Einkommen angeben.";
    if (anliegen === "verlaengerung" && (!ablauf || !parse(betrag))) return "Bitte Ablaufdatum und Hypothekarbetrag angeben.";
    if (anliegen === "aufstockung" && (!parse(wert) || !parse(zusatz))) return "Bitte Liegenschaftswert und gewünschten Zusatzbetrag angeben.";
    return null;
  }

  function next() {
    const e = eckdatenError();
    if (e) return setError(e);
    setError(null);
    setStep(2);
    // Auf dem Handy liegt der Weiter-Knopf weit unten: zurück an den Anfang der Karte.
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function summary(): string[] {
    if (anliegen === "kauf") {
      return [
        `Objekt: ${objekt}, ${stand}`,
        `Kaufpreis: ${chf(parse(preis))}`,
        `Eigenmittel: ${chf(parse(eigenmittel))}${parse(pk) ? ` + PK-Vorbezug ${chf(parse(pk))}` : ""}`,
        `Haushaltseinkommen: ${chf(parse(einkommen))} / Jahr`,
        `Selbst-Check: ${finance.status}, max. Kaufpreis ca. ${chf(finance.maxPrice)}`,
      ];
    }
    if (anliegen === "verlaengerung") {
      return [
        `Ablauf: ${ablauf}`,
        `Hypothek: ${chf(parse(betrag))}${bank ? ` bei ${bank}` : ""}`,
        `Aktuelles Modell: ${modell}`,
        parse(wert) ? `Liegenschaftswert: ${chf(parse(wert))}` : "",
      ].filter(Boolean);
    }
    return [
      `Liegenschaftswert: ${chf(parse(wert))}`,
      `Bestehende Hypothek: ${parse(betrag) ? chf(parse(betrag)) : "—"}`,
      `Zusätzlich gewünscht: ${chf(parse(zusatz))} für ${zweck}`,
      parse(einkommen) ? `Haushaltseinkommen: ${chf(parse(einkommen))} / Jahr` : "",
      belehnung !== null ? `Belehnung danach: ${Math.round(belehnung * 100)}%` : "",
    ].filter(Boolean);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!anliegen) return;
    if (!name.trim() || !email.trim() || !phone.trim()) return setError("Bitte Name, E-Mail und Telefon angeben.");
    if (!consent) return setError("Bitte bestätigen Sie die Einwilligung.");
    setError(null);
    setState("sending");

    const titel = ANLIEGEN.find((a) => a.key === anliegen)?.title ?? anliegen;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        source: `hypocasa-${anliegen}${quelle ? `-${quelle}` : ""}`.slice(0, 100),
        anliegen: "finanzieren",
        wantsFinancing: true,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website,
        message: [
          `HypoCasa-Analyse: ${titel}`,
          ...summary(),
          `Erreichbar: ${zeit}`,
          saron ? "SARON-Alarm: ja, bitte aktivieren" : "",
          quelle ? `Herkunft: ${quelle}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        profile: {
          objekt_typ: anliegen === "kauf" ? objekt : undefined,
          budget_max: anliegen === "kauf" ? parse(preis) : undefined,
          kauf_zeitpunkt: anliegen === "kauf" ? stand : undefined,
          hypo_ablauf: anliegen === "verlaengerung" && /^\d{4}-\d{2}$/.test(ablauf) ? `${ablauf}-01` : undefined,
          hypo_betrag: anliegen !== "kauf" ? parse(betrag) || undefined : undefined,
        },
      }),
    }).catch(() => null);

    if (res?.ok) {
      setState("sent");
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error ?? "Senden fehlgeschlagen. Bitte versuchen Sie es nochmals.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div ref={rootRef} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8" aria-live="polite">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">Danke, {name.split(" ")[0]}!</h3>
        <p className="mt-2 text-slate-600">
          Ihre Anfrage ist bei uns. Wir vergleichen die Angebote und melden uns innert 24 Stunden persönlich bei Ihnen.
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
      <ol className="mb-6 flex items-center gap-2 text-xs font-medium" aria-label="Fortschritt">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-1.5">
            <span className={`h-1.5 rounded-full ${i <= step ? "bg-[#c0392b]" : "bg-slate-200"}`} />
            <span className={i === step ? "text-[#c0392b]" : "text-slate-400"}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900">Worum geht es?</h3>
          <p className="mt-1 text-sm text-slate-600">Kostenlose Analyse in 2 Minuten.</p>
          <div className="mt-5 grid gap-3">
            {ANLIEGEN.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => start(a.key)}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#c0392b] hover:bg-[#fdf3f2]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fdf3f2] text-[#c0392b] group-hover:bg-[#c0392b] group-hover:text-white">
                  <a.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-slate-900">{a.title}</span>
                  <span className="block text-sm text-slate-600">{a.text}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#c0392b]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && anliegen && (
        <div className="grid gap-4">
          <h3 className="text-xl font-bold text-slate-900">{ANLIEGEN.find((a) => a.key === anliegen)?.title}: Ihre Eckdaten</h3>

          {anliegen === "kauf" && (
            <>
              <Choice label="Objekt" options={["Wohnung", "Haus", "Mehrfamilienhaus"]} value={objekt} onChange={setObjekt} />
              <Choice label="Stand" options={["Objekt gefunden", "Auf der Suche", "Kaufvertrag in Kürze"]} value={stand} onChange={setStand} />
              <Money label="Kaufpreis" value={preis} onChange={setPreis} placeholder="950'000" />
              <Money label="Eigenmittel (Erspartes, Wertschriften, 3a)" value={eigenmittel} onChange={setEigenmittel} placeholder="200'000" />
              <Money label="PK-Vorbezug (optional)" value={pk} onChange={setPk} placeholder="0" hint="Bezug oder Verpfändung: wir rechnen beides durch." />
              <Money label="Bruttoeinkommen Haushalt pro Jahr" value={einkommen} onChange={setEinkommen} placeholder="160'000" />
              {finance.status !== "offen" && parse(einkommen) > 0 && parse(eigenmittel) > 0 && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    finance.status === "ok"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : finance.status === "knapp"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-red-200 bg-red-50 text-red-900"
                  }`}
                  aria-live="polite"
                >
                  <strong>
                    {finance.status === "ok" ? "Voraussichtlich tragbar." : finance.status === "knapp" ? "Knapp, mit Optimierung oft machbar." : "So noch nicht tragbar, wir suchen Lösungen."}
                  </strong>{" "}
                  Richtwert max. Kaufpreis: {chf(finance.maxPrice)}.
                </div>
              )}
            </>
          )}

          {anliegen === "verlaengerung" && (
            <>
              <label className="block">
                <span className={labelCls}>Ablauf der aktuellen Hypothek</span>
                <input type="month" value={ablauf} onChange={(e) => setAblauf(e.target.value)} className={field} />
              </label>
              <Money label="Hypothekarbetrag" value={betrag} onChange={setBetrag} placeholder="600'000" />
              <label className="block">
                <span className={labelCls}>Aktuelle Bank / Versicherung (optional)</span>
                <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="z.B. Kantonalbank" className={field} />
              </label>
              <Choice label="Aktuelles Modell" options={["Festhypothek", "SARON", "Gemischt", "Weiss nicht"]} value={modell} onChange={setModell} />
              <Money label="Liegenschaftswert (optional)" value={wert} onChange={setWert} placeholder="1'000'000" />
            </>
          )}

          {anliegen === "aufstockung" && (
            <>
              <Money label="Liegenschaftswert" value={wert} onChange={setWert} placeholder="1'100'000" />
              <Money label="Bestehende Hypothek" value={betrag} onChange={setBetrag} placeholder="550'000" />
              <Money label="Zusätzlich benötigt" value={zusatz} onChange={setZusatz} placeholder="120'000" />
              <Choice label="Wofür?" options={["Umbau / Renovation", "Energetische Sanierung", "Anderes"]} value={zweck} onChange={setZweck} />
              <Money label="Bruttoeinkommen Haushalt pro Jahr (optional)" value={einkommen} onChange={setEinkommen} placeholder="150'000" />
              {belehnung !== null && parse(zusatz) > 0 && (
                <p className={`rounded-xl border px-4 py-3 text-sm ${belehnung <= 0.8 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                  Belehnung danach: <strong>{Math.round(belehnung * 100)}%</strong>
                  {belehnung <= 0.8 ? " – im üblichen Rahmen bis 80%." : " – über 80%, wir prüfen Alternativen."}
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>
            <button type="button" onClick={next} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c0392b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a93226]">
              Weiter <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <h3 className="text-xl font-bold text-slate-900">Wohin dürfen wir die Angebote schicken?</h3>
          <label className="block">
            <span className={labelCls}>Vor- und Nachname</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} required />
          </label>
          <label className="block">
            <span className={labelCls}>E-Mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} required />
          </label>
          <label className="block">
            <span className={labelCls}>Telefon</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="079 123 45 67" className={field} required />
          </label>
          <Choice label="Am besten erreichbar" options={["Vormittag", "Nachmittag", "Abend", "Egal"]} value={zeit} onChange={setZeit} />
          {/* Honeypot gegen Spam-Bots */}
          <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#fdf3f2] p-3.5 text-sm text-slate-700">
            <input type="checkbox" checked={saron} onChange={(e) => setSaron(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c0392b]" />
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                <BellRing className="h-4 w-4 text-[#c0392b]" /> SARON-Alarm aktivieren
              </span>
              Kostenlos: Wir melden uns, wenn sich ein Wechsel lohnt.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c0392b]" />
            <span>
              Ich bin einverstanden, dass HypoCasa und ihr Partner NoviDom Immo meine Angaben zur Bearbeitung dieser Anfrage verwenden und mich kontaktieren.
            </span>
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="mt-1 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Zurück
            </button>
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c0392b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a93226] disabled:opacity-60"
            >
              {state === "sending" ? "Wird gesendet…" : "Kostenlose Analyse anfordern"}
            </button>
          </div>
          <p className="text-center text-xs text-slate-500">Persönlich, kostenlos und unverbindlich.</p>
        </form>
      )}
    </div>
  );
}
