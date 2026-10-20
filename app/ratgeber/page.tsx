import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FinalCta } from "@/components/sections/FinalCta";
import { RatgeberCard } from "@/components/ratgeber/RatgeberCard";
import { ARTICLES } from "@/lib/ratgeber";

export const metadata: Metadata = {
  title: "Ratgeber Immobilien, Hypotheken & Versicherung — NoviDom",
  description:
    "Aktuelle Einordnungen für Eigentümer in Basel, Zürich und Zug: Hypothekarzinsen, Eigenmietwert, Umbau, Hagel und Erdbeben. Mit Quellen und Rechnern.",
  alternates: { canonical: "/ratgeber" },
};

export default function RatgeberPage() {
  const articles = [...ARTICLES].sort((a, b) => b.updated.localeCompare(a.updated));
  return (
    <>
      <Header />
      <main className="bg-ink">
        <section className="mx-auto max-w-5xl px-6 pb-12 pt-36 text-center lg:pt-44">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">NoviDom Ratgeber</div>
          <h1 className="mt-6 text-balance font-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-[-0.03em] text-ivory">
            Was die News <em>für Ihr Zuhause heissen.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim">
            Zinsen, Steuern, Umbau und Versicherung, kurz eingeordnet für Eigentümer in der Nordwestschweiz, in Zürich und Zug. Mit Quellen und dem passenden Rechner.
          </p>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-24 sm:grid-cols-2 lg:px-10">
          {articles.map((a) => (
            <RatgeberCard key={a.slug} article={a} />
          ))}
        </section>
        <FinalCta title="Ihre Frage ist nicht dabei?" text="Schreiben Sie uns, wir antworten persönlich und meist am gleichen Tag." topic="Ratgeber" />
      </main>
      <Footer />
    </>
  );
}
