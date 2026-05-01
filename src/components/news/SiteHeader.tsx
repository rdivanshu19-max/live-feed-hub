import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X, Bookmark } from "lucide-react";
import { CATEGORIES } from "./utils";
import { ThemeToggle } from "./ThemeToggle";
import { RegionPicker } from "./RegionPicker";
import { FilterDialog } from "./FilterDialog";

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/search", search: { q: q.trim() } });
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs gap-3">
          <span className="font-semibold tracking-wider whitespace-nowrap">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          <span className="hidden md:inline opacity-80">Live updates · global newsroom</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-primary px-2 py-1 text-primary-foreground font-display text-2xl leading-none">NEWS</span>
          <span className="font-display text-2xl leading-none text-secondary">POINT</span>
        </Link>
        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search breaking news…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/bookmarks"
            aria-label="Bookmarks"
            className="inline-flex h-9 w-9 items-center justify-center border border-border hover:bg-muted transition-colors"
          >
            <Bookmark className="h-4 w-4" />
          </Link>
          <ThemeToggle />
        </div>
        <button
          aria-label="Menu"
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div className="hidden md:block border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <RegionPicker />
          <FilterDialog />
        </div>
      </div>
      <nav className="hidden md:block border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="whitespace-nowrap px-3 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "whitespace-nowrap px-3 py-3 text-sm font-bold uppercase tracking-wide text-primary border-b-2 border-primary" }}
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/about"
            className="ml-auto whitespace-nowrap px-3 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
        </div>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <form onSubmit={submit} className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search breaking news…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </form>
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 flex-wrap">
            <RegionPicker />
            <div className="flex items-center gap-2">
              <FilterDialog />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="border-b border-border px-4 py-3 text-sm font-bold uppercase tracking-wide"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/bookmarks" onClick={() => setOpen(false)} className="border-b border-border px-4 py-3 text-sm font-bold uppercase tracking-wide">
              Bookmarks
            </Link>
            <Link to="/about" onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-bold uppercase">About</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-primary px-2 py-1 text-primary-foreground font-display text-xl leading-none">NEWS</span>
              <span className="font-display text-xl leading-none">POINT</span>
            </div>
            <p className="mt-2 text-sm opacity-80">Live breaking news from around the world.</p>
          </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-xs opacity-80">
          <div className="flex items-center gap-3">
            <a href="/api/public/rss.xml" className="hover:text-primary">RSS</a>
            <a href="/api/public/sitemap.xml" className="hover:text-primary">Sitemap</a>
            <Link to="/about" className="hover:text-primary">About</Link>
          </div>
          <p className="opacity-80">© {new Date().getFullYear()} NEWS POINT. Powered by NewsAPI.</p>
        </div>
        </div>
      </div>
    </footer>
  );
}