import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "../components/news/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NEWS POINT" },
      { name: "description", content: "NEWS POINT delivers live, real-time breaking news from trusted sources around the world." },
      { property: "og:title", content: "About — NEWS POINT" },
      { property: "og:description", content: "NEWS POINT delivers live, real-time breaking news from trusted sources around the world." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8 border-b-2 border-primary pb-4">
          <p className="text-xs uppercase tracking-widest text-primary font-bold">About</p>
          <h1 className="font-display text-5xl mt-1">NEWS POINT</h1>
        </header>
        <div className="space-y-4 text-base leading-relaxed">
          <p>
            <strong>NEWS POINT</strong> brings you the latest breaking news in real time, sourced live from
            thousands of trusted publishers around the world.
          </p>
          <p>
            Our home page refreshes every 60 seconds so you never miss a moment. Browse by category — Business,
            Technology, Sports, Entertainment, Health and more — or search across the entire global news feed
            in any language.
          </p>
          <p>
            We aggregate headlines and link directly to the original publishers so you can read the full story
            from the journalists who reported it.
          </p>
          <p className="pt-4">
            <Link to="/" className="inline-block bg-primary px-5 py-3 text-primary-foreground font-bold uppercase text-sm tracking-wide">
              ← Back to live news
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}