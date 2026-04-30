import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { CATEGORIES } from "./utils";

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="font-semibold tracking-wider">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          <span className="hidden sm:inline opacity-80">Live updates every 60 seconds</span>
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
        <button
          aria-label="Menu"
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()} NEWS POINT. Powered by NewsAPI.
          </p>
        </div>
      </div>
    </footer>
  );
}