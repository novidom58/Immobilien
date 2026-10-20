import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FinalCta } from "@/components/sections/FinalCta";
import { RatgeberCard } from "@/components/ratgeber/RatgeberCard";
import { ARTICLES, articleBySlug, formatDate } from "@/lib/ratgeber";

const siteUrl = "https://www.novidom-immo.ch";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return { title: "Nicht gefunden" };
  return {
    title: `${article.title} — NoviDom Ratgeber`,
    description: article.description,
    alternates: { canonical: `/ratgeber/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, publishedTime: article.published, modifiedTime: article.updated },
  };
}

export default async function RatgeberArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const more = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.updated,
    inLanguage: "de-CH",
    mainEntityOfPage: `${siteUrl}/ratgeber/${article.slug}`,
    author: { "@type": "Organization", name: "NoviDom Immo", url: siteUrl },
    publisher: { "@type": "Organization", name: "NoviDom Immo", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/icon.png` } },
    citation: article.sources.map((s) => s.url),
  };
  // Der Rechner-Hinweis steht nach dem zweiten Abschnitt, damit er beim Lesen auftaucht
  const ctaAfter = Math.min(1, article.sections.length - 1);

  return (
    <>
      <Header />
      <main className="bg-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article className="mx-auto max-w-3xl px-6 pb-20 pt-36 lg:pt-44">
          <nav aria-label="Brotkrumen" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim">
            <Link href="/ratgeber" className="hover:text-ivory">
              Ratgeber
            </Link>
            <span aria-hidden> / </span>
            <span className="text-amber">{article.category}</span>
          </nav>
          <h1 className="mt-6 text-balance font-display text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.08] tracking-[-0.02em] text-ivory">{article.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ivory-dim">
            <span>NoviDom Immo</span>
            <span>
              Veröffentlicht <time dateTime={article.published}>{formatDate(article.published)}</time>
            </span>
            {article.updated !== article.published && (
              <span>
                Aktualisiert <time dateTime={article.updated}>{formatDate(article.updated)}</time>
              </span>
            )}
            <span>{article.readingMinutes} Min. Lesezeit</span>
          </div>

          <p className="mt-10 text-xl leading-relaxed text-ivory">{article.lead}</p>

          {article.sections.map((s, i) => (
            <div key={s.heading}>
              <h2 className="mt-12 font-display text-2xl text-ivory lg:text-3xl">{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-4 text-[17px] leading-relaxed text-ivory-dim">
                  {p}
                </p>
              ))}
              {i === ctaAfter && (
                <Link href={article.cta.href} className="group mt-10 flex items-center gap-5 rounded-2xl bg-night p-6 text-ink">
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl">{article.cta.label}</span>
                    <span className="mt-1 block text-sm text-ink/75">{article.cta.text}</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber text-white transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                </Link>
              )}
            </div>
          ))}

          <div className="mt-12 rounded-2xl border border-amber/40 bg-amber/5 p-6">
            <div className="font-display text-xl text-ivory">Das heisst für Sie</div>
            <ul className="mt-4 grid gap-3">
              {article.takeaways.map((t) => (
                <li key={t} className="flex gap-3 text-ivory">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber" strokeWidth={1.75} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 border-t border-line pt-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim">Quellen</div>
            <ul className="mt-3 grid gap-2 text-sm">
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-ivory-dim underline decoration-line underline-offset-4 hover:text-amber">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-ivory-dim">
              Stand {formatDate(article.updated)}. Dieser Beitrag ordnet aktuelle Meldungen ein und ersetzt keine Rechts-, Steuer- oder Versicherungsberatung im Einzelfall.
            </p>
          </div>
        </article>

        <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-10">
          <h2 className="mb-6 px-2 font-display text-2xl text-ivory">Weiterlesen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {more.map((a) => (
              <RatgeberCard key={a.slug} article={a} />
            ))}
          </div>
        </section>

        <FinalCta title="Persönlich besprechen?" text="Wir schauen Ihre Situation an und melden uns meist am gleichen Tag." topic={article.category} />
      </main>
      <Footer />
    </>
  );
}
