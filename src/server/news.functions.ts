import { createServerFn } from "@tanstack/react-start";

export interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
  error?: string;
}

const BASE = "https://newsapi.org/v2";

async function callNewsApi(path: string, params: Record<string, string | undefined>): Promise<NewsResponse> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return { status: "error", totalResults: 0, articles: [], error: "NEWS_API_KEY is not configured" };
  }
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, v);
  }
  qs.set("apiKey", apiKey);
  try {
    const res = await fetch(`${BASE}${path}?${qs.toString()}`, {
      headers: { "User-Agent": "NewsPoint/1.0" },
    });
    const data = (await res.json()) as NewsResponse;
    if (!res.ok || data.status !== "ok") {
      return {
        status: "error",
        totalResults: 0,
        articles: [],
        error: data.error || `News API request failed (${res.status})`,
      };
    }
    // Filter out removed/invalid articles
    const articles = (data.articles || []).filter(
      (a) => a && a.title && a.title !== "[Removed]" && a.url
    );
    return { ...data, articles };
  } catch (err) {
    return {
      status: "error",
      totalResults: 0,
      articles: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const getTopHeadlines = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { category?: string; country?: string; q?: string; pageSize?: number; page?: number }) => data,
  )
  .handler(async ({ data }) => {
    return callNewsApi("/top-headlines", {
      category: data.category,
      country: data.country ?? "us",
      q: data.q,
      pageSize: data.pageSize ? String(data.pageSize) : "30",
      page: data.page ? String(data.page) : undefined,
    });
  });

export const searchNews = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { q: string; language?: string; sortBy?: string; pageSize?: number; page?: number }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.q || data.q.trim().length === 0) {
      return { status: "ok", totalResults: 0, articles: [] } as NewsResponse;
    }
    return callNewsApi("/everything", {
      q: data.q,
      language: data.language ?? "en",
      sortBy: data.sortBy ?? "publishedAt",
      pageSize: data.pageSize ? String(data.pageSize) : "30",
      page: data.page ? String(data.page) : undefined,
    });
  });

export const getArticleByUrl = createServerFn({ method: "GET" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    // NewsAPI doesn't have a single-article endpoint; we re-fetch top headlines + search and find by URL.
    const [headlines, searchRes] = await Promise.all([
      callNewsApi("/top-headlines", { country: "us", pageSize: "100" }),
      callNewsApi("/everything", {
        q: new URL(data.url).hostname.replace("www.", "").split(".")[0],
        sortBy: "publishedAt",
        pageSize: "100",
      }).catch(() => null),
    ]);
    const all = [...(headlines.articles || []), ...((searchRes?.articles) || [])];
    const found = all.find((a) => a.url === data.url) ?? null;
    return { article: found };
  });