# Federation Gap Ledger — 2026-09-12 visitation (remeasure 12:00 CEST)

Living list. Each row is owned by **one** monastery using [ISSUE_DIVISION.md](https://github.com/traali/monastic-governance/blob/main/docs/ISSUE_DIVISION.md).
Parent chapter: https://github.com/traali/sports-federation/issues/1

GitHub HEADs are current (git-guard vendored + CD workflows + ParkkiS title). **Cloudflare production is not.** The Cellarer token on `pelipaiva` fails Pages *and* Workers (`Authentication error [code: 10000]` on [run 34686181011](https://github.com/traali/pelipaiva/actions/runs/34686181011)). Satellites now have `.github/workflows/cd.yml` that no-ops until `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` exist on that remote.

## Production freshness (live `__APP_BUILD_INFO__` vs GitHub HEAD)

| Monastery | Live URL | Prod commit / buildTime | HEAD | Delta | Issue |
|---|---|---|---|---|---|
| pelipaiva | https://pelipaiva.pages.dev | `47bf621` 2026-09-10T04:49 | `0c5bef51` | stale ~2d; CD red (token) | [pelipaiva#3](https://github.com/traali/pelipaiva/issues/3) |
| football-stats | https://football-stats-agk.pages.dev | `ceb7840` 2026-09-12T08:06 | `7cf7a1a8` | stale (drawer guard + CD yaml) | [football-stats#1](https://github.com/traali/football-stats/issues/1) |
| floorball-stats | https://floorball-stats.pages.dev | `b160885` 2026-09-02T18:30 | `eb6bf990` | stale 10d (pre multi-page nav) | [floorball-stats#1](https://github.com/traali/floorball-stats/issues/1) |
| basketball-stats | https://basketball-stats-byu.pages.dev | `b2a7ea9` 2026-09-10T04:35 | `b4c10eed` | stale (upcoming vs 0-0) | [basketball-stats#1](https://github.com/traali/basketball-stats/issues/1) |
| volleyball-stats | https://volleyball-stats-7xq.pages.dev | `3fe3b78` 2026-09-02T18:31 | `582a9c17` | stale 7d (pre WebMCP) | [volleyball-stats#1](https://github.com/traali/volleyball-stats/issues/1) |
| Parkkis | https://parkkis.pages.dev | `7cc3799` 2026-09-02T18:29 title=`web` | `7ce48884` | stale 7d; title fix is on HEAD | [Parkkis#18](https://github.com/traali/Parkkis/issues/18) |
| weather-stats | *NXDOMAIN* | — | `1694f1a7` | no Pages project | [weather-stats#1](https://github.com/traali/weather-stats/issues/1) |

## Open work items (one issue per house)

| ID | Class | Monastery | Office | Severity | Gap | Status |
|---|---|---|---|---|---|---|
| G1 | house | pelipaiva | Cellarer | blocking | Recreate CF token with **Pages:Edit and Workers Scripts:Edit**. Pages job also 10000, not only Worker. | open #3 |
| G2 | house | weather-stats | Sacrist | advisory | Visit-gate SLA flakes patched on main. | done on HEAD |
| G3 | house | weather-stats | Cellarer | blocking | Create Pages project `weather-stats` + secrets + CD. CD yaml now on main. | open #1 |
| G4 | house | football-stats | Cellarer | blocking | Redeploy Pages. CD yaml on main; needs house secrets. | open #1 |
| G5 | house | floorball-stats | Cellarer | blocking | Redeploy Pages. CD yaml on main; needs house secrets. | open #1 |
| G6 | house | basketball-stats | Master of Works | blocking | Redeploy Pages. CD yaml on main; needs house secrets. | open #1 |
| G7 | house | volleyball-stats | Cellarer | blocking | Redeploy Pages. CD yaml on main; needs house secrets. | open #1 |
| G8 | house | Parkkis | Cellarer | blocking | Title fixed on HEAD. Redeploy Pages. Dependabot PR #14 still open. | open #18 |
| G9 | house | monastic-governance | Sacrist | done | Visit CI lockfile. | closed by commit |
| G10 | congregation | sports-federation | Abbas Primas | advisory | Runner now resolves sibling *or* nested checkouts; missing houses SKIP. | this commit |
| G11 | treaty | sports-federation | Legate | done | `SupportedSport` union now includes `weather`. | this commit |
| G12 | house | all satellites | Cellarer | done | Lefthook git-guard vendored per remote. | done 09:32Z |
| G13 | house | pelipaiva | Cellarer | blocking | Same token cannot deploy Pages. Unblocks G1 and is the federation prod gate. | open #3 |

## How issues are divided

Canon: [ISSUE_DIVISION.md](https://github.com/traali/monastic-governance/blob/main/docs/ISSUE_DIVISION.md)

| Class | File in | Default office |
|---|---|---|
| `house` | the monastery whose code/CD/UI is wrong | Cellarer / Works / Sacrist |
| `RULE` | that monastery's `AGENTS.md`, or `monastic-governance` if the template is wrong | Archon |
| `treaty` | `sports-federation` `contracts/` | Legate |
| `congregation` | `sports-federation` | Abbas Primas |

Never file a house bug in the kattorepo because it is easier. One congregation parent (#1); one house child per remote.

## Unblock prod (single Cellarer action)

1. Cloudflare dashboard → API tokens → create token with **Account.Cloudflare Pages:Edit** and **Account.Workers Scripts:Edit** on account `5a01b546bdf7de66a7ff19c5117911c7`.
2. Set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` on **each** of: pelipaiva, Parkkis, football-stats, floorball-stats, basketball-stats, volleyball-stats, weather-stats.
3. Create Pages project `weather-stats` (G3) before that house's first deploy.
4. `workflow_dispatch` (or push) `.github/workflows/cd.yml` on each house.
5. Confirm live `__APP_BUILD_INFO__.commit` equals HEAD; then close the house issue and this parent.

Division rule: file the GitHub issue in the owning monastery. This ledger only points.
