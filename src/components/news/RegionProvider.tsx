import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { STORAGE_KEYS, lsGet, lsSet } from "./utils";

interface Ctx {
  country: string;          // ISO2, e.g. "in"
  state: string;            // "All India" or specific
  setCountry: (c: string) => void;
  setState: (s: string) => void;
}
const RegionContext = createContext<Ctx | null>(null);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [country, setC] = useState<string>("in");
  const [state, setS] = useState<string>("All India");

  useEffect(() => {
    setC(lsGet<string>(STORAGE_KEYS.region, "in"));
    setS(lsGet<string>(STORAGE_KEYS.state, "All India"));
  }, []);

  const setCountry = useCallback((c: string) => {
    setC(c);
    lsSet(STORAGE_KEYS.region, c);
    if (c !== "in") {
      setS("All India");
      lsSet(STORAGE_KEYS.state, "All India");
    }
  }, []);
  const setState = useCallback((s: string) => {
    setS(s);
    lsSet(STORAGE_KEYS.state, s);
  }, []);

  return (
    <RegionContext.Provider value={{ country, state, setCountry, setState }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): Ctx {
  const ctx = useContext(RegionContext);
  if (!ctx) return { country: "in", state: "All India", setCountry: () => {}, setState: () => {} };
  return ctx;
}