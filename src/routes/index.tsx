import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTopHeadlines } from "../server/news.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { BreakingTicker } from "../components/news/BreakingTicker";
import { ArticleCard, ArticleCardSkeleton } from "../components/news/ArticleCard";
import { CATEGORIES } from "../components/news/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const top = useQuery({
    queryKey: ["headlines", "us", "general"],
    queryFn: () => getTopHeadlines({ data: { country: "us", pageSize: 30 } }),
    refetchInterval: 60_000,
  });

  const articles = top.data?.articles ?? [];
  const hero = articles[0];
  const sideStories = articles.slice(1, 5);
  const latest = articles.slice(5, 17);
  const todayTop = articles.slice(17, 25);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {top.isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 aspect-[16/10] bg-muted animate-pulse" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {top.data?.error && (
          <div className="border border-primary bg-primary/5 p-6 text-center">
            <h2 className="font-display text-2xl text-primary">Couldn't load news</h2>
            <p className="mt-2 text-sm text-muted-foreground">{top.data.error}</p>
          </div>
        )}

        {hero && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ArticleCard article={hero} size="hero" showBreaking />
            </div>
            <aside className="space-y-4">
              <h2 className="font-display text-xl border-b-2 border-primary pb-2">Top Stories</h2>
              <div className="space-y-3">
                {sideStories.map((a) => (
                  <ArticleCard key={a.url} article={a} size="sm" />
                ))}
              </div>
            </aside>
          </section>
        )}

        {latest.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6 border-b-2 border-secondary pb-2">
              <h2 className="font-display text-3xl">Latest News</h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Updated {top.dataUpdatedAt ? new Date(top.dataUpdatedAt).toLocaleTimeString() : ""}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a) => (
                <ArticleCard key={a.url} article={a} />
              ))}
            </div>
          </section>
        )}

        {todayTop.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl mb-6 border-b-2 border-secondary pb-2">Today's Top Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {todayTop.slice(0, 4).map((a) => (
                <ArticleCard key={a.url} article={a} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-display text-3xl mb-6 border-b-2 border-secondary pb-2">Browse by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((c) => c.slug !== "general").map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex items-center justify-between border border-border bg-card p-5 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <span className="font-display text-2xl">{c.name}</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
