import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { asDetails } from "@/lib/listingDetails";
import { offerTypeOf, priceText } from "@/lib/listingOffer";
import { COMPANY, contactFor } from "@/lib/team";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  Haus: "Einfamilienhaus",
  Wohnung: "Wohnung",
  Stockwerkeigentum: "Eigentumswohnung",
  Rendite: "Renditeliegenschaft",
  Andere: "Liegenschaft",
};

async function getListing(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("listings")
    .select("*, listing_photos(url, sort_order)")
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();
  if (!data) return null;

  await supabase.rpc("log_listing_expose_download", { p_listing_id: id });

  const photos = ((data.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort((a, b) => a.sort_order - b.sort_order);
  return { ...data, photos } as typeof data & { photos: { url: string }[] };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return {
    title: listing ? `Exposé: ${listing.title || listing.address}` : "Exposé",
    robots: { index: false, follow: false },
  };
}

/** Eine A4-Seite. Am Bildschirm als Blatt, im Druck genau eine Seite. */
function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`expose-sheet relative mx-auto mb-8 flex flex-col overflow-hidden bg-[#faf9f6] shadow-xl print:mb-0 print:shadow-none ${className}`}
      style={{ width: "210mm", height: "297mm" }}
    >
      {children}
    </section>
  );
}

function SheetFooter({ page, total, stand }: { page: number; total: number; stand: string }) {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-[#e7e3dc] px-[16mm] py-[6mm] text-[8pt] text-[#7a756b]">
      <span>
        {COMPANY.name} · {COMPANY.street}, {COMPANY.city} · {COMPANY.email}
      </span>
      <span>
        Angaben ohne Gewähr, Stand {stand} · {page}/{total}
      </span>
    </div>
  );
}

function Photo({ url, className = "" }: { url: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- Druckansicht: volle Auflösung, kein Lazy-Loading
  return <img src={url} alt="" className={`h-full w-full object-cover ${className}`} />;
}

export default async function ListingExposePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { id } = await params;
  const { format } = await searchParams;
  const listing = await getListing(id);
  if (!listing) notFound();

  const offer = offerTypeOf(listing.offer_type as string | null);
  const details = asDetails(listing.details);
  const title = (listing.title as string | null) || `${listing.address}, ${listing.city}`;
  const place = `${listing.postal_code ? `${listing.postal_code} ` : ""}${listing.city}`;
  const price = priceText(listing.price_chf as number | null, offer, "Preis auf Anfrage");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
  const onlineUrl = `${siteUrl}/immobilien/${listing.id}`;
  const qr = await QRCode.toString(onlineUrl, { type: "svg", margin: 0, color: { dark: "#191b1d", light: "#00000000" } });
  const contact = contactFor(listing.berater as string | null);
  const stand = new Date().toLocaleDateString("de-CH");
  const photos = listing.photos;

  const facts = [
    ["Objektart", TYPE_LABEL[listing.property_type as string] ?? (listing.property_type as string)],
    ["Zimmer", listing.rooms ? String(listing.rooms) : null],
    ["Wohnfläche", listing.living_area ? `ca. ${listing.living_area} m²` : null],
    ["Badezimmer", details.badezimmer],
    ["Etage", details.etage],
    ["Baujahr", details.baujahr],
    ["Letzte Renovation", details.renoviert],
    ["Verfügbar ab", details.verfuegbar],
    [offer === "miete" ? "Miete pro Monat" : "Verkaufspreis", price],
  ].filter((f): f is [string, string] => Boolean(f[1]));
  const keyFacts = facts.filter(([k]) => ["Zimmer", "Wohnfläche", "Etage", "Verfügbar ab"].includes(k)).slice(0, 4);
  const highlights = (details.highlights ?? []).slice(0, 6);
  const merkmale = details.merkmale ?? [];

  const contactBlock = (
    <div className="text-[9.5pt] leading-relaxed">
      {contact ? (
        <>
          <div className="font-semibold text-[#191b1d]">{contact.name}</div>
          <div className="text-[#7a756b]">{contact.role}</div>
          <div className="mt-1">{contact.phone}</div>
          <div>{contact.email}</div>
        </>
      ) : (
        <>
          <div className="font-semibold text-[#191b1d]">{COMPANY.name}</div>
          <div>{COMPANY.email}</div>
        </>
      )}
    </div>
  );

  const printCss = (
    <style>{`@page{size:A4;margin:0}@media print{html,body{background:#fff!important}.expose-sheet{break-after:page;height:296mm!important}.expose-sheet:last-of-type{break-after:auto}header,footer,nav,.fixed{display:none!important}}`}</style>
  );

  const toolbar = (
    <div className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 rounded-xl bg-[#191b1d] px-5 py-3 text-sm text-white print:hidden">
      <span>
        <strong>{format === "flyer" ? "Flyer" : "Exposé"}</strong> · {title}
      </span>
      <span className="flex items-center gap-4 text-white/70">
        <Link href={format === "flyer" ? `/immobilien/${listing.id}/expose` : `/immobilien/${listing.id}/expose?format=flyer`} className="underline underline-offset-4 hover:text-white">
          {format === "flyer" ? "Zum Exposé" : "Zum Flyer (1 Seite)"}
        </Link>
        <span>Mit Ctrl+P als PDF speichern</span>
      </span>
    </div>
  );

  // ---------------------------------------------------------------- Flyer
  if (format === "flyer") {
    return (
      <main className="min-h-svh bg-[#e9e5de] px-4 py-10 font-sans text-[#191b1d] print:bg-white print:p-0">
        {printCss}
        {toolbar}
        <Sheet>
          <div className="flex items-center justify-between px-[14mm] pt-[10mm]">
            <Logo className="h-[11mm] w-auto" />
            <span className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#8f6a39]">{offer === "miete" ? "Zu vermieten" : "Zu verkaufen"}</span>
          </div>
          <div className="mx-[14mm] mt-[6mm] grid h-[118mm] grid-cols-[2fr_1fr] grid-rows-[minmax(0,1fr)] gap-[2.5mm]">
            <div className="overflow-hidden rounded-[2mm] bg-[#ece8e1]">{photos[0] && <Photo url={photos[0].url} />}</div>
            <div className="grid min-h-0 grid-rows-3 gap-[2.5mm]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-[2mm] bg-[#ece8e1]">{photos[i] && <Photo url={photos[i].url} />}</div>
              ))}
            </div>
          </div>
          <div className="px-[14mm] pt-[7mm]">
            <h1 className="font-display text-[20pt] leading-tight">{title}</h1>
            <p className="mt-1 text-[10pt] text-[#7a756b]">
              {listing.address}, {place}
            </p>
          </div>
          <div className="mx-[14mm] mt-[5mm] grid grid-cols-5 border-y border-[#e7e3dc] py-[3.5mm]">
            {[...keyFacts, [offer === "miete" ? "Miete / Monat" : "Preis", price] as [string, string]].slice(0, 5).map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[6.5pt] uppercase tracking-[0.14em] text-[#7a756b]">{k}</div>
                <div className="mt-0.5 font-display text-[12pt] text-[#8f6a39]">{v}</div>
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-[8mm] overflow-hidden px-[14mm] pt-[6mm]">
            <p className="line-clamp-[14] whitespace-pre-line text-[9pt] leading-relaxed text-[#3d3a35]">{listing.description as string}</p>
            <div>
              {highlights.length > 0 && (
                <>
                  <div className="font-mono text-[7pt] uppercase tracking-[0.18em] text-[#8f6a39]">Besonderes</div>
                  <ul className="mt-2 space-y-1.5 text-[9.5pt]">
                    {highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <Check className="mt-[1mm] h-[3.2mm] w-[3.2mm] shrink-0 text-[#8f6a39]" strokeWidth={2.5} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="mt-[5mm] flex items-center justify-between bg-[#8f6a39] px-[14mm] py-[6mm] text-white">
            <div className="text-[9pt] leading-relaxed">
              <div className="font-display text-[13pt]">Besichtigung vereinbaren</div>
              {contact ? `${contact.name} · ${contact.phone} · ${contact.email}` : COMPANY.email}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-right text-[8pt] text-white/85">
                Alle Bilder und
                <br />
                3D-Rundgang online
              </span>
              <span className="block h-[19mm] w-[19mm] rounded-[1.5mm] bg-white p-[1.5mm]" dangerouslySetInnerHTML={{ __html: qr }} />
            </div>
          </div>
        </Sheet>
      </main>
    );
  }

  // --------------------------------------------------------------- Exposé
  const galleryPhotos = photos.slice(1);
  const galleryPages: { url: string }[][] = [];
  for (let i = 0; i < galleryPhotos.length && galleryPages.length < 4; i += 2) galleryPages.push(galleryPhotos.slice(i, i + 2));
  const total = 3 + galleryPages.length;

  return (
    <main className="min-h-svh bg-[#e9e5de] px-4 py-10 font-sans text-[#191b1d] print:bg-white print:p-0">
      {printCss}
      {toolbar}

      {/* 1 · Titelseite */}
      <Sheet>
        <div className="flex items-center justify-between px-[16mm] pt-[12mm]">
          <Logo className="h-[12mm] w-auto" />
          <span className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#7a756b]">
            {offer === "miete" ? "Mietdokumentation" : "Verkaufsdokumentation"}
          </span>
        </div>
        <div className="mx-[16mm] mt-[10mm] h-[150mm] overflow-hidden rounded-[2mm] bg-[#ece8e1]">{photos[0] && <Photo url={photos[0].url} />}</div>
        <div className="px-[16mm] pt-[12mm]">
          <div className="font-mono text-[8pt] uppercase tracking-[0.22em] text-[#8f6a39]">{place}</div>
          <h1 className="mt-3 font-display text-[26pt] leading-[1.1]">{title}</h1>
          <p className="mt-2 text-[11pt] text-[#7a756b]">{listing.address}</p>
          <div className="mt-[8mm] flex items-end justify-between">
            <div>
              <div className="font-mono text-[7pt] uppercase tracking-[0.18em] text-[#7a756b]">{offer === "miete" ? "Miete pro Monat" : "Verkaufspreis"}</div>
              <div className="font-display text-[20pt] text-[#8f6a39]">{price}</div>
            </div>
            {contactBlock}
          </div>
        </div>
        <SheetFooter page={1} total={total} stand={stand} />
      </Sheet>

      {/* 2 · Beschreibung und Eckdaten */}
      <Sheet>
        <div className="grid flex-1 grid-cols-[1.5fr_1fr] gap-[10mm] px-[16mm] pt-[16mm]">
          <div>
            <div className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#8f6a39]">Beschreibung</div>
            <h2 className="mt-2 font-display text-[17pt] leading-tight">{title}</h2>
            <p className="mt-[5mm] whitespace-pre-line text-[9.5pt] leading-[1.65] text-[#3d3a35]">
              {(listing.description as string | null) || "Weitere Angaben erhalten Sie gerne auf Anfrage."}
            </p>
          </div>
          <aside className="h-fit rounded-[2mm] bg-white p-[6mm]">
            <div className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#8f6a39]">Eckdaten</div>
            <dl className="mt-3 divide-y divide-[#efebe4] text-[9pt]">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-[1.8mm]">
                  <dt className="text-[#7a756b]">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
        {highlights.length > 0 && (
          <div className="mx-[16mm] mb-[8mm] mt-[6mm] rounded-[2mm] border border-[#e7e3dc] p-[6mm]">
            <div className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#8f6a39]">Highlights</div>
            <ul className="mt-3 grid grid-cols-2 gap-x-[8mm] gap-y-2 text-[9.5pt]">
              {highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <Check className="mt-[1mm] h-[3.2mm] w-[3.2mm] shrink-0 text-[#8f6a39]" strokeWidth={2.5} />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        <SheetFooter page={2} total={total} stand={stand} />
      </Sheet>

      {/* Bilder, zwei pro Seite */}
      {galleryPages.map((pair, i) => (
        <Sheet key={i}>
          <div className="grid min-h-0 flex-1 grid-rows-2 gap-[6mm] px-[16mm] pt-[16mm]">
            {pair.map((p) => (
              <div key={p.url} className="overflow-hidden rounded-[2mm] bg-[#ece8e1]">
                <Photo url={p.url} />
              </div>
            ))}
          </div>
          <div className="h-[8mm]" />
          <SheetFooter page={3 + i} total={total} stand={stand} />
        </Sheet>
      ))}

      {/* Letzte Seite · Ausstattung und Kontakt */}
      <Sheet>
        <div className="flex-1 px-[16mm] pt-[16mm]">
          {merkmale.length > 0 && (
            <>
              <div className="font-mono text-[7.5pt] uppercase tracking-[0.22em] text-[#8f6a39]">Ausstattung</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {merkmale.map((m) => (
                  <span key={m} className="rounded-full border border-[#e7e3dc] bg-white px-3 py-1 text-[9pt]">
                    {m}
                  </span>
                ))}
              </div>
            </>
          )}
          <div className="mt-[12mm] grid grid-cols-[1fr_auto] items-center gap-[10mm] rounded-[2mm] bg-[#8f6a39] p-[10mm] text-white">
            <div>
              <div className="font-display text-[18pt] leading-tight">Interessiert? Wir zeigen Ihnen das Objekt gerne.</div>
              <div className="mt-4 text-[10pt] leading-relaxed text-white/90">
                {contact ? (
                  <>
                    {contact.name}, {contact.role}
                    <br />
                    {contact.phone} · {contact.email}
                  </>
                ) : (
                  COMPANY.email
                )}
              </div>
            </div>
            <div className="text-center">
              <span className="block h-[30mm] w-[30mm] rounded-[2mm] bg-white p-[2.5mm]" dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="mt-2 text-[7.5pt] text-white/85">Alle Bilder und 3D-Rundgang</div>
            </div>
          </div>
          <p className="mt-[8mm] text-[8pt] leading-relaxed text-[#7a756b]">
            Diese Dokumentation dient der Information und ist kein Vertragsbestandteil. Alle Angaben ohne Gewähr; Irrtum und
            Zwischenverkauf vorbehalten. Flächen sind ca.-Angaben. Online: {onlineUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
        <SheetFooter page={total} total={total} stand={stand} />
      </Sheet>

      <div className="mx-auto mt-2 max-w-[210mm] text-center print:hidden">
        <Link href={`/immobilien/${listing.id}`} className="text-sm text-[#7a756b] underline underline-offset-4 hover:text-[#191b1d]">
          ← Zurück zum Objekt
        </Link>
      </div>
    </main>
  );
}
