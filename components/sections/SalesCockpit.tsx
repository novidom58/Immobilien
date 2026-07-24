import { Eye, Scan, FileDown, CalendarCheck, FileText, MessageSquare } from "lucide-react";
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

const documents = ["Exposé.pdf", "Grundbuchauszug.pdf", "Energieausweis.pdf"];

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
            <div className="relative rounded-2xl border border-line bg-ink p-5 shadow-2xl shadow-black/40 lg:p-7">
              <span className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim/40">
                Beispielansicht
              </span>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-ivory-dim/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-ivory-dim/20" />
                <span className="ml-3 font-mono text-xs text-ivory-dim/60">
                  Verkaufs-Cockpit — Musterstrasse 12, Basel
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-ink-2 p-4">
                    <stat.icon className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    <div className="mt-3 font-display text-2xl font-semibold text-ivory">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[11px] leading-tight text-ivory-dim">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-ink-2 p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Aktivitäten
                  </div>
                  <ul className="space-y-3">
                    {activity.map((item) => (
                      <li key={item.text} className="text-xs text-ivory-dim">
                        <span className="text-ivory">{item.text}</span>
                        <div className="mt-0.5 text-ivory-dim/50">{item.time}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-ink-2 p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dokumente
                  </div>
                  <ul className="space-y-2.5">
                    {documents.map((doc) => (
                      <li
                        key={doc}
                        className="flex items-center gap-2 text-xs text-ivory-dim"
                      >
                        <span className="h-1 w-1 rounded-full bg-amber/70" />
                        {doc}
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
