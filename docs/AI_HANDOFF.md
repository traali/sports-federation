# Sports Federation — AI handoff (give this file to an agent)

**Updated:** 2026-09-12  
**Rule:** Do not invent metrics. Use only TASO/SSBL/Basket.fi/Lentopalloliitto fields. If missing → `ei datassa`.

This is the collected brief for all monasteries. Supreme house rules stay in each repo’s `AGENTS.md` (<1 500 words). Youth-sport math is in `docs/plans/*-youth-stats-plan.md`.

---

## 1. Houses

| House | GitHub | Prod | Role |
|---|---|---|---|
| sports-federation | traali/sports-federation | — (kattorepo) | Contracts, golden tests, this file |
| pelipaiva | traali/pelipaiva | Worker `pelipaiva.sakkoja.workers.dev` + Pages `pelipaiva.pages.dev` | Family matchday; merge MyClub/Nimenhuuto × TASO |
| football-stats | traali/football-stats | `football-stats-agk.pages.dev` | SPL / Palloliitto |
| floorball-stats | traali/floorball-stats | `floorball-stats.pages.dev` | SSBL / salibandy |
| basketball-stats | traali/basketball-stats | `basketball-stats-byu.pages.dev` | Basket.fi |
| volleyball-stats | traali/volleyball-stats | `volleyball-stats-7xq.pages.dev` | Lentopalloliitto |
| Parkkis | traali/Parkkis | `parkkis.pages.dev` | Helsinki/Espoo parking |
| weather-stats | traali/weather-stats | **not deployed** | FMI |
| taso-proxy | traali/taso-proxy | `taso-proxy.sakkoja.workers.dev` | Torneopal cache/proxy |

Pages vs Worker: stats SPAs are **Pages** (`dist/`). pelipaiva-edge is **Worker** (KV). taso-proxy is **Worker**.

---

## 2. Merge (pelipaiva)

When MyClub/Nimenhuuto and TASO are joined:

| Field | Source |
|---|---|
| **Ottelu alkaa** (`startTime`) | Torneopal / official fixture |
| **Kokoontuminen** (`warmupTime`) | MyClub/Nimenhuuto if that timestamp is **before** TASO kickoff |
| Title / H vs A | Official names when linked |
| Stats drawer | `#/match/{numericId}` on the sport Pages app |

`applyOfficialKickoffKeepCalendarArrival` in `pelipaiva/src/lib/reconciliation/reconciliationEngine.ts`.

Floorball **turnaus** ICS block (no opponent): same calendar day + same hall → first TASO game.

Tuusulan Salibandyhalli / Kilpailukuja 4 must geocode (not 0,0).

---

## 3. TASO cache (`traali/taso-proxy`)

| State | Cache-Control |
|---|---|
| Live | `no-store` |
| Upcoming (lineups) | `max-age=30` |
| Played | immutable year |
| Roster getTeam/getPlayer | `max-age=60` |

Never cache 4xx. Paths: `/` SPL, `/ssbl/` SSBL, `/basket/`, `/volley/`.

---

## 4. Sport-specific truth (what “good” looks like)

### Football (gold)

- Search teams / series / players. Current season **ongoing first** (syksy 2026 when that is live).
- Player card: ottelut, maalit, varoitukset, 14 vrk. Game boxes V/T/H, **grey DNP**. Newest games first.
- Upcoming: not 0–0 final.
- **AI .md:** `buildMatchPreviewMd` + Match export “Lataa .md”. Prompt forbids invented minutes/standings.

### Floorball (must match football shape, floorball stats)

| Use | Never |
|---|---|
| G + A = P, RM, 3 erää, YV/AV, torjunnat/T% | Football yellows, 14 vrk load, xG, 0–0 as lopputulos on a future game |
| Ennakko + player cards on upcoming | Hardcoded match #8198 |
| Hash routes `#/search` `#/match/:id` `#/player/:id` | `/match/Westend-Yellow` name slugs |
| Syksy 2026 default | Always listing kevät first |

### Basketball

- 4 quarters, team fouls /5, 3P, 2-1-0 table. Upcoming ≠ 0–0 final.
- **Gap:** App still defaults team `etekp2627` / match `1011397` — not full discovery like football.

### Volleyball

- Sets to 25 (5th to 15), set quotient.  
- **Gap:** same as basketball — weaker discovery than football/floorball.

### Parkkis / weather

- Parkkis: kiekkopysäköinti, not sport stats.  
- weather-stats: FMI; **Pages project missing**.

---

## 5. AI match markdown (copy into a model)

Each stats house export tab now builds a **coach briefing .md** (same contract as football):

1. Header (date, venue, phase)
2. Table if we have it
3. Rosters / pörssi with **sport-native** counting
4. Events (goals/jäähyt/quarters/sets) or `_ei datassa_`
5. Section **Prompt tekoälylle** — model must use only that document

| House | Builder | Download |
|---|---|---|
| football-stats | `src/utils/buildMatchPreviewMd.ts` | Match page |
| floorball-stats | `src/utils/buildFloorballPreviewMd.ts` | Export tab |
| basketball-stats | `src/utils/buildBasketPreviewMd.ts` | Export tab |
| volleyball-stats | `src/utils/buildVolleyballPreviewMd.ts` | Export tab |

Banned everywhere: xG, GPS, invented lineups, invented %.

---

## 6. Audit 2026-09-12 — is each sport good?

| Check | FB | Floorball | Basket | Volley |
|---|---|---|---|---|
| Search teams/players | yes | yes (needs Pages Retry — bundle was stuck on `DwtwLDEG`) | weak / hardcoded default | weak / hardcoded default |
| Current season first | yes (`resolveActiveSeason`) | yes (Syksy chip) | partial | partial |
| Player card sport-native | ott/maalit/var | GP/G/A/P/RM + DNP | points/3P/fouls | points/roles if payload |
| Upcoming ≠ 0–0 final | yes | yes (date wins over status `0/1`) | quarter card fix on HEAD | sets unplayed |
| TASO via proxy | yes | `/ssbl/` | `/basket/` | `/volley/` |
| AI .md for model | yes | **added** | **added** | **added** |
| Prod = GitHub HEAD | Retry Pages | **Retry required** | Retry | Retry |

**Blocking (human):** Cloudflare Pages → each stats project → **Retry deployment**. Floorball prod was still `index-DwtwLDEG.js` after several GitHub commits.

**Blocking (data):** Pelipäivä S-profile must have **SSBL team URL** attached or the Sunday turnaus card cannot show opponent/TASO kickoff.

---

## 7. Neighbor + visit

Every house: `npm run visit` → `check-neighbors.mjs` (peer AGENTS.md + contract fields + 5-point plans).  
Kattorepo: `npm run check` across monasteries.

Do not drop a `SportStatsContract` field without a major version.

---

## 8. What to tell the next agent (short)

1. Read this file + the house `AGENTS.md` of the repo you touch.  
2. Kickoff = TASO; kokoontuminen = MyClub if earlier.  
3. Live games are never cached.  
4. Floorball cards are G/A/P/RM, not football warnings.  
5. Export `.md` is the payload you paste into a model.  
6. Do not overwrite `traali/floorball-stats` with a new repo.  
7. If UI looks old, the JS filename on Pages is the proof — Retry, don’t rewrite features that already exist on `main`.
