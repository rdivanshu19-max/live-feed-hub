import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { isBookmarked, toggleBookmark } from "./utils";
import type { Article } from "../../server/news.functions";

export function BookmarkButton({ article, className = "" }: { article: Article; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(article.url));
    const onChange = () => setSaved(isBookmarked(article.url));
    window.addEventListener("np:bookmarks", onChange);
    return () => window.removeEventListener("np:bookmarks", onChange);
  }, [article.url]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save article"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggleBookmark({
          url: article.url,
          title: article.title,
          description: article.description,
          urlToImage: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
        });
        setSaved(now);
      }}
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
        saved ? "text-primary" : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}