# Authentic Youth Floorball (Salibandy) Statistics & Capabilities Plan

**Federation:** Suomen Salibandyliitto (SSBL) / Torneopal  
**Age Groups:** Säbäkipinä (P8–P11), Juniorisarjat (P12–P22)  
**Zero-Fabrication Mandate:** Strictly derived from authentic SSBL match sheets and Torneopal API payloads. No synthetic pro metrics (no shift-by-shift +/- tracking, no unrecorded shot coordinates).

---

## 1. Ground Truth: Finnish Youth Match Sheet Realities

### 1.1 Age Bracket Distinctions & SSBL Regulations

| Age Bracket | Format | Standings Published? | Periods & Running Time | Goalie Saves Logged? | Special Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Säbäkipinä (P8–P9)** | 3v3 or 4v4 | **No** | $3 \times 15$ min (running) | No | Pienkenttä, mini-maalit / isot maalit alentimella, pelinohjaajat. |
| **Säbäkipinä (P10–P11)**| 4v4 or 5v5 | **No** | $3 \times 15$ min (running) | Optional / Local | 12 maalin eron sääntö (peli poikki tai maalisuhde leikataan). |
| **Aluesarjat (P12–P14)** | 5v5 + mv | **Yes** (2-1-0 or 3-2-1-0) | $3 \times 15$ min (tehokas/juokseva) | **Yes (erittäin usein)** | Turnausmuotoiset viikonloput (2 peliä/pvä), viralliset pöytäkirjat. |
| **Valtakunnalliset (P15–P22)**| 5v5 + mv | **Yes** (3-2-1-0 jatkoaika) | $3 \times 20$ min tehokas | **Yes (aina)** | Täydelliset tilastot: eräkohtaiset torjunnat, YV/AV maalit, jäähyt. |

---

## 2. Federation API (Torneopal SSBL) Payload Truth

### 2.1 Available Raw Fields
From `salibandy-api.torneopal.net/taso/rest/` endpoints:

- **Match Header & Periods:**
  - `match_id`, `category_id`, `category_name` (e.g. `P14 Haastajasarja`)
  - `fs_A`, `fs_B` (final score)
  - `p1s_A`, `p1s_B` (1st period)
  - `p2s_A`, `p2s_B` (2nd period)
  - `p3s_A`, `p3s_B` (3rd period)
  - `p4s_A`, `p4s_B` (jatkoaika / overtime, if applicable)
  - `ps_A`, `ps_B` (rangaistuslaukauskilpailu / shootout)
- **Goalkeeper Period Saves (`saves_by_period`):**
  - Stored per goalkeeper as `{ "T1": 8, "T2": 12, "T3": 6, "T4": 1 }`
  - *Gotcha:* In junior games where saves are not logged, this field serializes as an empty string `""` or `{}`.
- **Event Log (`events` array):**
  - **Goals (`event_type: "maali"`):**
    - `time`: `mm:ss` (e.g. `14:22`, `38:05`)
    - `scorer_id`, `scorer_name`
    - `goal_type: "normaali" | "YV" (ylivoima) | "AV" (alivoima) | "RL" (rankkari) | "TM" (tyhjä maali) | "OM" (omamaali)`
  - **Assists (`event_type: "syotto"`):**
    - `connected_event_id`: links to goal `event_id`
    - `player_id`, `player_name`
  - **Penalties (`event_type: "jaahy"`):**
    - `time`: `mm:ss`
    - `player_id`, `duration: "2 min" | "2+2 min" | "5 min" | "10 min" | "20 min" (PR)`
    - `reason`: e.g. "Mailaan lyönti", "Vaarallinen peli", "Väärä etäisyys"
  - **Timeouts (`event_type: "aikalisa"`):**
    - `time`, `team_id`

---

## 3. Deterministic Derived Metrics (Zero Fabrication)

### 3.1 Goalkeeper Analytics & Division-by-Zero Safety
1. **Save Percentage (Torjuntaprosentti):**
   $$\text{Save \%} = \frac{\sum T_i}{\sum T_i + \text{Goals Allowed}} \times 100\%$$
   *Mandatory Zero-Shot Guard:*
   ```ts
   const totalShots = totalSaves + goalsAllowed;
   const savePct = totalShots > 0 ? (totalSaves / totalShots) * 100 : 100.0;
   ```
2. **Period Save Distribution:**
   - Visualizing goalie workload across 1st, 2nd, and 3rd periods to spot third-period fatigue.

### 3.2 Special Teams (Erikoistilannepelaaminen)
1. **Power Play Efficiency (YV %):**
   $$\text{YV \%} = \frac{\text{Power Play Goals Scored}}{\text{Opponent Minor/Major Penalties}} \times 100\%$$
2. **Penalty Kill Efficiency (AV %):**
   $$\text{AV \%} = 100\% - \left(\frac{\text{Short-Handed Goals Allowed}}{\text{Own Penalties Incurred}} \times 100\%\right)$$
3. **Empty Net Performance:**
   - Tracking goals scored vs allowed with empty net (`TM`).

### 3.3 Player Tehopisteet & Discipline
1. **Pörssipisteet:**
   - $\text{Pisteet} = M + S$ (Goals + Assists).
2. **Rangaistusminuutit (PIM):**
   - Total penalty minutes accumulated.

---

## 4. User-Facing Presentation & Nova UI Specification

### 4.1 What Parents & Coaches Want to See
- **For Parents:**
  - Period scores banner ($P_1, P_2, P_3$) so they can follow game flow.
  - "Kuka syötti?" — Explicit visual link between goalscorer and assister.
  - Maalivahdin torjunnat per erä (e.g. "Torjunnat: 8 + 12 + 6 = 26 torjuntaa (89.7%)").
  - Turnausaikataulu: Monissa junioriturnauksissa pelataan 2–3 peliä päivässä 3h välein.
- **For Coaches:**
  - Erikoistilannetehokkuus (YV/AV).
  - Eräkohtainen maalisuhde (olenko hävinneet 3. erän?).
  - Jäähymäärien kehitys ja syyt (mailarikkeet vs fyysiset).

### 4.2 Nova UI Component Specifications
- **`FloorballPeriodGrid`:**
  - 3-column glassmorphic breakdown displaying $P_1, P_2, P_3$ (and OT/RL if played).
- **`GoaliePerformanceCard`:**
  - Clean card with radial or segmented bar showing saves per period and save %.
- **`PowerPlaySummaryBadge`:**
  - Pill displaying `YV: 2/3 (66%) • AV: 4/5 (80%)`.
