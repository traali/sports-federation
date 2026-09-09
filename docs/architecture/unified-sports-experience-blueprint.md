# 🏆 Unified Sports Experience Blueprint: "Same to All" Architecture (R3)
**Canonical Architectural Standard for Finnish Youth & Amateur Sports Monasteries**  
**Version:** 1.1.0  
**Target Systems:** Football (Palloliitto SPL), Floorball (Salibandyliitto SSBL), Basketball (Basket.fi), Volleyball (Lentopalloliitto)  
**Host Repositories:** `football-stats`, `floorball-stats`, `basketball-stats`, `volleyball-stats`, `pelipaiva`  
**Governance Standard:** Monastic Congregation Canons (`contracts/index.ts` v1.0.0 ➔ v1.1.0)  
**Status:** Authoritative Architectural Standard  

---

## 1. Executive Summary & Design Philosophy

### 1.1 The "Same to All" Vision
Finnish amateur and youth sports communities are powered by over 100,000 volunteer team managers, coaches, and parents. On any given Saturday across the Uusimaa and Helsinki metropolitan area, a single family may coordinate a morning P13 football match in Töölö, an afternoon floorball fixture in Otahalli, a sister's basketball game in Tapiola, and an evening volleyball set in Vantaa. 

Historically, each sport existed within an isolated technical silo:
- **Football (`football-stats`)** pioneered rich scouting analytics, common opponent comparison matrices, and tactical dossier exports.
- **Floorball (`floorball-stats`)** built real-time 3-period momentum tracking, goalkeeper save percentage algorithms, and special teams (powerplay / penalty kill) analytics.
- **Basketball (`basketball-stats`)** and **Volleyball (`volleyball-stats`)** operated with minimal dashboards despite having rich, granular data streams from their federations (4-quarter scoring, team foul bonus thresholds, 5-set deuce mechanics, set and point quotients).

The **"Same to All"** architectural blueprint establishes complete parity across all four sports. Regardless of whether a user opens a match card for football, floorball, basketball, or volleyball, they are met with an identical, publication-grade digital experience:
1. **Self-service onboarding** via any association URL or Torneopal competition ID.
2. **Unified Nova liquid glassmorphic Match Center** with responsive Bento grid layouts, tactile spring physics, and fluid typography.
3. **Deep, sport-polymorphic widgets** that adapt seamlessly to the mathematical rules of the discipline (halves, periods, quarters, sets).
4. **Complete team and player statistics** with eligibility tracking and efficiency analytics.
5. **1-Tap WhatsApp briefing generation** guaranteed against token leaks (`undefined`, `null`, `NaN`) through a mathematically verified word-boundary regex oracle.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    THE "SAME TO ALL" ARCHITECTURAL PILLARS                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. 🌐 UNIVERSAL INGESTION   Parse any link: SPL, SSBL, Basket.fi, Torneopal. │
│ 2. 📜 SHARED CONTRACT (v1.1) Non-breaking extension of Canonical Contracts. │
│ 3. 💎 NOVA DESIGN SUITE     Liquid glassmorphism, clamp font, spring motion. │
│ 4. 🧮 POLYMORPHIC RULES     SportScoringStrategy registry for exact math.    │
│ 5. 📱 1-TAP BRIEFING ENGINE Leak-free WhatsApp dossiers for team managers.   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Core Architectural Tenets

1. **Parity of Experience (No Second-Class Sports):**  
   Every sport receives first-class treatment. Basketball and volleyball feature the same visual richness, common opponent matrices, roster exploration, and WhatsApp briefing capabilities originally developed for football and floorball.

2. **Sovereignty Without Divergence:**  
   Each sport application (`football-stats`, `floorball-stats`, etc.) remains an independently deployable sovereign monastery hosted on Cloudflare Pages. However, all monasteries share a single unified data schema (`UnifiedMatchDetail v1.1.0`), standard UI component specifications, and zero-leak string generation oracles.

3. **Black-Box Protocol Decoupling:**  
   The core matchday hub (`pelipaiva`) communicates with sport satellites via deep-link parameters (`CrossRepoQueryContract`) and embedded drawer sheets (`SatelliteEmbedDrawer`). Satellites expose standardized REST/HAR adapter layers that normalize disparate Torneopal payloads into the canonical schema without modifying backend endpoints.

4. **Zero-Defect Information Delivery:**  
   Coaches and parents rely on generated match previews and recaps for rapid team communication. A single leaked `undefined` or `null` undermines user confidence. Sanitization is not left to ad-hoc template guards; it is enforced by a mathematical boundary oracle at the engine level.

---

## 2. Shared Data Contract: `UnifiedMatchDetail v1.1.0`

### 2.1 Canonical Contracts Non-Breaking Evolution
The governance repository (`c:\compdev\contracts\index.ts`) enforces strict Semantic Versioning rules:
1. **Semantic Versioning:** Major.Minor.Patch.
2. **Backward Compatibility Invariant:** All newly added fields in minor/patch versions **MUST** be optional (`?`).
3. **Immutability Invariant:** Existing fields, keys, and types defined in Canonical Contracts v1.0.0 (`MatchdayContextContract`, `ParkingRiskContract`, `SportStatsContract`, `CrossRepoQueryContract`) **CANNOT** be mutated or removed.

`UnifiedMatchDetail v1.1.0` extends the Canonical Contracts ecosystem by providing the shared models required for multi-sport match centers, rosters, tournaments, and scoring engines.

---

### 2.2 Formal TypeScript Contract Definitions

```typescript
/**
 * CANONICAL SHARED CONTRACTS v1.1.0
 * Unified Multi-Sport Model Specification
 * 
 * Extends Canonical Contracts v1.0.0 without breaking changes.
 */

export const CONTRACT_VERSION = '1.1.0' as const;

export type SupportedSport = 'football' | 'floorball' | 'basketball' | 'volleyball' | 'other';

export type AssociationSource = 'palloliitto' | 'salibandy' | 'basket' | 'torneopal' | 'other';

export type MatchStatus = 'upcoming' | 'live' | 'played' | 'cancelled' | 'postponed' | 'forfeited';

/**
 * Standardized score representation accommodating goals, points, and sets.
 */
export interface UnifiedScore {
  home: number;
  away: number;
  scoreType: 'goals' | 'points' | 'sets';
  /** Formatted string, e.g., "3 – 1", "76 – 68", "2 – 2" */
  formatted: string;
  /** End of regulation score if match ended in overtime or shootout */
  regulationHome?: number;
  regulationAway?: number;
  /** Overtime or shootout score if applicable */
  extraTimeHome?: number;
  extraTimeAway?: number;
  shootoutHome?: number;
  shootoutAway?: number;
  /** Overtime / Shootout winner notation, e.g. "ja." or "rl." */
  overtimeType?: 'ot' | 'so' | 'none';
  /** Forfeit / walkover indicator */
  isForfeit?: boolean;
  forfeitedBy?: 'home' | 'away';
}

/**
 * Standardized period-by-period score slice.
 */
export interface UnifiedPeriodScore {
  periodNumber: number;
  /** Localized label, e.g., "1. Puoliaika", "1. Erä", "Q1", "1. Erä (25p)" */
  periodLabel: string;
  scoreHome: number;
  scoreAway: number;
  shotsHome?: number;
  shotsAway?: number;
  durationMinutes?: number;
  isOvertime?: boolean;
  isShootout?: boolean;
  /** Sport-specific metadata (e.g. deuce flag in volleyball, team fouls in basketball) */
  metadata?: {
    isDeuce?: boolean;
    winningMargin?: number;
    teamFoulsHome?: number;
    teamFoulsAway?: number;
  };
}

/**
 * Standardized player profile within lineups and rosters.
 */
export interface UnifiedPlayer {
  playerId: string;
  lineupId?: string;
  teamId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  shirtNumber?: string;
  position?: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'guard' | 'center' | 'setter' | 'libero' | 'spiker' | 'other';
  positionRaw?: string; // "mv", "puolustaja", "lait", "yp", etc.
  isStarter: boolean;
  isCaptain: boolean;
  birthYear?: string | number;
  photoUrl?: string;
  /** Sport-agnostic cumulative match statistics */
  stats: {
    goals?: number;
    assists?: number;
    points?: number; // Total points (basketball) or G+A (floorball)
    fouls?: number;
    warnings?: number; // Yellow cards
    suspensions?: number; // Red cards or 2min/5min penalties
    penaltyMinutes?: number;
    saves?: number;
    conceded?: number;
    savePercentage?: number;
    // Volleyball specific DataVolley stats
    spikeKills?: number;
    killBlocks?: number;
    serviceAces?: number;
  };
}

/**
 * Standardized team entity.
 */
export interface UnifiedTeam {
  id: string;
  name: string;
  clubId?: string;
  crestUrl?: string;
  colorHex?: string;
  role: 'home' | 'away';
  coachName?: string;
  teamFoulsLive?: number;
  timeoutsRemaining?: number;
}

/**
 * Unified chronological match event.
 */
export interface UnifiedEvent {
  id: string;
  type: 'score' | 'penalty' | 'foul' | 'card' | 'save' | 'substitution' | 'timeout' | 'period_boundary';
  period: number;
  /** Time representation: "45'", "14:22", "Q3 04:12", "Set 2" */
  timeString: string;
  minute?: number;
  second?: number;
  team: 'home' | 'away';
  primaryPlayerName: string;
  primaryPlayerId?: string;
  primaryPlayerShirt?: string;
  /** Secondary player (assist in floorball/football, subbed-out player, or fouled player) */
  secondaryPlayerName?: string;
  secondaryPlayerId?: string;
  secondaryPlayerShirt?: string;
  /** Relational key joining assists directly to goals (Torneopal SSBL connected_event_id) */
  connectedEventId?: string;
  scoreAfterHome?: number;
  scoreAfterAway?: number;
  /** Visual badge text: "YV", "AV", "TM", "3p", "2min", "Punainen" */
  badgeText?: string;
  /** Explanatory subtext: "Korkea maila", "Epäurheilijamainen virhe (U2)", "Varoitus (A)" */
  subText?: string;
}

/**
 * Standardized tournament standings row.
 */
export interface UnifiedStandingsRow {
  rank: number;
  teamId: string;
  teamName: string;
  crestUrl?: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  points: number;
  pointsPerMatch: number;
  startingPoints: number; // Carryover points from Spring/Autumn phases
  effectivePoints: number; // points + startingPoints
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  homeSplit?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  awaySplit?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  /** Sport-specific standings criteria */
  sportSpecific?: {
    // Floorball / Volleyball 3-point breakdown
    matchesWon3?: number;
    matchesWon2?: number; // OT/SO win or 3-2 volleyball win
    matchesTiedWon?: number;
    // Volleyball quotients
    setQuotient?: number; // sets won / sets lost
    pointQuotient?: number; // points scored / points conceded
    periodPointsFor?: number;
    periodPointsAgainst?: number;
  };
}

/**
 * Complete Match Detail Model.
 */
export interface UnifiedMatchDetail {
  matchId: string;
  sport: SupportedSport;
  association: AssociationSource;
  competitionId?: string;
  competitionName: string;
  categoryId?: string;
  categoryName: string;
  groupId?: string;
  groupName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  isoStartTime: string; // ISO 8601 with Helsinki offset (EET/EEST)
  venueName: string;
  venueCity?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  fieldNumber?: string;
  homeTeam: UnifiedTeam;
  awayTeam: UnifiedTeam;
  status: MatchStatus;
  score: UnifiedScore;
  periods: UnifiedPeriodScore[];
  events: UnifiedEvent[];
  lineups: {
    home: UnifiedPlayer[];
    away: UnifiedPlayer[];
  };
  officials: {
    referee1?: string;
    referee2?: string;
    assistantReferee1?: string;
    assistantReferee2?: string;
  };
  spectators?: number;
  canonicalUrl: string;
  liveData?: {
    isLive: boolean;
    currentPeriod: number;
    clockTime: string;
  };
}

/**
 * Standardized UnifiedMatch entity (canonical alias for UnifiedMatchDetail).
 */
export type UnifiedMatch = UnifiedMatchDetail;
/**
 * Complete Tournament Model.
 */
export interface UnifiedTournament {
  competitionId: string;
  competitionName: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  season: string;
  standings: UnifiedStandingsRow[];
  matches: UnifiedMatchDetail[];
}
```

---

### 2.3 `SportScoringStrategy` Registry Interface

To decouple the UI from hardcoded sport logic, each sport implements the `ISportScoringStrategy` interface. The registry provides deterministic calculation of period counts, labels, score formatting, and standings tiebreaks.

```typescript
export interface ISportScoringStrategy {
  readonly sport: SupportedSport;
  readonly defaultPeriodCount: number;
  
  /** Generates localized period label */
  getPeriodLabel(periodNumber: number, isOvertime?: boolean, isShootout?: boolean): string;
  
  /** Formats the primary scoreboard display */
  formatScore(score: UnifiedScore): string;
  
  /** Parses raw Torneopal period scores into unified periods */
  parsePeriodScores(rawMatch: Record<string, any>): UnifiedPeriodScore[];
  
  /** Normalizes play-by-play events */
  parseEvents(rawEvents: any[], lineups?: any[]): UnifiedEvent[];
  
  /** Calculates league points for a standings row */
  calculateStandingsPoints(row: Record<string, any>): number;
  
  /** Resolves tiebreaks between two or more teams */
  resolveTiebreak(tiedRows: UnifiedStandingsRow[], h2hMatches: UnifiedMatchDetail[]): UnifiedStandingsRow[];
}
```

#### Strategy Implementations by Sport:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SPORTSCORINGSTRATEGY REGISTRY MATRIX                      │
├─────────────┬───────────┬─────────────┬───────────────────┬──────────────────┤
│ SPORT       │ PERIODS   │ WIN / DRAW  │ TIEBREAK MATH     │ SPECIAL RULES    │
├─────────────┼───────────┼─────────────┼───────────────────┼──────────────────┤
│ Football    │ 2 Halves  │ 3 / 1 / 0   │ H2H Pts ➔ H2H GD  │ Extra time in    │
│             │ (45m/35m) │             │ ➔ H2H GF ➔ Net GD │ cup knockout.    │
├─────────────┼───────────┼─────────────┼───────────────────┼──────────────────┤
│ Floorball   │ 3 Periods │ 3 / 2 / 1/ 0│ Total Pts ➔ Pts   │ 3-point system:  │
│             │ (15m/20m) │ (Reg/OT/L)  │ in Reg ➔ Net GD   │ OT win = 2 pts.  │
├─────────────┼───────────┼─────────────┼───────────────────┼──────────────────┤
│ Basketball  │ 4 Quarters│ 2 / 0       │ H2H Record        │ No ties allowed; │
│             │ (10m)     │ (No ties)   │ ➔ Point Diff      │ 5 fouls = bonus. │
├─────────────┼───────────┼─────────────┼───────────────────┼──────────────────┤
│ Volleyball  │ Best of 5 │ 3 / 2 / 1/ 0│ Total Pts ➔ Wins  │ 25p / 15p sets.  │
│             │ Sets      │ (3-0,1 /3-2)│ ➔ Set/Pt Quotient │ Win by 2 margin. │
└─────────────┴───────────┴─────────────┴───────────────────┴──────────────────┘
```

1. **Football Scoring Strategy (`FootballScoringStrategy`):**
   - Structure: 2 halves (45m regulation for adults; 35m / 30m for youth).
   - Points rule: Win = 3 points, Draw = 1 point, Loss = 0 points.
   - Tiebreak sequence (SPL §15): (1) H2H points, (2) H2H goal difference, (3) H2H goals scored, (4) Overall goal difference, (5) Overall goals scored.

2. **Floorball Scoring Strategy (`FloorballScoringStrategy`):**
   - Structure: 3 periods (15m or 20m) + sudden-death Overtime (P4) + Shootout (P5).
   - Points rule (3-point system): Regulation Win = 3 pts; Overtime/Shootout Win = 2 pts; Overtime/Shootout Loss = 1 pt; Regulation Loss = 0 pts.
   - Goalkeeper Save % Formula (with zero-shot guard):
     $$\text{Save \%} = \begin{cases} \frac{\text{saves}}{\text{saves} + \text{conceded}} \times 100 & \text{if } (\text{saves} + \text{conceded}) > 0 \\ 100.0\% & \text{if zero shots faced} \end{cases}$$
   - Special Teams Formulas:
     $$\text{YV\%} = \frac{\text{Powerplay Goals}}{\text{Opponent Penalties}} \times 100, \quad \text{AV\%} = \frac{\text{Own Penalties} - \text{Shorthanded Goals Allowed}}{\text{Own Penalties}} \times 100$$

3. **Basketball Scoring Strategy (`BasketballScoringStrategy`):**
   - Structure: 4 quarters (10m each) + 5m Overtime periods.
   - Points rule: Win = 2 points, Loss = 0 points. Ties are impossible in official basketball.
   - Team Foul Accumulator: 5 team fouls in a single quarter triggers automatic 2-shot bonus free throws.
   - Score Grammar Reconstruction: Parses `events` where `code === 'maali'` and `description === "{points} {s_A}-{s_B}"` (e.g. `"3 0-5"`, `"2 10-8"`, `"1 6-8"`) to compute exact 1pt / 2pt / 3pt box scores.

4. **Volleyball Scoring Strategy (`VolleyballScoringStrategy`):**
   - Structure: Best of 5 sets. Sets 1–4 to 25 points; Set 5 (tiebreak) to 15 points.
   - Deuce Rule: Every set requires a minimum 2-point margin (e.g. 27–25, 16–14).
   - Score Interpretation: Final score represents **Sets Won** (e.g., `3 – 1`, `3 – 2`).
   - Standings Points (FIVB / Lentopalloliitto 3-point system):
     - 3–0 or 3–1 win: Winner = 3 pts, Loser = 0 pts.
     - 3–2 win: Winner = 2 pts, Loser = 1 pt.
   - Standings Quotients:
     $$\text{Set Quotient (Eräsuhde)} = \frac{\text{Sets Won}}{\text{Sets Lost}} = \frac{\text{goals\_for}}{\text{goals\_against}}$$
     $$\text{Point Quotient (Pistesuhde)} = \frac{\text{Rally Points Scored}}{\text{Rally Points Conceded}} = \frac{\text{period\_points\_for}}{\text{period\_points\_against}}$$

---

## 3. Self-Service Team & Tournament Onboarding Pipeline

### 3.1 Universal URL Parser & Taxonomy

Coaches, team managers, and parents paste match or team links from WhatsApp chats and federation websites. The onboarding pipeline normalizes these arbitrary URLs into canonical identifiers.

```
Incoming URL / Text Input
          │
          ▼
┌────────────────────────────────────────┐
│         normalizeUrlString()           │  Strip angle brackets, trailing slashes,
│                                        │  whitespace, ensure https:// protocol
└────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────┐
│         URL & Host Evaluation          │
└────────────────────────────────────────┘
          │
   ┌──────┴──────────────────────────┬───────────────────────────────┐
   ▼                                 ▼                               ▼
[Federation SPA Portals]   [Torneopal *.torneopal.fi]     [Cup Tournament Domains]
• tulospalvelu.palloliitto • {subdomain}.torneopal.fi     • espooliikkuutournament.fi
• tulospalvelu.salibandy   • Generic taso/joukkue.php     • Custom tournament portals
• tulospalvelu.basket.fi   • widget.php embed scripts     • vierumaki-cup.fi
• tulospalvelu.lentopallo            │                               │
   │                                 │                               │
   ▼                                 ▼                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Inferred Sport & Association Enum                 │
│      (football, floorball, basketball, volleyball, other)          │
└────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Canonical Extracted Request                     │
│    { sport, association, teamId, matchId, competitionId, host }   │
└────────────────────────────────────────────────────────────────────┘
```

#### Supported URL Grammar & Extraction Rules:

```typescript
export interface ParsedSportsUrl {
  sport: SupportedSport;
  association: AssociationSource;
  entityType: 'team' | 'match' | 'tournament' | 'unknown';
  teamId?: string;
  matchId?: string;
  competitionId?: string;
  categoryId?: string;
  groupId?: string;
  subdomain?: string;
  canonicalUrl: string;
}

export function parseSportsAssociationUrl(rawInput: string): ParsedSportsUrl {
  const clean = rawInput.trim().replace(/^<|>$/g, '');
  const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  // 1. Palloliitto SPL (Football)
  if (host === 'tulospalvelu.palloliitto.fi') {
    const teamMatch = path.match(/\/team\/(\d+)/);
    const matchMatch = path.match(/\/match\/(\d+)/);
    return {
      sport: 'football',
      association: 'palloliitto',
      entityType: teamMatch ? 'team' : matchMatch ? 'match' : 'tournament',
      teamId: teamMatch?.[1],
      matchId: matchMatch?.[1],
      canonicalUrl: url.href
    };
  }

  // 2. Salibandyliitto SSBL (Floorball)
  if (host === 'tulospalvelu.salibandy.fi') {
    const teamMatch = path.match(/\/team\/(\d+)/);
    const matchMatch = path.match(/\/match\/(\d+)/);
    return {
      sport: 'floorball',
      association: 'salibandy',
      entityType: teamMatch ? 'team' : matchMatch ? 'match' : 'tournament',
      teamId: teamMatch?.[1],
      matchId: matchMatch?.[1],
      canonicalUrl: url.href
    };
  }

  // 3. Basket.fi (Basketball)
  if (host === 'tulospalvelu.basket.fi' || host === 'basket.fi') {
    const teamMatch = path.match(/\/team\/(\d+)/) || url.searchParams.get('team_id');
    const matchMatch = path.match(/\/match\/(\d+)/) || url.searchParams.get('match_id');
    const teamId = typeof teamMatch === 'string' ? teamMatch : teamMatch?.[1];
    const matchId = typeof matchMatch === 'string' ? matchMatch : matchMatch?.[1];
    return {
      sport: 'basketball',
      association: 'basket',
      entityType: teamId ? 'team' : matchId ? 'match' : 'tournament',
      teamId: teamId || undefined,
      matchId: matchId || undefined,
      canonicalUrl: url.href
    };
  }

  // 4. Lentopalloliitto (Volleyball)
  if (host === 'tulospalvelu.lentopallo.fi') {
    const teamMatch = path.match(/\/team\/(\d+)/);
    const matchMatch = path.match(/\/match\/(\d+)/);
    return {
      sport: 'volleyball',
      association: 'torneopal',
      entityType: teamMatch ? 'team' : matchMatch ? 'match' : 'tournament',
      teamId: teamMatch?.[1],
      matchId: matchMatch?.[1],
      canonicalUrl: url.href
    };
  }

  // 5. Generic Torneopal (*.torneopal.fi or *.torneopal.com)
  if (host.endsWith('.torneopal.fi') || host.endsWith('.torneopal.com')) {
    const sub = host.split('.')[0];
    const sport = inferSportFromSubdomain(sub);
    const teamId = url.searchParams.get('joukkue') || url.searchParams.get('teamid') || undefined;
    const matchId = url.searchParams.get('ottelu') || url.searchParams.get('matchid') || undefined;
    return {
      sport,
      association: 'torneopal',
      entityType: teamId ? 'team' : matchId ? 'match' : 'tournament',
      teamId,
      matchId,
      competitionId: url.searchParams.get('turnaus') || undefined,
      categoryId: url.searchParams.get('sarja') || undefined,
      subdomain: sub,
      canonicalUrl: url.href
    };
  }

  // 6. Custom Cup Domain fallback
  return {
    sport: 'other',
    association: 'other',
    entityType: 'unknown',
    canonicalUrl: url.href
  };
}

function inferSportFromSubdomain(sub: string): SupportedSport {
  const lower = sub.toLowerCase();
  if (/lentopallo|volley|lentis/.test(lower)) return 'volleyball';
  if (/salibandy|sb|floorball/.test(lower)) return 'floorball';
  if (/spl|palloliitto|futis|jalkapallo/.test(lower)) return 'football';
  if (/koripallo|basket|esli/.test(lower)) return 'basketball';
  return 'other';
}
```

---

### 3.2 Torneopal Widget Ingestion & CORS Proxy Architecture

Non-federation cup tournaments (e.g., Vierumäki Cup, Power Cup, Hesa Cup) do not provide open CORS headers on their REST API. Instead, they provide embedded JavaScript schedule widgets:
`https://{subdomain}.torneopal.fi/taso/widget.php?teamid={id}&widget=schedule`

These endpoints return legacy `document.write("...html...")` strings. Direct browser `fetch()` calls fail due to cross-origin resource sharing (CORS) blocks.

#### The Edge Worker Proxy Architecture:
A lightweight Cloudflare Worker (`taso-proxy.sakkoja.workers.dev`) acts as a secure edge proxy:

```
Browser Client (PWA)
       │
       ▼
Cloudflare Edge Proxy (taso-proxy.workers.dev)
       │  • Strips browser origin
       │  • Injects authenticated Accept: json/{key} & Referer
       │  • Queries upstream Torneopal origin
       │  • Unescapes document.write payloads
       ▼
Upstream Torneopal Origin (*.torneopal.fi)
```

```typescript
/**
 * Unescapes raw document.write payloads into clean HTML.
 * Handles both single and double quotes with non-greedy extraction.
 */
export function unescapeWidgetScript(scriptContent: string): string {
  const match = scriptContent.match(/document\.write\s*\(\s*(['"])([\s\S]*?)\1\s*\)/i);
  if (!match || !match[2]) {
    throw new Error('Invalid Torneopal widget script structure');
  }
  return match[2]
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\//g, '/')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t');
}
```

#### Sandboxed Iframe Fallback:
If the Cloudflare Worker proxy is unavailable (e.g. offline dev or rate limit), the client executes a zero-network sandboxed iframe fallback:
1. Creates an off-screen `HTMLIFrameElement` with `sandbox="allow-scripts allow-same-origin"`.
2. Injects `<script src="${widgetUrl}"></script>`.
3. Listens for `load` event and reads `iframe.contentDocument.body.innerHTML`.
4. Parses the generated `.fixture`, `.scoretable`, and `.standings` tables into `UnifiedMatchDetail` models using DOMParser.

---

## 4. Nova Liquid Glassmorphic Match Center UI Component Suite

### 4.1 Design System Foundation

The Match Center user interface complies strictly with the **Nova Design Protocol (Agentic UI)** specified in §7 of the Global Rules:
- **Agentic-First:** Generative layout composed via semantic tokens.
- **Liquid Glassmorphism:** Layered translucency, 16px backdrop blur, and specular border highlights.
- **Tactile Maximalism:** Spring physics animations (`motion/react`) with spring damping and stiffness.
- **Fluid Typography:** Exact mathematical clamp formulas eliminating layout breakages across mobile, tablet, and desktop viewports.

#### Semantic CSS Tokens & Variables:
```css
:root {
  /* Nova Surfaces & Glass */
  --nv-bg-base: #0a0e17;
  --nv-surface-1: rgba(18, 24, 38, 0.75);
  --nv-surface-2: rgba(28, 38, 58, 0.60);
  --nv-glass-border: rgba(255, 255, 255, 0.12);
  --nv-glass-highlight: rgba(255, 255, 255, 0.05);
  --nv-glass-blur: blur(16px);
  
  /* Semantic Accent Palette */
  --nv-accent-primary: #38bdf8;   /* Sky Blue */
  --nv-accent-success: #10b981;   /* Emerald */
  --nv-accent-warning: #f59e0b;   /* Amber */
  --nv-accent-danger: #ef4444;    /* Crimson */
  --nv-accent-live: #f43f5e;      /* Pulsing Rose */

  /* Mandatory Fluid Clamp Typography (Scale: 1.2 @ 320px ➔ 1.25 @ 1440px) */
  --nv-text-xs:    clamp(0.694rem, 0.65rem + 0.22vw, 0.8rem);
  --nv-text-sm:    clamp(0.833rem, 0.78rem + 0.27vw, 0.96rem);
  --nv-text-base:  clamp(1rem, 0.93rem + 0.33vw, 1.2rem);
  --nv-text-lg:    clamp(1.2rem, 1.1rem + 0.45vw, 1.5rem);
  --nv-text-xl:    clamp(1.44rem, 1.3rem + 0.63vw, 1.875rem);
  --nv-text-2xl:   clamp(1.728rem, 1.53rem + 0.89vw, 2.34rem);
  --nv-text-3xl:   clamp(2.074rem, 1.79rem + 1.27vw, 2.93rem);
  --nv-text-hero:  clamp(2.488rem, 2.09rem + 1.78vw, 3.66rem);
}
```

---

### 4.2 Modular Component Hierarchy

The Match Center is structured as a hierarchical suite of six decoupled components:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UniversalMatchCenter                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 1. AdaptiveScoreStrip                                                 │  │
│  │    • Team Crests & Names         • Live Pulse Indicator               │  │
│  │    • Primary Score (Goals/Pts)   • Status Badges (Played/Walkover/OT) │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 2. PeriodBreakdownWidget                                              │  │
│  │    • Halves (SPL)                • Quarters + Team Fouls (Basket)     │  │
│  │    • 3 Periods + OT/SO (SSBL)    • 5 Sets + Deuce Badges (Volley)     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ 3. SportSpecificBattleCard      │  │ 4. SportSpecificBattleCard       │  │
│  │    • Goalie Saves & Save %      │  │    • Common Opponents Matrix     │  │
│  │    • Special Teams (YV%/AV%)    │  │    • Head-to-Head Form Radar     │  │
│  └─────────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 5. UnifiedEventTimeline                                               │  │
│  │    • Chronological Event Feed with Sport-Specific Glyphs (⚽🏑🏀🏐)    │  │
│  │    • Goal Scorers, Assists, 2min Penalties, Fouls, Cards, Timeouts    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ 6. TeamRosterTable              │  │ 7. PlayerStatsModal              │  │
│  │    • Lineups & Shirt Numbers    │  │    • Player Season History       │  │
│  │    • Starters & Captain Badges  │  │    • Efficiency & Shooting Stats │  │
│  └─────────────────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Component Specifications & TypeScript Contracts:

```typescript
export interface UniversalMatchCenterProps {
  match: UnifiedMatchDetail;
  strategy: ISportScoringStrategy;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  /** Embedded drawer mode for cross-monastery usage */
  isEmbedded?: boolean;
  theme?: 'night-captain' | 'dark-glass';
  className?: string;
}

export interface AdaptiveScoreStripProps {
  match: UnifiedMatchDetail;
  strategy: ISportScoringStrategy;
  /** Callback when user clicks team crest or name */
  onTeamClick?: (teamId: string) => void;
  className?: string;
}

export interface PeriodBreakdownWidgetProps {
  sport: SupportedSport;
  periods: UnifiedPeriodScore[];
  score: UnifiedScore;
  strategy: ISportScoringStrategy;
  className?: string;
}

export interface SportSpecificBattleCardProps {
  match: UnifiedMatchDetail;
  h2hSummary?: {
    totalMatches: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    lastResult?: string;
  };
  commonOpponents?: Array<{
    opponentName: string;
    homeResult: string; // "V 3-1"
    awayResult: string; // "H 0-2"
  }>;
  className?: string;
}

export interface UnifiedEventTimelineProps {
  events: UnifiedEvent[];
  sport: SupportedSport;
  homeTeamName: string;
  awayTeamName: string;
  onPlayerClick?: (playerId: string) => void;
  className?: string;
}

export interface TeamRosterTableProps {
  homeTeam: UnifiedTeam;
  awayTeam: UnifiedTeam;
  lineups: {
    home: UnifiedPlayer[];
    away: UnifiedPlayer[];
  };
  sport: SupportedSport;
  onSelectPlayer: (player: UnifiedPlayer) => void;
  className?: string;
}

export interface PlayerStatsModalProps {
  player: UnifiedPlayer | null;
  sport: SupportedSport;
  isOpen: boolean;
  onClose: () => void;
}
```

1. **`UniversalMatchCenter`**:
   - Master Bento grid container coordinating real-time state.
   - Automatically initializes a 15-second background polling cycle if `status === 'live'`.
   - Manages tab navigation (`Ottelu`, `Tilastot`, `Kokoonpanot`, `Sarjataulukko`, `Ennakko`).

2. **`AdaptiveScoreStrip`**:
   - Liquid glassmorphic hero banner.
   - Dynamic score presentation:
     - Football & Floorball: Prominent goals (`3 : 1`), regulation subtitle if OT.
     - Basketball: High-density total points (`76 : 68`).
     - Volleyball: Sets won (`3 : 1`) with total points badge.
   - Animated live indicator:
     ```tsx
     <motion.span
       className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"
       animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
       transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
     />
     ```

3. **`PeriodBreakdownWidget`**:
   - Dynamically selects grid columns matching the sport:
     - Football: 2 columns (`1. Puoliaika`, `2. Puoliaika`).
     - Floorball: 3 columns (`1. Erä`, `2. Erä`, `3. Erä`) + OT / Shootout pills.
     - Basketball: 4 columns (`Q1`, `Q2`, `Q3`, `Q4`) + Overtime column + Team Foul counters.
     - Volleyball: 5 set columns with points (e.g., `25–22`, `27–25*`) with asterisk denoting deuce extension.

4. **`SportSpecificBattleCard`**:
   - Polymorphic analytics slot:
     - **Floorball**: Head-to-head goalkeeper duel with saves count, shots faced, and save percentage formula. Special teams powerplay (YV%) and penalty kill (AV%) conversion bars.
     - **Basketball**: Quarter foul tracker, 5-foul bonus alerts, and largest scoring run metrics.
     - **Football**: Half-time differential, goal timing distribution, and card tally.
     - **Volleyball**: Set quotient, point quotient, and service ace to error ratio.

5. **`UnifiedEventTimeline`**:
   - Unified chronological feed rendered with tactile spring animations.
   - Color-coded event pills:
     - ⚽ / 🏑 / 🏀 / 🏐 Green border for scores and goals.
     - 🟨 Amber border for yellow cards, personal fouls, or 2min floorball penalties.
     - 🟥 Crimson border for direct red cards or match disqualifications.
     - 🔄 Slate border for substitutions and timeouts.

6. **`PlayerStatsModal` & `TeamRosterTable`**:
   - Comprehensive team roster view with starter/substitute grouping, captain badges, and jersey numbers.
   - Clicking any player launches the `PlayerStatsModal` showing historical match logs, minutes, points, and efficiency.


---

## 5. 1-Tap WhatsApp Briefing Engine

### 5.1 Briefing Use Cases & Pipelines

Team managers and coaches communicate with parent groups via WhatsApp. The Briefing Engine provides instant, high-signal pre-match previews (*Ennakko*) and post-match recaps (*Otteluraportti*).

#### Pre-Match Preview Template (Ennakko):
```
⚽ *OTTELUENNAKKO: {HOME_TEAM} vs {AWAY_TEAM}*
📅 {DATE} klo {TIME} | 📍 {VENUE}
🏆 {COMPETITION} ({CATEGORY})

📊 *SARJATILANNE:*
• {HOME_TEAM}: #{HOME_RANK} ({HOME_POINTS} p, {HOME_MATCHES} ott)
• {AWAY_TEAM}: #{AWAY_RANK} ({AWAY_POINTS} p, {AWAY_MATCHES} ott)

⚔️ *YHTEISET VASTUSTAJAT:*
{COMMON_OPPONENTS_SUMMARY}

🔗 Katso täydet tilastot ja kokoonpanot:
{CANONICAL_URL}
```

#### Post-Match Recap Template (Otteluraportti):
```
🏑 *OTTELURAPORTTI ({SPORT_LOCALIZED})*
━━━━━━━━━━━━━━━━━━━━
🏆 *{COMPETITION}*
🆚 *{HOME_TEAM}* {HOME_SCORE} – {AWAY_SCORE} *{AWAY_TEAM}*
📊 *Erät:* {PERIOD_BREAKDOWN}
📍 *Pelipaikka:* {VENUE} ({DATE} klo {TIME})

⭐ *PISTEPÖRSSI / TEHOT:*
{TOP_SCORERS_LIST}

🧤 *MAALIVAHDIT / TILASTAT:*
{GOALKEEPER_STATS}
━━━━━━━━━━━━━━━━━━━━
🔗 {CANONICAL_URL}
```

---

### 5.2 Zero-Token-Leak Sanitization Architecture

A major defect in automated sports communication is token leakage: interpolation of `undefined`, `null`, `NaN`, `[object Object]`, `[PVM]`, or `[SYÖTÄ TULOS]` into published messages.

#### The Verified Word-Boundary Regex Oracle:
```typescript
export const TOKEN_LEAK_REGEX =
  /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;

export function assertZeroTokenLeaks(text: string): void {
  const match = TOKEN_LEAK_REGEX.exec(text);
  if (match) {
    throw new Error(`CRITICAL_TOKEN_LEAK: Detected unparsed token '${match[0]}' in briefing output.`);
  }
}
```

---

### 5.3 Mathematical & Linguistic Proof of the Word-Boundary Oracle

#### The Problem of False Positives in Scandinavian Languages:
A naive substring search for `"null"` or regex `/null/` triggers catastrophic false positives in official Finnish and Swedish federation correspondence:
1. **Finnish:** `"Ottelu on peruttu ja annulloitu liiton päätöksellä."` (Contains substring `"null"` inside `"annulloitu"`).
2. **Swedish:** `"Matchen är annullerad enligt förbundets beslut."` (Contains substring `"null"` inside `"annullerad"`).
3. **Finnish Legal/Administrative:** `"Sarjapaikan annulliointi vahvistettu."`

#### Mathematical / Automata Proof of Word-Boundary Safety:
Let $\Sigma$ be the Unicode/ASCII alphabet. Standard regex engines define the word character class as:
$$\mathcal{W} = [a\text{-}zA\text{-}Z0\text{-}9\_]$$
The non-word character class is defined as:
$$\mathcal{N} = \Sigma \setminus \mathcal{W} = [\ \wedge\ \text{space, punctuation, start-of-line } (\wedge), \text{end-of-line } (\$)]$$

A word boundary $\b$ exists at string position $i$ if and only if:
$$\b(i) = (\text{char}[i-1] \in \mathcal{W} \land \text{char}[i] \in \mathcal{N}) \lor (\text{char}[i-1] \in \mathcal{N} \land \text{char}[i] \in \mathcal{W})$$

Now consider the pattern `\bnull\b`:
1. **Evaluation against Finnish `"annulloitu"`:**
   - The substring `"null"` begins at index 2 (0-indexed: `a`(0), `n`(1), `n`(2), `u`(3), `l`(4), `l`(5), `o`(6)).
   - At the start of `"null"`: $\text{char}[i-1] = \text{'n'} \in \mathcal{W}$, and $\text{char}[i] = \text{'u'} \in \mathcal{W}$.  
     Because both adjacent characters belong to $\mathcal{W}$, $\b$ evaluates to **FALSE**.
   - At the end of `"null"`: $\text{char}[i-1] = \text{'l'} \in \mathcal{W}$, and $\text{char}[i] = \text{'o'} \in \mathcal{W}$.  
     Because both adjacent characters belong to $\mathcal{W}$, $\b$ evaluates to **FALSE**.
   - **Conclusion:** `\bnull\b` **CANNOT** match `"annulloitu"`. False positive probability = $0.0\%$.

2. **Evaluation against Swedish `"annullerad"`:**
   - At the start of `"null"`: $\text{char}[i-1] = \text{'n'} \in \mathcal{W}$ and $\text{char}[i] = \text{'u'} \in \mathcal{W}$ ➔ $\b$ evaluates to **FALSE**.
   - At the end of `"null"`: $\text{char}[i-1] = \text{'l'} \in \mathcal{W}$ and $\text{char}[i] = \text{'e'} \in \mathcal{W}$ ➔ $\b$ evaluates to **FALSE**.
   - **Conclusion:** `\bnull\b` **CANNOT** match `"annullerad"`. False positive probability = $0.0\%$.

3. **Evaluation against an actual leak `"Tulos: null"`:**
   - At the start of `"null"`: $\text{char}[i-1] = \text{' '} \in \mathcal{N}$ and $\text{char}[i] = \text{'n'} \in \mathcal{W}$ ➔ $\b$ evaluates to **TRUE**.
   - At the end of `"null"`: $\text{char}[i-1] = \text{'l'} \in \mathcal{W}$ and $\text{char}[i] = \$$ (end-of-line $\in \mathcal{N}$) ➔ $\b$ evaluates to **TRUE**.
   - **Conclusion:** `\bnull\b` evaluates to **TRUE** and triggers immediate detection.

#### Regex Oracle Truth Table:
| Input String | `\bnull\b` Match | `\bundefined\b` Match | `\bNaN\b` Match | Oracle Result | Desired Behavior | Verification |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `"Pisteet: null"` | **TRUE** | FALSE | FALSE | **LEAK DETECTED** | Flag defect | ✅ Correct |
| `"Klo undefined"` | FALSE | **TRUE** | FALSE | **LEAK DETECTED** | Flag defect | ✅ Correct |
| `"T% NaN%"` | FALSE | FALSE | **TRUE** | **LEAK DETECTED** | Flag defect | ✅ Correct |
| `"Tulos: [object Object]"`| FALSE | FALSE | FALSE | **LEAK DETECTED** | Flag defect | ✅ Correct |
| `"Peli: [PVM] klo 14"` | FALSE | FALSE | FALSE | **LEAK DETECTED** | Flag defect | ✅ Correct |
| `"Ottelu on annulloitu"` | **FALSE** | FALSE | FALSE | **CLEAN** | Allow valid text | ✅ Correct |
| `"Matchen är annullerad"`| **FALSE** | FALSE | FALSE | **CLEAN** | Allow valid text | ✅ Correct |
| `"Banana NaNook"` | FALSE | FALSE | **FALSE** | **CLEAN** | Allow valid text | ✅ Correct |

---

### 5.4 Production Implementation: Defensive Briefing Builder

```typescript
export class BriefingSanitizer {
  /**
   * Defensive string accessor guaranteeing a valid string without leaks.
   */
  public static safeString(val: unknown, fallback: string = ''): string {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'number') {
      if (!Number.isFinite(val)) return fallback;
      return String(val);
    }
    if (typeof val === 'object') {
      return fallback;
    }
    const str = String(val).trim();
    if (
      str === 'undefined' ||
      str === 'null' ||
      str === 'NaN' ||
      str === '[object Object]' ||
      str === '[PVM]' ||
      str === '[SYÖTÄ TULOS]'
    ) {
      return fallback;
    }
    return str;
  }

  /**
   * Safely formats score numbers.
   */
  public static safeScore(score: unknown): string {
    if (typeof score === 'number' && Number.isFinite(score)) {
      return String(score);
    }
    if (typeof score === 'string' && score.trim() !== '' && !Number.isNaN(Number(score))) {
      return score.trim();
    }
    return '-';
  }

  /**
   * Safely formats save percentages.
   */
  public static safeSavePercentage(saves: unknown, conceded: unknown): string {
    const s = typeof saves === 'number' ? saves : Number(saves);
    const c = typeof conceded === 'number' ? conceded : Number(conceded);
    if (!Number.isFinite(s) || !Number.isFinite(c)) return '100.0%';
    const total = s + c;
    if (total <= 0) return '100.0%';
    return `${((s / total) * 100).toFixed(1)}%`;
  }
}
```

---

### 5.5 Comprehensive Unit Test Specifications for Briefing Sanitization & Oracle

The following executable test specification (runnable via Node test runner or Vitest) validates the zero-token-leak invariant and linguistic false-positive protections:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TOKEN_LEAK_REGEX, assertZeroTokenLeaks, BriefingSanitizer } from './briefingSanitizer.ts';

describe('Briefing Engine Sanitizer & Word-Boundary Oracle Suite', () => {
  describe('TOKEN_LEAK_REGEX & assertZeroTokenLeaks', () => {
    it('MUST catch raw undefined leaks', () => {
      assert.throws(
        () => assertZeroTokenLeaks('Ottelu alkaa klo undefined'),
        /CRITICAL_TOKEN_LEAK.*undefined/
      );
    });

    it('MUST catch raw null leaks', () => {
      assert.throws(
        () => assertZeroTokenLeaks('Tulos: null – 2'),
        /CRITICAL_TOKEN_LEAK.*null/
      );
      assert.throws(
        () => assertZeroTokenLeaks('Pisteet: (null)'),
        /CRITICAL_TOKEN_LEAK.*null/
      );
    });

    it('MUST catch raw NaN leaks', () => {
      assert.throws(
        () => assertZeroTokenLeaks('Torjuntaprosentti: NaN%'),
        /CRITICAL_TOKEN_LEAK.*NaN/
      );
    });

    it('MUST catch raw [object Object] leaks', () => {
      assert.throws(
        () => assertZeroTokenLeaks('Joukkue: [object Object]'),
        /CRITICAL_TOKEN_LEAK.*\[object Object\]/
      );
    });

    it('MUST catch unreplaced template placeholders', () => {
      assert.throws(
        () => assertZeroTokenLeaks('Seuraava peli: [PVM] klo 18:00'),
        /CRITICAL_TOKEN_LEAK.*\[PVM\]/
      );
      assert.throws(
        () => assertZeroTokenLeaks('Ottelu päättyi [SYÖTÄ TULOS]!'),
        /CRITICAL_TOKEN_LEAK.*\[SYÖTÄ TULOS\]/
      );
    });

    it('MUST NOT flag legitimate Finnish words containing substring "null"', () => {
      const finnishText = 'Ottelu on peruttu ja annulloitu liiton päätöksellä.';
      assert.doesNotThrow(() => assertZeroTokenLeaks(finnishText));
      assert.strictEqual(TOKEN_LEAK_REGEX.test(finnishText), false);

      const nounForm = 'Sarjapaikan annulliointi vahvistettu.';
      assert.doesNotThrow(() => assertZeroTokenLeaks(nounForm));
      assert.strictEqual(TOKEN_LEAK_REGEX.test(nounForm), false);
    });

    it('MUST NOT flag legitimate Swedish words containing substring "null"', () => {
      const swedishText = 'Matchen är annullerad enligt förbundets beslut.';
      assert.doesNotThrow(() => assertZeroTokenLeaks(swedishText));
      assert.strictEqual(TOKEN_LEAK_REGEX.test(swedishText), false);
    });

    it('MUST NOT flag words with non-word character boundaries before or after NaN', () => {
      const text = 'Banana NaNook';
      assert.doesNotThrow(() => assertZeroTokenLeaks(text));
      assert.strictEqual(TOKEN_LEAK_REGEX.test(text), false);
    });
  });

  describe('BriefingSanitizer Defensive Accessors', () => {
    it('safely handles null and undefined strings with fallback', () => {
      assert.strictEqual(BriefingSanitizer.safeString(null, 'TBD'), 'TBD');
      assert.strictEqual(BriefingSanitizer.safeString(undefined, 'TBD'), 'TBD');
      assert.strictEqual(BriefingSanitizer.safeString('   ', 'TBD'), '');
      assert.strictEqual(BriefingSanitizer.safeString('Töölö PK', 'TBD'), 'Töölö PK');
    });

    it('filters out literal leak strings', () => {
      assert.strictEqual(BriefingSanitizer.safeString('undefined', 'Ei tiedossa'), 'Ei tiedossa');
      assert.strictEqual(BriefingSanitizer.safeString('null', 'Ei tiedossa'), 'Ei tiedossa');
      assert.strictEqual(BriefingSanitizer.safeString('NaN', '0'), '0');
      assert.strictEqual(BriefingSanitizer.safeString('[object Object]', ''), '');
      assert.strictEqual(BriefingSanitizer.safeString('[PVM]', 'Ilmoitetaan myöhemmin'), 'Ilmoitetaan myöhemmin');
    });

    it('safely formats scores', () => {
      assert.strictEqual(BriefingSanitizer.safeScore(3), '3');
      assert.strictEqual(BriefingSanitizer.safeScore('4'), '4');
      assert.strictEqual(BriefingSanitizer.safeScore(null), '-');
      assert.strictEqual(BriefingSanitizer.safeScore(undefined), '-');
      assert.strictEqual(BriefingSanitizer.safeScore(NaN), '-');
    });

    it('safely formats save percentages with zero-shot division guard', () => {
      assert.strictEqual(BriefingSanitizer.safeSavePercentage(18, 2), '90.0%');
      assert.strictEqual(BriefingSanitizer.safeSavePercentage(0, 0), '100.0%'); // Guarded against 0/0 NaN
      assert.strictEqual(BriefingSanitizer.safeSavePercentage(null, null), '100.0%');
      assert.strictEqual(BriefingSanitizer.safeSavePercentage(undefined, undefined), '100.0%');
    });
  });
});
```

---

## 6. Implementation Roadmap & Migration Guide

### 6.1 Monastic Ecosystem Architecture & Migration Scope

The Finnish Youth Sports Federation ecosystem comprises six sovereign monasteries:
1. `c:\compdev\pelipaiva` (Core matchday PWA hub)
2. `c:\compdev\football-stats` (Palloliitto reference satellite)
3. `c:\compdev\floorball-stats` (Salibandyliitto reference satellite)
4. `c:\compdev\basketball-stats` (Basket.fi satellite)
5. `c:\compdev\volleyball-stats` (Lentopalloliitto satellite)
6. `c:\compdev\Parkkis` (Spatial parking risk intelligence)

The migration to the Unified Architecture follows a phased, zero-regression protocol. At no point during migration are existing canonical contracts v1.0.0 or live client URLs disrupted.

---

### 6.2 Phased Migration Plan

```
Phase 1: Canonical Contract Baseline (v1.1.0)
  │  • Export UnifiedMatchDetail & ISportScoringStrategy in contracts/index.ts
  │  • Execute monastery-visitor validation across all 6 repos
  ▼
Phase 2: Satellite Ingestion Adapters
  │  • football-stats: toUnifiedMatch(details)
  │  • floorball-stats: toUnifiedMatch(salibandyMatch)
  │  • basketball-stats: toUnifiedMatch(korisMatch)
  │  • volleyball-stats: toUnifiedMatch(lentisMatch)
  ▼
Phase 3: Modular Nova UI Component Integration
  │  • Deploy UniversalMatchCenter, AdaptiveScoreStrip, PeriodBreakdownWidget
  │  • Standardize Bento layouts with CSS tokens and clamp typography
  ▼
Phase 4: WhatsApp Briefing Engine & Leak Sentinel
  │  • Deploy BriefingSanitizer & TOKEN_LEAK_REGEX across all monasteries
  │  • Enforce 1-tap clipboard verification gates
  ▼
Phase 5: Golden Test Suite & Parity Attestation
     • Run Playwright real-user black-box golden test suite
     • Verify zero leaks, 100% contract adherence, zero regressions
```

#### Phase 1: Shared Governance & Contract Baseline
- **Action:** Update `contracts/index.ts` to export `CONTRACT_VERSION = '1.1.0'`, `UnifiedMatchDetail`, `UnifiedScore`, `UnifiedPeriodScore`, `UnifiedEvent`, `UnifiedPlayer`, `UnifiedTeam`, `UnifiedStandingsRow`, and `ISportScoringStrategy`.
- **Validation:** Run `node scripts/monastery-visitor.mjs` to ensure all 6 monasteries pass static contract compilation.

#### Phase 2: Ingestion Adapter Layer in Satellites
- **Action:** Add adapter functions without modifying upstream Torneopal fetchers:
  - `football-stats/src/adapters/unifiedAdapter.ts`
  - `floorball-stats/src/adapters/unifiedAdapter.ts`
  - `basketball-stats/src/adapters/unifiedAdapter.ts`
  - `volleyball-stats/src/adapters/unifiedAdapter.ts`
- **Validation:** Assert that `toUnifiedMatch(raw)` produces valid `UnifiedMatchDetail` objects satisfying all contract invariants.

#### Phase 3: Modular Nova UI Component Integration
- **Action:** Deploy the 6 modular UI components into each satellite and `pelipaiva`.
- **Validation:** Spot-check responsive rendering on mobile viewports (`320px`), tablets (`768px`), and desktops (`1440px`). Verify that fluid typography clamp values match Rule §7 formulas exactly.

#### Phase 4: Briefing Engine & Leak Sentinel
- **Action:** Wire `assertZeroTokenLeaks(text)` into the clipboard copy action in `BriefingExportDrawer`.
- **Validation:** Execute unit test suites verifying true positive capture on `undefined`, `null`, `NaN`, `[object Object]` and zero false positives on Finnish `"annulloitu"` and Swedish `"annullerad"`.

#### Phase 5: Supreme Black-Box Golden Verification
- **Action:** Execute the canonical golden test suite:
  ```bash
  npm run test:real-user
  ```
- **Acceptance Gate:** 100% pass rate across all 5 parent/coach user journeys, zero contract drift, zero regressions.

---

### 6.3 Zero-Regression Invariants Checklist

| Invariant | Guarantee | Validation Command |
| :--- | :--- | :--- |
| **CONTRACT-01** | Canonical Contracts v1.0.0 remain 100% backward-compatible. | `node contracts/verify-contracts.mjs` |
| **URL-01** | Existing satellite deep-link routes (`/match/:id`, `/team/:id`) remain functional. | Playwright navigation audit |
| **LEAK-01** | Zero unparsed tokens or placeholders emitted in briefings. | `assertZeroTokenLeaks(output)` |
| **DST-01** | Timestamps adhere to Finnish EET/EEST boundaries without UTC drift. | Date verification suite |
| **ACC-01** | Interactive UI elements meet WCAG 2.2 AA touch target minimums (44px). | Lighthouse / Playwright DOM audit |

---

## 7. Conclusion & Architectural Attestation

The **Unified Sports Experience Blueprint** elevates Finnish youth sports digital infrastructure to publication-grade excellence. By establishing a shared data contract (`UnifiedMatchDetail v1.1.0`), a universal URL onboarding engine, an adaptive Nova liquid glassmorphic UI suite, and a mathematically proven WhatsApp briefing sentinel, all four major sports—Football, Floorball, Basketball, and Volleyball—achieve complete parity while preserving monastic sovereignty.
