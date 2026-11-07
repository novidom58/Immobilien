import { Eye, Scan, FileDown, CalendarCheck, MessageSquare, Users, Check, LineChart, Calculator, ShieldCheck, Home } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/lib/reveal";

const stats = [
  { icon: Eye, value: "128", label: "Inseratsaufrufe" },
  { icon: Scan, value: "42", label: "3D-Rundgang-Aufrufe" },
  { icon: FileDown, value: "18", label: "Exposé-Downloads" },
  { icon: CalendarCheck, value: "6", label: "Besichtigungsanfragen" },
];

const activity = [
  { text: "Neue Besichtigungsanfrage erhalten", time: "vor 2 Std." },
  { text: "Exposé von Interessent:in heruntergeladen", time: "vor 6 Std." },
  { text: "3D-Rundgang angesehen (2. Mal)", time: "vor 1 Tag" },
];

const tiles = [
  { icon: LineChart, label: "Mein Verkauf", status: "128 Aufrufe · 6 Anfragen", on: true },
  { icon: Home, label: "Mein Eigentum", status: "Richtwert CHF 1.24 Mio.", on: true },
  { icon: Calculator, label: "Finanzierung", status: "Nächstes Zuhause planen", on: false },
  { icon: ShieldCheck, label: "Versicherung", status: "3 Policen erfasst", on: false },
];

const steps = [
  { label: "Fotos & 3D", state: "done" },
  { label: "Online", state: "done" },
  { label: "Besichtigungen", state: "now" },
  { label: "Verkauft", state: "todo" },
] as const;

export function SalesCockpit() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Für aktive Kunden</SectionLabel>

        <div className="mt-10 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Ihr Verkauf.
              <br />
              <span className="text-amber-soft">Jederzeit im Überblick.</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Im persönlichen Verkaufs-Cockpit sehen Sie in Echtzeit, wie viele
              Interessenten Ihr Inserat ansehen, wer sich Ihren 3D-Rundgang
              anschaut und wer eine Besichtigung wünscht — inklusive aller
              Dokumente und Korrespondenz an einem Ort.
            </p>
            <p className="mt-4 max-w-md text-balance text-ivory-dim">
              Volle Transparenz, ohne nachfragen zu müssen. Sie erhalten Ihren
              Zugang automatisch mit Start Ihres Verkaufsmandats.
            </p>

            <div className="mt-8">
              <MagneticButton href="/login">Zum Kundenlogin</MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative rounded-2xl border border-line bg-ink p-5 shadow-2xl shadow-black/20 lg:p-7">
              <span className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim/50">
                Beispielansicht
              </span>
              <div className="font-display text-2xl text-ivory">
                Mein <em>Immobilienplan</em>
              </div>
              <div className="mt-1 font-mono text-xs text-ivory-dim/70">Musterstrasse 12, Basel</div>

              {/* Übersicht wie im Portal */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tiles.map((t) => (
                  <div key={t.label} className={`rounded-xl border p-3 ${t.on ? "border-line bg-white" : "border-dashed border-line bg-ink-2/60"}`}>
                    <t.icon className="h-4 w-4 text-amber" strokeWidth={1.6} />
                    <div className="mt-2 text-sm font-semibold leading-tight text-ivory">{t.label}</div>
                    <div className="mt-0.5 text-[11px] leading-tight text-ivory-dim">{t.status}</div>
                  </div>
                ))}
              </div>

              {/* Verkaufsschritte */}
              <div className="mt-5 rounded-xl border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  {steps.map((st, i) => (
                    <div key={st.label} className="flex flex-1 items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          st.state === "done" ? "bg-amber text-white" : st.state === "now" ? "border-2 border-amber text-amber" : "border border-line text-ivory-dim"
                        }`}
                      >
                        {st.state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                      </span>
                      <span className={`text-[11px] leading-tight ${st.state === "todo" ? "text-ivory-dim" : "text-ivory"}`}>{st.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-night p-4 text-ink">
                <Users className="h-5 w-5 shrink-0 text-amber-soft" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-lg leading-tight">4 vorgemerkte Käufer passen zu Ihrem Objekt</div>
                  <div className="mt-0.5 text-[11px] text-ink/70">Davon 2 mit Finanzierungs-Pass. Sie erhalten das Objekt im Vorverkauf zuerst.</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-ink-2 p-3">
                    <stat.icon className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    <div className="mt-2 font-display text-xl font-semibold text-ivory">{stat.value}</div>
                    <div className="mt-0.5 text-[11px] leading-tight text-ivory-dim">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-ink-2 p-4">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/70">Feedback nach Besichtigungen</div>
                  <div className="mt-2 font-display text-2xl text-ivory">Ø 4.4 von 5</div>
                  <div className="text-[11px] text-ivory-dim">6 Feedbacks, 3 mit klarem Interesse</div>
                </div>
                <div className="rounded-xl bg-ink-2 p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/70">
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Aktivitäten
                  </div>
                  <ul className="space-y-2">
                    {activity.map((item) => (
                      <li key={item.text} className="text-xs text-ivory-dim">
                        <span className="text-ivory">{item.text}</span> · {item.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
