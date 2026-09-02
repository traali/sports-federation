# GLOBAL_ROLL.md — The Multi-Repository Federated Chronicle
Append-only chronicle of cross-repository architectural decisions, contract versions, and dispensations.

---

## 2026-09-02 — Federated Monastic Foundation & Shared Contracts v1.0.0
- **Office / Author:** Archon & Legate
- **Scope:** `pelipaiva`, `football-stats`, `Parkkis`, `volleyball-stats`
- **Verdict:** PASS
- **Summary:** Established canonical contracts v1.0.0 (`MatchdayContextContract`, `ParkingRiskContract`, `SportStatsContract`, `CrossRepoQueryContract`) with non-breaking evolution rules (all new fields optional, no mutating existing fields). Standardized Monastic Governance with automated pre-visitation contract validation gates across all 4 repositories.

## 2026-09-02 — Pelipäivä UI Integration & WebMCP Registration (Step 3 & 4)
- **Office / Author:** Master of Works & Prior (Pelipäivä)
- **Scope:** `pelipaiva`
- **Contract Impact:** None (Consumes `CrossRepoQueryContract`, `ParkingRiskContract`, `SportStatsContract` v1.0.0)
- **Summary:** Added `SatelliteEmbedDrawer` for non-blocking slide-over previews of Parkkis and Football/Volleyball Stats. Registered WebMCP browser tools (`get_matchday_schedule`, `check_parking_risk`, `get_family_profiles`) in `document.modelContext` on PWA startup. All 509 tests green.

## 2026-09-02 — Interactive MCP Apps UI Layer in Satellites (Option 1)
- **Office / Author:** Master of Works & Cellarer (Parkkis, Football-Stats)
- **Scope:** `Parkkis`, `football-stats`
- **Contract Impact:** None (Satisfies `ParkingRiskContract` & `SportStatsContract` v1.0.0)
- **Summary:** Added `@modelcontextprotocol/ext-apps` tools and standalone widgets (`ui://parkkis/maplet` and `ui://football/h2h-card`). Verified 100% pre-visitation pass across both monasteries with zero modifications to existing human web UIs.

## 2026-09-02 — Multi-Repo Ecosystem Clean-Room Visitation & CI Gating
- **Office / Author:** The Clean-Room Visitor
- **Scope:** `pelipaiva`, `football-stats`, `Parkkis`, `volleyball-stats`, `contracts/`
- **Contract Impact:** None (Canonical v1.0.0 contracts verified 100%)
- **Verdict:** **PASS** (Zero Blockers, Zero Regressions, Zero Leaks)
- **Summary:** Completed full monastic cycle across all 4 repositories:
  1. Automated GitHub Actions pre-visitation gates configured in `.github/workflows/monastic-visit.yml`.
  2. Volleyball stats MCP App (`ui://volleyball/sets`) and contracts initialized.
  3. Pre-visitation checks passed across all 4 repositories (0 lint errors, 555+ tests green).
  4. Git commits structured and conventional across all repositories.

## 2026-09-02 — Floorball Stats Monastery Inception & SSBL Torneopal Integration
- **Office / Author:** Legate & Master of Works (Floorball-Stats)
- **Scope:** `floorball-stats`, `contracts/`, `pelipaiva`
- **Contract Impact:** None (Satisfies `SportStatsContract` v1.0.0 with `sport: 'floorball'`)
- **Verdict:** **PASS** (Cloud GitHub Actions CI green in 30s)
- **Summary:** Established the 5th monastery (`floorball-stats`):
  1. Reverse-engineered and integrated live SSBL Torneopal API for matches (e.g. `913481`, 3-period timeline, goals, 2min penalties) and teams (e.g. `25301`).
  2. Built `@modelcontextprotocol/ext-apps` MCP App widget (`ui://floorball/match-card`).
  3. Initialized standalone React 19 app with dual-mode `?embed=true` support.
  4. Created GitHub remote `traali/floorball-stats` and verified deterministic CI gate pass.

## 2026-09-02 — The General Chapter: Tri-Monastery Evolution (Options 1, 2, and 3)
- **Office / Author:** The General Chapter (Pelipäivä, ParkkiS, Floorball-Stats)
- **Scope:** `pelipaiva`, `Parkkis`, `floorball-stats`
- **Contract Impact:** None (Canonical v1.0.0 contracts verified across all 5 repos)
- **Verdict:** **PASS** (Zero Regressions, 512 tests green)
- **Summary:**
  1. **Chapter Governance Rule Enacted:** The General Chapter shall convene at regular milestone cycles AND on-demand whenever any sovereign monastery requests an RFC.
  2. **Option 1 (Pelipäivä):** Built Multi-Sport Family Conflict & Logistics Engine (`familyConflictEngine.ts`) with schedule overlap detection, driving time buffers, and `ConflictWarningBadge.tsx`.
  3. **Option 2 (ParkkiS):** Curated arena presets added (Otahalli, Väiski, Esport Center, Hakaniemi, Kisakallio) with disc parking rules and walking paths.
  4. **Option 3 (Floorball-Stats):** Implemented Special Teams (YV%/AV%) analytics radar and period-by-period goal momentum flow chart.

## 2026-09-02 — Basketball Stats Monastery Inception & The Supreme Golden Bull
- **Office / Author:** Abbas Primas & The General Chapter
- **Scope:** `basketball-stats`, `pelipaiva`, `contracts/`
- **Contract Impact:** None (Satisfies `SportStatsContract` v1.0.0 with `sport: 'basketball'`)
- **Verdict:** **PASS** (Supreme Golden Test 8/8 Steps 100% Green)
- **Summary:**
  1. Established the 6th monastery (`basketball-stats`) for Koripalloliitto / Basket.fi Torneopal integration (`df8e84j9xtdz269euy3h`), 4-quarter scoring, and team foul bonus tracking.
  2. Built and codified the **Supreme Golden End-User Test Suite** (`scripts/supreme-golden-test.mjs`) simulating real Saturday matchday journeys with diagnostic triage for Code vs. Test changes.
  3. Updated `pelipaiva` with live Basket.fi keys and 5-satellite slide-over drawer navigation.

---

## Format for New Cross-Repo Entries:
```markdown
## YYYY-MM-DD — <Title of Cross-Repo Decision>
- **Office / Author:** Legate / <Author>
- **Scope:** <List of affected repos>
- **Contract Impact:** None | Minor (v1.x non-breaking) | Major (v2.0 breaking with RFC)
- **Summary:** <1-2 sentences on what was agreed and why>
```
