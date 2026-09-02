# 🏛️ Sports Federation — The Monastic Congregation & Supreme Golden Bull

[![Supreme Golden Test](https://github.com/traali/sports-federation/actions/workflows/supreme-golden-test.yml/badge.svg)](https://github.com/traali/sports-federation/actions/workflows/supreme-golden-test.yml)
[![Ecosystem](https://img.shields.io/badge/monasteries-6%20sovereign%20repos-emerald.svg)](https://github.com/traali/sports-federation)
[![Cloudflare Pages](https://img.shields.io/badge/edge-cloudflare%20pages-orange.svg)](https://pelipaiva.pages.dev)

## 1. Problem
Finnish youth sports families face weekend scheduling chaos with multiple children competing across different federations (Palloliitto football, SSBL salibandy, Basket.fi basketball, lentopallo). In a single monolith codebase, conflicting data schemas and bloated LLM context windows lead to AI hallucinations and fragile codebases.

## 2. Solution
**The Monastic Multi-Repo Federation** splits the ecosystem into 6 sovereign repositories (monasteries). Each monastery maintains minimal context (< 1,500 word `AGENTS.md`) and passes a local clean-room gate (`npm run visit`). The central **Supreme Golden End-User Test Suite** (*Abbas Primas*) acts as the neutral outside arbiter validating treaties and simulating a real Finnish family matchday from start to finish.

---

## 3. Sovereign Monasteries & Live Deployments

| Sovereign Monastery | GitHub Repository | Live Cloudflare Pages App | Focus Area |
| :--- | :--- | :--- | :--- |
| **📱 Pelipäivä** | [`traali/pelipaiva`](https://github.com/traali/pelipaiva) | [`https://pelipaiva.pages.dev`](https://pelipaiva.pages.dev) | Family Sports Hub, Schedule Conflict Engine & Live Toast Streamer |
| **🅿️ ParkkiS** | [`traali/Parkkis`](https://github.com/traali/Parkkis) | [`https://parkkis.pages.dev`](https://parkkis.pages.dev) | Spatial Parking Radar, 165k Fines & Arena Presets |
| **🏑 Floorball Stats** | [`traali/floorball-stats`](https://github.com/traali/floorball-stats) | [`https://floorball-stats.pages.dev`](https://floorball-stats.pages.dev) | SSBL Salibandy Torneopal Center, YV%/AV% & 3-Period Timeline |
| **🏀 Basketball Stats** | [`traali/basketball-stats`](https://github.com/traali/basketball-stats) | [`https://basketball-stats-byu.pages.dev`](https://basketball-stats-byu.pages.dev) | Koripalloliitto / Basket.fi Hub, 4 Quarters & Team Fouls |
| **⚽ Football Stats** | [`traali/football-stats`](https://github.com/traali/football-stats) | [`https://football-stats-agk.pages.dev`](https://football-stats-agk.pages.dev) | Palloliitto Football Center, Head-to-Head & Form Radar |
| **🏐 Volleyball Stats** | [`traali/volleyball-stats`](https://github.com/traali/volleyball-stats) | [`https://volleyball-stats-7xq.pages.dev`](https://volleyball-stats-7xq.pages.dev) | Torneopal Lentopallo, 25-Point Set Momentum Tracker |

---

## 4. The 8-Step Supreme Golden Journey

The golden test executes the full real-world Saturday simulation:
1. **URL Ingestion:** Torneopal SSBL (`25301`), Palloliitto (`185085`), Basket.fi (`38753`).
2. **Conflict Warning:** Overlap detection between Otahalli & Töölö with 20 min driving transit buffers.
3. **ParkkiS Spatial Routing:** Otahalli (Free 4h disc, 120m walk) vs Töölö (Zone 2 payment, 180m walk).
4. **Floorball 3-Period Analytics:** Indians 15–3 win at Otahalli with YV%/AV% radar and goalie saves.
5. **Football H2H Radar:** Night Captain power bars, form breakdown, and card history.
6. **Basketball 4-Quarter Scoring:** Q1-Q4 breakdown, team foul bonus threshold, and top scorers.
7. **Post-Match Report:** 1-tap WhatsApp copy format.
8. **Autonomous AI Discovery:** Browser tools exposed in `document.modelContext`.

---

## 5. Quick Start

```bash
# Clone the federation canons
git clone https://github.com/traali/sports-federation.git
cd sports-federation

# Verify canonical interface contracts across all 6 repos
npm run test:contracts

# Execute the Supreme Golden End-User Test Suite
npm run test:golden
```

---

## 6. Attribution

Built with the **Antigravity AI Agent Protocol** by **[traali](https://github.com/traali)**.
