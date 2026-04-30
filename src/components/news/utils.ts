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