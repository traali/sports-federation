# Cloudflare Pages Edge Deployment & Domain Matrix

**Ecosystem:** The Monastic Multi-Repo Federation (7 Repositories + kattorepo)  
**Status:** Live, but several production aliases lag `HEAD` — see `docs/GAPS.md`  
**Account:** `Arto.oinonen@gmail.com` (`5a01b546bdf7de66a7ff19c5117911c7`)

---

## 1. Verified Production Domains Matrix

| Sovereign Monastery | Cloudflare Pages Production URL | Prod vs HEAD (2026-09-12) | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`pelipaiva`** | [https://pelipaiva.pages.dev](https://pelipaiva.pages.dev) | CD fixed to production alias this chapter | React 19, PWA, Dexie, Tailwind v4 |
| **`Parkkis`** | [https://parkkis.pages.dev](https://parkkis.pages.dev) | stale (`7cc3799` vs `86d442fe`) | MapLibre, DuckDB-WASM, Tailwind |
| **`floorball-stats`** | [https://floorball-stats.pages.dev](https://floorball-stats.pages.dev) | stale (`b160885` vs `12db6364`) | React 19, Vite, SSBL Torneopal |
| **`basketball-stats`**| [https://basketball-stats-byu.pages.dev](https://basketball-stats-byu.pages.dev) | stale (`b2a7ea9` vs `53415c8a`) | React 19, Basket.fi Torneopal |
| **`football-stats`** | [https://football-stats-agk.pages.dev](https://football-stats-agk.pages.dev) | stale (`ceb7840` vs `cbfa4dde`) | React 19, Palloliitto Torneopal |
| **`volleyball-stats`**| [https://volleyball-stats-7xq.pages.dev](https://volleyball-stats-7xq.pages.dev) | stale (`3fe3b78` vs `dc8cfb27`) | React 19, Torneopal Lentopallo |
| **`weather-stats`** | *not created* | NXDOMAIN | FMI WFS, lightning, turf slickness |

Redeploy is a **house** task on each satellite (Cellarer). Pelipäivä is the only remote with `CLOUDFLARE_API_TOKEN` in GitHub Actions. Satellites need the same secret + a `pages deploy` workflow, or a one-shot dashboard publish.

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
