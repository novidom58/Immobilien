import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, type RatgeberArticle } from "@/lib/ratgeber";

export function RatgeberCard({ article }: { article: RatgeberArticle }) {
  return (
    <Link
      href={`/ratgeber/${article.slug}`}
      className="group flex flex-col rounded-[24px] border border-line bg-white p-6 transition-colors hover:border-amber lg:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory-dim">
        <span className="text-amber">{article.category}</span>
        <span aria-hidden>·</span>
        <time dateTime={article.updated}>{formatDate(article.updated)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} Min.</span>
      </div>
      <h2 className="mt-4 text-balance font-display text-2xl leading-snug text-ivory">{article.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory-dim">{article.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ivory group-hover:text-amber">
        Weiterlesen
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </span>
    </Link>
  );
}

/** Passende Beiträge am Ende einer Leistungsseite, für die interne Verlinkung. */
export function RatgeberTeaser({ articles }: { articles: RatgeberArticle[] }) {
  if (!articles.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 px-2">
        <h2 className="font-display text-3xl text-ivory lg:text-4xl">
          Aus dem <em>Ratgeber.</em>
        </h2>
        <Link href="/ratgeber" className="text-sm font-semibold text-ivory-dim hover:text-amber">
          Alle Beiträge →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <RatgeberCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
