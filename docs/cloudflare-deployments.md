# Cloudflare Pages Edge Deployment & Domain Matrix

**Ecosystem:** The Monastic Multi-Repo Federation (7 Repositories + kattorepo)
**Status:** GitHub HEAD current; production aliases lag — see `docs/GAPS.md`
**Account:** `Arto.oinonen@gmail.com` (`5a01b546bdf7de66a7ff19c5117911c7`)

---

## 1. Verified Production Domains Matrix

| Sovereign Monastery | Cloudflare Pages Production URL | Prod vs HEAD (2026-09-12 12:00 CEST) | CD workflow |
| :--- | :--- | :--- | :--- |
| **`pelipaiva`** | [https://pelipaiva.pages.dev](https://pelipaiva.pages.dev) | stale (`47bf621` vs `0c5bef51`); token 10000 | `.github/workflows/cd.yml` (exists, red) |
| **`Parkkis`** | [https://parkkis.pages.dev](https://parkkis.pages.dev) | stale (`7cc3799` vs `7ce48884`); live title still `web` | added (project `parkkis`) |
| **`floorball-stats`** | [https://floorball-stats.pages.dev](https://floorball-stats.pages.dev) | stale (`b160885` vs `eb6bf990`) | added |
| **`basketball-stats`**| [https://basketball-stats-byu.pages.dev](https://basketball-stats-byu.pages.dev) | stale (`b2a7ea9` vs `b4c10eed`) | added (project `basketball-stats-byu`) |
| **`football-stats`** | [https://football-stats-agk.pages.dev](https://football-stats-agk.pages.dev) | stale (`ceb7840` vs `7cf7a1a8`) | added (project `football-stats-agk`) |
| **`volleyball-stats`**| [https://volleyball-stats-7xq.pages.dev](https://volleyball-stats-7xq.pages.dev) | stale (`3fe3b78` vs `582a9c17`) | added (project `volleyball-stats-7xq`) |
| **`weather-stats`** | *not created* | NXDOMAIN | added (project `weather-stats` — create the Pages project first) |

Each satellite CD job **skips** when `CLOUDFLARE_API_TOKEN` is unset. Pelipäivä is the only remote that currently has the secret, and that secret is rejected by the API (G1/G13).

Redeploy is a **house** task (Cellarer). Do not fix satellite Pages deploys from this kattorepo.

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
