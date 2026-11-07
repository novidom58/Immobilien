import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";
import { RatgeberCard } from "@/components/ratgeber/RatgeberCard";
import { ARTICLES } from "@/lib/ratgeber";

/**
 * Ratgeber auf der Startseite: die neuesten Beiträge als Einladung zum
 * Weiterlesen. Wer liest, bleibt länger und kommt mit Vertrauen zurück.
 */
export function RatgeberHome({ limit = 4 }: { limit?: number }) {
  const articles = [...ARTICLES].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, limit);
  if (!articles.length) return null;
  return (
    <section id="ratgeber" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionLabel>Ratgeber</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Kurz gelesen, <span className="text-amber-soft">besser entschieden.</span>
            </h2>
            <p className="mt-4 max-w-xl text-ivory-dim">
              Zinsen, Steuern, Umbau und Versicherung: was die aktuellen News für Ihr Zuhause bedeuten. In wenigen Minuten, mit Quellen und Rechner.
            </p>
          </Reveal>
          <Link href="/ratgeber" className="font-mono text-xs uppercase tracking-wide text-ivory-dim underline underline-offset-4 hover:text-ivory">
            Alle Beiträge →
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {articles.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.06}>
              <RatgeberCard article={a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
