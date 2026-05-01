export function encodeArticleId(url: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(url).toString("base64url");
  }
  return btoa(url).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeArticleId(id: string): string {
  const padded = id.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  return atob(padded + "===".slice((padded.length + 3) % 4));
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'><rect width='800' height='450' fill='%231d3557'/><text x='400' y='225' text-anchor='middle' fill='white' font-family='Arial' font-size='48' font-weight='900'>NEWS POINT</text></svg>";

export const CATEGORIES = [
  { slug: "general", name: "Top" },
  { slug: "business", name: "Business" },
  { slug: "technology", name: "Technology" },
  { slug: "sports", name: "Sports" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "health", name: "Health" },
  { slug: "science", name: "Science" },
] as const;

/* ---------- Regions ---------- */

export const COUNTRIES = [
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "za", name: "South Africa", flag: "🇿🇦" },
] as const;

export const INDIAN_STATES = [
  "All India",
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Jammu and Kashmir", "Ladakh",
  "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
] as const;

/* ---------- Local storage keys ---------- */
const LS = {
  region: "np:region",
  state: "np:in-state",
  theme: "np:theme",
  ticker: "np:ticker-interval",
  bookmarks: "np:bookmarks",
  filters: "np:filters",
  reader: "np:reader-mode",
} as const;

export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const STORAGE_KEYS = LS;

/* ---------- Bookmarks ---------- */
export interface Bookmark {
  url: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  source: string;
  publishedAt: string;
  savedAt: string;
}
export function getBookmarks(): Bookmark[] {
  return lsGet<Bookmark[]>(LS.bookmarks, []);
}
export function isBookmarked(url: string): boolean {
  return getBookmarks().some((b) => b.url === url);
}
export function toggleBookmark(b: Omit<Bookmark, "savedAt">): boolean {
  const list = getBookmarks();
  const existing = list.findIndex((x) => x.url === b.url);
  if (existing >= 0) {
    list.splice(existing, 1);
    lsSet(LS.bookmarks, list);
    window.dispatchEvent(new Event("np:bookmarks"));
    return false;
  }
  list.unshift({ ...b, savedAt: new Date().toISOString() });
  lsSet(LS.bookmarks, list);
  window.dispatchEvent(new Event("np:bookmarks"));
  return true;
}

/* ---------- Content filters ---------- */
export interface FilterPrefs {
  blockedKeywords: string[];
  blockedCategories: string[];
}
export function getFilters(): FilterPrefs {
  return lsGet<FilterPrefs>(LS.filters, { blockedKeywords: [], blockedCategories: [] });
}
export function setFilters(f: FilterPrefs) {
  lsSet(LS.filters, f);
  window.dispatchEvent(new Event("np:filters"));
}
export function applyFilters<T extends { title: string; description: string | null; source: { name: string } }>(
  list: T[],
  filters: FilterPrefs,
): T[] {
  if (!filters.blockedKeywords.length) return list;
  const kws = filters.blockedKeywords.map((k) => k.toLowerCase());
  return list.filter((a) => {
    const blob = `${a.title} ${a.description ?? ""} ${a.source.name}`.toLowerCase();
    return !kws.some((k) => k && blob.includes(k));
  });
}

/* ---------- Reading time ---------- */
export function readingTime(text: string | null | undefined): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}