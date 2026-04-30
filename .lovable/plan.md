
# NEWS POINT — Live News Website

A real-time news site that pulls from NewsAPI.org and presents headlines in a bold, urgent, newsroom-inspired UI.

## Visual Direction

- **Palette**: White background, near-black text (#0a0a0a), urgent red accent (#e63946) for "BREAKING" tags, time stamps, and CTAs, deep navy (#1d3557) for headers and section dividers.
- **Typography**: Bold condensed sans-serif for headlines (Anton / Bebas Neue feel), clean sans (Inter) for body — high contrast, newspaper energy.
- **Feel**: High-density grid, ticker bar at the top, big hero image for the lead story, sharp edges, minimal rounding. Animated red "LIVE" pulse on breaking news.

## Pages & Routes

```
/                    Home — breaking ticker, hero lead, latest grid, today's top, category previews
/category/$slug      Category page (politics, technology, sports, business, entertainment, health)
/search              Search results with country + language filters
/article/$id         Full article detail view
/about               About NEWS POINT
```

## Home Page Layout

```text
┌─────────────────────────────────────────────────┐
│ 🔴 LIVE  Breaking news ticker (auto-scroll)     │
├─────────────────────────────────────────────────┤
│  NEWS POINT       Politics Tech Sports … 🔍     │
├─────────────────────────────────────────────────┤
│ ┌──────── HERO LEAD STORY ────────┐ ┌─Top 3──┐ │
│ │  Big image, BREAKING tag,       │ │ side    │ │
│ │  headline, summary, time        │ │ stories │ │
│ └─────────────────────────────────┘ └─────────┘ │
├─────────────────────────────────────────────────┤
│  LATEST NEWS  (3-col card grid, infinite scroll)│
├─────────────────────────────────────────────────┤
│  TODAY'S TOP STORIES (horizontal scroller)      │
├─────────────────────────────────────────────────┤
│  BY CATEGORY — preview row per category         │
└─────────────────────────────────────────────────┘
```

## Features

- **Breaking news ticker** — top-of-page horizontal marquee pulling latest headlines, refreshes every 60s.
- **Live updates** — auto-refetch every 60s in the background; "Updated X seconds ago" indicator.
- **Category browsing** — Politics, Technology, Sports, Business, Entertainment, Health.
- **Search & filters** — keyword search, country filter (US, UK, IN, etc.), language filter.
- **Article detail view** — large image, title, source, published date, full description, "Read full story" link to original publisher.
- **Loading skeletons** — newsroom-feel placeholders, no jarring spinners.
- **Empty/error states** — friendly copy if API fails or no results.
- **Responsive** — mobile uses single-column stack, hamburger nav, swipeable category chips.

## Technical Setup

- **NewsAPI.org key**: stored as a runtime secret (`NEWS_API_KEY`); never exposed to the browser.
- **Server functions** (`createServerFn`) wrap all NewsAPI calls — keeps the key server-side, handles errors, normalizes the response shape.
  - `getTopHeadlines({ category?, country?, q?, page? })` → `/v2/top-headlines`
  - `getEverything({ q, language?, sortBy?, page? })` → `/v2/everything`
- **TanStack Query** caches results (60s stale time) and powers background refetch for the live feel.
- **Article detail**: NewsAPI doesn't provide stable article IDs, so we encode the article URL as a base64 slug for `/article/$id` and cache the article object in Query.
- **Route metadata**: each route gets its own `head()` with title, description, and og tags. Article pages use the article image as og:image.

## What I Need From You

After approval, I'll ask you to provide your **NewsAPI.org API key** so I can wire it up as a secret. You can grab one free at https://newsapi.org/register.

## Out of Scope (for v1)

- User accounts / saved articles
- Comments
- Push notifications
- Newsletter signup (can add later)
