# Authentic Youth Basketball (Koripallo) Statistics & Capabilities Plan

**Federation:** Suomen Koripalloliitto / Basket.fi / Torneopal  
**Age Groups:** Mikrot & Minit (U8–U12), Nuoret (U14–U19)  
**Zero-Fabrication Mandate:** Derived strictly from Basket.fi Torneopal digital scoresheets and FIBA junior rules. No synthetic NBA-style tracking (no shot coordinates or contested shot % that don't exist in youth pöytäkirjat).

---

## 1. Ground Truth: Finnish Youth Match Sheet Realities

### 1.1 Age Bracket Distinctions & Koripalloliitto Regulations

| Age Bracket | Format | Standings Published? | Quarter Structure | Foul Bonus Rules | Special Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mikrot (U8–U10)** | 4v4 or 5v5 | **No** | $4 \times 8$ min (or octants) | Ei virhebonusta | Madallettu kori (260 cm), pallo koko 5, tasaisen peliajan sääntö. |
| **Minit (U11–U12)** | 5v5 | **No/Optional** | $4 \times 8$ min | Joukkuevirheet nollataan | Kori 305 cm (tai 260 cm U11), paikkapuolustus kielletty. |
| **Aluesarjat (U14–U19)** | 5v5 | **Yes** (2 pts win, 1 pt loss, 0 forfeit) | $4 \times 10$ min | 5. virheestä 2 vaparia | 24s/14s hyökkäysaika, viralliset FIBA-pöytäkirjat (eServices). |
| **SM-sarjat (U16–U19)** | 5v5 | **Yes** | $4 \times 10$ min | Täysi FIBA LiveStats | Täydet tilastot (levypallot, syötöt, riistot, torjunnat, heittotyypit). |

---

## 2. Federation API (Basket.fi Torneopal) Payload Truth

### 2.1 Available Raw Fields
From `koripallo-api.torneopal.net/taso/rest/` endpoints:

- **Match Header & 4 Quarters:**
  - `match_id`, `category_id`, `category_name` (e.g. `U14 Pojat Aluesarja`)
  - `fs_A`, `fs_B` (final score, e.g. `68 - 62`)
  - `p1s_A`, `p1s_B` (1st quarter / 1. neljännes)
  - `p2s_A`, `p2s_B` (2nd quarter / 2. neljännes)
  - `p3s_A`, `p3s_B` (3rd quarter / 3. neljännes)
  - `p4s_A`, `p4s_B` (4th quarter / 4. neljännes)
  - `p5s_A`, `p5s_B` (jatkoaika / overtime if regular ends in tie; basketball has zero draws)
- **Team Foul State (`live_fouls_A`, `live_fouls_B`):**
  - Live count of accumulated team fouls in the active quarter.
  - When count reaches 5, opponent enters bonus free throw situation.
- **Player Scoresheet:**
  - `player_id`, `jersey_number`, `player_name`
  - `points`: total points scored
  - `fouls`: personal fouls committed (0 to 5; 5 fouls = virhetili täynnä / foul out)
  - In games with live digital scorekeeping: 1pt free throws (`FT`), 2pt field goals (`2P`), and 3pt field goals (`3P`).

---

## 3. Deterministic Derived Metrics (Zero Fabrication)

### 3.1 Quarter Scoring Breakdown & Halftime Split
1. **Quarter Flow & Momentum:**
   - Score difference per quarter ($Q_1, Q_2, Q_3, Q_4$).
   - Halftime comparison: 1st half score ($Q_1 + Q_2$) vs 2nd half score ($Q_3 + Q_4$).
2. **Scoring Pace (Pisteet per peliminuutti):**
   $$\text{Pace} = \frac{\text{Total Points Scored}}{\text{Match Duration in Minutes}}$$
   - Useful for comparing fast-break aggressive games vs deliberate half-court games.

### 3.2 Foul Invariants & Foul Trouble Warnings
1. **Foul Trouble Indicator (Virhevaara):**
   - In 4-quarter basketball, a player with 3 fouls in the 1st half or 4 fouls at any point is in severe foul danger.
   - Deterministic alert flag: `fouls === 4 ? 'VIRHEVAARA (4)' : fouls === 5 ? 'VIRHETILI TÄYNNÄ (5)' : null`.
2. **Team Foul Bonus State:**
   - Highlight whether bonus free throws are active in the current quarter ($\ge 5$ fouls).

### 3.3 Player Scoring Efficiency
1. **Top Scorers Leaderboard:**
   - Total Points and Points Per Game ($PPG = \frac{\text{Total Points}}{\text{Games Played}}$).
2. **Free Throw Contribution (when available):**
   - Free throw points as a percentage of total team points.

---

## 4. User-Facing Presentation & Nova UI Specification

### 4.1 What Parents & Coaches Want to See
- **For Parents:**
  - 4-Quarter breakdown table ($Q_1, Q_2, Q_3, Q_4$, OT) so they know how the lead changed.
  - Personal foul count per player so parents know why a player was subbed out ("3 virhettä, istuu penkillä").
  - Clear indicator that basketball cannot end in a draw.
- **For Coaches:**
  - Quarter differential trends (e.g. $+6$ in Q1, $-8$ in Q2, $+12$ in Q3, $+2$ in Q4).
  - Foul management table displaying active fouls per player in real time.
  - Standings calculation based on Koripalloliitto 2 pts win / 1 pt loss / 0 pt forfeit rules.

### 4.2 Nova UI Component Specifications
- **`BasketballQuarterMatrix`:**
  - 4-cell liquid glass grid with running totals and quarter scores.
- **`PlayerFoulMeter`:**
  - 5-dot visual meter: 1–3 dots green, 4 dots pulsing yellow ("Virhevaara"), 5 dots red ("Ulosajettu").
- **`TeamBonusPill`:**
  - Amber badge showing "BONUS" when team fouls $\ge 5$.
