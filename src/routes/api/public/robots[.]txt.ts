import { createFileRoute } from "@tanstack/react-router";
import { getRequestHost } from "@tanstack/react-start/server";

export const Route = createFileRoute("/api/public/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const host = getRequestHost();
        const body = `User-agent: *
Allow: /
Disallow: /bookmarks
Sitemap: ${proto}://${host}/api/public/sitemap.xml
`;
        return new Response(body, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});