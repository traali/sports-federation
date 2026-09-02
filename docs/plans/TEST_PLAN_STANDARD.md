# 📐 Test Plan Standard & Specification Contract

**Version:** 1.0.0  
**Status:** Canonical Requirement across All Monasteries & Plans

Every implementation plan, feature spec, and Golden Test step in the Sports Federation ecosystem **MUST** explicitly define the following 5 dimensions:

---

## The Mandatory 5-Point Test Plan Specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE 5-POINT TEST SPECIFICATION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. 👤 USER JOURNEY        The human story: who does what, when, and where.   │
│ 2. 🎯 REASON IT EXISTS    The concrete pain point, risk, or job-to-be-done. │
│ 3. 🧪 WHAT IT TESTS       The exact contracts, APIs, schemas, and UI state. │
│ 4. 🟢 WHEN IT SUCCEEDS    The clear, unambiguous pass condition.            │
│ 5. 🔴 WHEN IT SHOULD FAIL The exact anomalies, errors, and drift triggers.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Specification Matrix for the Supreme Golden Suite

#### Step 1: Multi-Sport Team Ingestion
* **👤 User Journey:** A parent pastes 3 URLs (SSBL Salibandy, Palloliitto Football, Basket.fi Basketball) into Pelipäivä to set up their family matchday calendar for the upcoming weekend.
* **🎯 Reason Why It Exists:** Parents cannot spend Friday night manually re-typing team schedules from 3 completely different association websites.
* **🧪 What It Tests:** Torneopal API scrapers/fetchers across SSBL (`25301`), Palloliitto (`185085`), and Basket.fi (`38753`) mapping into `MatchdayContextContract`.
* **🟢 When It Succeeds:** All 3 team schedules are ingested, producing non-empty match lists with validated team names, start times, and venue names.
* **🔴 When It Should Fail:** If any association API key is expired (HTTP 401/403), if team ID is missing, or if any ingested match lacks valid ISO `startTime` or `venue`.

---

#### Step 2: Sibling Schedule Conflict & Transit Buffer Engine
* **👤 User Journey:** On Saturday morning, the parent opens Pelipäivä. Tuomas has a game at Otahalli at 15:00 and Aino has a game at Töölön Pallokenttä at 15:30. The app warns: *"⚠️ Tarvitaan kaksi kuskia!"*
* **🎯 Reason Why It Exists:** Prevents the nightmare scenario of a parent realizing too late that two siblings are playing in different cities at the same time with only one car.
* **🧪 What It Tests:** Temporal collision detection with same-day calendar boundary checks, Finland coordinate boundaries (lat 50-70, lng 15-35), and 20 min driving transit buffers.
* **🟢 When It Succeeds:** Correctly flags the overlap, calculates driving transit buffer (15–30 min), and emits severity `'conflict'`.
* **🔴 When It Should Fail:** 
  * If driving buffer is 0 for distant venues (missing transit calculation).
  * If distance explodes to Null Island (e.g. 14,758 min driving buffer for unknown venues).
  * If games on different calendar days trigger false-positive collisions.

---

#### Step 3: Spatial Parking & Walking Gate Guidance (ParkkiS)
* **👤 User Journey:** The family drives to Otahalli (or Töölö). The parent taps the parking badge to know: *Where do I park? Do I need a parking disc? How far is the walk to the arena gate?*
* **🎯 Reason Why It Exists:** Avoids getting an €80 parking fine or arriving late because the family parked at the wrong entrance with young kids carrying heavy gear bags.
* **🧪 What It Tests:** `ParkingRiskContract` integration, arena presets (Otahalli 4h disc on Luolamiehentie vs Töölö Zone 2 payment on Urheilukatu), and walking distance meters.
* **🟢 When It Succeeds:** Returns accurate risk index (1–10), disc requirement time rules, nearest parking lot name, and walking duration under 5 minutes.
* **🔴 When It Should Fail:**
  * If risk score is outside the 1–10 boundary.
  * If fee zone or disc requirements are empty/undefined.
  * If walking distance exceeds 1,500m for a designated arena parking lot.

---

#### Step 4: Floorball 3-Period Analytics & Special Teams (SSBL)
* **👤 User Journey:** Grandma and relatives follow Tuomas's salibandy match remotely or inspect the post-game stats in Pelipäivä to see the 3-period scoring flow (15–3) and who was in goal.
* **🎯 Reason Why It Exists:** Standard sports apps only show final scores; junior sports families care about period momentum, powerplay execution (YV/AV), and goalie save percentages.
* **🧪 What It Tests:** `FloorballStatsContract` fulfilling 3 discrete period score tuples (`[Score, Score, Score]`), goalie save percentage calculation, and powerplay efficiency.
* **🟢 When It Succeeds:** Sum of 3 period scores strictly matches final score (15–3), goalie save % is between 0–100%, and powerplay radar renders correctly.
* **🔴 When It Should Fail:**
  * If periods array does not have exactly 3 periods.
  * If sum of period scores does not equal final score.
  * If goalie save percentage is `NaN` or negative.

---

#### Step 5: Football Head-to-Head & Form Radar (Night Captain)
* **👤 User Journey:** Before Aino's football match against KäPa, the coach and parents check the opponent's recent 5-game form (W-W-D-W-L), past head-to-head records, and referee card history.
* **🎯 Reason Why It Exists:** Gives junior players and parents tactical excitement and context before kickoff.
* **🧪 What It Tests:** `FootballStatsContract` fulfilling `recentForm` array, `headToHeadSummary` played/won/lost/drawn counts, and card statistics.
* **🟢 When It Succeeds:** Returns valid form letters (`W`, `D`, `L`), win percentages between 0–100%, and power comparison bar totals summing to 100%.
* **🔴 When It Should Fail:**
  * If `recentForm` contains invalid characters.
  * If `headToHeadSummary.played !== (homeWins + awayWins + draws)`.
  * If comparison bars divide by zero.

---

#### Step 6: Basketball 4-Quarter Scoring & Foul Bonus Tracker (Basket.fi)
* **👤 User Journey:** During Eero's basketball match, parents track the score across 4 quarters and monitor when the team reaches 5 team fouls in a quarter (triggering bonus free throws).
* **🎯 Reason Why It Exists:** Basketball has unique 4-quarter scoring and crucial team foul bonus rules governed by Koripalloliitto.
* **🧪 What It Tests:** `BasketballStatsContract` fulfilling `quarters: [Q1, Q2, Q3, Q4]`, team foul counters, and top scorer leaderboard points.
* **🟢 When It Succeeds:** Exactly 4 quarters reported, quarter score sums equal total points (68:62), and team foul bonus flag triggers on 5th foul.
* **🔴 When It Should Fail:**
  * If quarters array length is not 4.
  * If quarter score sums mismatch final score.
  * If team fouls exceed allowable game limits without bonus flag set.

---

#### Step 7: 1-Tap Post-Match WhatsApp Share Report
* **👤 User Journey:** Immediately after the final buzzer, the team manager taps *"Kopioi WhatsApp-raportti"* and pastes the match summary directly into the team parent WhatsApp group.
* **🎯 Reason Why It Exists:** Team managers spend 10 minutes typing out match results, goal scorers, and stats; 1-tap sharing solves this instantly.
* **🧪 What It Tests:** String template formatting with emojis, period breakdown, goal scorers with assists, and goalie save percentage.
* **🟢 When It Succeeds:** Produces non-empty formatted message containing team names, final score, period scores, scorer list, and goalie saves.
* **🔴 When It Should Fail:**
  * If output string is empty or contains `undefined`/`NaN`.
  * If match score or team names are missing from the message header.

---

#### Step 8: Autonomous WebMCP Tool Discovery & Live Production Edge
* **👤 User Journey:** An AI browser agent (or family copilot) opens Pelipäivä to help the parent plan transit, parking, and match timing without manual clicking.
* **🎯 Reason Why It Exists:** Enables next-generation autonomous AI agents to interact with sports data with zero screen scraping and complete offline privacy.
* **🧪 What It Tests:** `document.modelContext` tool registry (`get_matchday_schedule`, `check_parking_risk`, `get_family_profiles`), live Cloudflare HTTP 200 health, and SPA deep routing across all 6 production satellites.
* **🟢 When It Succeeds:** All 6 production domains return HTTP 200, WebMCP tools execute in < 1ms, and all `ui://` MCP App widgets load valid HTML.
* **🔴 When It Should Fail:**
  * If any production domain returns HTTP 404/500.
  * If `document.modelContext` fails to register tools.
  * If satellite headers send `X-Frame-Options: DENY` blocking iframe drawers.
