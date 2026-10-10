"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MagneticSubmitButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/lib/reveal";
import { LEAD_SOURCE_OPTIONS } from "@/lib/constants";
import { ANLIEGEN, ANLIEGEN_CONFIG, anliegenFromTopic, isAnliegen, portalHref, type Anliegen } from "@/lib/anliegen";

const CONTACT_EMAIL = "verkaufen@novidom-immo.ch";
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

const fieldClasses =
  "w-full rounded-xl border border-line bg-ink px-5 py-4 font-sans text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

const PROPERTY_TYPES = ["Haus", "Wohnung", "Andere"];
const ZEITPUNKTE = ["sofort", "3-6 Monate", "6-12 Monate", "1-2 Jahre", "nur am Schauen"];
const VERKAUF_ZEIT = ["So bald wie möglich", "In 3–6 Monaten", "In 6–12 Monaten", "Nur unverbindlich informieren"];
const VORHABEN = ["Kauf", "Verlängerung", "Aufstockung oder Umbau"];
const PROJEKTE = ["Küche", "Bad", "Heizung", "Solar", "Fenster & Dämmung", "Ausbau", "Anderes"];
const UMBAU_BUDGET = ["bis CHF 50'000", "CHF 50'000–150'000", "über CHF 150'000", "noch offen"];
const SITUATIONEN = ["Ich kaufe", "Ich baue um", "Ich wohne im Eigentum", "Ich vermiete"];
const KONTAKTWEG = ["Telefon", "WhatsApp", "E-Mail"];

function Chips({
  options,
  value,
  onToggle,
}: {
  options: string[];
  value: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value.includes(o)}
          onClick={() => onToggle(o)}
          className={`rounded-xl border px-4 py-3 font-sans text-sm transition-colors ${
            value.includes(o) ? "border-amber bg-amber/10 text-amber-soft" : "border-line bg-ink text-ivory-dim hover:border-ivory-dim/40"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

/**
 * Kontaktformular, das sich nach dem Anliegen richtet: Verkaufen, Kaufen,
 * Finanzieren, Umbauen oder Versichern. Auf Bereichsseiten ist das Anliegen
 * vorgewählt, auf der Startseite wählt man es selbst (oder per Klick im
 * Puzzle). Die Angaben landen strukturiert im Lead und in der Kundenakte.
 */
export function FinalCta({
  title,
  text,
  topic,
}: {
  title?: string;
  text?: string;
  /** Bereich, aus dem die Anfrage kommt (z.B. "Finanzieren"). */
  topic?: string;
} = {}) {
  const preset = anliegenFromTopic(topic);
  const [anliegen, setAnliegen] = useState<Anliegen | null>(preset);
  const [step, setStep] = useState<1 | 2>(1);

  // Anliegen-Felder
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [region, setRegion] = useState("");
  const [budget, setBudget] = useState("");
  const [rooms, setRooms] = useState("");
  const [vorhaben, setVorhaben] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [hypoAblauf, setHypoAblauf] = useState("");
  const [projekte, setProjekte] = useState<string[]>([]);
  const [umbauBudget, setUmbauBudget] = useState("");
  const [situation, setSituation] = useState<string[]>([]);

  // Kontakt
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kontaktweg, setKontaktweg] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [wantsFinancing, setWantsFinancing] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Anliegen aus dem Link (?anliegen=umbauen#kontakt) oder aus einem Klick im Puzzle.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("anliegen");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalig aus der URL übernehmen
    if (!preset && isAnliegen(fromUrl)) setAnliegen(fromUrl);
    function onSelect(e: Event) {
      const value = (e as CustomEvent).detail;
      if (isAnliegen(value)) {
        setAnliegen(value);
        setStep(1);
      }
    }
    window.addEventListener("nd:anliegen", onSelect);
    return () => window.removeEventListener("nd:anliegen", onSelect);
  }, [preset]);

  const single = (setter: (v: string[]) => void) => (o: string) => setter([o]);
  const multi = (value: string[], setter: (v: string[]) => void) => (o: string) =>
    setter(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);

  const config = anliegen ? ANLIEGEN_CONFIG[anliegen] : null;
  // Eigener Titel der Bereichsseite nur, solange das vorgewählte Anliegen aktiv ist.
  const own = anliegen === preset;
  const shownTitle = (own ? title : undefined) ?? config?.title ?? "Wie können wir Ihnen helfen?";
  const shownText = (own ? text : undefined) ?? config?.text ?? "Wählen Sie Ihr Anliegen. Wir melden uns persönlich, so wie es Ihnen passt: per Telefon, WhatsApp oder E-Mail.";

  const step1Valid =
    anliegen === "verkaufen"
      ? propertyType.length > 0 && address.trim() !== ""
      : anliegen === "kaufen"
        ? region.trim() !== ""
        : anliegen === "finanzieren"
          ? vorhaben.length > 0
          : anliegen === "umbauen"
            ? projekte.length > 0
            : anliegen === "versichern"
              ? situation.length > 0
              : false;

  function handleNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step1Valid) setStep(2);
  }

  function details(): string[] {
    switch (anliegen) {
      case "verkaufen":
        return [`Objekttyp: ${propertyType.join(", ")}`, `Adresse: ${address}`, `Zeithorizont: ${timeframe || "keine Angabe"}`];
      case "kaufen":
        return [
          `Wunschregion: ${region}`,
          `Objektart: ${propertyType.join(", ") || "egal"}`,
          `Budget bis: ${budget ? `CHF ${Number(digits(budget)).toLocaleString("de-CH")}` : "offen"}`,
          `Zimmer ab: ${rooms || "egal"}`,
          `Kaufzeitpunkt: ${timeframe || "keine Angabe"}`,
        ];
      case "finanzieren":
        return [
          `Vorhaben: ${vorhaben.join(", ")}`,
          `Betrag: ${amount ? `CHF ${Number(digits(amount)).toLocaleString("de-CH")}` : "offen"}`,
          hypoAblauf ? `Hypothek läuft ab: ${new Date(hypoAblauf).toLocaleDateString("de-CH")}` : "",
        ].filter(Boolean);
      case "umbauen":
        return [`Projekt: ${projekte.join(", ")}`, `Ort: ${address || "keine Angabe"}`, `Budget: ${umbauBudget || "keine Angabe"}`, `Zeitpunkt: ${timeframe || "keine Angabe"}`];
      case "versichern":
        return [`Situation: ${situation.join(", ")}`, `Ort: ${address || "keine Angabe"}`];
      default:
        return [];
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!anliegen || !config) return;
    setStatus("sending");
    const profile =
      anliegen === "kaufen"
        ? {
            wunsch_ort: region,
            objekt_typ: propertyType.find((t) => t !== "Andere") ?? null,
            budget_max: budget ? Number(digits(budget)) : null,
            zimmer_min: rooms ? Number(rooms) : null,
            kauf_zeitpunkt: ZEITPUNKTE.includes(timeframe) ? timeframe : null,
          }
        : anliegen === "finanzieren" && hypoAblauf
          ? { hypo_ablauf: hypoAblauf, hypo_betrag: amount ? Number(digits(amount)) : null }
          : undefined;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: anliegen === "verkaufen" ? "valuation" : "contact",
          name,
          email,
          phone,
          anliegen,
          profile,
          message: [`Bereich: ${config.label}`, ...details(), kontaktweg.length ? `Kontakt bevorzugt: ${kontaktweg.join(", ")}` : ""]
            .filter(Boolean)
            .join("\n"),
          wantsFinancing: anliegen === "finanzieren" || wantsFinancing,
          newsletterOptIn,
          source: source || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Anfrage konnte nicht gesendet werden.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMsg("Anfrage konnte nicht gesendet werden.");
      setStatus("error");
    }
  }

  if (status === "done" && anliegen && config) {
    return (
      <section id="kontakt" className="relative overflow-hidden bg-ink-2 py-28 lg:py-36">
        <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Vielen Dank, {name.split(" ")[0] || "für Ihre Anfrage"}!
            </h2>
            <p className="mt-6 text-balance text-lg text-ivory-dim">
              Wir melden uns innert kurzer Zeit{kontaktweg.length ? ` per ${kontaktweg.join(" oder ")}` : " persönlich"}. In der Zwischenzeit:
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={portalHref(anliegen)} className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink hover:bg-amber">
                {config.portalLabel}
              </Link>
              {anliegen === "verkaufen" && CAL_LINK && (
                <a href="#termin" className="rounded-full border border-line px-7 py-4 text-sm font-semibold text-ivory hover:border-ivory">
                  Direkt Termin wählen
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="relative scroll-mt-20 overflow-hidden bg-ink-2 py-28 lg:py-36">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-soft">Unverbindlich &amp; kostenlos</span>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-tight text-ivory lg:text-6xl">{shownTitle}</h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ivory-dim">{shownText}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-lg">
            <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wide text-ivory-dim/50">
              <span className={step === 1 ? "text-amber-soft" : ""}>1. Ihr Anliegen</span>
              <span className="h-px w-8 bg-line" />
              <span className={step === 2 ? "text-amber-soft" : ""}>2. Kontakt</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  onSubmit={handleNext}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div>
                    <p className="mb-2 text-sm text-ivory-dim">Worum geht es?</p>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Anliegen">
                      {ANLIEGEN.map((a) => (
                        <button
                          key={a}
                          type="button"
                          role="radio"
                          aria-checked={anliegen === a}
                          onClick={() => setAnliegen(a)}
                          className={`rounded-full border px-4 py-2.5 font-sans text-sm transition-colors ${
                            anliegen === a ? "border-night bg-night text-ink" : "border-line bg-ink text-ivory-dim hover:border-ivory-dim/40"
                          }`}
                        >
                          {ANLIEGEN_CONFIG[a].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {anliegen === "verkaufen" && (
                    <>
                      <Chips options={PROPERTY_TYPES} value={propertyType} onToggle={single(setPropertyType)} />
                      <input required placeholder="Adresse Ihrer Immobilie" value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClasses} />
                      <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                        <option value="">Wann möchten Sie verkaufen? (optional)</option>
                        {VERKAUF_ZEIT.map((z) => (
                          <option key={z}>{z}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {anliegen === "kaufen" && (
                    <>
                      <input required placeholder="Wunschregion, z.B. Allschwil, Basel, Zug" value={region} onChange={(e) => setRegion(e.target.value)} className={fieldClasses} />
                      <Chips options={PROPERTY_TYPES} value={propertyType} onToggle={multi(propertyType, setPropertyType)} />
                      <div className="grid grid-cols-2 gap-3">
                        <input inputMode="numeric" placeholder="Budget bis CHF" value={budget} onChange={(e) => setBudget(e.target.value)} className={fieldClasses} />
                        <select value={rooms} onChange={(e) => setRooms(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                          <option value="">Zimmer ab</option>
                          {["2", "3", "4", "5", "6"].map((r) => (
                            <option key={r} value={r}>
                              {r}+ Zimmer
                            </option>
                          ))}
                        </select>
                      </div>
                      <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                        <option value="">Wann möchten Sie kaufen? (optional)</option>
                        {ZEITPUNKTE.map((z) => (
                          <option key={z}>{z}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {anliegen === "finanzieren" && (
                    <>
                      <Chips options={VORHABEN} value={vorhaben} onToggle={single(setVorhaben)} />
                      <input
                        inputMode="numeric"
                        placeholder={vorhaben.includes("Kauf") ? "Kaufpreis CHF (optional)" : "Höhe der Hypothek CHF (optional)"}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={fieldClasses}
                      />
                      {vorhaben.includes("Verlängerung") && (
                        <label className="block text-sm text-ivory-dim">
                          Ihre Hypothek läuft ab am
                          <input type="date" value={hypoAblauf} onChange={(e) => setHypoAblauf(e.target.value)} className={`${fieldClasses} mt-2`} />
                        </label>
                      )}
                    </>
                  )}

                  {anliegen === "umbauen" && (
                    <>
                      <p className="text-sm text-ivory-dim">Was möchten Sie umbauen? (mehrere möglich)</p>
                      <Chips options={PROJEKTE} value={projekte} onToggle={multi(projekte, setProjekte)} />
                      <input placeholder="Ort oder Adresse (optional)" value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClasses} />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={umbauBudget} onChange={(e) => setUmbauBudget(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                          <option value="">Budget</option>
                          {UMBAU_BUDGET.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                          <option value="">Wann?</option>
                          {["sofort", "3-6 Monate", "6-12 Monate", "später"].map((z) => (
                            <option key={z}>{z}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {anliegen === "versichern" && (
                    <>
                      <Chips options={SITUATIONEN} value={situation} onToggle={multi(situation, setSituation)} />
                      <input placeholder="Ort (optional)" value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClasses} />
                    </>
                  )}

                  {anliegen && (
                    <MagneticSubmitButton className="w-full justify-center sm:w-auto sm:self-center" disabled={!step1Valid}>
                      Weiter
                    </MagneticSubmitButton>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <input required placeholder="Ihr Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClasses} />
                  <input required type="email" placeholder="Ihre E-Mail-Adresse" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClasses} />
                  <input type="tel" placeholder="Telefon (optional)" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClasses} />
                  <div>
                    <p className="mb-2 text-sm text-ivory-dim">Am liebsten erreichen Sie uns per</p>
                    <Chips options={KONTAKTWEG} value={kontaktweg} onToggle={multi(kontaktweg, setKontaktweg)} />
                  </div>
                  <select value={source} onChange={(e) => setSource(e.target.value)} className={`${fieldClasses} text-ivory-dim`}>
                    <option value="">Wie sind Sie auf uns aufmerksam geworden? (optional)</option>
                    {LEAD_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  {anliegen !== "finanzieren" && (
                    <label className="flex items-start gap-2.5 text-sm text-ivory-dim">
                      <input
                        type="checkbox"
                        checked={wantsFinancing}
                        onChange={(e) => setWantsFinancing(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-line bg-ink accent-amber"
                      />
                      Ich interessiere mich zusätzlich für eine Finanzierungsberatung.
                    </label>
                  )}
                  <label className="flex items-start gap-2.5 text-sm text-ivory-dim">
                    <input
                      type="checkbox"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-line bg-ink accent-amber"
                    />
                    Ich möchte Updates zu neuen Objekten per E-Mail erhalten.
                  </label>

                  {status === "error" && <p className="text-sm text-red-700">{errorMsg}</p>}
                  <div className="mt-1 flex items-center justify-center gap-5">
                    <button type="button" onClick={() => setStep(1)} className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory">
                      Zurück
                    </button>
                    <MagneticSubmitButton disabled={status === "sending"}>
                      {status === "sending" ? "Wird gesendet…" : (config?.submit ?? "Senden")}
                    </MagneticSubmitButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 text-sm text-ivory-dim">
            Oder direkt schreiben:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-soft underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
