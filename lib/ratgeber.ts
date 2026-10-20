import type { AreaId } from "@/components/novidom360/areas";

export type RatgeberArticle = {
  slug: string;
  area: AreaId;
  category: string;
  title: string;
  description: string;
  /** ISO-Datum der Erstpublikation bzw. der letzten inhaltlichen Aktualisierung */
  published: string;
  updated: string;
  readingMinutes: number;
  lead: string;
  sections: { heading: string; paragraphs: string[] }[];
  takeaways: string[];
  cta: { href: string; label: string; text: string };
  sources: { label: string; url: string }[];
};

// Beiträge nach aktuellen Meldungen. Zahlen stehen immer mit Quelle; vor
// einer Aktualisierung die Originalquellen erneut prüfen.
export const ARTICLES: RatgeberArticle[] = [
  {
    slug: "festhypothek-steigt-trotz-nullzins",
    area: "fin",
    category: "Finanzieren",
    title: "Festhypotheken steigen trotz Nullzins: Was Eigentümer bis Dezember tun sollten",
    description:
      "Die SNB lässt den Leitzins bei 0 %, trotzdem werden Festhypotheken teurer. Warum das so ist und wie Sie zwischen SARON, Festhypothek und Mix entscheiden.",
    published: "2026-10-20",
    updated: "2026-10-20",
    readingMinutes: 5,
    lead: "Die Schweizerische Nationalbank hat den Leitzins am 24. September 2026 bei 0 % belassen. Trotzdem sind Festhypotheken teurer geworden. Der Grund: Festzinsen folgen den langfristigen Zinsen am Kapitalmarkt, nicht direkt dem Leitzins. SARON-Hypotheken bleiben dagegen stabil, solange die SNB nichts ändert.",
    sections: [
      {
        heading: "Was die SNB entschieden hat",
        paragraphs: [
          "Die Inflation lag im August 2026 bei 0,8 %. SNB-Präsident Martin Schlegel erwartet, dass sie 2027 wieder sinkt, und sah deshalb keinen Grund für eine Erhöhung. Der nächste Zinsentscheid ist am 10. Dezember 2026.",
          "Ein Teil der Beobachter hält eine Erhöhung im Dezember für wahrscheinlicher als bisher, andere rechnen erst 2027 damit. Sicher ist: Der Spielraum nach unten ist bei 0 % weitgehend ausgeschöpft.",
        ],
      },
      {
        heading: "Warum Festhypotheken trotzdem steigen",
        paragraphs: [
          "Banken refinanzieren eine Festhypothek über die ganze Laufzeit. Erwartet der Markt in einigen Jahren höhere Zinsen, werden lange Laufzeiten heute schon teurer. Eine Auswertung nennt für fünfjährige Festhypotheken 1,81 % am 22. September 2026, nach 1,31 % im Juni 2025.",
          "Dazu kommen strengere Vorgaben für die Banken. Seit der Umsetzung von Basel III und der Kritik der FINMA an zu lockerer Vergabe sind die Margen laut Berichten gestiegen.",
        ],
      },
      {
        heading: "SARON, Festhypothek oder beides?",
        paragraphs: [
          "Die SARON-Hypothek ist heute meist die günstigste Variante, der Zins kann sich aber alle drei Monate ändern. Sie passt, wenn Sie Schwankungen aushalten und bei Bedarf rasch amortisieren können.",
          "Die Festhypothek kostet mehr, dafür kennen Sie Ihre Kosten für die ganze Laufzeit. Sie passt, wenn das Budget knapp kalkuliert ist oder Sie Ruhe wollen.",
          "Viele Eigentümer teilen die Hypothek auf: einen Teil SARON, einen Teil fest, mit gestaffelten Laufzeiten. So läuft nie alles gleichzeitig aus, und Sie profitieren von beiden Welten.",
        ],
      },
      {
        heading: "Ihre Hypothek läuft 2027 aus?",
        paragraphs: [
          "Mit einer Forward-Hypothek fixieren Sie den Zins heute für eine Hypothek, die erst später beginnt, meist bis zu zwei oder drei Jahre im Voraus. Dafür zahlen Sie einen Zuschlag. Ob sich das lohnt, hängt von Ihrer Erwartung und Ihrem Sicherheitsbedürfnis ab.",
          "Wichtig ist der Zeitpunkt: Zwölf bis achtzehn Monate vor Ablauf sollten Sie Offerten vergleichen. Die eigene Bank ist selten automatisch die günstigste.",
        ],
      },
    ],
    takeaways: [
      "Ablaufdatum Ihrer Hypothek heraussuchen.",
      "Läuft sie in den nächsten 18 Monaten aus: jetzt Offerten vergleichen lassen.",
      "Den SARON-Alarm aktivieren, dann melden wir uns, wenn sich ein Wechsel lohnt.",
    ],
    cta: {
      href: "/leistungen/finanzieren",
      label: "Zum Zinsbarometer",
      text: "Aktuelle Richtzinsen für SARON und Festhypotheken, Schnell-Check zur Tragbarkeit und SARON-Alarm.",
    },
    sources: [
      { label: "watson: SNB-Leitzins bleibt im September 2026 bei 0 Prozent", url: "https://www.watson.ch/wirtschaft/best-of-watson/724087030-snb-leitzins-bleibt-im-september-2026-bei-0-prozent-was-das-bedeutet" },
      { label: "Blick: Schlegel rüttelt nicht am Nullzins", url: "https://www.blick.ch/wirtschaft/trotz-gestiegener-inflation-snb-praesident-martin-schlegel-ruettelt-nicht-am-leitzins-id22276096.html" },
      { label: "Marlin: Saron oder Festhypothek vor dem SNB-Entscheid", url: "https://marlin-immo.ch/blog/saron-oder-festhypothek-snb-september-2026" },
      { label: "cash.ch: Hypotheken im Umbruch durch Regulierung", url: "https://www.cash.ch/news/top-news/hypotheken-im-umbruch-das-sind-die-folgen-von-immer-mehr-regulierung-944539" },
    ],
  },
  {
    slug: "eigenmietwert-2029-renovieren",
    area: "umbau",
    category: "Umbauen",
    title: "Eigenmietwert fällt 2029: Diese Renovationen lohnen sich bis Ende 2028",
    description:
      "Ab 1. Januar 2029 entfällt der Abzug für Unterhaltskosten bei selbst genutztem Wohneigentum. Was das heisst und welche Arbeiten Sie vorziehen sollten.",
    published: "2026-10-20",
    updated: "2026-10-20",
    readingMinutes: 5,
    lead: "Der Eigenmietwert wird per 1. Januar 2029 abgeschafft. Das hat der Bundesrat am 1. April 2026 festgelegt, nach dem Ja an der Urne vom 28. September 2025. Ab dann können Sie bei selbst genutztem Wohneigentum keine Unterhaltskosten mehr vom Einkommen abziehen. Wer ohnehin renovieren will, sollte die Arbeiten bis Ende 2028 ausführen und bezahlen.",
    sections: [
      {
        heading: "Was sich ab 2029 ändert",
        paragraphs: [
          "Sie versteuern keinen Eigenmietwert mehr. Im Gegenzug fallen bei selbst genutztem Eigentum die Abzüge für Unterhalt und Schuldzinsen weg. Bei vermieteten Liegenschaften bleiben sie bestehen.",
          "Kosten für die Denkmalpflege bleiben beim Bund abziehbar. Die Kantone können Abzüge für Energiespar- und Umweltschutzmassnahmen weiterhin zulassen. Was Ihr Kanton macht, ist teilweise noch offen.",
        ],
      },
      {
        heading: "Schuldzinsen und Ersterwerber",
        paragraphs: [
          "Wer erstmals Wohneigentum kauft, erhält einen befristeten Schuldzinsabzug: im ersten Jahr bis CHF 10'000 für Ehepaare und CHF 5'000 für Alleinstehende, danach über zehn Jahre linear sinkend.",
          "Eine tiefe Hypothek lohnt sich steuerlich dadurch eher als bisher. Ob Sie amortisieren oder das Geld anders anlegen, rechnen wir mit Ihnen durch.",
        ],
      },
      {
        heading: "Welche Arbeiten Sie vorziehen sollten",
        paragraphs: [
          "Abziehbar sind werterhaltende Arbeiten: ein Bad oder eine Küche in gleichwertigem Standard ersetzen, Dach, Fassade, Fenster oder Leitungen erneuern. Wertvermehrende Teile waren nie vom Einkommen abziehbar, sie zählen später bei der Grundstückgewinnsteuer.",
          "Energetische Massnahmen wie Wärmepumpe, Dämmung oder Solaranlage sind doppelt interessant: Abzug bis Ende 2028 und dazu Förderbeiträge von Bund und Kanton. Das Fördergesuch muss vor Baubeginn eingereicht werden.",
          "Grössere Vorhaben lassen sich oft auf zwei Steuerjahre verteilen. So wirkt der Abzug bei hohem Einkommen stärker.",
        ],
      },
      {
        heading: "Früh planen lohnt sich",
        paragraphs: [
          "Wir rechnen damit, dass viele Eigentümer 2027 und 2028 renovieren wollen. Gute Handwerker sind dann schnell ausgebucht. Wer 2027 plant und offeriert, kann 2028 in Ruhe bauen.",
        ],
      },
    ],
    takeaways: [
      "Liste machen: Was steht in den nächsten fünf Jahren ohnehin an?",
      "Werterhaltendes bis Ende 2028 ausführen und bezahlen.",
      "Fördergesuche vor Baubeginn einreichen.",
    ],
    cta: {
      href: "/leistungen/umbauen",
      label: "Richtpreise & Förderung ansehen",
      text: "Was Küche, Bad oder Wärmepumpe kosten, Vorher/Nachher zum Wischen und welche Beiträge es gibt.",
    },
    sources: [
      { label: "HEV Schweiz: Eigenmietwert", url: "https://www.hev-schweiz.ch/politik/steuerrecht/eigenmietwert" },
      { label: "VZ VermögensZentrum: Eigenmietwert wird abgeschafft", url: "https://www.vermoegenszentrum.ch/wissen/eigenmietwert-wird-abgeschafft-das-ist-jetzt-fuer-sie-wichtig" },
      { label: "ZKB: Eigenmietwert fällt weg", url: "https://www.zkb.ch/de/blog/immobilien/eigenmietwert-faellt-weg.html" },
      { label: "Migros Bank: Abschaffung des Eigenmietwerts", url: "https://www.migrosbank.ch/de/ratgeber/wohnen/abschaffung-des-eigenmietwerts-was-sind-die-folgen.html" },
    ],
  },
  {
    slug: "hagel-versicherung-pruefen",
    area: "vers",
    category: "Versichern",
    title: "Nach dem Hagel vom 28. August: So prüfen Sie Ihre Deckung",
    description:
      "Über 1,7 Milliarden Franken Schaden: Wer bei Hagel für Gebäude, Hausrat und Auto zahlt, was Sie jetzt tun müssen und wie Sie Unterversicherung vermeiden.",
    published: "2026-10-20",
    updated: "2026-10-20",
    readingMinutes: 4,
    lead: "Swiss Re schätzt die versicherten Schäden des Unwetters vom 28. August 2026 auf über 1,7 Milliarden Franken, davon rund 800 Millionen an Fahrzeugen. Allein bei der Gebäudeversicherung des Kantons Zürich gingen über 20'000 Meldungen ein. Drei Versicherungen sind bei Hagel zuständig, und bei jeder lohnt sich ein Blick auf die Versicherungssumme.",
    sections: [
      {
        heading: "Wer zahlt was",
        paragraphs: [
          "Das Gebäude, also Dach, Fassade, Storen und fest Verbautes, ist in Basel-Stadt, Basel-Landschaft, Zürich, Zug und Aargau über die kantonale Gebäudeversicherung gegen Elementarschäden versichert.",
          "Möbel, Geräte und Gegenstände im Haus und auf dem Balkon deckt die Hausratversicherung. Elementarschäden wie Hagel sind dort in der Regel enthalten.",
          "Beim Auto zahlt die Teilkasko. Wer nur eine Haftpflicht hat, bleibt auf dem Hagelschaden sitzen.",
        ],
      },
      {
        heading: "Was Sie nach einem Schaden tun",
        paragraphs: [
          "Melden Sie den Schaden so rasch wie möglich. Viele Bedingungen verlangen eine unverzügliche Meldung. Fotografieren Sie alles und werfen Sie nichts weg, bevor die Versicherung es gesehen hat.",
          "Was Sie zumutbar tun können, um den Schaden zu begrenzen, gehört zu Ihren Pflichten, etwa ein beschädigtes Dachfenster abdecken. Diese Kosten werden in der Regel übernommen.",
        ],
      },
      {
        heading: "Die unterschätzte Gefahr: Unterversicherung",
        paragraphs: [
          "Ist die Versicherungssumme beim Hausrat zu tief, kürzt die Versicherung den Schaden im gleichen Verhältnis. Wer seit dem Einzug neue Möbel, Geräte oder Kunst gekauft hat, sollte die Summe prüfen.",
          "Nach einem Umbau gilt dasselbe für das Gebäude: Der Versicherungswert muss angepasst werden, sonst fehlt im Schadenfall Geld. Viele kantonale Versicherungen schätzen das Gebäude dafür neu.",
        ],
      },
    ],
    takeaways: [
      "Offene Schäden vom 28. August jetzt melden, falls noch nicht geschehen.",
      "Versicherungssumme beim Hausrat mit dem heutigen Wert vergleichen.",
      "Nach einem Umbau den Gebäudewert neu schätzen lassen.",
    ],
    cta: {
      href: "/leistungen/versichern",
      label: "Policen prüfen lassen",
      text: "Policen hochladen, wir zeigen Lücken, doppelte Deckungen und Sparpotenzial. Dazu die Schadenfall-Hilfe.",
    },
    sources: [
      { label: "cash-online: Hagelsturm kostet Versicherer über 1,7 Milliarden Franken", url: "https://www.cash-online.de/a/hagelsturm-in-der-schweiz-kostet-versicherer-ueber-17-milliarden-franken-727575/" },
      { label: "SRF: Unwetter kommen die Schweiz immer teurer zu stehen", url: "https://www.srf.ch/news/schweiz/hagel-starkregen-und-sturm-gewitter-vom-freitag-bringen-versicherungen-an-den-anschlag" },
      { label: "NZZ: Hagel vom 28. August verursachte doppelt so viele Schäden", url: "https://www.nzz.ch/zuerich/zuerich-doppelt-so-viele-hagelschaeden-wie-bisher-angenommen-ld.10024231" },
    ],
  },
  {
    slug: "erdbebenversicherung-basel",
    area: "vers",
    category: "Versichern",
    title: "Keine Erdbeben-Lösung vom Bund: Ist Ihr Haus in Basel geschützt?",
    description:
      "Der Nationalrat hat die Eventualverpflichtung Erdbeben abgelehnt. Warum die Gebäudeversicherung Erdbeben nicht deckt und wann sich eine private Versicherung lohnt.",
    published: "2026-10-20",
    updated: "2026-10-20",
    readingMinutes: 4,
    lead: "Am 30. September 2026 ist der Nationalrat nicht auf die Eventualverpflichtung Erdbeben eingetreten, der Ständerat hatte das bereits im Dezember 2025 getan. Damit gibt es weiterhin keine schweizweite Erdbebendeckung. Die obligatorische Gebäudeversicherung zahlt bei Feuer und Elementarschäden, aber nicht bei Erdbeben. Laut Bundesrat waren Ende 2024 rund 15 % der Gebäude gegen Erdbeben versichert.",
    sections: [
      {
        heading: "Was gescheitert ist",
        paragraphs: [
          "Geplant war, dass alle Eigentümer nach einem schweren Erdbeben eine einmalige Abgabe leisten, die im Grundbuch vermerkt worden wäre. Damit wären Schäden bis zu einer festgelegten Summe finanziert worden. Beide Räte haben das abgelehnt, die Vorlage ist erledigt.",
          "Der Versicherungsverband will stattdessen die private Vorsorge stärken. Für Sie heisst das: Ob Ihr Haus gegen Erdbeben versichert ist, entscheiden Sie selbst.",
        ],
      },
      {
        heading: "Warum das Thema in Basel besonders zählt",
        paragraphs: [
          "Die Region Basel gehört mit dem Wallis zu den Gebieten mit der höchsten Erdbebengefährdung der Schweiz. Das Beben von 1356 zerstörte grosse Teile der Stadt.",
          "Und: Die Hypothek bleibt geschuldet, auch wenn das Haus beschädigt ist. Ohne Versicherung tragen Sie den Wiederaufbau und die Hypothek gleichzeitig.",
        ],
      },
      {
        heading: "Wann sich eine Erdbebenversicherung lohnt",
        paragraphs: [
          "Private Versicherer bieten Erdbebendeckungen als Zusatz an, meist mit einem hohen Selbstbehalt. Sie schützt vor allem vor dem Totalschaden, nicht vor kleinen Rissen.",
          "Sinnvoll ist sie vor allem bei hoher Hypothek, wenig freiem Vermögen und in den gefährdeten Regionen. Bei grösseren Umbauten lohnt sich zudem ein Blick auf die Erdbebensicherheit des Gebäudes.",
        ],
      },
    ],
    takeaways: [
      "Prüfen, ob Ihre Police eine Erdbebendeckung enthält.",
      "Hypothek und freies Vermögen ins Verhältnis setzen: Was wäre bei einem Totalschaden?",
      "Offerten vergleichen, Selbstbehalt und Prämie zusammen anschauen.",
    ],
    cta: {
      href: "/leistungen/versichern",
      label: "Lücken-Check starten",
      text: "Wir prüfen Gebäude, Hausrat, Haftpflicht und Vorsorge zusammen und zeigen, wo Lücken sind.",
    },
    sources: [
      { label: "HEV Basel-Stadt: Auch der Nationalrat will keine obligatorische Erdbeben-Versicherung", url: "https://www.hev-bs.ch/auch-der-nationalrat-will-keine-obligatorische-erdbeben-versicherung/" },
      { label: "finews: SVV setzt sich gegen Bundeslösung durch", url: "https://www.finews.ch/news/versicherungen/73784-svv-chef-urs-arbter-geplante-staatliche-erdbebenabsicherung-scheinloesung-vorlage-nationalrat-endgueltig-gescheitert-versicherungsverband-private-absicherung-ausbauen" },
      { label: "The Broker News: Erdbeben-Eventualverpflichtung ist vom Tisch", url: "https://www.thebrokernews.ch/erdbeben-eventualverpflichtung-ist-vom-tisch-das-risiko-bleibt/" },
      { label: "BAFU: Erdbebenvorsorge", url: "https://www.bafu.admin.ch/de/erdbebenvorsorge" },
    ],
  },
];

export function articleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
}
