import { useEffect, useState } from "react";
import { getFilters, type FilterPrefs } from "./utils";

export function useFilters(): FilterPrefs {
  const [f, setF] = useState<FilterPrefs>({ blockedKeywords: [], blockedCategories: [] });
  useEffect(() => {
    setF(getFilters());
    const onChange = () => setF(getFilters());
    window.addEventListener("np:filters", onChange);
    return () => window.removeEventListener("np:filters", onChange);
  }, []);
  return f;
}