import { createFileRoute } from "@tanstack/react-router";
import { getRequestHost } from "@tanstack/react-start/server";
import { CATEGORIES } from "../../../components/news/utils";

export const Route = createFileRoute("/api/public/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const host = getRequestHost();
        const base = `${proto}://${host}`;
        const lastmod = new Date().toISOString();
        const urls = [
          { loc: `${base}/`, changefreq: "always", priority: "1.0" },
          { loc: `${base}/about`, changefreq: "monthly", priority: "0.4" },
          { loc: `${base}/search`, changefreq: "weekly", priority: "0.5" },
          ...CATEGORIES.map((c) => ({
            loc: `${base}/category/${c.slug}`,
            changefreq: "hourly",
            priority: "0.8",
          })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=600",
          },
        });
      },
    },
  },
});