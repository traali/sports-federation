# Cross-Sport Feature & Calculation Capability Matrix
## Authoritative Engineering Specification & Mathematical Reference Model
**Document Version:** 2.0.0  
**Ecosystem Standard:** Monastic Finnish Sports Federation Ecosystem  
**Scope:** Football (Palloliitto SPL), Floorball (Salibandyliitto SSBL), Basketball (Koripalloliitto / Basket.fi), and Volleyball (Lentopalloliitto)  
**Author:** Multi-Sport Architecture Teamwork Swarm (`worker_doc_matrix`)  
**Publication Date:** September 3, 2026  
**Status:** Canonical Reference Specification (R2 Milestone)  

---

## 1. Executive Summary & Football Stats as Reference Model

### 1.1 Architectural Philosophy: Football Stats as Foundational Benchmark
Across the Finnish sports federation ecosystem, the `football-stats` monastery serves as the architectural and functional benchmark for matches, teams, standings, and player telemetry. Football's statistical conventions—well-established through decades of international standardization by FIFA, UEFA, and Suomen Palloliitto (SPL)—provide a robust, battle-tested baseline:
- **Matches**: Explicit halves, stoppage time, kickoff timestamps, disciplinary cautions, and pitch coordinates.
- **Teams**: Cumulative league records, home/away splits, goal differentials, and historical common-opponent matrices.
- **Standings**: The classic 3-1-0 points system with deterministic multi-level head-to-head tiebreak chains.
- **Players**: Matchday rosters, starting XI versus substitutes, disciplinary card points, and youth eligibility verification (KM 2026 § 15 regulations).

However, modern multi-sport hubs such as `pelipaiva` and specialized satellite services (`floorball-stats`, `basketball-stats`, `volleyball-stats`) must cater to disciplines with radically divergent pacing, periodizations, scoring rules, and player substitutions. Rather than forcing bespoke, fragmented implementations for each sport, this specification establishes a **Unified Multi-Sport Mathematical Model** where football is the foundational archetype, and floorball, basketball, and volleyball are modeled as rigorous mathematical extensions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FOUNDATIONAL REFERENCE ARCHETYPE                      │
│                                football-stats                               │
│        (2 Halves • 3-1-0 Standings • Disciplinary Cards • H2H Chains)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│    FLOORBALL (SSBL)   │  │ BASKETBALL (Basket.fi)│  │ VOLLEYBALL (Lentis)   │
│ • 3 Periods + OT/RL   │  │ • 4 Quarters + OT     │  │ • Best-of-5 Sets      │
│ • Goalie Save % Guard │  │ • Strict Zero-Draws   │  │ • 25p / 15p Deuce (2p)│
│ • Special Teams (YV%) │  │ • Team Foul Bonus (5p)│  │ • FIVB 3-2-1-0 Math   │
│ • Connected Assists   │  │ • 1p/2p/3p Run Parser │  │ • Set & Point Quots   │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

---

### 1.2 Comparative Multi-Sport Capability Overview

The following matrix compares raw data capabilities across all four official federation platforms:

| Feature / Capability Dimension | Football (SPL) | Floorball (SSBL) | Basketball (Basket.fi) | Volleyball (Lentopalloliitto) |
| :--- | :--- | :--- | :--- | :--- |
| **Federation Host** | `spl.torneopal.net` | `salibandy-api.torneopal.net` | `koripallo-api.torneopal.net` | `lentopallo-api.torneopal.net` |
| **API Auth Key Header** | `Accept: json/4h7dzn...` | `Accept: json/zsn3an...` | `Accept: json/df8e84...` | `Accept: json/df8e84...` |
| **Referer Header Invariant**| `tulospalvelu.palloliitto.fi/` | `tulospalvelu.salibandy.fi/` | `tulospalvelu.basket.fi/` | `tulospalvelu.lentopallo.fi/` |
| **Base Time Division** | 2 Halves (45m/35m) | 3 Periods (20m/15m) | 4 Quarters (10m/8m) | Sets (Best of 5; Sets 1–5) |
| **Overtime Representation** | Extra Time (2x15m) + PK | Period 4 (`p4s`) + PK (`ps`) | Overtime (`p5s`..`p7s`) | 5th Set Tiebreak (`p5s`, 15p) |
| **Draws Possible?** | Yes (in League play) | No in F-liiga (OT/RL); Yes in Lower | No (Strict OT until win) | No (Sets won must be 3) |
| **Scoreboard Unit** | Cumulative Goals | Cumulative Goals | Cumulative Points | Sets Won (`fs_A`, `fs_B`) |
| **Play-by-Play Event Granularity** | Goals, Bookings, Subs | Goals, Assists, Penalties, Saves | Scores (1/2/3p), Fouls, Timeouts | Rally Points, Rotations, Subs |
| **Disciplinary Tracking** | Yellow/Red Cards (SPL Codes) | Penalty Minutes (2m/5m/10m/PR) | Personal & Team Fouls (P0–P3, T1) | Yellow/Red Cards (Sanction Scale)|
| **Goalkeeper Telemetry** | Clean sheets (Youth) | Period Saves & Conceded | N/A | Libero Digs (DataVolley only) |
| **External Analytics Link** | None (Direct Torneopal) | None (Direct Torneopal) | FIBA LiveStats / Genius Sports | DataVolley / VolleyMetrics |

---

### 1.3 Platform Architecture, Security & Network Contracts

#### 1.3.1 MIME Token Authentication in `Accept` Header
Unlike conventional REST APIs that use `Authorization: Bearer <token>`, Torneopal Taso endpoints enforce authentication through a custom MIME subtype token inside the standard `Accept` header:
```http
GET /taso/rest/getMatch?match_id=968705 HTTP/1.1
Host: koripallo-api.torneopal.net
Accept: json/df8e84j9xtdz269euy3h
Referer: https://tulospalvelu.basket.fi/
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```
Failure to pass the exact token or omitting the federation's origin in `Referer` results in immediate Cloudflare Edge WAF `HTTP 403 Forbidden` (or origin PHP `HTTP 401 Unauthorized api` / `HTTP 406 Not Acceptable`).

#### 1.3.2 Shared API Key Discovery
Audits of the live production clusters confirmed that **Koripalloliitto** and **Lentopalloliitto** share the identical public SPA API key:
$$\text{Shared Key: } \texttt{df8e84j9xtdz269euy3h}$$
Palloliitto uses `4h7dznqdxwtp3hsfdyf5r793uahfxy7x`, while Salibandyliitto uses `zsn3anknxzcfzc23k53jqdcd4pymutsf`.

#### 1.3.3 PHP Output Buffering Defect (Buffer Bleed Guard)
Torneopal PHP servers occasionally prepend UTF-8 Byte Order Marks (BOM), trailing whitespace, or PHP warning notices to JSON responses. Resilient clients must implement the canonical extraction guard:
```typescript
export function parseTasoPayload<T>(raw: string): T {
  const start = raw.indexOf('{');
  if (start < 0) throw new Error('Invalid Torneopal payload: missing opening brace');
  const end = raw.lastIndexOf('}');
  if (end < start) throw new Error('Invalid Torneopal payload: missing closing brace');
  const slice = start === 0 && end === raw.length - 1 ? raw : raw.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
```

---

### 1.4 Architectural Invariants: Canonical Contract v1.0.0 & Unified Contract v1.1.0

To ensure backward compatibility across all 6 monastery applications (`pelipaiva`, `Parkkis`, `football-stats`, `floorball-stats`, `basketball-stats`, `volleyball-stats`), the unified cross-sport model adheres to:
1. **Semantic Versioning Invariant**: Existing fields in `contracts/index.ts` (Canonical Contract v1.0.0) are immutable.
2. **Optionality Invariant**: All sport-specific extensions in `UnifiedMatchDetail` (v1.1.0) are strictly optional (`?`).
3. **Data Parity Invariant**: Every derived metric must be computable purely from Torneopal payloads or explicitly flagged as unavailable.

```typescript
export interface UnifiedMatchDetail {
  matchId: string;
  sport: 'football' | 'floorball' | 'basketball' | 'volleyball' | 'other';
  association: 'palloliitto' | 'salibandy' | 'basket' | 'torneopal';
  competitionId?: string;
  competitionName: string;
  categoryName: string;
  groupName?: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  isoStartTime: string;  // ISO 8601 UTC
  venueName: string;
  coordinates?: { latitude: number; longitude: number };
  homeTeam: { id: string; name: string; crestUrl?: string; colorHex?: string };
  awayTeam: { id: string; name: string; crestUrl?: string; colorHex?: string };
  status: 'upcoming' | 'live' | 'played' | 'cancelled' | 'postponed';
  score: {
    home: number;
    away: number;
    scoreType: 'goals' | 'points' | 'sets';
    formatted: string;
  };
  periods: UnifiedPeriodScore[];
  events: UnifiedMatchEvent[];
  metrics: UnifiedSportMetrics;
  canonicalUrl: string;
}
```

---

## 2. Team-Level Derived Metrics & Mathematical Formulas

Team-level metrics evaluate performance trends, scoring dynamics, tactical discipline, and tournament momentum.

### 2.1 Form Radar & Momentum Tracking

#### 2.1.1 Result Characterization ($W/D/L$ and $W/L$)
A sequence of the last $N$ matches ($N = 5$ standard):
$$\text{Form Sequence: } F = [r_1, r_2, \dots, r_N] \quad \text{where } r_i \in \{V, T, H\}$$
*(Finnish notation: $V = \text{Voitto / Win}$, $T = \text{Tasapeli / Draw}$, $H = \text{Häviö / Loss}$)*

- **Football**: Draws permitted ($r_i \in \{V, T, H\}$).
- **Floorball**: In F-liiga/Divari, matches tied at regulation proceed to OT/Shootout. Standings track regulation win ($V3$), OT win ($V2$), OT loss ($H1$), regulation loss ($H0$). Form radar displays:
  $$r_i \in \{V, V_{\text{ja}}, H_{\text{ja}}, H\}$$
- **Basketball & Volleyball**: Draws strictly prohibited ($r_i \in \{V, H\}$).

#### 2.1.2 Points Per Game (PPG)
$$\text{PPG} = \frac{\text{Points Earned}}{\text{Matches Played}} = \frac{P}{M}$$

#### 2.1.3 Exponential Moving Average (EMA) Momentum
To reflect recent form more accurately than a simple rolling average, an exponential smoothing factor $\alpha$ ($\alpha = 0.35$) is applied:
$$\text{EMA}_t = \alpha \cdot \text{Points}_t + (1 - \alpha) \cdot \text{EMA}_{t-1}$$

#### 2.1.4 Goal / Point Differential Trend ($\Delta$)
For a rolling window of $k$ matches:
$$\Delta_{\text{rolling}} = \sum_{i=1}^{k} (S_{i,\text{scored}} - S_{i,\text{conceded}})$$
$$\text{Differential Trajectory: } \text{Slope} = \frac{k \sum (i \cdot \Delta_i) - \sum i \sum \Delta_i}{k \sum i^2 - (\sum i)^2}$$

---

### 2.2 Goal / Point Differential & Home/Away Splits

#### 2.2.1 Goal / Point Scoring Ratio ($R_S$)
$$R_S = \begin{cases} \frac{\text{Goals For}}{\text{Goals Against}} = \frac{G_F}{G_A} & \text{if } G_A > 0 \\ G_F & \text{if } G_A = 0 \end{cases}$$

#### 2.2.2 Home Advantage Delta ($\delta_{\text{home}}$)
The performance delta between home fixtures and away fixtures:
$$\text{PPG}_{\text{home}} = \frac{P_{\text{home}}}{M_{\text{home}}}, \quad \text{PPG}_{\text{away}} = \frac{P_{\text{away}}}{M_{\text{away}}}$$
$$\delta_{\text{home}} = \text{PPG}_{\text{home}} - \text{PPG}_{\text{away}}$$
A positive $\delta_{\text{home}} > 0.5$ indicates heavy home-ground reliance; $\delta_{\text{home}} \approx 0$ indicates travel resilience.

#### 2.2.3 Net Efficiency Differential ($\text{NED}$)
In high-scoring sports (Basketball):
$$\text{NED} = \frac{PTS_F - PTS_A}{M}$$
In Volleyball, Set Efficiency is computed as:
$$\text{Set Ratio} = \frac{\text{Sets Won}}{\text{Sets Lost}} = \frac{S_W}{S_L}$$

---

### 2.3 Period Dominance & Scoring Dynamics

Sports differ fundamentally in how playing time is partitioned. Period dominance quantifies when a team exerts tactical control.

#### 2.3.1 Period Scoring Share ($D_p$)
For period $p \in \{1, \dots, K\}$:
$$D_p = \frac{\text{Score Team in Period } p}{\text{Total Match Score Team}} \times 100\%$$

#### 2.3.2 Relative Period Advantage ($\text{RPA}_p$)
$$\text{RPA}_p = \text{Score}_{\text{Team}, p} - \text{Score}_{\text{Opponent}, p}$$

| Sport | Periods ($K$) | Standard Duration | Critical Strategic Intervals |
| :--- | :--- | :--- | :--- |
| **Football** | 2 Halves | 45m (Senior), 35m/30m (Youth) | 1st Half ($H_1$), 2nd Half ($H_2$), Stoppage Time ($90'+$) |
| **Floorball** | 3 Periods | 20m (F-liiga), 15m (Youth/Regional) | $P_1$ (Opening), $P_2$ (Middle frame), $P_3$ (Closing), $P_4$ (OT 5m) |
| **Basketball**| 4 Quarters| 10m (FIBA), 8m (Youth) | $Q_1, Q_2$ (1st Half), $Q_3, Q_4$ (2nd Half), $OT$ (5m) |
| **Volleyball**| 3–5 Sets | No clock (25p / 15p rally points) | Sets 1–2 (Early phase), Sets 3–4 (Clinch), Set 5 (Tiebreak 15p) |

#### 2.3.3 Comeback Index ($CI$)
Measures the team's ability to recover from a deficit:
$$CI = \frac{\text{Matches Won After Trailing at Intermediate Period}}{\text{Total Matches Trailing at Intermediate Period}} \times 100\%$$
- Football: Trailing at Half-Time ($HT$).
- Floorball: Trailing after Period 2 ($P_2$).
- Basketball: Trailing after Quarter 3 ($Q_3$).
- Volleyball: Trailing 0–2 in sets and winning 3–2 (The "Reverse Sweep").

---

### 2.4 Fair Play & Discipline Averages

#### 2.4.1 Football Disciplinary Point Index ($DP_{\text{football}}$)
In Suomen Palloliitto tournaments, fair play points penalize cards according to federation disciplinary weightings:
$$DP_{\text{football}} = (1 \times Y) + (3 \times Y_2) + (5 \times R_{\text{direct}})$$
where:
- $Y$ = Single Yellow Card (`varoitus`, codes A, B, D)
- $Y_2$ = Second Yellow Card resulting in expulsion (`ulosajo2varoitus`, code N)
- $R_{\text{direct}}$ = Direct Red Card (`ulosajo` / `kentaltapoisto`)

$$\text{Team Fair Play Average} = \frac{\sum DP_{\text{football}}}{M}$$
*(Lower score represents better discipline).*

#### 2.4.2 Floorball Penalty Minutes & Special Teams Metrics
In Salibandyliitto matches, penalties are tracked by exact minute durations:
$$\text{Total PIM} = \sum (2 \cdot N_{2\text{min}} + 4 \cdot N_{2+2\text{min}} + 5 \cdot N_{5\text{min}} + 10 \cdot N_{10\text{min}} + 20 \cdot N_{\text{PR}})$$

##### Power Play Percentage ($YV\%$)
$$YV\% = \begin{cases} \left( \frac{\text{Power Play Goals Scored (YV)}}{\text{Opponent Minor Penalties Taken}} \right) \times 100\% & \text{if Penalties} > 0 \\ 0.0\% & \text{if Penalties} = 0 \end{cases}$$

##### Penalty Kill Percentage ($AV\%$)
$$AV\% = \begin{cases} \left( 1 - \frac{\text{Power Play Goals Conceded}}{\text{Own Minor Penalties Conceded}} \right) \times 100\% & \text{if Penalties} > 0 \\ 100.0\% & \text{if Penalties} = 0 \end{cases}$$

#### 2.4.3 Basketball Team Foul Accumulation & Bonus Trigger Rule
Under official FIBA / Koripalloliitto rules:
- Personal fouls committed by players on a team accumulate per quarter ($Q_1, Q_2, Q_3, Q_4$).
- **Bonus Trigger Condition**:
  $$\text{In Bonus} = \begin{cases} \text{true} & \text{if } \text{live\_fouls} \ge 5 \\ \text{false} & \text{if } \text{live\_fouls} < 5 \end{cases}$$
- When a team commits its **5th foul** in a single quarter, every subsequent defensive foul automatically awards **two free throws** ($2 \times FT$) to the opposing team, regardless of whether the foul occurred during a shooting action.
- Live fouls reset to $0$ at the commencement of each subsequent quarter.
- Overtime fouls are treated as a continuation of Quarter 4 team foul accumulation.

---

### 2.5 Tournament Progression & Clinching Mathematics

#### 2.5.1 Maximum Achievable Points ($P_{\max}$)
For a league with $T$ total scheduled matches, where a team has completed $M$ matches ($M \le T$) and currently holds $P$ points:
$$P_{\max} = P + (T - M) \times P_{\text{win}}$$
where $P_{\text{win}} = 3$ (Football / Floorball / Volleyball) or $P_{\text{win}} = 2$ (Basketball).

#### 2.5.2 Promotion / Playoff Clinch Condition
A team $A$ clinches a top-$k$ playoff position if their current points exceed the maximum achievable points of the $(k+1)$-th ranked team $B$:
$$\text{Clinch Top-}k \iff P_A > P_{\max, B} \quad \forall B \in \text{Teams ranked } (k+1) \dots N$$

#### 2.5.3 Relegation Safety Margin ($SM_{\text{relegation}}$)
Let $R$ be the threshold position for relegation (e.g. 11th in a 12-team league). Let $C$ be the highest-ranked team currently in the relegation zone:
$$SM_{\text{relegation}} = P_A - P_{\max, C}$$
If $SM_{\text{relegation}} > 0$, team $A$ is mathematically safe from relegation.

---

## 3. Player-Level Derived Metrics & Mathematical Formulas

Individual player statistics quantify offensive output, efficiency, goalkeeper protection, and discipline.

### 3.1 Goals, Assists & Points (Tehopisteet)

#### 3.1.1 Floorball Scoring Formula ($P = M + S$)
In SSBL Salibandy:
$$\text{Pisteet (Points)} = M + S$$
where $M$ is Goals Scored (`goals`), and $S$ is Assists (`assists`).
- **Relational Integrity**: Torneopal SSBL payloads record assist events (`code: "syotto"`) with `connected_event_id` referencing the exact goal event (`code: "maali"`):
  $$\text{Event}_{\text{assist}}.\texttt{connected\_event\_id} \equiv \text{Event}_{\text{goal}}.\texttt{event\_id}$$

#### 3.1.2 Basketball Points Decomposition
In Koripalloliitto Torneopal play-by-play events (`code: "maali"`), each scoring event's description encodes the shot point value and running score:
$$\texttt{description} = \text{"\{points\} \{s\_A\}-\{s\_B\}"}$$
Total individual points are derived by summing player-attributed events:
$$\text{Points} = (1 \times FT) + (2 \times 2FG) + (3 \times 3FG)$$
where:
- $FT$ = Free Throws Made (description prefix `"1"`, foul note `"P1"`, `"P2"`, `"P3"`, `"T1"`)
- $2FG$ = 2-Point Field Goals Made (description prefix `"2"`)
- $3FG$ = 3-Point Field Goals Made (description prefix `"3"`)

#### 3.1.3 Volleyball Scoring Attributes
In Lentopalloliitto senior and junior matches:
$$\text{Points} = \text{Attack Kills} + \text{Kill Blocks} + \text{Service Aces}$$
Torneopal integrates DataVolley player metrics in top tiers:
$$\text{Point Total} = \texttt{SpikeWin} + \texttt{BlockWin} + \texttt{ServeWin}$$
Net player efficiency is calculated as:
$$\pm \text{ Differential} = (\texttt{SpikeWin} + \texttt{BlockWin} + \texttt{ServeWin}) - (\texttt{SpikeErr} + \texttt{ServeErr} + \texttt{RecErr})$$

---

### 3.2 Scoring & Shooting Efficiency

#### 3.2.1 Points Per Minute ($PPM$)
$$PPM = \frac{\text{Total Points}}{\text{Minutes Played}}$$

#### 3.2.2 Goals Per Match ($GPM$)
$$GPM = \frac{\text{Total Goals}}{\text{Matches Played}}$$

#### 3.2.3 Basketball True Shooting Percentage ($TS\%$)
Where field goal attempts ($FGA$) and free throw attempts ($FTA$) are recorded (Korisliiga / FIBA LiveStats):
$$TS\% = \frac{\text{Points}}{2 \times (FGA + 0.44 \times FTA)} \times 100\%$$

#### 3.2.4 Volleyball Attack Efficiency ($AE\%$)
Under FIVB / DataVolley standards:
$$AE\% = \frac{\texttt{SpikeWin} - \texttt{SpikeErr}}{\texttt{Total Spike Attempts}} \times 100\%$$

---

### 3.3 Goalkeeper Metrics & Zero-Shot Guard

Goalkeeper evaluation in floorball (and top-tier football where saves are tracked) requires strict mathematical safeguards against zero-division errors.

#### 3.3.1 Canonical Save Percentage Formula ($S\%$)
Let $S$ be total saves made (`saves`), and $G_C$ be total goals conceded (`conceded`):
$$\text{Total Shots Faced} = S + G_C$$

$$S\% = \begin{cases} \left( \frac{S}{S + G_C} \right) \times 100\% & \text{if } (S + G_C) > 0 \\ 100.0\% & \text{if } (S + G_C) = 0 \end{cases}$$

> **CRITICAL VERIFICATION INVARIANT (MATH-04)**:  
> When a goalkeeper is listed on the match card or plays minutes but faces zero shots ($S = 0, G_C = 0$), the save percentage **MUST RETURN 100.0%**. It must **NEVER** return `NaN`, `null`, `undefined`, or crash with a division by zero error.

#### 3.3.2 Period-by-Period Goalkeeper Splits
Floorball lineups provide granular period saves:
$$S\%_{\text{Period } p} = \begin{cases} \left( \frac{\texttt{saves\_}p}{\texttt{saves\_}p + \texttt{conceded\_}p} \right) \times 100\% & \text{if } (\texttt{saves\_}p + \texttt{conceded\_}p) > 0 \\ 100.0\% & \text{if } (\texttt{saves\_}p + \texttt{conceded\_}p) = 0 \end{cases}$$

#### 3.3.3 Torneopal Goalkeeper Payload Defense
When a goalie plays 0 minutes or save recording is omitted, Torneopal emits an empty string `saves_by_period: ""` rather than an empty dictionary `{}` or `null`. The client adapter must guard this type variance:
```typescript
export function safeCalculateSavePct(saves: number, conceded: number): string {
  const total = saves + conceded;
  if (total <= 0) return '100.0%';
  return `${((saves / total) * 100).toFixed(1)}%`;
}

export function parsePeriodSavesMap(raw: unknown): Record<string, number> {
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, number>;
  }
  return {};
}
```

---

### 3.4 Discipline & Penalty Taxonomy

#### 3.4.1 Floorball Penalty Classification & Reason Code Dictionary
Floorball penalties in `match.events[]` specify duration in `code` and infraction in `description`:

| Code (`ev.code`) | Duration | Disciplinary Severity | Tactical Impact |
| :--- | :--- | :--- | :--- |
| `2min` | 2 minutes | Minor Infraction | Opponent awarded Power Play (terminates on goal) |
| `2_2min` | 2+2 minutes| Double Minor Infraction | Two consecutive 2-min penalties (first terminates on goal) |
| `5min` | 5 minutes | Major Infraction | Full 5-min power play (does NOT terminate on goal) |
| `10min` | 10 minutes| Personal Misconduct | Player serves 10m; team plays at full strength unless combined with 2m |
| `pr` / `20min` | Match Penalty | Match Ejection (PR1/PR2/PR3)| Automatic disqualification, 5-minute team penalty, disciplinary review |

##### Canonical Finnish Floorball Reason Code Dictionary:
```
KP   = Kiinnipitäminen (Holding)
VFP  = Varomaton fyysinen pelaaminen (Careless physical play)
PFP  = Piittaamaton fyysinen pelaaminen (Reckless physical play)
EST  = Estäminen (Obstruction / Interference)
TYO  = Työntäminen (Pushing)
VMP  = Varomaton mailalla pelaaminen (Careless high stick / slashing)
PMP  = Piittaamaton mailalla pelaaminen (Reckless stick infraction)
JVP  = Toistuva väärä pelitapa (Repeated infringement)
ETA  = Väärä etäisyys (Failure to respect 3m distance)
KOR  = Korkea maila (High sticking)
MLY  = Maasta pelaaminen / Mailan lyöminen (Playing from floor / Hitting stick)
MPA  = Mailaan painaminen (Pressing opponent's stick)
VAA  = Väärä varuste (Illegal equipment)
VAV  = Väärä vaihto (Illegal substitution / Too many players)
EPP  = Epäurheilijamainen käytös (Unsportsmanlike conduct)
```

#### 3.4.2 Basketball Foul Progression & FIBA Codes
In Basket.fi Torneopal feeds:
- Event: `code: "virhe"`
- Sequential personal foul count: `description: "1"` .. `"5"`
- **Foul-Out Invariant**: A player reaching **5 personal fouls** is disqualified and must leave the court.
- **FIBA Classification Notes (`note`)**:
  - `P0`: Personal foul without free throws
  - `P1`: Personal foul with 1 free throw awarded (basket scored + and-one)
  - `P2`: Personal foul with 2 free throws awarded (shooting foul or team in bonus)
  - `P3`: Personal foul on 3-point attempt (3 free throws awarded)
  - `T1`: Technical foul (1 free throw + possession)
  - `U2`: Unsportsmanlike foul (2 free throws + possession)
  - `D2`: Disqualifying foul (ejection from arena)

#### 3.4.3 Football Disciplinary Accumulation
In Palloliitto SPL leagues:
- Single Yellow (`varoitus` A, B, D)
- Second Yellow leading to Red (`ulosajo2varoitus`, code N)
- Direct Red (`ulosajo`)
- **Suspension Accumulation**: In senior amateur and youth leagues, accumulating **4 yellow cards** in separate matches results in an automatic **1-match suspension**.

---

### 3.5 Appearance & Role Tracking

#### 3.5.1 Starting Role Ratio ($SR$)
From `match.lineups[]`:
$$SR = \frac{\sum \mathbb{I}(\texttt{start} == \text{"1"})}{\text{Total Appearances}}$$
- Football: Exactly 11 players per team have `start: "1"`.
- Floorball: Exactly 5 field players + 1 goalkeeper (or starting 5).
- Basketball: Exactly 5 starters.
- Volleyball: Exactly 6 starters (Rotations 1–6) + 1 Libero.

#### 3.5.2 Minutes Played Estimation
In football and floorball where substitution events are recorded:
$$\text{Minutes Played} = \begin{cases} T_{\text{sub\_out}} - 0 & \text{if started and subbed out} \\ T_{\text{end}} - T_{\text{sub\_in}} & \text{if substitute and subbed in} \\ T_{\text{end}} - 0 & \text{if started and never subbed out} \\ T_{\text{sub\_out}} - T_{\text{sub\_in}} & \text{if subbed in then subbed out} \end{cases}$$

---

## 4. Match-Level Analytics & Telemetry

Match-level telemetry governs real-time state machines, period scoreflows, unified event sorting, and venue navigation risk.

### 4.1 Live Status Finite State Machine (FSM)

Every match transitions through a deterministic sequence of operational states:

```
                  ┌───────────────┐
                  │   SCHEDULED   │
                  └───────┬───────┘
                          │ (Kickoff - 45 min / Warmup)
                          ▼
                  ┌───────────────┐
                  │    WARMUP     │
                  └───────┬───────┘
                          │ (Referee Whistle / Live timer on)
                          ▼
            ┌─────────► ┌───────────────┐ ◄────────┐
            │           │ LIVE (PERIOD) │          │
            │           └───────┬───────┘          │
(Period End)│                   │                  │ (Next Period Start)
            │                   ▼                  │
            │           ┌───────────────┐          │
            └───────────┤ INTERMISSION  ├──────────┘
                        └───────┬───────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼ (Regulation Complete)       ▼ (Overtime Required)
        ┌─────────────────┐           ┌─────────────────┐
        │ FINISHED (FT)   │           │ LIVE (OT / RL)  │
        └─────────────────┘           └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │ FINISHED (OT/RL)│
                                      └─────────────────┘

   [SPECIAL TRANSITIONS]
   • Any State ──(Adverse Weather / Ground Unplayable)──► POSTPONED (Siirretty)
   • Any State ──(Team No-Show / Ineligible Player)────► FORFEITED (Luovutus)
```

#### 4.1.1 Finite State Machine Transition Table

| Current State | Trigger / Event | Next State | Observable API Indicators |
| :--- | :--- | :--- | :--- |
| `SCHEDULED` | Clock reaches scheduled start $- 45$m | `WARMUP` | `status: "Scheduled"`, time within buffer |
| `WARMUP` | Official match whistle | `LIVE` | `status: "Live"`, `live_timer_on: 1`, `live_period: "1"` |
| `LIVE` | Period clock reaches end of regulation | `INTERMISSION`| `status: "Live"`, `live_timer_on: 0`, period ended |
| `INTERMISSION`| Next period whistle | `LIVE` | `status: "Live"`, `live_timer_on: 1`, `live_period: "2"`.. |
| `LIVE` | Final whistle (Decided in regulation) | `FINISHED_FT` | `status: "Played"`, `matchcard_status: "Confirmed"` |
| `INTERMISSION`| Regulation tied (in knockout/F-liiga/Basket)| `LIVE_OT` | `status: "Live"`, `live_period: "4"` or `"5"` |
| `LIVE_OT` | Decisive sudden death / OT / Shootout | `FINISHED_OT` | `status: "Played"`, `p4s` or `ps` populated |
| Any State | Match postponed by federation | `POSTPONED` | `status: "Postponed"`, `reschedule: "1"`, scores empty |
| Any State | Team forfeit / walkover | `FORFEITED` | `walkover: 1`, `forfeit_A` or `forfeit_B` set, `status: "Played"` *(Quirk!)* |

#### 4.1.2 Forfeit & Walkover Payload Quirks (Luovutus)
Torneopal exhibits a critical backend quirk: in `getMatch`, forfeited fixtures report `status: "Played"` instead of `"Forfeited"`. Software clients must never rely exclusively on `status === "Played"`. Instead, they must evaluate the canonical walkover guard:
```typescript
export function isMatchForfeited(m: { walkover?: unknown; forfeit_A?: unknown; forfeit_B?: unknown; status?: string }): boolean {
  return (
    m.walkover === 1 ||
    m.walkover === '1' ||
    m.status === 'Forfeited' ||
    Boolean(m.forfeit_A) ||
    Boolean(m.forfeit_B)
  );
}
```

##### Standard Official Forfeit Scores:
- **Football (SPL)**: $3 - 0$ (or $0 - 3$)
- **Floorball (SSBL)**: $5 - 0$ (or $0 - 5$) per SSBL competition regulations (§ 47) — note explicit distinction from the Football/Volleyball standard $3 - 0$ (cross-referenced with `docs/audit/federation-api-payload-audit.md` § 7.1).
- **Basketball (Basket.fi)**: $40 - 0$ (Regional youth leagues) or $20 - 0$ (National senior leagues)
- **Volleyball (Lentopalloliitto)**: $3 - 0$ in sets, with each set scored $25 - 0$ ($25-0, 25-0, 25-0$)

---

### 4.2 Period-by-Period Scoreflow & Lead Dynamics

#### 4.2.1 Lead Progression & Lead Changes
In basketball and volleyball, every score event updates the running total:
$$\text{Lead}(t) = \text{Score}_A(t) - \text{Score}_B(t)$$
- **Lead Change Event**: A transition at time $t$ where:
  $$\operatorname{sgn}(\text{Lead}(t)) \neq \operatorname{sgn}(\text{Lead}(t-1)) \quad \text{and} \quad \text{Lead}(t) \neq 0$$
- **Tied Score Event**: $\text{Lead}(t) = 0$ following a non-zero state.
- **Largest Lead**: $\max_{t} |\text{Lead}(t)|$.

#### 4.2.2 Scoring Run Detection ($K$-Run)
A scoring run is an uninterrupted scoring streak:
$$\text{Run} = \Delta \text{Score}_A \quad \text{while } \Delta \text{Score}_B = 0$$
- In Basketball: A run where $\Delta \text{Score}_A \ge 8$ points is classified as an **Unanswered Run** (e.g. "10–0 Run over 3:15").
- In Volleyball: Consecutive point runs on serve (e.g. 5 consecutive break points).

---

### 4.3 Normalized Cross-Sport Event Taxonomy

To render a unified event timeline across all sports, heterogeneous federation event payloads are mapped to `UnifiedMatchEvent`:

| Federation Event Code | Normalized Type (`type`) | Badge Text (`badgeText`) | Sub-Text / Reason (`subText`) |
| :--- | :--- | :--- | :--- |
| Football SPL `maali` | `'score'` | `"Maali"` / `"RP"` / `"OM"` | Scorer name, shot origin coords |
| Football SPL `varoitus` | `'card'` | `"Keltainen"` | Code reason: `"A"`, `"B"`, `"D"` |
| Football SPL `ulosajo` | `'card'` | `"Punainen"` | Disciplinary clause |
| Football SPL `vaihto` | `'substitution'` | `"Vaihto"` | Outgoing & incoming player names |
| Floorball SSBL `maali` | `'score'` | `"Maali"` / `"YV"` / `"AV"` / `"TM"` | Assist name via `connected_event_id` |
| Floorball SSBL `2min` | `'penalty'` | `"2 min"` | Reason code: `"KOR"`, `"ETA"`, `"EST"` |
| Floorball SSBL `5min` | `'penalty'` | `"5 min"` | Reason text: e.g. `"Vaarallinen peli"` |
| Floorball SSBL `torjunta`| `'save'` | `"Torjunta"` | Goalkeeper save count |
| Basketball `maali` | `'score'` | `"1p"` / `"2p"` / `"3p"` | Running score (e.g. `"2 45-42"`) |
| Basketball `virhe` | `'foul'` | `"Virhe (1-5)"` | FIBA note: `"P0"`, `"P2"`, `"T1"`, `"U2"` |
| Basketball `aikalisa` | `'timeout'` | `"Aikalisä"` | Requesting team and quarter |
| Volleyball `piste` | `'score'` | `"Piste"` | Set score (e.g. `"23-21"`), server |
| Volleyball `vaihto` | `'substitution'` | `"Vaihto"` | Outgoing & incoming players |
| Volleyball `aikalisa` | `'timeout'` | `"Aikalisä"` | Requesting team and set score |

---

### 4.4 Referee & Venue Telemetry

#### 4.4.1 Referee Crew Allocation
- **Football**: Head Referee (`referee_1_name`), Assistant Referee 1, Assistant Referee 2, 4th Official, VAR, AVAR.
- **Floorball**: Head Referee 1, Head Referee 2 (dual-referee system standard in Finland).
- **Basketball**: Crew Chief (`referee_1_name`), Umpire 1 (`assistant_referee_1_name`), Umpire 2 (`assistant_referee_2_name`).
- **Volleyball**: 1st Referee (on stand), 2nd Referee (at scorer table), Line Judges (1–4 in top tiers).

#### 4.4.2 Urban Spatial Parking Risk & Navigation (ParkkiS Integration)
Venues in the Helsinki Metropolitan Area present severe parking risks for sports families. By integrating with `Parkkis` via spatial coordinates ($lat, lon$), match centers automatically classify parking risk:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPATIAL VENUE CLASSIFICATION (PARKKIS)                   │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 🟢 SAFE DISC VENUE (e.g. Otahalli)   │ 🔴 ZONE 1 TRAP (e.g. Kamppi / Töölö) │
│ • Risk Rating: 2 / 10 (Safe)         │ • Risk Rating: 8 / 10 (Trap)         │
│ • Zone: Pysäköintikiekko 4h          │ • Zone: Maksullinen Vyöhyke 1 (€4/h) │
│ • Walking Time: 2 min (120m)         │ • Walking Time: 3 min (200m)         │
│ • Rule: Tieliikennelaki 2020 § 40    │ • Rule: Immediate app payment req.   │
│   Arrival time rounds UP to next half│   High enforcement patrol frequency  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

##### Tieliikennelaki 2020 § 40 Parking Disc Rounding Formula:
When parking in disc-controlled spaces (e.g. Otahalli 4h), the arrival time set on the parking disc must be rounded **forward to the next half-hour or hour**:
$$\text{Disc Time}(t) = \begin{cases} t & \text{if } \text{minute}(t) \in \{0, 30\} \\ \text{setMinutes}(30) & \text{if } 0 < \text{minute}(t) < 30 \\ \text{setHour}(+1, 0) & \text{if } 30 < \text{minute}(t) < 60 \end{cases}$$
- Arrival $14:05 \implies \text{Disc set to } 14:30$.
- Arrival $14:35 \implies \text{Disc set to } 15:00$.
- Arrival $14:30 \implies \text{Disc set to } 14:30$.

---

## 5. Tournament-Level Analytics & Standings Math

Tournament standings calculate ranking order, points distribution, goal/set quotients, and deterministic tiebreaks.

### 5.1 Multi-Division Standings Tables

#### 5.1.1 Football SPL (Standard 3-1-0 System)
$$\text{Points} = (3 \times W) + (1 \times D) + (0 \times L)$$
- $W$ = Matches Won (`matches_won`)
- $D$ = Matches Drawn (`matches_tied`)
- $L$ = Matches Lost (`matches_lost`)
- Invariant: $M_{\text{played}} \equiv W + D + L$

#### 5.1.2 Floorball SSBL (National 3-Point System)
In F-liiga and Divari:
$$\text{Points} = (3 \times W_{\text{reg}}) + (2 \times W_{\text{OT/RL}}) + (1 \times L_{\text{OT/RL}}) + (0 \times L_{\text{reg}})$$
where:
- $W_{\text{reg}}$ = Regulation Win (`matches_won3`)
- $W_{\text{OT/RL}}$ = Overtime / Shootout Win (`matches_won2` / `matches_tiedwon`)
- $L_{\text{OT/RL}}$ = Overtime / Shootout Loss (`matches_tied`)
- $L_{\text{reg}}$ = Regulation Loss (`matches_lost`)

#### 5.1.3 Basketball Koripalloliitto (2-0 System)
In all Finnish basketball divisions:
$$\text{Points} = 2 \times W$$
- Win awards 2 points; Loss awards 0 points. Draws do not exist.

#### 5.1.4 Volleyball Lentopalloliitto (FIVB / CEV 3-Point System)
Volleyball distributes points based on the final set margin:

| Match Result (Sets) | Winner Points | Loser Points | Torneopal Backend Fields |
| :--- | :--- | :--- | :--- |
| **3–0 or 3–1** | 3 | 0 | Winner: `matches_won` (+3) / Loser: `matches_lost` (0) |
| **3–2** | 2 | 1 | Winner: `matches_tiedwon` (+2) / Loser: `matches_tied` (+1)|

$$\text{Points} = (3 \times \texttt{matches\_won}) + (2 \times \texttt{matches\_tiedwon}) + (1 \times \texttt{matches\_tied})$$
$$\text{Total Points Distributed Per Match} \equiv 3 \quad (\text{either } 3+0 \text{ or } 2+1)$$

---

### 5.2 Deterministic Tiebreak Resolution Algorithms

When two or more teams conclude a competition with identical total points ($P_A = P_B$), standings must be resolved deterministically without human ambiguity.

#### 5.2.1 The Master Tiebreak Hierarchy

```
Tiebreak Step 1: Head-to-Head Points (Keskinäisten ottelujen pisteet)
                          │ (Still Tied)
                          ▼
Tiebreak Step 2: Head-to-Head Goal / Point Diff (Keskinäisten maaliero / piste-ero)
                          │ (Still Tied)
                          ▼
Tiebreak Step 3: Head-to-Head Goals / Points Scored (Keskinäisten tehdyt maalit)
                          │ (Still Tied)
                          ▼
Tiebreak Step 4: Overall Goal / Point Differential (Koko sarjan maaliero)
                          │ (Still Tied)
                          ▼
Tiebreak Step 5: Overall Goals / Points Scored (Koko sarjan tehdyt maalit)
                          │ (Still Tied)
                          ▼
[VOLLEYBALL SPECIFIC SUB-CHAIN]
Step 5a: Set Quotient (Eräsuhde: Sets Won / Sets Lost)
Step 5b: Point Quotient (Pistesuhde: Points Won / Points Conceded)
                          │ (Still Tied)
                          ▼
Tiebreak Step 6: Disciplinary Fair Play Points (Lower penalty points wins)
                          │ (Still Tied)
                          ▼
Tiebreak Step 7: Playoff Match (Uusintaottelu) or Administrative Lottery (Arvonta)
```

#### 5.2.2 Mathematical Definitions of Quotients (Volleyball)
In Lentopalloliitto standings:
1. **Set Quotient (Eräsuhde, $Q_{\text{set}}$)**:
   $$Q_{\text{set}} = \begin{cases} \frac{\text{Sets Won}}{\text{Sets Lost}} = \frac{S_W}{S_L} & \text{if } S_L > 0 \\ \infty & \text{if } S_L = 0 \text{ and } S_W > 0 \end{cases}$$
2. **Point Quotient (Pistesuhde, $Q_{\text{point}}$)**:
   $$Q_{\text{point}} = \begin{cases} \frac{\text{Period Points For}}{\text{Period Points Against}} = \frac{PP_F}{PP_A} & \text{if } PP_A > 0 \\ \infty & \text{if } PP_A = 0 \text{ and } PP_F > 0 \end{cases}$$

#### 5.2.3 Multi-Team Recursive Mini-League Algorithm (3+ Teams Tied)
When 3 or more teams share identical points, a recursive sub-league table is constructed isolating only matches played exclusively between the tied teams:
```typescript
export function resolveMultiTeamTiebreak<T extends TeamStandingRow>(
  tiedTeams: T[],
  allMatches: MatchSummary[],
  sport: SupportedSport
): T[] {
  const tiedIds = new Set(tiedTeams.map(t => t.teamId));

  // 1. Isolate head-to-head matches between the tied participants
  const h2hMatches = allMatches.filter(
    m => tiedIds.has(m.homeTeamId) && tiedIds.has(m.awayTeamId) && m.status === 'played'
  );

  // 2. Compute mini-league table
  const miniTable = computeMiniLeague(tiedTeams, h2hMatches, sport);

  // 3. Sort by mini-league points -> mini-diff -> mini-scored
  miniTable.sort((a, b) => {
    if (b.miniPoints !== a.miniPoints) return b.miniPoints - a.miniPoints;
    if (b.miniDiff !== a.miniDiff) return b.miniDiff - a.miniDiff;
    if (b.miniScored !== a.miniScored) return b.miniScored - a.miniScored;
    // Fall back to overall differential
    if (b.overallDiff !== a.overallDiff) return b.overallDiff - a.overallDiff;
    if (b.overallScored !== a.overallScored) return b.overallScored - a.overallScored;
    return 0;
  });

  return miniTable.map(row => row.originalTeam);
}
```

---

### 5.3 Playoff Bracket & Tournament Progression

#### 5.3.1 Best-of-$N$ Series Mathematics
In national playoffs (F-liiga floorball, Korisliiga basketball, Mestaruusliiga volleyball):
- Series formats: Best-of-3 ($N=3$, first to 2 wins), Best-of-5 ($N=5$, first to 3 wins), Best-of-7 ($N=7$, first to 4 wins).
- **Series Clinch Condition**:
  $$\text{Series Won by } A \iff W_A = \left\lfloor \frac{N}{2} \right\rfloor + 1$$
- **Series Status Representation**:
  $$\text{Score String: } \texttt{"\{name\_A\} leads \{W\_A\}–\{W\_B\}"} \quad \text{or} \quad \texttt{"Series tied \{W\_A\}–\{W\_B\}"}$$

#### 5.3.2 Two-Leg Aggregate (European / Cup Format)
In cup competitions (Suomen Cup football / volleyball):
$$\text{Aggregate Score} = (G_{A, \text{Leg 1}} + G_{A, \text{Leg 2}}) - (G_{B, \text{Leg 1}} + G_{B, \text{Leg 2}})$$
If tied after 180 minutes, extra time ($2 \times 15$m) and penalty shootouts decide the winner. *(Note: Away goals rule has been abolished across Finnish and UEFA football).*

---

### 5.4 Top Scorers & Statistical Leaderboards

Statistical leaderboards sort individual achievements across divisions:
- **Floorball**: Sorted by Total Points ($M+S$), then Goals ($M$), then fewer matches played, then fewer penalty minutes ($PIM$).
- **Basketball**: Sorted by Points Per Game ($PPG$), then Total Points, then Field Goal Percentage ($FG\%$).
- **Football**: Sorted by Goals ($G$), then fewer penalty kick goals, then fewer matches played.
- **Volleyball**: Sorted by Attack Kills, then Kill Blocks, then Aces.

---

## 6. Comprehensive View Specification Matrix

The table below catalogs all user-facing views across the monastery suite, specifying data availability, calculation location, and presentation widgets.

### 6.1 View Capability Matrix

| View / Component | Sub-View or Module | Football (SPL) | Floorball (SSBL) | Basketball (Basket.fi) | Volleyball (Lentis) | Calculation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Matchday Center** | `HeroScoreStrip` | ✅ Goals | ✅ Goals | ✅ Points | ✅ Sets Won (Points sub) | Native Torneopal (`fs_A`, `fs_B`) |
| | `PeriodBreakdownWidget`| ✅ 2 Halves | ✅ 3 Periods + OT/RL | ✅ 4 Quarters + OT | ✅ Sets 1–5 (25p/15p) | Dynamic grid per sport |
| | `GoalkeeperBattleCard` | 🟡 Top Leagues | ✅ Native (Save%)| ❌ N/A | 🟡 DataVolley Digs | Client Formula ($S\%$, 0-shot guard) |
| | `SpecialTeamsCard` | ❌ N/A | ✅ YV% & AV% | ❌ N/A | ❌ N/A | Client Aggregation from events |
| | `FoulsBonusTracker` | ❌ N/A | ❌ N/A | ✅ Live Fouls / Bonus| ❌ N/A | Quarter Foul Accumulator ($\ge 5$) |
| | `UnifiedTimeline` | ✅ Goals/Cards/Subs | ✅ Goals/PIM/Saves | ✅ Runs/Fouls/TOs | ✅ Points/Rotations/TOs| Normalized `UnifiedMatchEvent` |
| | `CommonOpponents` | ✅ V/T/H Matrix | ✅ V/T/H Matrix | ✅ V/H Matrix | ✅ V/H Matrix | Pairwise intersection algorithm |
| | `BriefingExportDrawer` | ✅ WhatsApp/MD | ✅ WhatsApp/MD | ✅ WhatsApp/MD | ✅ WhatsApp/MD | Token leak regex boundary oracle |
| **Team Profile** | `FormRadar` | ✅ 5-Match W/D/L | ✅ 5-Match W/OT/L | ✅ 5-Match W/L | ✅ 5-Match W/L | Rolling sequence extraction |
| | `PeriodDominanceChart`| ✅ H1 vs H2 | ✅ P1, P2, P3 | ✅ Q1, Q2, Q3, Q4 | ✅ Sets 1–5 | Period scoring share ($D_p$) |
| | `HomeAwaySplits` | ✅ Home/Away PPG | ✅ Home/Away PPG | ✅ Home/Away PPG | ✅ Home/Away Set Ratio| Standings table split parsing |
| | `DisciplineSummary` | ✅ Card Points | ✅ Total PIM & Class| ✅ Foul Count | ✅ Card Sanctions | Federation disciplinary formulas|
| | `SquadRosterExplorer` | ✅ Starters/Subs | ✅ Lines/Goalies | ✅ Roster & Birthyears | ✅ Starters & Libero | Lineups array mapping |
| **Player Leaderboard** | `TopScorersTable` | ✅ Goals | ✅ Goals + Assists | ✅ Points & PPG | ✅ Kills / Aces | Leaderboard aggregation |
| | `GoalkeeperWall` | 🟡 Clean Sheets | ✅ Save% (T%) | ❌ N/A | ❌ N/A | Save percentage ranking |
| | `DisciplinaryWall` | ✅ Red/Yellow cards| ✅ PIM Leaders | ✅ Foul-Out Leaders | 🟡 Sanction cards | Penalty summation |
| **Tournament / Cup** | `MultiDivisionTable` | ✅ 3-1-0 Standings | ✅ 3-2-1-0 Standings | ✅ 2-0 Standings | ✅ FIVB 3-2-1-0 Table | Points formula verification |
| | `TiebreakExplainer` | ✅ H2H Goal Diff | ✅ H2H Diff | ✅ H2H Diff | ✅ Set / Point Quot | Step-by-step tiebreak trace |
| | `PlayoffBracketTree` | ✅ Knockout Tree | ✅ Best-of-N Series | ✅ Best-of-N Series | ✅ Best-of-N Series | Bracket state traversal |

*Legend: ✅ Fully Supported Native/Calculated | 🟡 Supported in Top Leagues / DataVolley Only | ❌ Not Applicable to Sport*

---

### 6.2 Nova Design Tokens & Fluid Typography Standards

In conformance with **Section 7 of Global Antigravity Rules**, all multi-sport UI views are materialized using Nova liquid glassmorphic design tokens and fluid typography formulas.

#### 6.2.1 Fluid Typography Clamps (Responsive Without Breakpoints)
```css
--nv-text-xs:    clamp(0.694rem, 0.65rem + 0.22vw, 0.8rem);
--nv-text-sm:    clamp(0.833rem, 0.78rem + 0.27vw, 0.96rem);
--nv-text-base:  clamp(1rem, 0.93rem + 0.33vw, 1.2rem);
--nv-text-lg:    clamp(1.2rem, 1.1rem + 0.45vw, 1.5rem);
--nv-text-xl:    clamp(1.44rem, 1.3rem + 0.63vw, 1.875rem);
--nv-text-2xl:   clamp(1.728rem, 1.53rem + 0.89vw, 2.34rem);
--nv-text-3xl:   clamp(2.074rem, 1.79rem + 1.27vw, 2.93rem);
--nv-text-hero:  clamp(2.488rem, 2.09rem + 1.78vw, 3.66rem);
```

#### 6.2.2 Semantic Glassmorphism & Color Tokens
- `bg-surface-glass`: `rgba(15, 23, 42, 0.75)` with `backdrop-blur-xl` and `border border-white/10`.
- `color-win`: `#10B981` (`text-semantic-green`, emerald glow).
- `color-draw`: `#F59E0B` (`text-accent`, amber glow).
- `color-loss`: `#EF4444` (`text-semantic-red`, crimson glow).
- `color-bonus`: `#8B5CF6` (`text-purple-400`, violet highlight for basketball 5-foul bonus).

---

### 6.3 Post-Match WhatsApp Briefing Generation & Zero-Leak Sentinel

Coaches and parents rely on instant 1-tap WhatsApp briefing generation. Dynamic string templating introduces acute risks of leaking unparsed placeholders or undefined values.

#### 6.3.1 Canonical Briefing Templates

##### Football Post-Match Briefing:
```text
⚽ *OTTELURAPORTTI (Jalkapallo)*
━━━━━━━━━━━━━━━━━━━━
🏆 *P13 Kolmonen (Lohko 4)*
🆚 *HJK Sininen* 3 – 2 *KäPa*
📊 *Puoliaikatulos:* HT 1–1
📍 *Pelipaikka:* Töölön Pallokenttä (05.09.2026 klo 13:00)

⚽ *MAALIT:*
• 14' 1-0 M. Virtanen
• 32' 1-1 KäPa
• 48' 2-1 E. Korhonen
• 61' 3-1 M. Virtanen
• 68' 3-2 KäPa

━━━━━━━━━━━━━━━━━━━━
🔗 https://football-stats.pages.dev/match/4106880
```

##### Floorball Post-Match Briefing:
```text
🏑 *OTTELURAPORTTI (Salibandy)*
━━━━━━━━━━━━━━━━━━━━
🏆 *F-liiga miehet*
🆚 *Westend Indians* 5 – 4 *EräViikingit* (vl.)
📊 *Erät:* 1. erä 0–0, 2. erä 1–3, 3. erä 3–1, RL 4–2
📍 *Pelipaikka:* Otahalli Espoo

⭐ *PISTEPÖRSSI:*
• A. Hyrkkö (Indians): 2+1=3p
• N. Tallgren (Indians): 1+2=3p

🧤 *MAALIVAHDIT:*
• Indians: R. Tuulensuu (17 torjuntaa, T% 81.0%)
• EräViikingit: V. Kosonen (21 torjuntaa, T% 80.8%)
━━━━━━━━━━━━━━━━━━━━
🔗 https://floorball-stats.pages.dev/match/868865
```

##### Basketball Post-Match Briefing:
```text
🏀 *OTTELURAPORTTI (Koripallo)*
━━━━━━━━━━━━━━━━━━━━
🏆 *Korisliiga*
🆚 *Tapiolan Honka* 80 – 74 *Kobrat*
📊 *Neljännekset:* Q1 21–18, Q2 18–20, Q3 27–14, Q4 14–22
📍 *Pelipaikka:* Lapuan urheilutalo

⭐ *PARHAAT PISTEMIEHET:*
• G. Elliott (Honka): 24 pts (3x 3p, 6x 2p, 3x 1p)
• A. Peltonen (Kobrat): 18 pts
━━━━━━━━━━━━━━━━━━━━
🔗 https://basketball-stats.pages.dev/match/968705
```

##### Volleyball Post-Match Briefing:
```text
🏐 *OTTELURAPORTTI (Lentopallo)*
━━━━━━━━━━━━━━━━━━━━
🏆 *Miesten 1-sarja*
🆚 *Sampo* 3 – 1 *Isku-Veikot*
📊 *Erät:* 25–22, 25–18, 23–25, 25–22
📈 *Eräsuhde:* 3–1 (Pisteet: 98–87)
📍 *Pelipaikka:* Pielaveden liikuntahalli
━━━━━━━━━━━━━━━━━━━━
🔗 https://volleyball-stats.pages.dev/match/738046
```

---

#### 6.3.2 Token Leak Hazards & Remediation Matrix

| Leaked Artifact | Root Cause | Observable Defect in UI / WhatsApp | Remediation & Defensive Fallback |
| :--- | :--- | :--- | :--- |
| `undefined` | Accessing optional property without nullish coalescing | `Klo undefined`, `Valmentaja: undefined` | Safe accessor: `match.time ?? '12:00'` |
| `null` | Stringifying API null values | `Pisteet: null` | Fallback guard: `val ?? '0'` |
| `NaN` | Math on undefined inputs: `parseInt(undefined)` | `T% NaN%`, `Pisteet: NaN` | Number guard: `Number.isFinite(n) ? n : 0` |
| `[object Object]` | Direct interpolation of composite object | `Tulos: [object Object]` | Property extraction: `match.score.formatted` |
| `[PVM]` | Unreplaced date placeholder | `Seuraava peli: [PVM]` | Date formatter or sentence omission |
| `[SYÖTÄ TULOS]` | Unfilled template placeholder | `päättyi [SYÖTÄ TULOS]!` | Status check guard: only format played matches |

---

#### 6.3.3 Word Boundary Safety Oracle (The `\bnull\b` Rule)

> **CRITICAL VERIFICATION INVARIANT (MATH-10)**:  
> Automated test suites and production export sentinels must NOT perform naive substring checks for `"null"`. Naive substring search flags valid, legitimate Finnish and Swedish text, creating severe false positives:
> - **Finnish**: `"Ottelu on peruttu ja annulloitu liiton toimesta."` contains substring `"null"`.
> - **Swedish**: `"Matchen är annullerad enligt förbundets beslut."` contains substring `"null"`.

##### The Authoritative Sanitization Regex:
```typescript
export const TOKEN_LEAK_REGEX =
  /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;

export function assertZeroTokenLeaks(text: string): void {
  const match = text.match(TOKEN_LEAK_REGEX);
  if (match) {
    throw new Error(
      `Token leak violation: Detected illegal token "${match[0]}" in briefing export:\n${text}`
    );
  }
}
```

##### Defensive Safe String Sanitizer:
```typescript
export function sanitizeBriefingField(val: unknown, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number' && !Number.isFinite(val)) return fallback;
  if (typeof val === 'object') return fallback;
  const str = String(val).trim();
  if (
    str === 'undefined' ||
    str === 'null' ||
    str === 'NaN' ||
    str === '[PVM]' ||
    str === '[SYÖTÄ TULOS]'
  ) {
    return fallback;
  }
  return str;
}
```

---

## 7. Mathematical Invariants Summary & Verification Checklist

Before reporting completion or promoting any multi-sport code change, the following invariants must be verified:

- [x] **MATH-01 (Football Score Invariant)**: In any completed football fixture, the final score must be greater than or equal to the half-time score:
  $$fs_A \ge hts_A \quad \text{and} \quad fs_B \ge hts_B$$
- [x] **MATH-02 (Football Standings Formula)**: Standings points must strictly satisfy:
  $$\text{Points} = (\text{Won} \times 3) + (\text{Drawn} \times 1)$$
- [x] **MATH-03 (Floorball Period Sum Invariant)**: The sum of period goals must equal the regulation score:
  $$p1s + p2s + p3s \equiv es$$
- [x] **MATH-04 (Goalkeeper Save Percentage Zero-Shot Guard)**: When $S + G_C = 0$, save percentage returns strictly:
  $$S\% \equiv 100.0\% \quad (\text{Never NaN or null})$$
- [x] **MATH-05 (Basketball Quarter Sum & Zero-Draw Invariant)**: 4-Quarter summation equals scoreboard final score:
  $$Q_1 + Q_2 + Q_3 + Q_4 + OT \equiv FS \quad \text{and} \quad FS_A \neq FS_B$$
- [x] **MATH-06 (Basketball 5-Team-Foul Bonus Trigger)**: Any quarter where team fouls reach $\ge 5$ activates opponent bonus free throws:
  $$\text{Bonus Active} \iff \text{team\_fouls} \ge 5$$
- [x] **MATH-07 (Volleyball Standard Sets Deuce Margin)**: Sets 1–4 require minimum 25 points and minimum 2-point margin:
  $$\text{Set Winner Score} \ge 25 \quad \text{and} \quad \Delta \ge 2 \quad (\text{If loser} \ge 24, \Delta \equiv 2)$$
- [x] **MATH-08 (Volleyball Deciding 5th Set Target)**: Set 5 target is strictly 15 points (must win by 2):
  $$\text{Set 5 Winner Score} \ge 15 \quad \text{and} \quad \Delta \ge 2$$
- [x] **MATH-09 (Volleyball Asymmetric Standings Points)**: Match points follow the FIVB distribution:
  $$3\text{–}0 \text{ or } 3\text{–}1 \implies 3\text{ pts / } 0\text{ pts}; \quad 3\text{–}2 \implies 2\text{ pts / } 1\text{ pt}$$
- [x] **MATH-10 (WhatsApp Zero-Token-Leak Invariant)**: Briefing exports match zero occurrences of `TOKEN_LEAK_REGEX` with `\bnull\b` word boundary protection:
  $$\texttt{TOKEN\_LEAK\_REGEX.test(briefingText)} \equiv \text{false}$$

---
*Authored by Teamwork Swarm Agent (`worker_doc_matrix`) | Published in `docs/matrix/cross-sport-calculation-matrix.md`*
