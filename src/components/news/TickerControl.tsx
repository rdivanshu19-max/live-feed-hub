import { useEffect, useState } from "react";
import { Pause, Play, Timer } from "lucide-react";
import { STORAGE_KEYS, lsGet, lsSet } from "./utils";

export type TickerInterval = 30 | 60 | 0; // seconds; 0 = off

export function useTickerInterval(): [TickerInterval, (v: TickerInterval) => void] {
  const [v, setV] = useState<TickerInterval>(60);
  useEffect(() => {
    setV(lsGet<TickerInterval>(STORAGE_KEYS.ticker, 60));
  }, []);
  return [
    v,
    (next: TickerInterval) => {
      setV(next);
      lsSet(STORAGE_KEYS.ticker, next);
      window.dispatchEvent(new Event("np:ticker"));
    },
  ];
}

export function TickerControl() {
  const [interval, setInterval] = useTickerInterval();
  const opts: { v: TickerInterval; label: string }[] = [
    { v: 30, label: "30s" },
    { v: 60, label: "60s" },
    { v: 0, label: "Off" },
  ];
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="uppercase tracking-widest text-muted-foreground font-bold">Refresh</span>
      <div className="inline-flex border border-border overflow-hidden">
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setInterval(o.v)}
            className={`px-2.5 py-1 font-bold uppercase tracking-wide transition-colors ${
              interval === o.v
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            {o.v === 0 ? <Pause className="h-3 w-3 inline" /> : <Play className="h-3 w-3 inline mr-1" />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}