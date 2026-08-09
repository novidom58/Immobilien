import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Eye, Scan, FileDown, CalendarCheck, FileText, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";
import { MyDocuments } from "@/components/MyDocuments";

export const metadata: Metadata = {
  title: "Verkaufs-Cockpit",
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
};

export default async function DashboardPage() {
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
    .select("id, address, city, status, views, tour_views, expose_downloads, viewing_requests")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const listing = (listings as Listing[] | null)?.[0];

  let activity: { text: string; created_at: string }[] = [];
  let documents: { name: string; url: string }[] = [];
  let photos: { url: string }[] = [];

  if (listing) {
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
    documents = documentsRes.data ?? [];
    photos = photosRes.data ?? [];
  }

  return (
    <main className="min-h-svh bg-ink px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ivory">
            Novi<span className="text-amber">Dom</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden font-sans text-sm text-ivory-dim sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-6">
          <PasswordSettingsToggle />
        </div>

        <h1 className="mt-8 font-display text-3xl font-semibold text-ivory lg:text-4xl">
          Ihr Verkaufs-Cockpit
        </h1>

        {!listing ? (
          <div className="mt-8">
            <div className="rounded-2xl border border-line bg-ink-2 p-8 text-center">
              <p className="text-ivory">Ihr Verkaufsmandat ist noch nicht aktiv.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ivory-dim">
                Sobald Ihre Immobilie bei NoviDom gelistet ist, sehen Sie hier in Echtzeit alle
                Aufrufe, Anfragen und Dokumente. Fragen? Schreiben Sie uns direkt.
              </p>
              <Link
                href="/#kontakt"
                className="mt-5 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
              >
                Zur kostenlosen Bewertung
              </Link>
            </div>

            {/* Vorschau, damit das Portal vor Mandatsstart nicht leer wirkt */}
            <div className="relative mt-6 rounded-2xl border border-line bg-ink-2 p-5 lg:p-7">
              <span className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim/40">
                Beispielansicht
              </span>
              <div className="font-mono text-xs text-ivory-dim/60">
                So wird Ihr Cockpit aussehen — Beispiel: Musterstrasse 12, Basel
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 opacity-70 sm:grid-cols-4">
                {[
                  { icon: Eye, value: "128", label: "Inseratsaufrufe" },
                  { icon: Scan, value: "42", label: "3D-Rundgang-Aufrufe" },
                  { icon: FileDown, value: "18", label: "Exposé-Downloads" },
                  { icon: CalendarCheck, value: "6", label: "Besichtigungsanfragen" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-ink p-4">
                    <stat.icon className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    <div className="mt-3 font-display text-2xl font-semibold text-ivory">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[11px] leading-tight text-ivory-dim">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 opacity-70 sm:grid-cols-2">
                <div className="rounded-xl bg-ink p-4">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Aktivitäten
                  </div>
                  <ul className="space-y-3">
                    {[
                      ["Neue Besichtigungsanfrage erhalten", "vor 2 Std."],
                      ["Exposé von Interessent:in heruntergeladen", "vor 6 Std."],
                      ["3D-Rundgang angesehen (2. Mal)", "vor 1 Tag"],
                    ].map(([text, time]) => (
                      <li key={text} className="text-xs text-ivory-dim">
                        <span className="text-ivory">{text}</span>
                        <div className="mt-0.5 text-ivory-dim/50">{time}</div>
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
                    {["Exposé.pdf", "Grundbuchauszug.pdf", "Energieausweis.pdf"].map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-xs text-ivory-dim">
                        <span className="h-1 w-1 rounded-full bg-amber/70" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href="/expose-beispiel"
                className="mt-5 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
              >
                Beispiel-Exposé ansehen →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-line bg-ink-2 p-5 lg:p-7">
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
