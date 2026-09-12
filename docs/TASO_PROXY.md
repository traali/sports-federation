# Torneopal cache — Cloudflare Worker

Gold worker: `traali/football-stats/workers/taso-proxy`  
Live: `https://taso-proxy.sakkoja.workers.dev`

| Sport | Path prefix | Origin |
|---|---|---|
| Football (SPL) | `/` or `/spl/` | `spl.torneopal.net` |
| Floorball (SSBL) | `/ssbl/` | `salibandy-api.torneopal.net` |
| Basketball | `/basket/` | `koripallo-api.torneopal.net` |
| Volleyball | `/volley/` | `lentopallo-api.torneopal.net` |

## Rules
1. Never return `Cache-Control: max-age` on 4xx. Torneopal's own Cloudflare edge caches empty 403s.
2. On 403 / empty body, retry origin with `_cb=<epoch>` (cache bust).
3. Worker subrequest uses `cf.cacheTtlByStatus["400-599"]=0`.
4. Live matches are **never** cached (`no-store`). Upcoming matches `max-age=30` (lineups). Played matches immutable. Roster 60s.
5. Clients: proxy → origin → origin+`_cb`. Do not depend on the proxy being up.

## Cache by match state

| State | How we know | `Cache-Control` | `X-Taso-Cache` | Client |
|---|---|---|---|---|
| **Live / ongoing** | `Live`, `Started`, `Playing`, clock `12'` | `no-store` | `live` | not stored |
| **Upcoming** | `Fixture` / scheduled (lineups change) | `public, max-age=30` | `upcoming` | 30s memory, no persist |
| **Played** | `Played` / `Finished` | `public, max-age=31536000, immutable` | `store-played` | memory + disk |
| **Roster** | `getTeam` / `getPlayer` / `getGroup` | `public, max-age=60` | `roster` | 60s memory |
| **Catalog** | competitions, seasons, clubs | `max-age=300` | `catalog` | 5 min |

Never put live or upcoming `getMatch` in the Worker Cache API. Cache API hits are served only when `X-Taso-Cache: store-played`.


## Cellarer
```
cd workers/taso-proxy
npx wrangler deploy
```
Needs `CLOUDFLARE_API_TOKEN` with Workers:Edit. Pages token alone is not enough.
