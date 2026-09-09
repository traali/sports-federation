# Authentic Youth Football (Jalkapallo) Statistics & Capabilities Plan

**Federation:** Suomen Palloliitto (SPL) / Torneopal Taso  
**Age Groups:** Leikkimaailma (P8–P11), Kaverimaailma (P12–P15), Tulevaisuusmaailma (P16–P20)  
**Zero-Fabrication Mandate:** All metrics must be mathematically derived strictly from authentic Finnish youth match sheets and Torneopal Taso API payloads. No synthetic pro metrics (no xG, no GPS tracking, no shot coordinates).

---

## 1. Ground Truth: Finnish Youth Match Sheet Realities

### 1.1 Age Bracket Distinctions & Kaikki Pelaa Regulations
Suomen Palloliitto enforces distinct rules depending on the developmental age group:

| Age Bracket | Format | Standings Published? | Disciplinary Cards | Flying Substitutions | Key Rule Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Leikkimaailma (P8–P9)** | 5v5 | **No** | No cards (Pelinohjaaja) | Yes (unlimited) | Extra player allowed if trailing by 5+ goals until lead narrows to 2. |
| **Leikkimaailma (P10–P11)** | 8v8 | **Optional/Capped** | No cards | Yes (unlimited) | Goal differential capped at +7 goals in published tables to discourage blowouts. |
| **Kaverimaailma (P12–P13)** | 8v8 | **Yes** (3-1-0 pts) | Yellow / Red active | Rolling subs | Official referees, offside rule active. |
| **Kaverimaailma (P14–P15)** | 11v11 | **Yes** (3-1-0 pts) | Yellow / Red active | Rolling subs | Full pitch, official match reports. |
| **Tulevaisuusmaailma (P16+)**| 11v11 | **Yes** (3-1-0 pts) | Standard IFAB | Limited windows | Full match sheets with minute-by-minute substitutions. |

---

## 2. Federation API (Torneopal SPL) Payload Truth

### 2.1 Available Raw Fields
From `spl.torneopal.net/taso/rest/` endpoints (`getMatches`, `getMatch`, `getTeam`, `getStandings`):

- **Match Header:**
  - `match_id`, `category_id`, `category_name` (e.g. `P12 Kakkonen`)
  - `date`, `time` (kickoff in Europe/Helsinki)
  - `field_name` (e.g. `Töölön pk 2 tn`), `field_id`
  - `home_team_name`, `away_team_name`, `home_team_id`, `away_team_id`
  - `fs_A`, `fs_B` (final score)
  - `p1s_A`, `p1s_B` (half-time score)
  - `status: "0" (not started) | "1" (in progress) | "2" (ended) | "9" (forfeit / luovutus)`
- **Event Log (`events` array):**
  - **Goals (`event_type: "maali"`):**
    - `minute`: minute of goal (1–90)
    - `player_id`, `player_name`
    - `team_id`: scoring team
    - `code: "rp"` (penalty kick) or `"om"` (own goal / oma maali)
  - **Assists (`event_type: "syotto"`):**
    - `connected_event_id`: links directly to the `event_id` of the goal
    - `player_id`, `player_name`
  - **Disciplinary (`event_type: "keltainen"` | `"punainen"`):**
    - `minute`, `player_id`, `reason`
  - **Substitutions (`event_type: "vaihto"`):**
    - `minute`, `player_out_id`, `player_in_id` (present in P13+ regional/national sheets).

---

## 3. Deterministic Derived Metrics (Zero Fabrication)

### 3.1 Team-Level Analytics
1. **Half-Time Performance Splits:**
   - 1st Half Goal Differential ($GD_1 = p1s_A - p1s_B$)
   - 2nd Half Goal Differential ($GD_2 = (fs_A - p1s_A) - (fs_B - p1s_B)$)
   - *Actionable Insight for Coaches:* Identifies whether the team struggles in early warmup or drops stamina/concentration in the second half.
2. **Clean Sheet Ratio (Nollapelit):**
   - Clean Sheets Count / Total Matches Played.
3. **Comeback & Lead Retention Record:**
   - Points earned from trailing positions at half-time.
   - Win % when leading at half-time.
4. **Official SPL Tiebreaker Math:**
   - Points $\rightarrow$ Head-to-Head Points $\rightarrow$ Head-to-Head Goal Diff $\rightarrow$ Head-to-Head Goals Scored $\rightarrow$ Total Goal Diff $\rightarrow$ Total Goals Scored.
5. **Fair Play Index (P12+):**
   - $\text{FP Points} = (\text{Yellow Cards} \times 1) + (\text{Red Cards} \times 3)$. Lower is better.

### 3.2 Player-Level Analytics
1. **Goal Contributions ($G + A$):**
   - Sum of goals + verified assists (joined via `connected_event_id`).
2. **Goal Frequency:**
   - Goals per Match ($G / GP$).
3. **Penalty Conversion Rate:**
   - Penalties scored / penalties awarded (when flagged with `code: "rp"`).

---

## 4. User-Facing Presentation & Nova UI Specification

### 4.1 What Parents & Coaches Want to See
- **For Parents:**
  - Kickoff countdown and call-up time (e.g. "Kokoontuminen 45 min ennen: 11:15").
  - Match kit advisory ("Peliasu: Sininen paita, valkoiset sukat").
  - Half-time notification and quick score summary on WhatsApp.
  - Venue map link and parking risk level (ParkkiS integration).
- **For Coaches:**
  - Half-time split momentum bar (visual comparison of 1st half vs 2nd half goals).
  - Accurate goal + assist leaderboard without missing assist credits.
  - League standings with live tiebreaker simulation.

### 4.2 Nova UI Component Specifications
- **`MatchCenterHalvesWidget`:**
  - Displays 1st half and 2nd half scores with a liquid-glass pill design.
- **`GoalTimelineList`:**
  - Chronological vertical timeline with distinct markers for normal goals, penalties (`RP`), own goals (`OM`), and assists indented below the goalscorer.
- **`TeamFormBadge`:**
  - 5-game streak bubbles (`W` green, `D` yellow, `L` red) with click-through to match details.
