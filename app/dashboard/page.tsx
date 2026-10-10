import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Eye, Scan, FileDown, CalendarCheck, FileText, MessageSquare, Users } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";
import { MyDocuments } from "@/components/MyDocuments";
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

/** Finanzierungs-Pass-Status aus der CRM-Kundenakte des Portal-Users. */
async function getFinanzStatus(userId: string) {
  const admin = serviceClient();
  if (!admin) return null;
  const { data } = await admin.from("customers").select("finanz_status").eq("portal_user_id", userId).maybeSingle();
  return (data?.finanz_status as "vorgeprueft" | "bestaetigt" | null) ?? null;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ preis?: string }> }) {
  const { preis } = await searchParams;
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

  const { data: listings } = await supabase
    .from("listings")
    .select("id, address, city, status, views, tour_views, expose_downloads, viewing_requests, price_chf, rooms, property_type, living_area, postal_code")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const listing = (listings as Listing[] | null)?.[0];

  let activity: { text: string; created_at: string }[] = [];
  let documents: { name: string; url: string }[] = [];
  let photos: { url: string }[] = [];
  let matchingBuyers: { total: number; withPass: number } | null = null;
  let feedback: ViewingFeedback[] = [];

  if (listing) {
    matchingBuyers = await countMatchingBuyers(listing);
    const { data: feedbackRows } = await supabase
      .from("viewing_feedback")
      .select("*")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false });
    feedback = (feedbackRows as ViewingFeedback[] | null) ?? [];
    const [activityRes, documentsRes, photosRes] = await Promise.all([
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
  const [planRes, profileRes, publicRes, finanzStatus] = await Promise.all([
    supabase.from("customer_plans").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("listings")
      .select("id, title, address, city, price_chf, rooms, living_area, property_type, tour_url, status, offmarket_until, listing_photos(url, sort_order)")
      .in("status", ["active", "reserved"])
      .order("created_at", { ascending: false })
      .limit(40),
    getFinanzStatus(user.id),
  ]);
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
    bestaetigt: finanzStatus === "bestaetigt",
  };
  const feedbackSummary = summarizeFeedback(feedback);
  const eigentum = plan?.eigentum ?? null;
  const hypoMonths = eigentum?.hypo_ablauf
    ? Math.round((new Date(eigentum.hypo_ablauf).getTime() - new Date().getTime()) / (30.44 * 24 * 3_600_000))
    : null;

  const sectionClass = "mt-12 scroll-mt-8";
  const sectionHead = "font-display text-2xl text-ivory lg:text-3xl";

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
          Mein <em>Immobilienplan</em>
        </h1>
        <p className="mt-3 max-w-2xl text-ivory-dim">
          {listing
            ? "Ihr Verkauf auf einen Blick: Schritt für Schritt, mit allen Zahlen und Dokumenten. Darunter planen Sie gleich Ihr nächstes Zuhause."
            : "Suchprofil, Finanzierung und Versicherung an einem Ort. Sie bekommen sofort eine Antwort und wir melden uns, sobald ein passendes Objekt kommt."}
        </p>
        <nav className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            ...(listing ? [["#verkauf", "Mein Verkauf"]] : []),
            ["#suchprofil", "Suchprofil"],
            ["#objekte", "Passende Objekte"],
            ["#finanzierung", "Finanzierung"],
            ["#versicherung", "Versicherung"],
            ["#eigentum", "Mein Eigentum"],
          ].map(([href, text]) => (
            <a key={href} href={href} className="rounded-full border border-line bg-white px-4 py-2 text-ivory hover:border-ivory">
              {text}
            </a>
          ))}
        </nav>

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

            <h2 className="mt-16 font-display text-3xl text-ivory lg:text-4xl">
              Und Ihr <em>nächstes Zuhause?</em>
            </h2>
            <p className="mt-2 max-w-2xl text-ivory-dim">
              Viele Verkäufer kaufen gleich wieder. Hinterlegen Sie Ihr Suchprofil, dann sind Sie bei neuen Objekten zuerst dran.
            </p>
          </>
        )}

        <section className={sectionClass}>
          <h2 className={sectionHead}>Ihr Weg zum Eigenheim</h2>
          <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-3">
            <BuyerJourney done={journey} />
          </div>
        </section>

        <section id="suchprofil" className={sectionClass}>
          <h2 className={sectionHead}>Was suchen Sie?</h2>
          <div className="mt-5 rounded-2xl border border-line bg-white p-5 lg:p-7">
            <SearchProfileForm profile={plan} />
          </div>
        </section>

        <section id="objekte" className={sectionClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className={sectionHead}>Passende Objekte &amp; Favoriten</h2>
            <Link href="/dashboard/planer/demo" className="text-sm text-amber underline underline-offset-4">
              Grundriss-Planer ausprobieren →
            </Link>
          </div>
          <div className="mt-5">
            <MatchList listings={portalListings} onCheckPrice="finanzierung" />
          </div>
        </section>

        <section id="finanzierung" className={sectionClass}>
          <h2 className={sectionHead}>Ist die Finanzierung möglich?</h2>
          <p className="mt-2 max-w-2xl text-sm text-ivory-dim">
            Sofortige Einschätzung nach den Regeln der Schweizer Banken. Die verbindliche Prüfung macht unser Partner HypoCasa.
          </p>
          <div className="mt-5">
            <FinancePass
              name={portalUser.name}
              maxPrice={plan?.finanz?.max_price ?? null}
              status={finanzStatus ?? (plan?.finanz?.max_price ? "vorgeprueft" : null)}
              savedAt={plan?.finanz?.saved_at ?? null}
            />
          </div>
          <div className="mt-5">
            <FinanceCheck key={preis ?? "plan"} initial={financeInitial} user={portalUser} priceOptions={priceOptions} />
          </div>
        </section>

        <section id="versicherung" className={sectionClass}>
          <h2 className={sectionHead}>Richtig versichert?</h2>
          <div className="mt-5">
            <InsuranceCheck initial={plan?.versicherung ?? null} user={portalUser} />
          </div>
        </section>

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

        {!listing && (
          <section className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-ink-2 p-6">
              <div>
                <div className="font-display text-xl text-ivory">Sie möchten verkaufen?</div>
                <p className="mt-1 max-w-md text-sm text-ivory-dim">
                  Sobald Ihre Immobilie bei NoviDom gelistet ist, sehen Sie hier Ihr Verkaufs-Cockpit mit Aufrufen, Anfragen und
                  Dokumenten.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/#bewertung" className="rounded-full bg-night px-5 py-3 text-sm font-semibold text-ink hover:bg-amber">
                  Kostenlose Bewertung
                </Link>
                <Link href="/expose-beispiel" className="rounded-full border border-line px-5 py-3 text-sm text-ivory hover:border-ivory">
                  Beispiel-Exposé
                </Link>
              </div>
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
