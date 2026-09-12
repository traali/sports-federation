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
4. Played `getMatch` responses are immutable in Cache API (`X-Taso-Cache: store-played`).
5. Clients: proxy → origin → origin+`_cb`. Do not depend on the proxy being up.

## Cellarer
```
cd workers/taso-proxy
npx wrangler deploy
```
Needs `CLOUDFLARE_API_TOKEN` with Workers:Edit. Pages token alone is not enough.
