"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";
import { AREAS, areaHref, type AreaId } from "@/components/novidom360/areas";
import { Compass } from "@/components/novidom360/Compass";
import { PuzzleHub } from "@/components/novidom360/PuzzleHub";

export function SolutionsHub() {
  const router = useRouter();
  // Jeder Bereich hat seine eigene Seite mit allen Infos und dem Ansprechpartner.
  const open = (id: AreaId) => router.push(areaHref(id));

  return (
    <section id="leistungen" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <SectionLabel>NoviDom 360°</SectionLabel>
          <h2 className="mt-6 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
            Eine Immobilie. <span className="text-amber-soft">Vier Lösungen.</span>
          </h2>
          <p className="mt-4 max-w-xl text-balance text-lg text-ivory-dim">
            Wählen Sie, wo Sie gerade stehen. Wir verbinden den Rest.
          </p>
        </div>

        <div className="mt-12">
          <PuzzleHub onSelect={open} />
          <p className="mt-6 hidden text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim/60 sm:block">
            Ein Teil wählen, um mehr zu erfahren
          </p>
        </div>

        <div className="mt-8 grid gap-2 sm:hidden">
          {AREAS.map((a) => (
            <Link
              key={a.id}
              href={areaHref(a.id)}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-blueprint">{a.num}</span>
              <a.icon className="h-4 w-4 text-amber-soft" strokeWidth={1.5} />
              <span className="font-display font-semibold text-ivory">{a.title}</span>
              <span className="ml-auto text-amber">→</span>
            </Link>
          ))}
        </div>

        <Reveal className="mt-24 text-center">
          <h3 className="mx-auto max-w-3xl text-balance font-display text-2xl font-semibold leading-tight text-ivory lg:text-4xl">
            Warum vier Ansprechpartner, wenn <span className="text-amber-soft">einer alles verbinden kann?</span>
          </h3>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-ivory">
            <span>«Ich möchte meine Immobilie verkaufen»</span>
            <span aria-hidden className="text-amber">——————→</span>
            <span>«Ich habe mein neues Zuhause bezogen»</span>
          </div>
        </Reveal>
      </div>

      <Compass onSelect={open} />
    </section>
  );
}
