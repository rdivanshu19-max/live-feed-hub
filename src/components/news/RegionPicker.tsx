import { Globe } from "lucide-react";
import { useRegion } from "./RegionProvider";
import { COUNTRIES, INDIAN_STATES } from "./utils";

export function RegionPicker() {
  const { country, state, setCountry, setState } = useRegion();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        aria-label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="border border-border bg-background px-2 py-1.5 text-xs font-bold uppercase tracking-wide hover:border-primary focus:border-primary outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      {country === "in" && (
        <select
          aria-label="Indian state or city"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-border bg-background px-2 py-1.5 text-xs font-bold uppercase tracking-wide hover:border-primary focus:border-primary outline-none"
        >
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  );
}