import { Link } from "@tanstack/react-router";
import type { Article } from "../../server/news.functions";
import { encodeArticleId, FALLBACK_IMAGE, timeAgo } from "./utils";

interface Props {
  article: Article;
  size?: "sm" | "md" | "lg" | "hero";
  showBreaking?: boolean;
}

export function ArticleCard({ article, size = "md", showBreaking = false }: Props) {
  const id = encodeArticleId(article.url);
  const img = article.urlToImage || FALLBACK_IMAGE;

  if (size === "hero") {
    return (
      <Link
        to="/article/$id"
        params={{ id }}
        className="group relative block overflow-hidden bg-secondary"
      >
        <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
          <img
            src={img}
            alt={article.title}
            loading="eager"
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
          {showBreaking && (
            <span className="mb-3 inline-flex items-center gap-2 bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-white animate-live-pulse" /> Breaking
            </span>
          )}
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            {article.title}
          </h2>
          {article.description && (
            <p className="mt-3 hidden md:block text-base opacity-90 line-clamp-2 max-w-3xl">
              {article.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-wide opacity-80">
            <span className="font-bold">{article.source.name}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (size === "sm") {
    return (
      <Link to="/article/$id" params={{ id }} className="group flex gap-3 border-b border-border pb-3 last:border-0">
        <div className="h-20 w-24 flex-shrink-0 overflow-hidden bg-muted">
          <img
            src={img}
            alt={article.title}
            loading="lazy"
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base leading-snug line-clamp-3 group-hover:text-primary">
            {article.title}
          </h3>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            {article.source.name} · {timeAgo(article.publishedAt)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/article/$id" params={{ id }} className="group flex flex-col bg-card border border-border hover:border-primary transition-colors">
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {showBreaking && (
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-live-pulse" /> Breaking
          </span>
        )}
        <h3 className="font-display text-xl leading-tight line-clamp-3 group-hover:text-primary">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span className="font-bold text-secondary">{article.source.name}</span>
          <span>·</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border border-border">
      <div className="aspect-[16/10] w-full bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-muted animate-pulse" />
        <div className="h-5 w-2/3 bg-muted animate-pulse" />
        <div className="h-3 w-1/3 bg-muted animate-pulse mt-3" />
      </div>
    </div>
  );
}