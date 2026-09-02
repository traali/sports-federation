# Cloudflare Pages Edge Deployment & Domain Matrix

**Ecosystem:** The Monastic Multi-Repo Federation (6 Repositories)  
**Status:** 🟢 **100% LIVE & VERIFIED (HTTP 200)**  
**Account:** `Arto.oinonen@gmail.com` (`5a01b546bdf7de66a7ff19c5117911c7`)

---

## 1. Verified Production Domains Matrix

| Sovereign Monastery | Cloudflare Pages Production URL | Status | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`pelipaiva`** | [`https://pelipaiva.pages.dev`](https://pelipaiva.pages.dev) | 🟢 **HTTP 200** | React 19, PWA, Dexie, Tailwind v4 |
| **`Parkkis`** | [`https://parkkis.pages.dev`](https://parkkis.pages.dev) | 🟢 **HTTP 200** | MapLibre, DuckDB-WASM (jsDelivr), Tailwind |
| **`floorball-stats`** | [`https://floorball-stats.pages.dev`](https://floorball-stats.pages.dev) | 🟢 **HTTP 200** | React 19, Vite, Lucide, SSBL Torneopal |
| **`basketball-stats`**| [`https://basketball-stats-byu.pages.dev`](https://basketball-stats-byu.pages.dev) | 🟢 **HTTP 200** | React 19, Basket.fi Torneopal, MCP App |
| **`football-stats`** | [`https://football-stats-agk.pages.dev`](https://football-stats-agk.pages.dev) | 🟢 **HTTP 200** | React 19, Palloliitto Torneopal, H2H |
| **`volleyball-stats`**| [`https://volleyball-stats-7xq.pages.dev`](https://volleyball-stats-7xq.pages.dev) | 🟢 **HTTP 200** | React 19, Torneopal Lentopallo, 25-pt sets |

---

## 2. Cross-Monastery Embedding Security (`_headers`)

All satellite repositories serve the standard `_headers` configuration allowing secure, low-latency iframe embedding inside `pelipaiva.pages.dev`:

```http
/*
  X-Frame-Options: ALLOW-FROM https://pelipaiva.pages.dev
  Content-Security-Policy: frame-ancestors 'self' https://pelipaiva.pages.dev http://localhost:5173 http://localhost:5174 http://localhost:5175 http://localhost:5176 http://localhost:5177 http://localhost:5178;
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=300
```
