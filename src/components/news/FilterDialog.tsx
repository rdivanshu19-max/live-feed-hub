import { useEffect, useState } from "react";
import { Filter, X, Plus } from "lucide-react";
import { getFilters, setFilters, type FilterPrefs } from "./utils";

export function FilterDialog() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<FilterPrefs>({ blockedKeywords: [], blockedCategories: [] });
  const [input, setInput] = useState("");

  useEffect(() => {
    setPrefs(getFilters());
  }, [open]);

  function commit(next: FilterPrefs) {
    setPrefs(next);
    setFilters(next);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 border border-border px-3 text-xs font-bold uppercase tracking-wide hover:bg-muted transition-colors"
        aria-label="Content filters"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {prefs.blockedKeywords.length > 0 && (
          <span className="bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
            {prefs.blockedKeywords.length}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background border border-border w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b-2 border-primary pb-2">
              <h2 className="font-display text-2xl">Content Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Hide articles containing these keywords (matches title, description, source).
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = input.trim().toLowerCase();
                if (!v || prefs.blockedKeywords.includes(v)) return;
                commit({ ...prefs, blockedKeywords: [...prefs.blockedKeywords, v] });
                setInput("");
              }}
              className="flex gap-2 mb-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. crypto, celebrity, politics"
                className="flex-1 border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary px-3 text-primary-foreground inline-flex items-center"
                aria-label="Add filter"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {prefs.blockedKeywords.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No filters yet.</p>
              )}
              {prefs.blockedKeywords.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 text-xs"
                >
                  {k}
                  <button
                    onClick={() =>
                      commit({ ...prefs, blockedKeywords: prefs.blockedKeywords.filter((x) => x !== k) })
                    }
                    aria-label={`Remove ${k}`}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <button
                onClick={() => commit({ blockedKeywords: [], blockedCategories: [] })}
                className="text-xs uppercase tracking-wide font-bold text-muted-foreground hover:text-primary"
              >
                Clear all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="bg-primary px-4 py-2 text-primary-foreground font-bold uppercase text-sm tracking-wide"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}