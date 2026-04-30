import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getTopHeadlines } from "../../server/news.functions";
import { encodeArticleId } from "./utils";

export function BreakingTicker() {
  const { data } = useQuery({
    queryKey: ["ticker"],
    queryFn: () => getTopHeadlines({ data: { country: "us", pageSize: 15 } }),
    refetchInterval: 60_000,
  });

  const items = data?.articles ?? [];
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="flex items-stretch overflow-hidden border-b border-border bg-background">
      <div className="flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground flex-shrink-0">
        <span className="h-2 w-2 rounded-full bg-white animate-live-pulse" />
        <span className="font-display text-sm tracking-widest">LIVE</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker gap-8 py-2 pl-8">
          {loop.map((a, i) => (
            <Link
              key={`${a.url}-${i}`}
              to="/article/$id"
              params={{ id: encodeArticleId(a.url) }}
              className="flex items-center gap-2 text-sm whitespace-nowrap hover:text-primary"
            >
              <span className="text-primary font-bold">●</span>
              <span className="font-semibold text-secondary">{a.source.name}:</span>
              <span>{a.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}