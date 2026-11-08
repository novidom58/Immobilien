import Image from "next/image";
import {
  CalendarCheck,
  Calculator,
  Eye,
  FileDown,
  FileText,
  Home,
  LineChart,
  MessageSquare,
  Plus,
  Scan,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SaleStepper } from "@/components/SaleStepper";
import { PriceCheck } from "@/components/portal/PriceCheck";
import { Reveal } from "@/lib/reveal";

// Beispielzahlen. Aufbau, Komponenten und Klassen sind dieselben wie im
// echten Kundenportal (app/dashboard/page.tsx), damit die Vorschau stimmt.
const TILES = [
  { icon: LineChart, label: "Mein Verkauf", status: "128 Aufrufe · 6 Anfragen", highlight: true, pin: false },
  { icon: Home, label: "Mein Eigentum", status: "Richtwert CHF 1'240'000", highlight: false, pin: true },
  { icon: Calculator, label: "Finanzierung", status: "Noch nicht geprüft", highlight: false, pin: true },
  { icon: ShieldCheck, label: "Versicherung", status: "3 Policen erfasst", highlight: false, pin: true },
];

const STATS = [
  { icon: Eye, value: 128, label: "Inseratsaufrufe" },
  { icon: Scan, value: 42, label: "3D-Rundgang-Aufrufe" },
  { icon: FileDown, value: 18, label: "Exposé-Downloads" },
  { icon: CalendarCheck, value: 6, label: "Besichtigungsanfragen" },
];

const ACTIVITY = [
  { text: "Neue Besichtigungsanfrage erhalten", date: "heute" },
  { text: "Exposé von Interessent:in heruntergeladen", date: "gestern" },
  { text: "Feedback nach Besichtigung erhalten", date: "vor 2 Tagen" },
];

const DOCUMENTS = ["Verkaufsdokumentation.pdf", "Grundbuchauszug.pdf", "Besichtigungsprotokoll.pdf"];

const PHOTOS = [
  "/images/ki/hf_20261028_215930_11e7f739-e718-48f4-98c6-1e6814f4b75c.webp",
  "/images/ki/hf_20261020_211921_592459a5-4c55-437a-b4b9-e788bfedf73a.webp",
  "/images/ki/hf_20261020_211922_acfeb165-2cc3-475a-86c4-ef3f2ff1018d.webp",
  "/images/ki/hf_20261020_211922_369d43d3-7348-4c69-829b-3e491562efd4.webp",
  "/images/ki/hf_20260724_172033_240313c6-3332-42be-b381-08181cd212e4.webp",
];

export function SalesCockpit() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Für aktive Kunden</SectionLabel>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Ihr Verkauf.
              <br />
              <span className="text-amber-soft">Jederzeit im Überblick.</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Im persönlichen Verkaufs-Cockpit sehen Sie in Echtzeit, wie viele Interessenten Ihr Inserat ansehen, wer sich Ihren 3D-Rundgang
              anschaut und wer eine Besichtigung wünscht, inklusive aller Dokumente an einem Ort.
            </p>
            <p className="mt-4 max-w-md text-balance text-ivory-dim">
              Volle Transparenz, ohne nachfragen zu müssen. Sie erhalten Ihren Zugang automatisch mit Start Ihres Verkaufsmandats.
            </p>

            <div className="mt-8">
              <MagneticButton href="/login">Zum Kundenlogin</MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {/* Ausschnitt aus dem Kundenportal, unten ausgeblendet wie ein Bildschirm */}
            <div className="relative max-h-[860px] overflow-hidden rounded-[28px] border border-line bg-ink p-5 shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)] sm:p-7" aria-label="Beispielansicht des Kundenportals">
              <span className="absolute right-5 top-5 rounded-full bg-white/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim">Beispielansicht</span>

              <div className="font-display text-3xl text-ivory">
                Mein <em>Verkauf</em>
              </div>
              <p className="mt-2 max-w-md text-sm text-ivory-dim">Ihr Verkauf auf einen Blick: Schritt für Schritt, mit allen Zahlen und Dokumenten.</p>

              {/* Übersicht: gleiche Kacheln wie im Portal */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TILES.map((t) => (
                  <div
                    key={t.label}
                    className={`relative flex flex-col rounded-2xl border p-4 ${
                      t.highlight ? "border-line bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]" : "border-dashed border-line bg-ink-2/60"
                    }`}
                  >
                    <t.icon className="h-5 w-5 text-amber" strokeWidth={1.6} />
                    <span className="mt-3 pr-6 font-display text-base leading-tight text-ivory">{t.label}</span>
                    <span className="mt-1 text-[11px] leading-snug text-ivory-dim">{t.status}</span>
                    {t.pin && (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-ivory-dim">
                        <Plus className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 font-display text-2xl text-ivory">Mein Verkauf</div>
              <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-ivory-dim/60">
                    Musterstrasse 12, Basel
                    <span className="rounded-full border border-amber/40 px-2 py-0.5 text-amber-soft">Online</span>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">Öffentliches Inserat ansehen →</span>
                </div>

                <div className="mt-6">
                  <SaleStepper hasPhotos isOnline hasViewingRequests isSold={false} />
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2">
                  {PHOTOS.map((src) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-ink">
                      <Image src={src} alt="" fill sizes="110px" className="object-cover" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4 rounded-xl bg-night p-4 text-ink">
                  <Users className="h-6 w-6 shrink-0 text-amber-soft" strokeWidth={1.5} />
                  <div>
                    <div className="font-display text-xl">4 vorgemerkte Käufer passen zu Ihrem Objekt</div>
                    <div className="mt-0.5 text-xs text-ink/70">Davon 2 mit Finanzierungs-Pass. Sie erhalten das Objekt im Off-Market-Vorverkauf zuerst.</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-ink p-4">
                      <stat.icon className="h-4 w-4 text-amber" strokeWidth={1.5} />
                      <div className="mt-3 font-display text-2xl font-semibold text-ivory">{stat.value}</div>
                      <div className="mt-1 text-[11px] leading-tight text-ivory-dim">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <PriceCheck price={1240000} area={135} type="Haus" region="Basel-Stadt" feedback={{ zu_tief: 1, passt: 4, zu_hoch: 1 }} />
                  <div className="rounded-xl bg-ink p-4">
                    <div className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Besichtigungen</div>
                    <div className="mt-3 font-display text-3xl text-ivory">6</div>
                    <div className="text-[11px] text-ivory-dim">Feedbacks, 3 mit klarem Interesse</div>
                    <div className="mt-2 text-sm text-amber">Ø 4.4 von 5 Sternen</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-ink p-4">
                    <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                      <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Aktivitäten
                    </div>
                    <ul className="space-y-3">
                      {ACTIVITY.map((item) => (
                        <li key={item.text} className="text-xs text-ivory-dim">
                          <span className="text-ivory">{item.text}</span>
                          <div className="mt-0.5 text-ivory-dim/50">{item.date}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-ink p-4">
                    <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                      <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Dokumente
                    </div>
                    <ul className="space-y-2.5">
                      {DOCUMENTS.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-xs text-ivory-dim">
                          <span className="h-1 w-1 rounded-full bg-amber/70" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Unten weich ausblenden, wie ein Bildschirmausschnitt */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
