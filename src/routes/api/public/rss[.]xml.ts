import { createFileRoute } from "@tanstack/react-router";
import { getRequestHost } from "@tanstack/react-start/server";
import { getTopHeadlines } from "../../../server/news.functions";
import { encodeArticleId } from "../../../components/news/utils";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/api/public/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const host = getRequestHost();
        const base = `${proto}://${host}`;
        const url = new URL(request.url);
        const country = url.searchParams.get("country") ?? "us";
        const data = await getTopHeadlines({ data: { country, pageSize: 30 } });

        const items = (data.articles ?? []).map((a) => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(`${base}/article/${encodeArticleId(a.url)}`)}</link>
      <guid isPermaLink="false">${esc(a.url)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <source>${esc(a.source.name)}</source>
      <description><![CDATA[${a.description ?? ""}]]></description>
    </item>`).join("");

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NEWS POINT — Live Breaking News</title>
    <link>${base}</link>
    <description>Real-time breaking news from around the world.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});