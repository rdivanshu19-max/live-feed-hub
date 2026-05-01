import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { getArticleByUrl, searchNews } from "../server/news.functions";
import { extractArticle } from "../server/extract.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { ArticleCard } from "../components/news/ArticleCard";
import { BookmarkButton } from "../components/news/BookmarkButton";
import { ShareButtons } from "../components/news/ShareButtons";
import { decodeArticleId, FALLBACK_IMAGE, lsGet, lsSet, readingTime, STORAGE_KEYS, timeAgo } from "../components/news/utils";

type ReaderMode = "rich" | "extracted" | "iframe";

export const Route = createFileRoute("/article/$id")({
  head: ({ params }) => {
    let url = "";
    try { url = decodeArticleId(params.id); } catch {}
    return {
      meta: [
        { title: "Article — NEWS POINT" },
        { name: "description", content: "Read the full story on NEWS POINT." },
        { property: "og:title", content: "Article — NEWS POINT" },
        { property: "og:description", content: url || "Read the full story on NEWS POINT." },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  let url = "";
  try { url = decodeArticleId(id); } catch {}

  const [mode, setMode] = useState<ReaderMode>("rich");
  useEffect(() => {
    setMode(lsGet<ReaderMode>(STORAGE_KEYS.reader, "rich"));
  }, []);
  function pickMode(m: ReaderMode) {
    setMode(m);
    lsSet(STORAGE_KEYS.reader, m);
  }

  const meta = useQuery({
    queryKey: ["article", url],
    queryFn: () => getArticleByUrl({ data: { url } }),
    enabled: !!url,
    staleTime: 5 * 60_000,
  });

  const a = meta.data?.article;

  const extracted = useQuery({
    queryKey: ["extract", url],
    queryFn: () => extractArticle({ data: { url } }),
    enabled: !!url && mode === "extracted",
    staleTime: 30 * 60_000,
  });

  const relatedQ = useQuery({
    queryKey: ["related", a?.title],
    queryFn: () => {
      const kw = (a?.title ?? "").split(/\s+/).filter((w) => w.length > 4).slice(0, 4).join(" ");
      return searchNews({ data: { q: kw || (a?.source.name ?? "news"), language: "en", sortBy: "relevancy", pageSize: 12 } });
    },
    enabled: !!a,
    staleTime: 10 * 60_000,
  });
  const related = (relatedQ.data?.articles ?? []).filter((r) => r.url !== url).slice(0, 4);

  const bodyText = a?.content ? a.content.replace(/\[\+\d+ chars\]$/, "") : "";
  const richEstimate = readingTime((a?.description ?? "") + " " + bodyText);
  const extractedTime = extracted.data?.textContent ? readingTime(extracted.data.textContent) : null;
  const readMins = mode === "extracted" && extractedTime ? extractedTime : richEstimate;

  const jsonLd = a ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    image: a.urlToImage ? [a.urlToImage] : undefined,
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    author: a.author ? [{ "@type": "Person", name: a.author }] : undefined,
    publisher: { "@type": "Organization", name: a.source.name },
    description: a.description ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": a.url },
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        {meta.isLoading && (
          <div className="space-y-4">
            <div className="h-12 bg-muted animate-pulse" />
            <div className="aspect-[16/9] bg-muted animate-pulse" />
            <div className="h-4 bg-muted animate-pulse" />
            <div className="h-4 w-2/3 bg-muted animate-pulse" />
          </div>
        )}

        {!meta.isLoading && !a && (
          <div className="border border-border bg-card p-8 text-center">
            <h1 className="font-display text-3xl">Article unavailable in headlines</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              This article may have rotated out of the live feed. You can still read the full version using extraction or open it at the source.
            </p>
            {url && (
              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => pickMode("extracted")} className="inline-flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-secondary-foreground font-bold uppercase text-sm tracking-wide">
                  Try reader view
                </button>
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 text-primary-foreground font-bold uppercase text-sm tracking-wide">
                  Open at source <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {a && (
          <article>
            {jsonLd && (
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            )}
            <p className="text-xs uppercase tracking-widest text-primary font-bold">{a.source.name}</p>
            <h1 className="font-display text-4xl md:text-6xl mt-2 leading-tight">{a.title}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {a.author && <><span>By {a.author}</span><span>·</span></>}
              <span>{new Date(a.publishedAt).toLocaleString()}</span>
              <span>·</span>
              <span>{timeAgo(a.publishedAt)}</span>
              <span>·</span>
              <span>{readMins} min read</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 flex-wrap border-y border-border py-3">
              <BookmarkButton article={a} />
              <ShareButtons url={a.url} title={a.title} />
            </div>

            {a.urlToImage && (
              <div className="mt-6 aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={a.urlToImage}
                  alt={a.title}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-6 border border-border bg-muted/30 p-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground mr-1">Reader</span>
              {(["rich", "extracted", "iframe"] as ReaderMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => pickMode(m)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                    mode === m ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {m === "rich" ? "Summary" : m === "extracted" ? "Reader View" : "Embed"}
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
                Full article copyright belongs to the publisher.
              </span>
            </div>

            <div className="mt-6">
              {mode === "rich" && (
                <>
                  {a.description && (
                    <p className="text-xl leading-relaxed font-medium text-foreground">{a.description}</p>
                  )}
                  {bodyText && (
                    <p className="mt-4 text-base leading-relaxed text-foreground/90">{bodyText}</p>
                  )}
                  <div className="mt-6 border-l-4 border-primary bg-muted/40 p-4 text-sm text-muted-foreground">
                    News APIs only return a short preview. Switch to <button className="underline font-bold hover:text-primary" onClick={() => pickMode("extracted")}>Reader View</button> to read the full extracted article, or <a className="underline font-bold hover:text-primary" href={a.url} target="_blank" rel="noopener noreferrer">open the original</a>.
                  </div>
                </>
              )}

              {mode === "extracted" && (
                <ExtractedView
                  loading={extracted.isLoading}
                  data={extracted.data}
                  fallbackUrl={a.url}
                  onTryEmbed={() => pickMode("iframe")}
                />
              )}

              {mode === "iframe" && (
                <IframeView url={a.url} extracted={extracted.data} />
              )}
            </div>

            <div className="mt-10 border-t border-border pt-6 flex items-center justify-between gap-4 flex-wrap">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground font-bold uppercase text-sm tracking-wide hover:opacity-90"
              >
                Read at original source <ExternalLink className="h-4 w-4" />
              </a>
              <ShareButtons url={a.url} title={a.title} />
            </div>
          </article>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl mb-6 border-b-2 border-primary pb-2">Related Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {related.map((r) => <ArticleCard key={r.url} article={r} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ExtractedView({
  loading,
  data,
  fallbackUrl,
  onTryEmbed,
}: {
  loading: boolean;
  data: Awaited<ReturnType<typeof extractArticle>> | undefined;
  fallbackUrl: string;
  onTryEmbed: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse" />
        <div className="h-4 w-2/3 bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse" />
      </div>
    );
  }
  if (!data || !data.ok || !data.content) {
    return (
      <div className="border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold">Couldn't extract this article</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {data?.error || "The publisher's site doesn't allow reader extraction."}
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={onTryEmbed} className="border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-muted">
                Try embed view
              </button>
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground inline-flex items-center gap-1">
                Open at source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-muted-foreground italic mb-4 border-l-2 border-border pl-3">
        Reader view extracted from {data.siteName ?? "source"} · ~{data.length ?? 0} chars · all rights to original publisher.
      </p>
      <div
        className="np-reader max-w-none"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}

function IframeView({
  url,
  extracted,
}: {
  url: string;
  extracted: Awaited<ReturnType<typeof extractArticle>> | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const blocked = extracted?.iframeBlocked === true;

  if (blocked || failed) {
    return (
      <div className="border border-border bg-card p-6 text-center">
        <AlertTriangle className="h-8 w-8 mx-auto text-primary" />
        <h3 className="font-bold mt-2">This site blocks embedding</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The publisher uses X-Frame-Options to prevent embedding. Try Reader View instead.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground font-bold uppercase text-sm tracking-wide">
          Open at source <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] border border-border bg-muted">
      <iframe
        src={url}
        title="Original article"
        className="absolute inset-0 w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
