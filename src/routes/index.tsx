import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTopHeadlines, searchNews } from "../server/news.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { BreakingTicker } from "../components/news/BreakingTicker";
import { ArticleCard, ArticleCardSkeleton } from "../components/news/ArticleCard";
import { TickerControl, useTickerInterval } from "../components/news/TickerControl";
import { useRegion } from "../components/news/RegionProvider";
import { useFilters } from "../components/news/useFilters";
import { applyFilters, CATEGORIES, COUNTRIES } from "../components/news/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEWS POINT — Live Breaking News, Latest Headlines & Today's Top Stories" },
      { name: "description", content: "Real-time breaking news from India and the world. Latest headlines, today's top stories across politics, business, tech, sports, entertainment, and health." },
      { name: "keywords", content: "breaking news, live news, India news, world news, today news, latest headlines, business news, sports news, technology news" },
      { property: "og:title", content: "NEWS POINT — Live Breaking News" },
      { property: "og:description", content: "Real-time breaking news from India and around the world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "alternate", type: "application/rss+xml", title: "NEWS POINT RSS", href: "/api/public/rss.xml" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { country, state } = useRegion();
  const [interval] = useTickerInterval();
  const filters = useFilters();
  const refetch = interval > 0 ? interval * 1000 : false;

  const top = useQuery({
    queryKey: ["headlines", country, "general"],
    queryFn: () => getTopHeadlines({ data: { country, pageSize: 30 } }),
    refetchInterval: refetch,
  });

  // India: extra state-specific feed
  const stateFeed = useQuery({
    queryKey: ["india-state", state],
    queryFn: () =>
      searchNews({
        data: { q: `${state} India`, language: "en", sortBy: "publishedAt", pageSize: 12 },
      }),
    enabled: country === "in" && state !== "All India",
    refetchInterval: refetch,
  });

  const world = useQuery({
    queryKey: ["headlines", "world"],
    queryFn: () => getTopHeadlines({ data: { country: "us", category: "general", pageSize: 12 } }),
    refetchInterval: refetch,
  });

  const tech = useQuery({
    queryKey: ["headlines", country, "technology"],
    queryFn: () => getTopHeadlines({ data: { country, category: "technology", pageSize: 8 } }),
    refetchInterval: refetch,
  });

  const sports = useQuery({
    queryKey: ["headlines", country, "sports"],
    queryFn: () => getTopHeadlines({ data: { country, category: "sports", pageSize: 8 } }),
    refetchInterval: refetch,
  });

  const articles = applyFilters(top.data?.articles ?? [], filters);
  const hero = articles[0];
  const sideStories = articles.slice(1, 5);
  const latest = articles.slice(5, 17);
  const todayTop = articles.slice(17, 25);
  const regionalArticles = applyFilters(stateFeed.data?.articles ?? [], filters).slice(0, 8);
  const worldArticles = applyFilters(world.data?.articles ?? [], filters).slice(0, 8);
  const techArticles = applyFilters(tech.data?.articles ?? [], filters).slice(0, 4);
  const sportsArticles = applyFilters(sports.data?.articles ?? [], filters).slice(0, 4);

  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Status bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-3 border-b border-border">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-live-pulse" />
              <span className="font-bold uppercase tracking-widest">Live</span>
            </span>
            <span className="text-muted-foreground">
              {countryName}{country === "in" && state !== "All India" ? ` · ${state}` : ""}
            </span>
            {top.dataUpdatedAt > 0 && (
              <span className="text-muted-foreground hidden sm:inline">
                · Updated {new Date(top.dataUpdatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <TickerControl />
        </div>

        {top.isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 aspect-[16/10] bg-muted animate-pulse" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse" />)}
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
                {sideStories.map((a) => <ArticleCard key={a.url} article={a} size="sm" />)}
              </div>
            </aside>
          </section>
        )}

        {country === "in" && state !== "All India" && regionalArticles.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6 border-b-2 border-secondary pb-2">
              <h2 className="font-display text-3xl">{state} News</h2>
              <Link to="/search" search={{ q: `${state} India`, language: "en", sortBy: "publishedAt" }} className="text-xs uppercase tracking-widest font-bold text-primary hover:underline">
                More →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {regionalArticles.slice(0, 4).map((a) => <ArticleCard key={a.url} article={a} />)}
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6 border-b-2 border-secondary pb-2">
              <h2 className="font-display text-3xl">Latest News</h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Auto-refresh {interval === 0 ? "off" : `${interval}s`}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a) => <ArticleCard key={a.url} article={a} />)}
            </div>
          </section>
        )}

        {todayTop.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl mb-6 border-b-2 border-secondary pb-2">Today's Top Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {todayTop.slice(0, 4).map((a) => <ArticleCard key={a.url} article={a} />)}
            </div>
          </section>
        )}

        {country !== "us" && worldArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl mb-6 border-b-2 border-secondary pb-2">World</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {worldArticles.slice(0, 4).map((a) => <ArticleCard key={a.url} article={a} />)}
            </div>
          </section>
        )}

        {(techArticles.length > 0 || sportsArticles.length > 0) && (
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {techArticles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-secondary pb-2">
                  <h2 className="font-display text-2xl">Technology</h2>
                  <Link to="/category/$slug" params={{ slug: "technology" }} className="text-xs uppercase tracking-widest font-bold text-primary hover:underline">More →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {techArticles.map((a) => <ArticleCard key={a.url} article={a} size="sm" />)}
                </div>
              </div>
            )}
            {sportsArticles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-secondary pb-2">
                  <h2 className="font-display text-2xl">Sports</h2>
                  <Link to="/category/$slug" params={{ slug: "sports" }} className="text-xs uppercase tracking-widest font-bold text-primary hover:underline">More →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sportsArticles.map((a) => <ArticleCard key={a.url} article={a} size="sm" />)}
                </div>
              </div>
            )}
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
