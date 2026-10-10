import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Ihr Feedback zur Besichtigung",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { id } = await params;
  const { k } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, address, city")
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();
  if (!listing) notFound();

  return (
    <main className="min-h-svh bg-ink px-5 py-8">
      <div className="mx-auto max-w-lg">
        <Link href="/" aria-label="NoviDom Startseite">
          <Logo className="h-9 w-auto" />
        </Link>
        <h1 className="mt-8 font-display text-3xl text-ivory">Wie war die Besichtigung?</h1>
        <p className="mt-2 text-ivory-dim">
          {listing.title || listing.address}, {listing.city}. Eine Minute, ganz ohne Anruf. Ihre Antworten helfen dem Verkäufer und uns.
        </p>
        <FeedbackForm listingId={listing.id} kanal={k ?? "link"} />
      </div>
    </main>
  );
}
