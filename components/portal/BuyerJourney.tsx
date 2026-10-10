import { Check } from "lucide-react";

const STEPS = [
  { key: "profil", title: "Suchprofil", text: "Wunschort, Budget und Zimmer festlegen, Käufer-Alarm aktivieren.", href: "#suchprofil" },
  { key: "pass", title: "Finanzierungs-Pass", text: "Kaufkraft prüfen. So sind Sie bei Besichtigungen bevorzugt.", href: "#finanzierung" },
  { key: "objekt", title: "Objekt gefunden", text: "Favoriten merken, Grundriss einrichten, Monatskosten prüfen.", href: "#objekte" },
  { key: "besichtigung", title: "Besichtigung", text: "Termin online buchen oder per WhatsApp anfragen.", href: "#objekte" },
  { key: "bestaetigt", title: "Finanzierung bestätigt", text: "HypoCasa bestätigt verbindlich innert 24 Stunden.", href: "#finanzierung" },
  { key: "angebot", title: "Angebot & Reservation", text: "Wir verhandeln mit Ihnen und halten das Objekt mit einer Reservation fest.", href: null },
  { key: "notar", title: "Notar & Schlüssel", text: "Kaufvertrag beurkunden, Versicherung abschliessen, einziehen.", href: "#versicherung" },
] as const;

export type JourneyState = Partial<Record<(typeof STEPS)[number]["key"], boolean>>;

/** Der Kaufprozess Schritt für Schritt, erledigte Schritte abgehakt. */
export function BuyerJourney({ done }: { done: JourneyState }) {
  const current = STEPS.findIndex((s) => !done[s.key]);
  return (
    <ol className="grid gap-2 sm:grid-cols-7 sm:gap-1">
      {STEPS.map((s, i) => {
        const isDone = Boolean(done[s.key]);
        const isCurrent = i === current;
        const body = (
          <>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isDone ? "bg-amber text-white" : isCurrent ? "border-2 border-amber bg-white text-amber" : "border border-line bg-white text-ivory-dim"
              }`}
            >
              {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${isDone || isCurrent ? "text-ivory" : "text-ivory-dim"}`}>{s.title}</span>
              {isCurrent && <span className="mt-0.5 block text-xs leading-snug text-ivory-dim">{s.text}</span>}
            </span>
          </>
        );
        return (
          <li key={s.key} className={`rounded-xl p-2 ${isCurrent ? "bg-white shadow-sm sm:col-span-1" : ""}`}>
            {s.href && !isDone ? (
              <a href={s.href} className="flex items-start gap-3 sm:flex-col sm:gap-2">
                {body}
              </a>
            ) : (
              <div className="flex items-start gap-3 sm:flex-col sm:gap-2">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
