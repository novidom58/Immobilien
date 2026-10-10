import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FinalCta } from "@/components/sections/FinalCta";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { Process } from "@/components/sections/Process";
import { ProvisionsRechner } from "@/components/sections/ProvisionsRechner";
import { Preparation } from "@/components/sections/Preparation";
import { Situations } from "@/components/sections/Situations";
import { SalesCockpit } from "@/components/sections/SalesCockpit";
import { AREAS } from "@/components/novidom360/areas";
import { AREA_CONTACTS, AREA_CONTENT } from "@/components/novidom360/areaContent";
import { AreaContactCard, AreaFaq, AreaInteractive, OtherAreas } from "@/components/leistungen/AreaParts";
import { FinanzierenContent } from "@/components/leistungen/FinanzierenContent";
import { Giraffe360Showcase } from "@/components/leistungen/Giraffe360Showcase";

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = AREAS.find((a) => a.slug === slug);
  if (!area) return { title: "Nicht gefunden" };
  const content = AREA_CONTENT[area.id];
  return {
    title: `${area.title} — NoviDom 360°`,
    description: content.intro,
    alternates: { canonical: `/leistungen/${area.slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = AREAS.find((a) => a.slug === slug);
  if (!area) notFound();

  const content = AREA_CONTENT[area.id];
  const contact = AREA_CONTACTS[area.id];
  // Finanzieren läuft mit HypoCasa und übernimmt deren Rot als Akzentfarbe.
  const themeStyle = content.accentColor
    ? ({ "--color-amber": content.accentColor, "--color-amber-soft": content.accentColor } as React.CSSProperties)
    : undefined;

  return (
    <>
      <Header />
      <main className="bg-ink" style={themeStyle}>
        {/* Kopf im Editorial-Stil der Startseite */}
        <section className="mx-auto max-w-5xl px-6 pb-12 pt-36 text-center lg:pt-44">
          <Link href="/#leistungen" className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim hover:text-ivory">
            ← NoviDom 360°
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-3 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim">
            <area.icon className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} />
            {area.num} · {area.title}
          </div>
          <h1 className="mt-7 text-balance font-display text-[clamp(2.4rem,5.5vw,4.8rem)] font-normal leading-[1.05] tracking-[-0.03em] text-ivory">
            {content.headline}
            <br />
            <em>{content.accent}</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim">{content.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#kontakt" className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber">
              {content.cta}
            </a>
            <a
              href="#ansprechpartner"
              className="rounded-full border border-line bg-ink px-7 py-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory"
            >
              Ihr Ansprechpartner
            </a>
          </div>
          {content.badges && (
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ivory-dim">
              {content.badges.map((badge) => (
                <span key={badge} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
                  {badge}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)] sm:aspect-[16/7]">
            <Image src={content.image} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" preload className="object-cover object-[60%_center]" />
          </div>
        </section>

        {area.id === "fin" ? (
          <FinanzierenContent />
        ) : (
          <>
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
              <SectionLabel>Das bringen wir mit</SectionLabel>
              <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {content.benefits.map((b, i) => (
                  <div key={b.title} className="border-t border-line pt-6">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-amber">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 font-display text-xl text-ivory">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{b.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 pb-24 lg:px-10">
              <AreaInteractive id={area.id} title={area.title} />
            </section>
          </>
        )}

        {area.id === "kv" && (
          <>
            <Giraffe360Showcase />
            <ProblemSolution />
            <Process />
            <ProvisionsRechner />
            <Preparation />
            <Situations />
            <SalesCockpit />
          </>
        )}

        <section id="ansprechpartner" className="mx-auto max-w-5xl scroll-mt-28 px-4 pb-24 lg:px-10">
          <AreaContactCard contact={contact} />
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-10">
          <SectionLabel>Häufige Fragen</SectionLabel>
          <h2 className="mb-8 mt-6 font-display text-3xl text-ivory lg:text-4xl">Gut zu wissen.</h2>
          <AreaFaq items={content.faq} />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <SectionLabel>NoviDom 360°</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            Der nächste Schritt <em>gleich mit dabei.</em>
          </h2>
          <OtherAreas current={area.id} />
        </section>

        <FinalCta title={content.closing.title} text={content.closing.text} topic={area.title} />
      </main>
      <Footer />
    </>
  );
}
