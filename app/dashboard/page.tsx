import type { Metadata } from "next";
import { OpenSectionOnHash } from "@/components/portal/OpenSectionOnHash";
import { PolicyOverview } from "@/components/portal/PolicyOverview";
import { Fragment } from "react";
import { isAnliegen, type Anliegen } from "@/lib/anliegen";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PortalOverview, type OverviewTile } from "@/components/portal/PortalOverview";
import { Eye, Scan, FileDown, CalendarCheck, FileText, MessageSquare, Users } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";
import { MyDocuments } from "@/components/MyDocuments";
import { DocChecklist, FINANZ_UNTERLAGEN } from "@/components/DocChecklist";
import { SaleStepper } from "@/components/SaleStepper";
import { Logo } from "@/components/ui/Logo";
import { SearchProfileForm, type SearchProfile } from "@/components/portal/SearchProfileForm";
import { FinanceCheck } from "@/components/portal/FinanceCheck";
import { InsuranceCheck } from "@/components/portal/InsuranceCheck";
import { MatchList, type PortalListing } from "@/components/portal/MatchList";
import { matchesPlan } from "@/lib/planMatching";
import { FinancePass } from "@/components/portal/FinancePass";
import { PriceCheck } from "@/components/portal/PriceCheck";
import { BuyerJourney } from "@/components/portal/BuyerJourney";
import { FeedbackSummary } from "@/components/FeedbackSummary";
import { WertmonitorForm } from "@/components/sections/WertmonitorForm";
import { summarizeFeedback, type ViewingFeedback } from "@/lib/feedback";
import { regionFromPostal } from "@/lib/region";
import { formatChf } from "@/lib/valuation";

export const metadata: Metadata = {
  title: "Mein Immobilienplan",
  robots: { index: false, follow: false },
};

type Listing = {
  id: string;
  address: string;
  city: string;
  status: string;
  views: number;
  tour_views: number;
  expose_downloads: number;
  viewing_requests: number;
  price_chf: number | null;
  rooms: number | null;
  property_type: string | null;
  living_area: number | null;
  postal_code: string | null;
};

/**
 * Wie viele vorgemerkte Käufer passen zum Objekt des Verkäufers? Es wird nur
 * die Anzahl gezeigt, nie wer. Liest mit dem Service-Role-Key, weil
 * Verkäufer die CRM-Tabelle nicht sehen dürfen.
 */
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createSupabaseClient(url, key) : null;
}

async function countMatchingBuyers(listing: Listing) {
  const admin = serviceClient();
  if (!admin) return null;
  const { data } = await admin
    .from("customers")
    .select("wunsch_ort, objekt_typ, zimmer_min, budget_max, finanz_status, finanz_max")
    .eq("ziel", "kaufen")
    .neq("typ", "ex");
  const matching = (data ?? []).filter((c) => matchesPlan(c, listing));
  const withPass = matching.filter((c) => c.finanz_status && (!listing.price_chf || !c.finanz_max || c.finanz_max >= listing.price_chf * 0.95));
  return { total: matching.length, withPass: withPass.length };
}

/** Finanzierungs-Pass und Rollen aus der CRM-Kundenakte des Portal-Users. */
async function getCrmProfile(userId: string, email: string | undefined) {
  const admin = serviceClient();
  if (!admin) return null;
  const { data: linked } = await admin.from("customers").select("finanz_status, rollen").eq("portal_user_id", userId).maybeSingle();
  const data =
    linked ??
    (email ? (await admin.from("customers").select("finanz_status, rollen").ilike("email", email).limit(1).maybeSingle()).data : null);
  if (!data) return null;
  return {
    finanz_status: (data.finanz_status as "vorgeprueft" | "bestaetigt" | null) ?? null,
    rollen: (data.rollen as string[] | null) ?? [],
  };
}

type PortalSection = "weg" | "suchprofil" | "objekte" | "finanzierung" | "versicherung" | "umbau" | "eigentum" | "verkaufen";

const SECTION_LABEL: Record<PortalSection | "verkauf", string> = {
  verkauf: "Mein Verkauf",
  weg: "Mein Weg",
  suchprofil: "Suchprofil",
  objekte: "Passende Objekte",
  finanzierung: "Finanzierung",
  versicherung: "Versicherung",
  umbau: "Umbau",
  eigentum: "Mein Eigentum",
  verkaufen: "Verkaufen",
};

const ORDER: Record<Anliegen | "eigentum", PortalSection[]> = {
  kaufen: ["weg", "suchprofil", "objekte", "finanzierung", "versicherung", "umbau", "eigentum", "verkaufen"],
  verkaufen: ["verkaufen", "eigentum", "weg", "suchprofil", "objekte", "finanzierung", "versicherung", "umbau"],
  finanzieren: ["finanzierung", "eigentum", "weg", "suchprofil", "objekte", "versicherung", "umbau", "verkaufen"],
  umbauen: ["umbau", "finanzierung", "versicherung", "eigentum", "weg", "suchprofil", "objekte", "verkaufen"],
  versichern: ["versicherung", "eigentum", "umbau", "finanzierung", "weg", "suchprofil", "objekte", "verkaufen"],
  eigentum: ["eigentum", "finanzierung", "umbau", "versicherung", "verkaufen", "weg", "suchprofil", "objekte"],
  trennung: ["finanzierung", "eigentum", "verkaufen", "weg", "suchprofil", "objekte", "versicherung", "umbau"],
};

/**
 * Das Portal richtet sich nach dem, was die Person will: zuerst nach dem
 * Link (?fokus=umbauen aus dem Kontaktformular), sonst nach den Rollen in
 * der Kundenakte. Verkäufer mit Inserat sehen ihr Cockpit ohnehin zuoberst.
 */
function portalFocus(fokus: string | undefined, rollen: string[], hasListing: boolean): keyof typeof ORDER {
  if (isAnliegen(fokus)) return fokus;
  if (fokus === "eigentum") return "eigentum";
  if (!hasListing && rollen.includes("verkaeufer")) return "verkaufen";
  if (rollen.includes("trennung")) return "trennung";
  if (rollen.includes("umbau")) return "umbauen";
  if (rollen.includes("finanzierung") && !rollen.includes("kaeufer")) return "finanzieren";
  if (rollen.includes("versicherung") && !rollen.includes("kaeufer")) return "versichern";
  if (rollen.includes("eigentuemer") && !rollen.includes("kaeufer")) return "eigentum";
  return "kaufen";
}

/**
 * Was offen angezeigt wird. Alles andere liegt eingeklappt unter «Weitere
 * Bereiche», damit niemand durch Themen scrollen muss, die ihn nicht
 * betreffen (z.B. sieht ein Eigentümer im Hypothekenwächter keine Kaufkraft).
 */
const MAIN: Record<keyof typeof ORDER, PortalSection[]> = {
  kaufen: ["suchprofil", "objekte"],
  verkaufen: ["verkaufen", "eigentum"],
  finanzieren: ["finanzierung"],
  umbauen: ["umbau"],
  versichern: ["versicherung"],
  eigentum: ["eigentum"],
  trennung: ["finanzierung", "eigentum", "verkaufen"],
};

/** Titel oben im Portal, passend zum Anliegen (nicht immer «Immobilienplan»). */
const TITLE: Record<keyof typeof ORDER, [string, string]> = {
  kaufen: ["Mein neues", "Zuhause"],
  verkaufen: ["Mein", "Verkauf"],
  finanzieren: ["Meine", "Finanzierung"],
  umbauen: ["Mein", "Umbau"],
  versichern: ["Meine", "Versicherungen"],
  eigentum: ["Mein", "Eigentum"],
  trennung: ["Meine", "Situation"],
};

const MORE_HINT: Record<PortalSection, string> = {
  weg: "Ihr Weg zum Eigenheim in Schritten",
  suchprofil: "Suchprofil hinterlegen und neue Objekte zuerst sehen",
  objekte: "Passende Objekte, Favoriten und Grundriss-Planer",
  finanzierung: "Kaufkraft prüfen und Unterlagen für die Bank",
  versicherung: "Policen an einem Ort, Lücken-Check und Schaden melden",
  umbau: "Ideen am Grundriss ausprobieren und Kosten abschätzen",
  eigentum: "Wertmonitor und Hypothekenwächter für Ihre Immobilie",
  verkaufen: "Was ist Ihr Zuhause wert? Verkauf starten",
};

const INTRO: Record<Anliegen | "eigentum", string> = {
  kaufen: "Suchprofil, Finanzierung und Versicherung an einem Ort. Passende Objekte sehen Sie hier zuerst, oft vor den Portalen.",
  verkaufen: "Was ist Ihr Zuhause wert, und wie verkaufen Sie es am besten? Hier starten Sie Ihren Verkauf und behalten alles im Blick.",
  finanzieren: "Ihre Kaufkraft, Ihr Finanzierungs-Pass und Ihre laufende Hypothek an einem Ort. HypoCasa prüft verbindlich innert 24 Stunden.",
  umbauen: "Ideen am Grundriss ausprobieren, Kosten abschätzen und mit uns planen. Finanzierung und Versicherung gleich dabei.",
  versichern: "Prüfen Sie in zwei Minuten, ob Ihr Zuhause richtig versichert ist. Wir zeigen Ihnen, wo Lücken sein könnten.",
  eigentum: "Der Richtwert Ihrer Immobilie und Ihre Hypothek im Blick. Wir melden uns rechtzeitig, wenn sich etwas lohnt.",
  trennung: "Prüfen Sie, ob Sie das Haus allein finanzieren können, und sehen Sie den aktuellen Richtwert. Vertraulich und nur für Sie sichtbar.",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ preis?: string; fokus?: string }> }) {
  const { preis, fokus } = await searchParams;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <NotConfigured />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  // Alles, was nicht voneinander abhängt, gleichzeitig laden (schnellerer Einstieg)
  const [listingsRes, planRes, profileRes, publicRes, crm, policiesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id, address, city, status, views, tour_views, expose_downloads, viewing_requests, price_chf, rooms, property_type, living_area, postal_code")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("customer_plans").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("listings")
      .select("*, listing_photos(url, sort_order)")
      .in("status", ["active", "reserved"])
      .order("created_at", { ascending: false })
      .limit(40),
    getCrmProfile(user.id, user.email),
    supabase.from("customer_policies").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const listing = (listingsRes.data as Listing[] | null)?.[0];

  let activity: { text: string; created_at: string }[] = [];
  let documents: { name: string; url: string }[] = [];
  let photos: { url: string }[] = [];
  let matchingBuyers: { total: number; withPass: number } | null = null;
  let feedback: ViewingFeedback[] = [];

  if (listing) {
    const [buyers, feedbackRes, activityRes, documentsRes, photosRes] = await Promise.all([
      countMatchingBuyers(listing),
      supabase.from("viewing_feedback").select("*").eq("listing_id", listing.id).order("created_at", { ascending: false }),
      supabase
        .from("listing_activity")
        .select("text, created_at")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("listing_documents").select("name, url").eq("listing_id", listing.id),
      supabase
        .from("listing_photos")
        .select("url")
        .eq("listing_id", listing.id)
        .order("sort_order", { ascending: true }),
    ]);
    matchingBuyers = buyers;
    feedback = (feedbackRes.data as ViewingFeedback[] | null) ?? [];
    activity = activityRes.data ?? [];
    photos = photosRes.data ?? [];

    // Dokumente aus dem privaten "listing-dokumente"-Bucket liegen als
    // Storage-Pfad in `url` (nicht als direkt aufrufbarer Link) und
    // brauchen eine signierte, zeitlich begrenzte URL zum Anzeigen.
    const rawDocuments = documentsRes.data ?? [];
    documents = await Promise.all(
      rawDocuments.map(async (doc) => {
        if (doc.url.startsWith("http")) return doc;
        const { data: signed } = await supabase.storage
          .from("listing-dokumente")
          .createSignedUrl(doc.url, 300);
        return { name: doc.name, url: signed?.signedUrl ?? "" };
      })
    );
    documents = documents.filter((doc) => doc.url);
  }

  // «Mein Immobilienplan»: Suchprofil, Finanzierung, Versicherung, Favoriten
  const plan = planRes.data as
    | (SearchProfile & {
        finanz: { income: number; savings: number; pension: number; price: number; max_price?: number; saved_at?: string } | null;
        eigentum: {
          region: string;
          typ: string;
          flaeche: number;
          baujahr: number | null;
          adresse: string | null;
          hypo_ablauf: string | null;
          hypo_betrag: number | null;
          wert: { low: number; mid: number; high: number };
          saved_at: string;
        } | null;
        versicherung: Record<string, string | boolean> | null;
        favorites: string[];
      })
    | null;
  const portalUser = { name: profileRes.data?.full_name || user.email || "Kunde", email: user.email ?? "" };
  const favorites = new Set(plan?.favorites ?? []);
  // Objekte mit hinterlegtem Grundriss: im Planer massstabsgetreu einrichten
  const planOptions = (publicRes.data ?? [])
    .filter((l) => (l.details as { grundriss?: { url?: string } } | null)?.grundriss?.url)
    .map((l) => ({ id: l.id as string, title: ((l.title as string | null) || `${l.address}, ${l.city}`) as string, rooms: (l.rooms as number | null) ?? null }));
  const portalListings: PortalListing[] = (publicRes.data ?? [])
    .map((l) => {
      const photos = ((l.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort((a, b) => a.sort_order - b.sort_order);
      return {
        id: l.id as string,
        title: (l.title as string | null) || (l.address as string),
        city: l.city as string,
        price_chf: (l.price_chf as number | null) ?? null,
        rooms: (l.rooms as number | null) ?? null,
        living_area: (l.living_area as number | null) ?? null,
        cover: photos[0]?.url ?? null,
        tour_url: (l.tour_url as string | null) ?? null,
        offmarket_until: (l.offmarket_until as string | null) ?? null,
        favorite: favorites.has(l.id as string),
        match: matchesPlan(plan, {
          city: l.city as string,
          property_type: (l.property_type as string | null) ?? null,
          rooms: (l.rooms as number | null) ?? null,
          price_chf: (l.price_chf as number | null) ?? null,
        }),
      };
    })
    .filter((l) => l.match || l.favorite);
  const preisParam = Number(preis);
  const financeInitial = {
    ...(plan?.finanz ?? {}),
    ...(Number.isFinite(preisParam) && preisParam > 0 ? { price: preisParam } : {}),
  };
  const priceOptions = portalListings
    .filter((l) => l.price_chf)
    .slice(0, 4)
    .map((l) => ({ label: `${l.city}: CHF ${l.price_chf!.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`, price: l.price_chf! }));

  const journey = {
    profil: Boolean(plan?.wunsch_ort || plan?.budget_max || plan?.objekt_typ),
    pass: Boolean(plan?.finanz?.max_price),
    objekt: (plan?.favorites ?? []).length > 0,
    bestaetigt: crm?.finanz_status === "bestaetigt",
  };
  const feedbackSummary = summarizeFeedback(feedback);
  const eigentum = plan?.eigentum ?? null;
  const hypoMonths = eigentum?.hypo_ablauf
    ? Math.round((new Date(eigentum.hypo_ablauf).getTime() - new Date().getTime()) / (30.44 * 24 * 3_600_000))
    : null;

  const sectionClass = "mt-12 scroll-mt-8";
  const sectionHead = "font-display text-2xl text-ivory lg:text-3xl";

  const portalSections: Record<PortalSection, React.ReactNode> = {
    weg: (
        <section className={sectionClass}>
          <h2 className={sectionHead}>Ihr Weg zum Eigenheim</h2>
          <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-3">
            <BuyerJourney done={journey} />
          </div>
        </section>
    ),
    suchprofil: (
        <section id="suchprofil" className={sectionClass}>
          <h2 className={sectionHead}>Was suchen Sie?</h2>
          <div className="mt-5 rounded-2xl border border-line bg-white p-5 lg:p-7">
            <SearchProfileForm profile={plan} />
          </div>
        </section>
    ),
    objekte: (
        <section id="objekte" className={sectionClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className={sectionHead}>Passende Objekte &amp; Favoriten</h2>
            <Link href="#umbau" className="text-sm text-amber underline underline-offset-4">
              Grundriss-Planer ausprobieren →
            </Link>
          </div>
          <div className="mt-5">
            <MatchList listings={portalListings} onCheckPrice="finanzierung" />
          </div>
        </section>
    ),
    finanzierung: (
        <section id="finanzierung" className={sectionClass}>
          <h2 className={sectionHead}>Ist die Finanzierung möglich?</h2>
          <p className="mt-2 max-w-2xl text-sm text-ivory-dim">
            Sofortige Einschätzung nach den Regeln der Schweizer Banken. Die verbindliche Prüfung macht unser Partner HypoCasa.
          </p>
          <div className="mt-5">
            <FinancePass
              name={portalUser.name}
              maxPrice={plan?.finanz?.max_price ?? null}
              status={crm?.finanz_status ?? (plan?.finanz?.max_price ? "vorgeprueft" : null)}
              savedAt={plan?.finanz?.saved_at ?? null}
            />
          </div>
          <div className="mt-5">
            <FinanceCheck key={preis ?? "plan"} initial={financeInitial} user={portalUser} priceOptions={priceOptions} />
          </div>
          <div className="mt-5">
            <DocChecklist
              title="Unterlagen für die Bank"
              intro="Laden Sie die Dokumente hier hoch, dann können wir die Finanzierung ohne Papierkram einreichen."
              items={FINANZ_UNTERLAGEN}
            />
          </div>
        </section>
    ),
    versicherung: (
        <section id="versicherung" className={sectionClass}>
          <h2 className={sectionHead}>Meine Versicherungen</h2>
          <div className="mt-5">
            <div id="policen" className="scroll-mt-28" />
            <PolicyOverview user={portalUser} isOwner={Boolean(plan?.eigentum)} />
          </div>
          <details className="mt-5 rounded-2xl border border-line bg-white p-5">
            <summary className="cursor-pointer font-display text-lg text-ivory">Bedarfs-Check: Was brauche ich wirklich?</summary>
            <div className="mt-4">
              <InsuranceCheck initial={plan?.versicherung ?? null} user={portalUser} />
            </div>
          </details>
        </section>
    ),
    umbau: (
        <section id="umbau" className={sectionClass}>
          <h2 className={sectionHead}>Umbauen &amp; einrichten</h2>
          <p className="mt-2 max-w-2xl text-sm text-ivory-dim">Ideen am Grundriss ausprobieren, Kosten abschätzen und mit uns planen.</p>
          <div className="mt-5 rounded-2xl border border-line bg-white p-5">
            <div className="font-display text-lg text-ivory">Grundriss-Planer: Grundriss wählen</div>
            <p className="mt-1 text-sm text-ivory-dim">
              Möbel massstabsgetreu verschieben, am Handy oder Computer. Ihre Einrichtung wird pro Grundriss gespeichert.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {planOptions.map((o) => (
                <Link key={o.id} href={`/dashboard/planer/${o.id}`} className="rounded-xl border border-line px-4 py-3 text-sm text-ivory transition-colors hover:border-amber">
                  <span className="font-medium">{o.title}</span>
                  {o.rooms ? <span className="block text-xs text-ivory-dim">{o.rooms} Zimmer · echter Grundriss</span> : <span className="block text-xs text-ivory-dim">echter Grundriss</span>}
                </Link>
              ))}
              <Link href="/dashboard/planer/demo" className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-ivory transition-colors hover:border-amber">
                <span className="font-medium">Beispielwohnung</span>
                <span className="block text-xs text-ivory-dim">5.5 Zimmer zum Ausprobieren</span>
              </Link>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link href="/leistungen/umbauen" className="rounded-2xl border border-line bg-white p-5 hover:border-amber">
              <div className="font-display text-lg text-ivory">Richtpreise &amp; Förderung</div>
              <p className="mt-1 text-sm text-ivory-dim">Was Küche, Bad oder Wärmepumpe kosten und welche Beiträge es gibt.</p>
            </Link>
            <Link href="/leistungen/umbauen#kontakt" className="rounded-2xl border border-line bg-white p-5 hover:border-amber">
              <div className="font-display text-lg text-ivory">Umbau anfragen</div>
              <p className="mt-1 text-sm text-ivory-dim">Eine erste Einschätzung zu Kosten, Ablauf und Finanzierung.</p>
            </Link>
          </div>
          {portalListings.some((l) => l.favorite) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="text-ivory-dim">Ihre Favoriten einrichten:</span>
              {portalListings
                .filter((l) => l.favorite)
                .map((l) => (
                  <Link key={l.id} href={`/dashboard/planer/${l.id}`} className="text-amber underline underline-offset-4">
                    {l.title}
                  </Link>
                ))}
            </div>
          )}
        </section>
    ),
    eigentum: (
        <section id="eigentum" className={sectionClass}>
          <h2 className={sectionHead}>Mein Eigentum</h2>
          <p className="mt-2 max-w-2xl text-sm text-ivory-dim">
            Wertmonitor und Hypothekenwächter: Sie sehen jederzeit den Richtwert Ihrer Immobilie und wir erinnern Sie rechtzeitig vor dem Ablauf
            Ihrer Hypothek.
          </p>
          {eigentum && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-night p-5 text-ink">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-soft">Richtwert heute</div>
                <div className="mt-2 font-display text-3xl">{formatChf(eigentum.wert.mid)}</div>
                <div className="mt-1 text-xs text-ink/70">
                  Spanne {formatChf(eigentum.wert.low)} – {formatChf(eigentum.wert.high)} · {eigentum.typ}, {eigentum.flaeche} m²
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Hypothek</div>
                {hypoMonths !== null ? (
                  <>
                    <div className="mt-2 font-display text-3xl text-ivory">{hypoMonths > 0 ? `noch ${hypoMonths} Monate` : "abgelaufen"}</div>
                    <div className="mt-1 text-xs text-ivory-dim">
                      Ablauf {new Date(eigentum.hypo_ablauf!).toLocaleDateString("de-CH")}
                      {hypoMonths <= 12 && hypoMonths > 0 ? " · jetzt ist der beste Moment zum Vergleichen" : ""}
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-sm text-ivory-dim">Noch kein Ablaufdatum hinterlegt.</div>
                )}
              </div>
            </div>
          )}
          <div className="mt-5 rounded-2xl border border-line bg-white p-5 lg:p-7">
            <WertmonitorForm portal initial={eigentum} />
          </div>
        </section>
    ),
    verkaufen: listing ? null : (
          <section id="verkaufen" className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-ink-2 p-6">
              <div>
                <div className="font-display text-xl text-ivory">Sie möchten verkaufen?</div>
                <p className="mt-1 max-w-md text-sm text-ivory-dim">
                  Sobald Ihre Immobilie bei NoviDom gelistet ist, sehen Sie hier Ihr Verkaufs-Cockpit mit Aufrufen, Anfragen und
                  Dokumenten.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/leistungen/kaufen-verkaufen#kontakt" className="rounded-full bg-night px-5 py-3 text-sm font-semibold text-ink hover:bg-amber">
                  Kostenlose Bewertung
                </Link>
                <Link href="/expose-beispiel" className="rounded-full border border-line px-5 py-3 text-sm text-ivory hover:border-ivory">
                  Beispiel-Exposé
                </Link>
              </div>
            </div>
          </section>
    ),
  };
  // Anliegen aus dem Link, sonst das bei der Registrierung gewählte, sonst aus der Kundenakte
  const meta = (user.user_metadata ?? {}) as { anliegen?: string; portal_pins?: string[] };
  const focus = portalFocus(fokus ?? meta.anliegen, crm?.rollen ?? [], Boolean(listing));
  const order = ORDER[focus];
  // Mit eigenem Inserat steht das Verkaufs-Cockpit oben, alles andere eingeklappt
  // Mit «+» angeheftete Bereiche stehen immer offen oben (im Konto gespeichert, auf allen Geräten)
  const pins = (Array.isArray(meta.portal_pins) ? meta.portal_pins : []).filter((k): k is PortalSection => (order as string[]).includes(k));
  const baseMain = listing ? [] : MAIN[focus].filter((k) => portalSections[k]);
  const main = [...baseMain, ...pins.filter((k) => !baseMain.includes(k) && portalSections[k] && !(listing && k === "verkaufen"))];
  const more = order.filter((k) => !main.includes(k) && portalSections[k] && !(listing && k === "verkaufen"));

  // Übersicht: alle Bereiche als Kacheln mit dem aktuellen Stand
  const policyCount = policiesRes.count ?? 0;
  const matchCount = portalListings.filter((l) => l.match).length;
  const status: Record<PortalSection | "verkauf", string> = {
    verkauf: listing ? `${listing.views} Aufrufe · ${listing.viewing_requests} Anfragen` : "",
    weg: `${Object.values(journey).filter(Boolean).length} von 4 Schritten erledigt`,
    suchprofil: plan?.wunsch_ort ? `${plan.wunsch_ort}${plan.budget_max ? ` · bis ${formatChf(plan.budget_max)}` : ""}` : "Noch nicht ausgefüllt",
    objekte: `${matchCount} passend · ${favorites.size} Favoriten`,
    finanzierung:
      crm?.finanz_status === "bestaetigt"
        ? "Von der Bank bestätigt"
        : plan?.finanz?.max_price
          ? `Kaufkraft bis ${formatChf(plan.finanz.max_price)}`
          : "Noch nicht geprüft",
    versicherung: policyCount ? `${policyCount} ${policyCount === 1 ? "Police" : "Policen"} erfasst` : "Policen hinzufügen",
    umbau: "Grundriss-Planer und Richtpreise",
    eigentum: eigentum ? `Richtwert ${formatChf(eigentum.wert.mid)}` : "Wertmonitor einrichten",
    verkaufen: "Gratis-Bewertung anfragen",
  };
  const tiles: OverviewTile[] = [
    ...(listing ? [{ key: "verkauf", label: SECTION_LABEL.verkauf, status: status.verkauf, href: "#verkauf", highlight: true, base: true }] : []),
    ...[...main, ...more].map((k) => ({
      key: k,
      label: k === "weg" ? "Mein Weg" : SECTION_LABEL[k],
      status: status[k],
      href: `#${k}`,
      highlight: main.includes(k),
      base: baseMain.includes(k),
      pinned: pins.includes(k),
    })),
  ];

  return (
    <main className="min-h-svh bg-ink px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="NoviDom Startseite">
            <Logo className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden font-sans text-sm text-ivory-dim sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-6">
          <PasswordSettingsToggle />
        </div>

        <h1 className="mt-8 font-display text-3xl text-ivory lg:text-5xl">
          {listing ? "Mein" : TITLE[focus][0]} <em>{listing ? "Verkauf" : TITLE[focus][1]}</em>
        </h1>
        <p className="mt-3 max-w-2xl text-ivory-dim">
          {listing
            ? "Ihr Verkauf auf einen Blick: Schritt für Schritt, mit allen Zahlen und Dokumenten. Darunter planen Sie gleich Ihr nächstes Zuhause."
            : INTRO[focus]}
        </p>
        <PortalOverview tiles={tiles} pins={pins} />

        {listing && (
          <>
            <section id="verkauf" className={sectionClass}>
            <h2 className={`${sectionHead} mb-5`}>Mein Verkauf</h2>
            <div className="rounded-2xl border border-line bg-ink-2 p-5 lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-xs text-ivory-dim/60">
                  {listing.address}, {listing.city}
                  <span className="rounded-full border border-amber/40 px-2 py-0.5 text-amber-soft">
                    {listing.status}
                  </span>
                </div>
                {listing.status !== "draft" && (
                  <Link
                    href={`/immobilien/${listing.id}`}
                    target="_blank"
                    className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
                  >
                    Öffentliches Inserat ansehen →
                  </Link>
                )}
              </div>

              <div className="mt-6">
                <SaleStepper
                  hasPhotos={photos.length > 0}
                  isOnline={listing.status !== "draft"}
                  hasViewingRequests={listing.viewing_requests > 0}
                  isSold={listing.status === "sold"}
                />
              </div>

              {photos.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {photos.slice(0, 5).map((photo, i) => (
                    <div key={photo.url} className="relative aspect-square overflow-hidden rounded-lg bg-ink">
                      <Image src={photo.url} alt="" fill sizes="150px" className="object-cover" />
                      {i === 4 && photos.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/70 font-mono text-xs text-ivory">
                          +{photos.length - 5}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {matchingBuyers !== null && (
                <div className="mt-6 flex items-center gap-4 rounded-xl bg-night p-4 text-ink">
                  <Users className="h-6 w-6 shrink-0 text-amber-soft" strokeWidth={1.5} />
                  <div>
                    <div className="font-display text-xl">
                      {matchingBuyers.total === 1 ? "1 vorgemerkter Käufer passt" : `${matchingBuyers.total} vorgemerkte Käufer passen`} zu Ihrem Objekt
                    </div>
                    <div className="mt-0.5 text-xs text-ink/70">
                      {matchingBuyers.withPass > 0 ? `Davon ${matchingBuyers.withPass} mit Finanzierungs-Pass. ` : ""}
                      Aus unserer Käuferkartei nach Ort, Objektart, Zimmern und Budget. Sie erhalten das Objekt im Off-Market-Vorverkauf zuerst.
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Eye, value: listing.views, label: "Inseratsaufrufe" },
                  { icon: Scan, value: listing.tour_views, label: "3D-Rundgang-Aufrufe" },
                  { icon: FileDown, value: listing.expose_downloads, label: "Exposé-Downloads" },
                  { icon: CalendarCheck, value: listing.viewing_requests, label: "Besichtigungsanfragen" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-ink p-4">
                    <stat.icon className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    <div className="mt-3 font-display text-2xl font-semibold text-ivory">{stat.value}</div>
                    <div className="mt-1 text-[11px] leading-tight text-ivory-dim">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <PriceCheck
                  price={listing.price_chf}
                  area={listing.living_area}
                  type={listing.property_type}
                  region={regionFromPostal(listing.postal_code, listing.city)}
                  feedback={feedbackSummary.preis}
                />
                <div className="rounded-xl bg-ink p-4">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Besichtigungen</div>
                  <div className="mt-3 font-display text-3xl text-ivory">{feedbackSummary.total}</div>
                  <div className="text-[11px] text-ivory-dim">Feedbacks, {feedbackSummary.interesse.ja} mit klarem Interesse</div>
                  {feedbackSummary.avg && <div className="mt-2 text-sm text-amber">Ø {feedbackSummary.avg.toFixed(1)} von 5 Sternen</div>}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-line p-4">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Feedback nach Besichtigungen</div>
                <FeedbackSummary items={feedback} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-ink p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Aktivitäten
                  </div>
                  {activity.length === 0 ? (
                    <p className="text-xs text-ivory-dim/60">Noch keine Aktivitäten.</p>
                  ) : (
                    <ul className="space-y-3">
                      {activity.map((item, i) => (
                        <li key={i} className="text-xs text-ivory-dim">
                          <span className="text-ivory">{item.text}</span>
                          <div className="mt-0.5 text-ivory-dim/50">
                            {new Date(item.created_at).toLocaleDateString("de-CH")}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl bg-ink p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dokumente
                  </div>
                  {documents.length === 0 ? (
                    <p className="text-xs text-ivory-dim/60">Noch keine Dokumente.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {documents.map((doc) => (
                        <li key={doc.name}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-ivory-dim hover:text-amber-soft"
                          >
                            <span className="h-1 w-1 rounded-full bg-amber/70" />
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <MyDocuments />
              </div>
            </div>
            </section>

          </>
        )}

        <OpenSectionOnHash />
        {main.map((key) => (
          <Fragment key={key}>{portalSections[key]}</Fragment>
        ))}

        {more.length > 0 && (
          <section className="mt-16">
            <h2 className={sectionHead}>Weitere Bereiche</h2>
            <p className="mt-2 max-w-2xl text-sm text-ivory-dim">
              {listing
                ? "Und Ihr nächstes Zuhause? Viele Verkäufer kaufen gleich wieder: Suchprofil, Finanzierung und mehr bei Bedarf aufklappen."
                : "Bei Bedarf aufklappen, oder oben in der Übersicht mit + anheften, dann stehen sie immer offen. Was Sie hier eingeben, sieht nur Ihr NoviDom-Team."}
            </p>
            <div className="mt-5 grid gap-3">
              {more.map((key) => (
                <details key={key} id={`mehr-${key}`} className="group rounded-2xl border border-line bg-white px-5 py-4 open:pb-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span>
                      <span className="block font-display text-lg text-ivory">{key === "weg" ? "Mein Weg" : SECTION_LABEL[key]}</span>
                      <span className="block text-sm text-ivory-dim">{MORE_HINT[key]}</span>
                    </span>
                    <span aria-hidden className="text-2xl leading-none text-amber transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="[&>section]:mt-5 [&>section>h2]:hidden">{portalSections[key]}</div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="text-ivory">Das Verkaufs-Cockpit ist noch nicht eingerichtet.</p>
      <Link href="/" className="mt-4 font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
        Zurück zur Startseite
      </Link>
    </main>
  );
}
