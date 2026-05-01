import { createServerFn } from "@tanstack/react-start";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface ExtractedArticle {
  ok: boolean;
  title: string | null;
  byline: string | null;
  content: string | null;   // sanitized HTML
  textContent: string | null;
  excerpt: string | null;
  siteName: string | null;
  length: number | null;
  leadImage: string | null;
  url: string;
  error?: string;
  iframeBlocked?: boolean;  // set when X-Frame-Options/CSP frame-ancestors disallow embedding
}

function pickMeta(doc: Document, sel: string[]): string | null {
  for (const s of sel) {
    const el = doc.querySelector(s) as HTMLMetaElement | null;
    const v = el?.getAttribute("content");
    if (v) return v;
  }
  return null;
}

function sanitizeHtml(html: string, baseUrl: string): string {
  const { document } = parseHTML(`<div id="__r">${html}</div>`);
  const root = document.getElementById("__r");
  if (!root) return html;

  // Strip risky elements
  root.querySelectorAll("script,style,iframe,form,input,button,noscript,link,meta").forEach((el) => el.remove());

  // Resolve relative URLs and strip tracking
  root.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href) {
      try {
        a.setAttribute("href", new URL(href, baseUrl).toString());
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer nofollow");
      } catch {}
    }
  });
  root.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || img.getAttribute("data-src");
    if (src) {
      try { img.setAttribute("src", new URL(src, baseUrl).toString()); } catch {}
    }
    img.removeAttribute("srcset");
    img.setAttribute("loading", "lazy");
    img.setAttribute("referrerpolicy", "no-referrer");
  });

  // Strip inline event handlers
  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
      if (attr.name === "style") el.removeAttribute(attr.name);
    });
  });

  return root.innerHTML;
}

function isFrameBlocked(headers: Headers): boolean {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo === "deny" || xfo === "sameorigin") return true;
  const csp = headers.get("content-security-policy")?.toLowerCase();
  if (csp && /frame-ancestors\s+(?:'none'|'self')/i.test(csp)) return true;
  return false;
}

export const extractArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<ExtractedArticle> => {
    const base: ExtractedArticle = {
      ok: false, title: null, byline: null, content: null, textContent: null,
      excerpt: null, siteName: null, length: null, leadImage: null, url: data.url,
    };
    try {
      // Validate
      const u = new URL(data.url);
      if (!/^https?:$/.test(u.protocol)) return { ...base, error: "Invalid URL" };

      const res = await fetch(u.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NewsPointReader/1.0; +https://newspoint.app)",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      const iframeBlocked = isFrameBlocked(res.headers);
      if (!res.ok) {
        return { ...base, iframeBlocked, error: `Source returned ${res.status}` };
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("html")) {
        return { ...base, iframeBlocked, error: "Source is not HTML" };
      }
      const html = await res.text();
      const { document } = parseHTML(html);

      const leadImage =
        pickMeta(document, ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[name="twitter:image:src"]']);
      const siteName =
        pickMeta(document, ['meta[property="og:site_name"]']) || u.hostname.replace("www.", "");

      const reader = new Readability(document as unknown as Document, {
        charThreshold: 200,
      });
      const parsed = reader.parse();

      if (!parsed) {
        return { ...base, iframeBlocked, leadImage, siteName, error: "Could not extract article body" };
      }
      return {
        ok: true,
        title: parsed.title ?? null,
        byline: parsed.byline ?? null,
        content: parsed.content ? sanitizeHtml(parsed.content, u.toString()) : null,
        textContent: parsed.textContent ?? null,
        excerpt: parsed.excerpt ?? null,
        siteName: parsed.siteName ?? siteName,
        length: parsed.length ?? null,
        leadImage,
        url: data.url,
        iframeBlocked,
      };
    } catch (err) {
      return { ...base, error: err instanceof Error ? err.message : "Extraction failed" };
    }
  });