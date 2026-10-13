import { ArrowRight, ArrowUpRight, BellRing, Check, Clock, Home, Landmark, PiggyBank, RefreshCw, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { HypoFunnel } from "@/components/hypocasa/HypoFunnel";
import { MobileCta } from "@/components/hypocasa/MobileCta";
import { NOVIDOM_URL } from "@/lib/hypocasa";

// Inhalte nach dem bisherigen Auftritt von HypoCasa (siehe auch
// components/leistungen/FinanzierenContent.tsx). Links innerhalb der Seite
// sind reine Anker, damit sie unter hypocasa.ch («/») und unter /hypocasa
// gleich funktionieren.

const RED = "#c0392b";

const STATS = [
  { big: "50+", text: "Banken, Versicherungen und Pensionskassen" },
  { big: "24 h", text: "bis zur Finanzierungsbestätigung" },
  { big: "CHF 0", text: "Beratung, persönlich und kostenlos" },
  { big: "Ø 25k", text: "CHF Ersparnis über die Laufzeit" },
];

const SERVICES = [
  {
    icon: Home,
    title: "Kauf",
    text: "Tragbarkeit prüfen, Offerten vergleichen, Finanzierungsbestätigung innert 24 Stunden. So können Sie sofort ein Angebot machen.",
    href: "#analyse-kauf",
  },
  {
    icon: RefreshCw,
    title: "Verlängerung",
    text: "Läuft Ihre Hypothek aus? Wir holen bis zu 12 Monate im Voraus Angebote ein und verhandeln, statt die Offerte der Hausbank zu unterschreiben.",
    href: "#analyse-verlaengerung",
  },
  {
    icon: TrendingUp,
    title: "Aufstockung",
    text: "Mehr Hypothek für Umbau, Renovation oder energetische Sanierung. Wir prüfen Belehnung, Tragbarkeit und Förderbeiträge.",
    href: "#analyse-aufstockung",
  },
  {
    icon: BellRing,
    title: "SARON-Alarm",
    text: "Wir beobachten den SARON und die Festzinsen für Sie und melden uns, sobald sich ein Wechsel lohnt.",
    href: "#saron",
  },
  {
    icon: PiggyBank,
    title: "Pensionskasse & 3a",
    text: "PK-Vorbezug oder Verpfändung, indirekte Amortisation über die Säule 3a: steuerlich durchdacht und von Anfang an mitgeplant.",
    href: "#analyse-kauf",
  },
  {
    icon: Landmark,
    title: "Begleitung bis zum Notar",
    text: "Dossier, Anbietervergleich, Vertragsprüfung und Notartermin. Ein Ansprechpartner für den ganzen Weg.",
    href: "#ablauf",
  },
];

const STEPS = [
  { title: "Anliegen & Eckdaten", text: "Online in 2 Minuten oder direkt im Gespräch. Ohne Formularberg." },
  { title: "Persönliche Analyse", text: "Einkommen, Eigenmittel, Vorsorge und Lebensplan. Wir rechnen realistisch, nicht geschönt." },
  { title: "Vergleich über 50+ Anbieter", text: "Banken, Versicherungen und Pensionskassen treten für Sie gegeneinander an. Mindestens 3 Offerten im Vergleich." },
  { title: "Bestätigung innert 24 h", text: "Mit den nötigen Unterlagen erhalten Sie innert eines Werktages die Finanzierungsbestätigung." },
];

const GUARANTEE = [
  "Unabhängig: wir arbeiten für Sie, nicht für eine Bank",
  "Mindestens 3 Offerten im Vergleich",
  "Finanzierungsbestätigung innert 24 Stunden",
  "PK- und 3a-Koordination inklusive",
  "SARON-Alarm inklusive",
  "Kostenlos für Sie",
];

const FAQ = [
  { q: "Was kostet die Beratung?", a: "Nichts. HypoCasa wird von Banken, Versicherungen und Pensionskassen entschädigt, wenn eine Finanzierung zustande kommt. Kein Abschluss, keine Kosten." },
  { q: "Was bedeutet Finanzierungsbestätigung innert 24 Stunden?", a: "Nach dem Erstgespräch und mit den nötigen Unterlagen erhalten Sie innert eines Werktages eine Finanzierungsbestätigung. Damit können Sie beim Kauf sofort ein Angebot machen." },
  { q: "Wie viel Eigenkapital brauche ich?", a: "In der Regel mindestens 20% des Kaufpreises. Davon müssen mindestens 10% aus «harten» Eigenmitteln stammen, also nicht aus der Pensionskasse." },
  { q: "Wie wird die Tragbarkeit berechnet?", a: "Banken rechnen mit einem kalkulatorischen Zins von rund 5% plus Nebenkosten und Amortisation. Diese Kosten sollten höchstens etwa einen Drittel des Bruttoeinkommens ausmachen." },
  { q: "Wann sollte ich mich um die Verlängerung kümmern?", a: "Idealerweise 12 bis 18 Monate vor Ablauf. Viele Anbieter offerieren Forward-Hypotheken, mit denen Sie sich die heutigen Konditionen sichern können." },
  { q: "Was ist der SARON-Alarm?", a: "Ein kostenloser Service: Wir beobachten den SARON und die Festzinsen und melden uns, wenn ein Wechsel, zum Beispiel zur Festhypothek, sinnvoll ist." },
  { q: "Welche Unterlagen braucht es?", a: "Lohnausweis, Steuererklärung, Betreibungsauszug, Pensionskassenausweis, Nachweis der Eigenmittel und die Objektunterlagen. Wir sagen Ihnen genau, was fehlt." },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xl font-extrabold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: RED }}>
        <Home className="h-4.5 w-4.5" strokeWidth={2.5} />
      </span>
      <span>
        Hypo<span style={{ color: RED }}>Casa</span>
      </span>
    </span>
  );
}

export default function HypoCasaPage() {
  const year = new Date().getFullYear();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" aria-label="HypoCasa, zum Seitenanfang">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#leistungen" className="hover:text-slate-900">Leistungen</a>
            <a href="#saron" className="hover:text-slate-900">SARON-Alarm</a>
            <a href="#ablauf" className="hover:text-slate-900">Ablauf</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <a href="#analyse" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: RED }}>
            Analyse starten
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero + Funnel */}
        <section className="bg-gradient-to-b from-[#fdf3f2] to-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-14 lg:pb-20 lg:pt-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: RED }}>
                Unabhängige Hypothekenberatung
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                Die beste Hypothek aus <span style={{ color: RED }}>über 50 Angeboten.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Banken, Versicherungen und Pensionskassen im Vergleich. Für Kauf, Verlängerung oder Aufstockung, persönlich beraten und für Sie kostenlos.
              </p>
              <ul className="mt-6 grid gap-2.5 text-slate-800">
                {["Finanzierungsbestätigung innert 24 Stunden", "Persönlich und kostenlos", "SARON-Alarm, PK-Vorbezug und Säule 3a inklusive"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: RED }}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 hidden items-center gap-2 text-sm text-slate-500 lg:flex">
                <ShieldCheck className="h-4 w-4" /> Partner von{" "}
                <a href={NOVIDOM_URL} className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">
                  NoviDom Immo
                </a>
              </p>
            </div>
            <div id="analyse" className="scroll-mt-20">
              <HypoFunnel />
            </div>
          </div>
        </section>

        {/* Kennzahlen */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.big} className="px-2 text-center">
                <div className="text-3xl font-extrabold tabular-nums" style={{ color: RED }}>{s.big}</div>
                <div className="mt-1 text-sm text-slate-600">{s.text}</div>
              </div>
            ))}
          </div>
          <p className="pb-4 text-center text-[11px] text-slate-400">Ø-Ersparnis: Erfahrungswert von HypoCasa, über die gesamte Laufzeit gerechnet.</p>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="scroll-mt-16 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Für jede Situation die passende Finanzierung.</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Ob erstes Eigenheim, auslaufende Festhypothek oder Umbau: Wir holen die Angebote ein und verhandeln für Sie.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <a key={s.title} href={s.href} className="group rounded-2xl border border-slate-200 p-6 transition hover:border-[#c0392b] hover:shadow-lg hover:shadow-slate-900/5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fdf3f2]" style={{ color: RED }}>
                    <s.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: RED }}>
                    Mehr erfahren <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* SARON-Alarm */}
        <section id="saron" className="scroll-mt-16 text-white" style={{ background: RED }}>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                <BellRing className="h-4 w-4" /> Kostenloser Service
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">SARON-Alarm: Wir passen auf Ihre Hypothek auf.</h2>
              <p className="mt-4 text-white/85">
                Zinsen ändern sich, Ihre Hypothek läuft weiter. Wir beobachten den SARON und die Festzinsen und melden uns, wenn ein Wechsel oder eine
                Forward-Hypothek Geld spart. Und rechtzeitig vor Ablauf Ihrer Festhypothek.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-slate-900">
              <ul className="grid gap-3 text-sm">
                {[
                  "Meldung, sobald sich ein Wechsel lohnt",
                  "Erinnerung 12 Monate vor Ablauf",
                  "Neue Offerten aus über 50 Anbietern",
                  "Kein Abo, keine Kosten, jederzeit abbestellbar",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
              <a href="#analyse-saron" className="mt-6 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white" style={{ background: RED }}>
                SARON-Alarm aktivieren <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Ablauf */}
        <section id="ablauf" className="scroll-mt-16 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">So einfach geht&apos;s.</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-white" style={{ background: RED }}>
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
              <div>
                <h3 className="text-xl font-bold">Unser Versprechen</h3>
                <p className="mt-2 text-sm text-slate-600">
                  <Clock className="mr-1 inline h-4 w-4" style={{ color: RED }} />
                  Antwort innert 24 Stunden, an Werktagen.
                </p>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {GUARANTEE.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} strokeWidth={3} />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Verknüpfung mit NoviDom */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-900 p-7 text-white sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Partner</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Immobilie kaufen oder verkaufen?</h2>
              <p className="mt-3 text-white/75">
                Unser Partner NoviDom Immo verkauft Immobilien von der Nordwestschweiz bis zum Vierwaldstättersee. Transparent, persönlich und zur
                Provision ab 0.95%.
              </p>
              <a href={NOVIDOM_URL} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90">
                Zu NoviDom Immo <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 p-7 sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: RED }}>
                Schon NoviDom-Kunde?
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Ihr Finanzierungs-Pass kommt direkt zu uns.</h2>
              <p className="mt-3 text-slate-600">
                Den Finanzierungs-Pass und den Hypothekenwächter aus dem NoviDom-Kundenportal bearbeiten wir direkt. Sie müssen nichts doppelt eingeben.
              </p>
              <a href={`${NOVIDOM_URL}/login`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: RED }}>
                Zum Kundenportal <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Häufige Fragen</h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {FAQ.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="text-xl leading-none transition group-open:rotate-45" style={{ color: RED }}>+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Abschluss */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Users className="mx-auto h-8 w-8" style={{ color: RED }} />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Klären wir Ihre Finanzierung.</h2>
            <p className="mt-3 text-slate-600">Zwei Minuten online, danach melden wir uns persönlich. Unverbindlich und kostenlos.</p>
            <a href="#analyse" className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-white" style={{ background: RED }}>
              Kostenlose Analyse starten <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white pb-24 pt-10 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Logo className="text-lg text-slate-900" />
          <p>
            © {year} HypoCasa · Partner von{" "}
            <a href={NOVIDOM_URL} className="underline underline-offset-2 hover:text-slate-800">
              NoviDom Immo
            </a>
          </p>
        </div>
      </footer>

      <MobileCta />
    </>
  );
}
