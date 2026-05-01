import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getTopHeadlines } from "../../server/news.functions";
import { applyFilters, encodeArticleId } from "./utils";
import { useTickerInterval } from "./TickerControl";
import { useFilters } from "./useFilters";
import { useRegion } from "./RegionProvider";

export function BreakingTicker() {
  const { country } = useRegion();
  const [interval] = useTickerInterval();
  const filters = useFilters();
  const { data } = useQuery({
    queryKey: ["ticker", country],
    queryFn: () => getTopHeadlines({ data: { country, pageSize: 20 } }),
    refetchInterval: interval > 0 ? interval * 1000 : false,
  });

  const items = applyFilters(data?.articles ?? [], filters).slice(0, 15);
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