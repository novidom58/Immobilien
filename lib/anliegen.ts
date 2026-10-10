// Das Anliegen einer Anfrage steuert Formular, Lead, CRM-Rollen und den
// Fokus im Kundenportal. So landet jede Anfrage dort, wo sie hingehört.

export const ANLIEGEN = ["verkaufen", "kaufen", "finanzieren", "umbauen", "versichern"] as const;
export type Anliegen = (typeof ANLIEGEN)[number];

export const ANLIEGEN_CONFIG: Record<
  Anliegen,
  { label: string; title: string; text: string; submit: string; portalLabel: string }
> = {
  verkaufen: {
    label: "Verkaufen",
    title: "Starten wir Ihren Verkauf.",
    text: "Ein persönliches Bewertungsgespräch mit unserem Team, unverbindlich und kostenlos.",
    submit: "Kostenlose Bewertung anfragen",
    portalLabel: "Wertmonitor im Kundenportal starten",
  },
  kaufen: {
    label: "Kaufen",
    title: "Finden wir Ihr neues Zuhause.",
    text: "Sagen Sie uns, was Sie suchen. Passende Objekte erhalten Sie zuerst, oft schon vor den Portalen.",
    submit: "Suchauftrag senden",
    portalLabel: "Kundenkonto eröffnen und Suchprofil speichern",
  },
  finanzieren: {
    label: "Finanzieren",
    title: "Klären wir Ihre Finanzierung.",
    text: "Mit HypoCasa vergleichen wir über 50 Anbieter. Persönlich, neutral und kostenlos.",
    submit: "Finanzierungsberatung anfragen",
    portalLabel: "Finanzierungs-Pass im Kundenportal holen",
  },
  umbauen: {
    label: "Umbauen",
    title: "Planen wir Ihren Umbau.",
    text: "Erzählen Sie uns, was Sie vorhaben. Sie erhalten eine erste Einschätzung zu Kosten, Ablauf und Förderung.",
    submit: "Umbau-Beratung anfragen",
    portalLabel: "Ideen im Grundriss-Planer ausprobieren",
  },
  versichern: {
    label: "Versichern",
    title: "Sichern wir Ihr Zuhause ab.",
    text: "Wir prüfen Ihre Policen und zeigen, wo Lücken sind. Unverbindlich und kostenlos.",
    submit: "Versicherungs-Check anfragen",
    portalLabel: "Versicherungs-Check im Kundenportal",
  },
};

/** Bereichsname einer Leistungsseite → passendes Anliegen. */
export function anliegenFromTopic(topic: string | undefined): Anliegen | null {
  const t = (topic ?? "").toLowerCase();
  if (t.startsWith("kaufen & verkaufen") || t === "verkaufen") return "verkaufen";
  if (t === "kaufen") return "kaufen";
  if (t.startsWith("finanz")) return "finanzieren";
  if (t.startsWith("umbau")) return "umbauen";
  if (t.startsWith("versich")) return "versichern";
  return null;
}

export function isAnliegen(value: unknown): value is Anliegen {
  return typeof value === "string" && (ANLIEGEN as readonly string[]).includes(value);
}

/** Portal-Link, der nach dem Login direkt den passenden Bereich zeigt. */
export function portalHref(anliegen: Anliegen) {
  if (anliegen === "umbauen") return "/dashboard/planer/demo";
  return `/login?redirect=${encodeURIComponent(`/dashboard?fokus=${anliegen}`)}`;
}

/** Wechselt das Anliegen im Kontaktformular derselben Seite (z.B. aus dem Puzzle). */
export function selectAnliegen(anliegen: Anliegen) {
  window.dispatchEvent(new CustomEvent("nd:anliegen", { detail: anliegen }));
}
