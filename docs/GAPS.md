# Federation Gap Ledger — 2026-09-12 visitation

Living list. Each row is owned by **one** monastery using [ISSUE_DIVISION.md](https://github.com/traali/monastic-governance/blob/main/docs/ISSUE_DIVISION.md).
Measured against `HEAD` on GitHub vs live Cloudflare Pages `__APP_BUILD_INFO__.commit` at 2026-09-12 11:20 CEST.

## Production freshness

| Monastery | Live URL | Prod commit / buildTime | HEAD (product) | Delta | Class / office |
|---|---|---|---|---|---|
| pelipaiva | https://pelipaiva.pages.dev | `47bf621` 2026-09-10T04:49 | `d4d7d528` then CD fix `60230ac` | stale ~2d (CD was preview branch) | house / Cellarer |
| football-stats | https://football-stats-agk.pages.dev | `ceb7840` 2026-09-12T08:06 | `cbfa4dde` drawer guard | stale 1 product commit | house / Cellarer |
| floorball-stats | https://floorball-stats.pages.dev | `b160885` 2026-09-02T18:30 | `12db6364` multi-page nav | stale 10d | house / Cellarer |
| basketball-stats | https://basketball-stats-byu.pages.dev | `b2a7ea9` 2026-09-10T04:35 | `53415c8a` upcoming vs 0-0 | stale 1 product commit | house / Master of Works |
| volleyball-stats | https://volleyball-stats-7xq.pages.dev | `3fe3b78` 2026-09-02T18:31 | `dc8cfb27` WebMCP | stale 7d | house / Cellarer |
| Parkkis | https://parkkis.pages.dev | `7cc3799` 2026-09-02T18:29 | `86d442fe` sovereign checks | stale 7d | house / Cellarer |
| weather-stats | no Pages project (NXDOMAIN) | — | visit-gate fixes on main | not in prod | house / Cellarer |

## Open work items (one issue per house)

| ID | Class | Monastery | Office | Severity | Gap |
|---|---|---|---|---|---|
| G1 | house | pelipaiva | Cellarer | blocking | Worker token needs Workers Scripts:Edit (API 10000/10502). Pages CD now deploys production alias. |
| G2 | house | weather-stats | Sacrist | blocking | Visit gate was red (SLA wall-clock + burst hitting live FMI). Patched this chapter. |
| G3 | house | weather-stats | Cellarer | blocking | Create Cloudflare Pages project `weather-stats` and wire CD. |
| G4 | house | football-stats | Cellarer | blocking | Redeploy Pages so drawer getter guard is live. |
| G5 | house | floorball-stats | Cellarer | blocking | Redeploy Pages so multi-page nav is live. |
| G6 | house | basketball-stats | Master of Works | blocking | Redeploy Pages so upcoming-match status is live. |
| G7 | house | volleyball-stats | Cellarer | blocking | Redeploy Pages so WebMCP is live. |
| G8 | house | Parkkis | Cellarer | blocking | Redeploy Pages. Document title is still `web`. Dependabot PR #14. |
| G9 | house | monastic-governance | Sacrist | blocking | Visit CI required package-lock.json. Fixed this chapter. |
| G10 | congregation | sports-federation | Abbas Primas | advisory | Federation runners still assume sibling directories. |
| G11 | treaty | sports-federation | Legate | advisory | SupportedSport omits weather. |
| G12 | house | all satellites | Cellarer | blocking | Lefthook `../scripts/git-guard.mjs` monorepo leftover. Paths fixed; vendor git-guard.mjs next. |

Division rule: file the GitHub issue in the owning monastery. This ledger only points.
