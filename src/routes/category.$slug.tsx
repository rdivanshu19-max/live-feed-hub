import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTopHeadlines } from "../server/news.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { ArticleCard, ArticleCardSkeleton } from "../components/news/ArticleCard";
import { CATEGORIES } from "../components/news/utils";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const title = cat ? `${cat.name} News — NEWS POINT` : "Category — NEWS POINT";
    const desc = cat ? `Latest ${cat.name.toLowerCase()} news, breaking stories and live updates.` : "Latest news.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  beforeLoad: ({ params }): never | undefined => {
    if (!CATEGORIES.find((c) => c.slug === params.slug)) throw notFound();
    return undefined;
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug)!;
  const q = useQuery({
    queryKey: ["headlines", "us", slug],
    queryFn: () => getTopHeadlines({ data: { country: "us", category: slug, pageSize: 40 } }),
    refetchInterval: 60_000,
  });

  const articles = q.data?.articles ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 border-b-2 border-primary pb-4">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Category</p>
          <h1 className="font-display text-5xl mt-1">{cat.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live {cat.name.toLowerCase()} headlines · refreshes every 60s
          </p>
        </header>

        {q.isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        )}

        {q.data?.error && (
          <div className="border border-primary bg-primary/5 p-6 text-center">
            <p className="text-sm">{q.data.error}</p>
          </div>
        )}

        {articles.length === 0 && !q.isLoading && !q.data?.error && (
          <p className="text-center text-muted-foreground py-12">No stories found in this category right now.</p>
        )}

        {articles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => <ArticleCard key={a.url} article={a} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}