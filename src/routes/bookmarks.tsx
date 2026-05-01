import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark as BIcon, Trash2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { encodeArticleId, FALLBACK_IMAGE, getBookmarks, lsSet, STORAGE_KEYS, timeAgo, type Bookmark } from "../components/news/utils";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Saved Articles — NEWS POINT" },
      { name: "description", content: "Your bookmarked news articles, saved for later reading." },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Saved Articles — NEWS POINT" },
      { property: "og:description", content: "Your bookmarked news articles." },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const [items, setItems] = useState<Bookmark[]>([]);
  useEffect(() => {
    setItems(getBookmarks());
    const onChange = () => setItems(getBookmarks());
    window.addEventListener("np:bookmarks", onChange);
    return () => window.removeEventListener("np:bookmarks", onChange);
  }, []);

  function remove(url: string) {
    const next = items.filter((b) => b.url !== url);
    lsSet(STORAGE_KEYS.bookmarks, next);
    setItems(next);
    window.dispatchEvent(new Event("np:bookmarks"));
  }
  function clearAll() {
    if (!confirm("Remove all saved articles?")) return;
    lsSet(STORAGE_KEYS.bookmarks, []);
    setItems([]);
    window.dispatchEvent(new Event("np:bookmarks"));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 border-b-2 border-primary pb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Your Library</p>
            <h1 className="font-display text-5xl mt-1">Saved Articles</h1>
            <p className="mt-2 text-sm text-muted-foreground">{items.length} saved · stored on this device</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <BIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="font-display text-2xl mt-4">No saved articles yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Tap the bookmark icon on any story to save it here.</p>
            <Link to="/" className="mt-6 inline-block bg-primary px-5 py-2.5 text-primary-foreground font-bold uppercase text-sm tracking-wide">
              Browse latest news
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <article key={b.url} className="group flex flex-col bg-card border border-border hover:border-primary transition-colors relative">
                <Link to="/article/$id" params={{ id: encodeArticleId(b.url) }} className="block">
                  <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                    <img
                      src={b.urlToImage || FALLBACK_IMAGE}
                      alt={b.title}
                      loading="lazy"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link to="/article/$id" params={{ id: encodeArticleId(b.url) }}>
                    <h3 className="font-display text-xl leading-tight line-clamp-3 hover:text-primary">{b.title}</h3>
                  </Link>
                  {b.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.description}</p>}
                  <div className="mt-auto pt-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                    <span><span className="font-bold text-secondary">{b.source}</span> · {timeAgo(b.publishedAt)}</span>
                    <button
                      onClick={() => remove(b.url)}
                      aria-label="Remove bookmark"
                      className="hover:text-primary"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}