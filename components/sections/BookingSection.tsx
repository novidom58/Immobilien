import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

// Aktiviert sich, sobald NEXT_PUBLIC_CAL_LINK gesetzt ist (z.B. "novidom/beratung"
// nach dem Erstellen eines kostenlosen Cal.com-Kontos). Ohne den Wert wird die
// Sektion gar nicht gerendert - kein kaputter Platzhalter auf der Live-Seite.
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

export function BookingSection() {
  if (!CAL_LINK) return null;

  return (
    <section id="termin" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Direkt buchen</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Bewertungstermin <span className="text-amber-soft">online wählen</span>.
        </h2>
        <p className="mt-5 max-w-xl text-balance text-lg text-ivory-dim">
          Wählen Sie direkt einen passenden Termin — ohne Hin und Her per
          E-Mail.
        </p>

        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-ink-2">
            <iframe
              src={`https://cal.com/${CAL_LINK}?theme=dark&hide_landing_page_details=1`}
              title="Termin buchen"
              className="h-[680px] w-full"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
