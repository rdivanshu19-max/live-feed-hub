import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState } from "react";
import { Search } from "lucide-react";
import { searchNews } from "../server/news.functions";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";
import { ArticleCard, ArticleCardSkeleton } from "../components/news/ArticleCard";

const searchSchema = z.object({
  q: z.string().optional().default(""),
  language: z.string().optional().default("en"),
  sortBy: z.string().optional().default("publishedAt"),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ search }) => {
    const title = search.q ? `Search: ${search.q} — NEWS POINT` : "Search news — NEWS POINT";
    return {
      meta: [
        { title },
        { name: "description", content: "Search live news from across the web." },
        { property: "og:title", content: title },
        { property: "og:description", content: "Search live news from across the web." },
      ],
    };
  },
  component: SearchPage,
});

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
];

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(search.q);

  const q = useQuery({
    queryKey: ["search", search.q, search.language, search.sortBy],
    queryFn: () =>
      searchNews({
        data: { q: search.q, language: search.language, sortBy: search.sortBy, pageSize: 40 },
      }),
    enabled: !!search.q,
  });

  const articles = q.data?.articles ?? [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: input.trim() }) });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 border-b-2 border-primary pb-4">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">Search</p>
          <h1 className="font-display text-5xl mt-1">Find News</h1>
        </header>

        <form onSubmit={submit} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex flex-1 items-center gap-2 border border-border bg-muted px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search keywords…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={search.language}
            onChange={(e) => navigate({ search: (p) => ({ ...p, language: e.target.value }) })}
            className="border border-border bg-muted px-3 py-2.5 text-sm"
          >
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          <select
            value={search.sortBy}
            onChange={(e) => navigate({ search: (p) => ({ ...p, sortBy: e.target.value }) })}
            className="border border-border bg-muted px-3 py-2.5 text-sm"
          >
            <option value="publishedAt">Newest</option>
            <option value="relevancy">Relevance</option>
            <option value="popularity">Popularity</option>
          </select>
          <button type="submit" className="bg-primary px-6 py-2.5 text-primary-foreground font-bold uppercase text-sm tracking-wide">
            Search
          </button>
        </form>

        {!search.q && (
          <p className="text-center text-muted-foreground py-12">Enter a keyword to search live news.</p>
        )}

        {search.q && q.isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        )}

        {search.q && q.data?.error && (
          <div className="border border-primary bg-primary/5 p-6 text-center">
            <p className="text-sm">{q.data.error}</p>
          </div>
        )}

        {search.q && !q.isLoading && articles.length === 0 && !q.data?.error && (
          <p className="text-center text-muted-foreground py-12">No results for "{search.q}".</p>
        )}

        {articles.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {q.data?.totalResults?.toLocaleString()} results for "{search.q}"
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => <ArticleCard key={a.url} article={a} />)}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}