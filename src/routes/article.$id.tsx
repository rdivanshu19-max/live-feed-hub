import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { getArticleByUrl } from "../server/news.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { decodeArticleId, FALLBACK_IMAGE, timeAgo } from "../components/news/utils";

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
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  let url = "";
  try { url = decodeArticleId(id); } catch {}

  const q = useQuery({
    queryKey: ["article", url],
    queryFn: () => getArticleByUrl({ data: { url } }),
    enabled: !!url,
    staleTime: 5 * 60_000,
  });

  const a = q.data?.article;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        {q.isLoading && (
          <div className="space-y-4">
            <div className="h-12 bg-muted animate-pulse" />
            <div className="aspect-[16/9] bg-muted animate-pulse" />
            <div className="h-4 bg-muted animate-pulse" />
            <div className="h-4 w-2/3 bg-muted animate-pulse" />
          </div>
        )}

        {!q.isLoading && !a && (
          <div className="border border-border bg-card p-8 text-center">
            <h1 className="font-display text-3xl">Article unavailable</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              We couldn't find this article in our live feed. It may have rotated out.
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground font-bold uppercase text-sm tracking-wide"
              >
                Read at original source <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {a && (
          <article>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">{a.source.name}</p>
            <h1 className="font-display text-4xl md:text-6xl mt-2 leading-tight">{a.title}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              {a.author && <span>By {a.author}</span>}
              {a.author && <span>·</span>}
              <span>{new Date(a.publishedAt).toLocaleString()}</span>
              <span>·</span>
              <span>{timeAgo(a.publishedAt)}</span>
            </div>
            <div className="mt-6 aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={a.urlToImage || FALLBACK_IMAGE}
                alt={a.title}
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
                className="h-full w-full object-cover"
              />
            </div>
            {a.description && (
              <p className="mt-6 text-xl leading-relaxed font-medium text-foreground">
                {a.description}
              </p>
            )}
            {a.content && (
              <p className="mt-4 text-base leading-relaxed text-foreground/90">
                {a.content.replace(/\[\+\d+ chars\]$/, "")}
              </p>
            )}
            <div className="mt-8 border-t border-border pt-6">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground font-bold uppercase text-sm tracking-wide hover:opacity-90"
              >
                Read full story <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}