# Authentic Youth Volleyball (Lentopallo) Statistics & Capabilities Plan

**Federation:** Suomen Lentopalloliitto / Torneopal  
**Age Groups:** F-, E-, D-juniorit (U10–U13), C-, B-, A-juniorit (U14–U20)  
**Zero-Fabrication Mandate:** Derived strictly from Lentopalloliitto Torneopal rally score payloads and official FIVB junior competition regulations. No synthetic pro tracking (no unrecorded attack angle vectors or reception rating grades unless present in DataVolley sheets).

---

## 1. Ground Truth: Finnish Youth Match Sheet Realities

### 1.1 Age Bracket Distinctions & Lentopalloliitto Regulations

| Age Bracket | Format | Standings Published? | Sets Structure | Deuce Margin | Tournament Model |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-juniorit (U10)** | 2v2 / 3v3 | **No** | 2 erää (lyhennetyt) | +2 pistettä | Koppipallo / koppisäännöt, mini-kenttä. |
| **E-juniorit (U11)** | 3v3 | **No** | 2 erää (lyhennetyt) | +2 pistettä | Koppi / sormilyönti, matala verkko. |
| **D-juniorit (U12–U13)** | 4v4 / 6v6 | **Aluesarjat** | 2 erää 25p (+ mahd. 3. erä 15p) | +2 pistettä | Turnauspäivä: 3–4 ottelua päivässä. |
| **C-, B-, A-juniorit (U14–U20)** | 6v6 | **Yes (FIVB 3-2-1-0)** | Paras 3:sta tai paras 5:stä | +2 pistettä | SM- ja aluesarjat, virallinen sähköinen pöytäkirja (Torneopal). |

---

## 2. Federation API (Lentopalloliitto Torneopal) Payload Truth

### 2.1 Available Raw Fields
From `lentopallo-api.torneopal.net/taso/rest/` endpoints (shared API key `df8e84j9xtdz269euy3h`):

- **Match Header & Sets Won:**
  - `match_id`, `category_id`, `category_name` (e.g. `C-tytöt SM-sarja`)
  - `fs_A`, `fs_B`: Sets won (e.g. `3 - 1`, `3 - 2`, `2 - 0`, `2 - 1`)
  - `p1s_A`, `p1s_B`: 1st set score (e.g. `25 - 19`)
  - `p2s_A`, `p2s_B`: 2nd set score (e.g. `22 - 25`)
  - `p3s_A`, `p3s_B`: 3rd set score (e.g. `25 - 20`)
  - `p4s_A`, `p4s_B`: 4th set score (if played)
  - `p5s_A`, `p5s_B`: 5th set tiebreak score (played to 15 points, win by 2)
- **Rally Point Totals:**
  - `period_points_for`: Total rally points won across all sets
  - `period_points_against`: Total rally points lost across all sets
- **Tournament Details:**
  - `field_name`: Kenttä / Sali (e.g. `Kaukajärven vapaa-aikatalo K2`)

---

## 3. Deterministic Derived Metrics (Zero Fabrication)

### 3.1 Lentopalloliitto / FIVB Standings Mathematical System
Volleyball uses a distinct 3-point system where set margin determines points:

| Result | Winner Points | Loser Points | Rationale |
| :--- | :--- | :--- | :--- |
| **3 - 0** | 3 | 0 | Selkeä voitto |
| **3 - 1** | 3 | 0 | Neljän erän voitto |
| **3 - 2** | 2 | 1 | Tiukka viisieräinen taistelu (pistejako) |
| **2 - 0** (Paras 3:sta) | 2 (tai 3 sarjasta riippuen) | 0 | Turnaussarjat |
| **2 - 1** (Paras 3:sta) | 2 | 1 | Turnaussarjat |

### 3.2 Set Quotient & Point Quotient (Eräsuhde ja Pistesuhde)
Tiebreakers in volleyball depend on quotients (ratios), not simple differences:
1. **Set Quotient (Eräsuhde):**
   $$\text{Set Quotient} = \frac{\text{Erät Voitetut}}{\text{Erät Hävityt}}$$
   - *Zero-Division Guard:* If Erät Hävityt == 0, display `MAX` or `--`.
2. **Point Quotient (Pistesuhde):**
   $$\text{Point Quotient} = \frac{\text{Pisteet Tehdyt}}{\text{Pisteet Päästetyt}}$$
   - Calculated to 3 or 4 decimal places (e.g. `1.142`).

### 3.3 Set Competitiveness & Deuce Analysis
1. **Deuce Indicator:**
   - Detects sets that extended past 25 (e.g. `28 - 26`) or past 15 in the 5th set (`18 - 16`).
   - Shows "Jatkopallot" badge.
2. **Set Dominance Margin:**
   - Average margin of victory per set won.

---

## 4. User-Facing Presentation & Nova UI Specification

### 4.1 What Parents & Coaches Want to See
- **For Parents:**
  - Set-by-set rally score pills ($S_1, S_2, S_3, S_4, S_5$).
  - Kenttänumero urheilutalolla (e.g. "Kenttä 2") — kriittinen turnauspäivänä monikenttäsaleissa.
  - Päivän seuraavan ottelun alkamisaika (turnauskaavio).
- **For Coaches:**
  - Eräsuhde ja pistesuhde sarjataulukossa (viralliset Lentopalloliiton sijoituskriteerit).
  - Tasaiset erät (jatkopallot) vs repsahdukset.
  - Erävoittoprosentti erittäin tiukoissa ($\le 2$ pistettä) tilanteissa.

### 4.2 Nova UI Component Specifications
- **`VolleyballSetGrid`:**
  - Horizontal cards for each set showing winner highlight and exact score (e.g. `25-21`, `27-25*`, `15-11`).
- **`CourtLocationBadge`:**
  - Prominent badge displaying "KENTTÄ 2" so parents find the right net immediately.
- **`FIVBStandingsTable`:**
  - Table including Sets (W-L), Set Quotient ($S_Q$), Points (W-L), Point Quotient ($P_Q$), and Total Points ($3/2/1/0$).
