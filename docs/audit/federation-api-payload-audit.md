# Finnish Sports Federation API Call & Payload Truth Audit
## Comprehensive Specification for Football (SPL), Floorball (SSBL), Basketball (Basket.fi), and Volleyball (Lentopalloliitto)

> **Document Version**: 1.0.0 (Authoritative Reference)  
> **Audit Date**: September 3, 2026  
> **Author**: R1 Swarm Verification Auditor (`worker_doc_audit`)  
> **Source Evidence Repositories**: `c:\compdev\football-stats`, `c:\compdev\floorball-stats`, `c:\compdev\pelipaiva`, `c:\compdev\basketball-stats`, `c:\compdev\volleyball-stats`  
> **Target Production Platforms**:
> - Football: Suomen Palloliitto (SPL) / Torneopal Taso (`spl.torneopal.net`, `tulospalvelu.palloliitto.fi`)
> - Floorball: Suomen Salibandyliitto (SSBL) / Torneopal Taso (`salibandy-api.torneopal.net`, `tulospalvelu.salibandy.fi`)
> - Basketball: Suomen Koripalloliitto / Basket.fi (`koripallo-api.torneopal.net`, `tulospalvelu.basket.fi`, FIBA LiveStats)
> - Volleyball: Suomen Lentopalloliitto (`lentopallo-api.torneopal.net`, `tulospalvelu.lentopallo.fi`, DataVolley, Centrifugo)
> - Tournaments & Independent Cups: Torneopal Tupa (`tupa.api.torneopal.com`, `*.torneopal.fi`, `widget.php`)

---

## Table of Contents

1. [Executive Summary & Federation API Landscape](#1-executive-summary--federation-api-landscape)
   - 1.1 Finnish Sports Federation Ecosystem Overview
   - 1.2 Architectural Archetypes & Platform Heritage
   - 1.3 Summary Comparison Matrix of All 4 Federations
2. [Transport, Security & Authentication Architecture](#2-transport-security--authentication-architecture)
   - 2.1 Hostnames, Base URLs, and Cluster Routing
   - 2.2 Authentication Mechanics: Pseudo-MIME Token in Accept Header
   - 2.3 Anti-Scraping & Origin Protection: Referer Header Spoofing Rules
   - 2.4 The Shared Key Discovery & Master API Key Directory
   - 2.5 Standard Response Envelope & HTTP Status Codes
   - 2.6 Network Resiliency & The PHP Buffer Bleed Anomaly
3. [Comprehensive REST Endpoint Catalog & Request Schemas](#3-comprehensive-rest-endpoint-catalog--request-schemas)
   - 3.1 Universal REST Endpoint Catalog
   - 3.2 Tournament Schedule Widget Architecture (`widget.php` Proxying & Sandboxing)
   - 3.3 Universal URL Detection & Auto-Resolution Taxonomy
4. [Raw Payload Schemas & Field Dictionaries (By Sport)](#4-raw-payload-schemas--field-dictionaries-by-sport)
   - 4.1 Master Match Metadata Dictionary (`match` Root Object)
   4.2 Roster & Player Lineup Dictionary (`match.lineups[]`)
   - 4.3 Chronological Event Stream Dictionary (`match.events[]`)
   - 4.4 Standings & League Table Dictionary (`group.teams[]`)
   - 4.5 Sport 1: Football (Suomen Palloliitto / SPL)
   - 4.6 Sport 2: Floorball (Suomen Salibandyliitto / SSBL)
   - 4.7 Sport 3: Basketball (Suomen Koripalloliitto / Basket.fi)
   - 4.8 Sport 4: Volleyball (Suomen Lentopalloliitto)
5. [Raw vs. Derived Fields & Mathematical Derivation Engine](#5-raw-vs-derived-fields--mathematical-derivation-engine)
   - 5.1 Calculation Taxonomy Matrix
   - 5.2 Floorball Goalkeeper Save Percentage & Period Splits
   - 5.3 Special Teams Metrics: Power Play (YV%) & Penalty Kill (AV%)
   - 5.4 Basketball Team Fouls, Bonus Thresholds & Shot Distributions
   - 5.5 Volleyball Set Quotient (Eräsuhde) & Point Quotient (Pistesuhde)
   - 5.6 Volleyball 3-Point Standings Math
   - 5.7 Standings Tiebreaker Resolution Hierarchies Across Sports
6. [Deep Event Log & Roster Telemetry Analysis](#6-deep-event-log--roster-telemetry-analysis)
   - 6.1 Football: Pitch Coordinates, Card Classifications, Sub Dynamics, Referee Crews
   - 6.2 Floorball: Period Structure, Assist Linkage (`connected_event_id`), Disciplinary Codes
   - 6.3 Basketball: Play-by-Play Scoring Grammar, Foul Codes (P0–P3, T1, U2), FIBA LiveStats
   - 6.4 Volleyball: Set Rally Tracking, Deuce Extension Rules, DataVolley Player Analytics
7. [Edge-Case Payload Quirks & Defensive Parsing Rules](#7-edge-case-payload-quirks--defensive-parsing-rules)
   - 7.1 Forfeits & Walkovers (`luovutus` / `luov.`) Across All Sports
   - 7.2 Shootout & Overtime Score Divergences (`es_A` vs `fs_A` vs `ps_A`)
   - 7.3 Goalkeeper Schema Anomaly: Empty String vs Object in `saves_by_period`
   - 7.4 Amateur & Youth Rostering Gaps (`"Ei pelaajia"`)
   - 7.5 Series Playoff Aggregates vs Single Match Fixtures
   - 7.6 WhatsApp Briefing Generation & Word-Boundary Token Leak Sentinel
8. [Concrete Reproducible Verification Suite](#8-concrete-reproducible-verification-suite)
   - 8.1 Reproducible cURL Command Suite (All 4 Sports + Tupa)
   - 8.2 Standalone Node.js Verification Test Harness
   - 8.3 Live Endpoint Assertion Checklist

---

## 1. Executive Summary & Federation API Landscape

### 1.1 Finnish Sports Federation Ecosystem Overview
In Finland, official amateur, youth, and semi-professional competitive sports are governed by national federations operating digital result services (*tulospalvelu*). For decades, these federations used disparate legacy software. However, over the past decade, the dominant backend supplier has consolidated: **Torneopal Oy** (and its modern Taso / Tupa software suite) powers the central competition management, player licensing, match scheduling, referee reporting, and live scorekeeping for the vast majority of Finnish team sports.

This audit establishes the definitive, unadulterated source of truth for the four major sports federations:
1. **Suomen Palloliitto ry (SPL)** — The Football Association of Finland (Jalkapallo / Futsal), encompassing Veikkausliiga, Ykkösliiga, Kakkonen, Kolmonen, junior leagues (P20–P8, T20–T8), and regional districts.
2. **Suomen Salibandyliitto ry (SSBL)** — The Finnish Floorball Federation (Salibandy), encompassing F-liiga (Men and Women), Inssi-Divari, Suomisarja, regional divisions (2.–6. divisioona), and junior national championships.
3. **Suomen Koripalloliitto ry** — Basketball Finland (Koripallo / Basket.fi), encompassing Korisliiga, Naisten Korisliiga, 1-divisioona (A and B), regional leagues (Eteläinen, Läntinen, etc.), and youth leagues.
4. **Suomen Lentopalloliitto ry** — The Finnish Volleyball Association (Lentopallo), encompassing Mestaruusliiga, 1-sarja, 2-sarja, Power Cup (world's largest youth tournament), and regional youth divisions.

### 1.2 Architectural Archetypes & Platform Heritage
While all four federations trace their core backend to Torneopal's PHP/MySQL origin architecture, they deploy across two distinct platform generations:
- **Modern REST Infrastructure (`*-api.torneopal.net/taso/rest`)**: Dedicated API gateway subdomains fronted by Cloudflare CDN caching and DDoS mitigation. Requests pass through reverse proxies that authenticate incoming API calls via custom HTTP headers and enforce CORS / Referer restrictions.
- **Legacy Cup / Widget Infrastructure (`*.torneopal.fi/taso/widget.php`)**: Hundreds of weekend tournaments, seasonal invitationals, and municipal cups host their results on isolated subdomains (e.g. `espooliikkuutournament.fi`, `vierumaki.torneopal.fi`, `hjk.torneopal.fi`). These environments rarely expose CORS-enabled JSON endpoints, instead outputting raw HTML table snippets via executable JavaScript (`document.write(...)`).

### 1.3 Summary Comparison Matrix of All 4 Federations

| Attribute | Football (SPL) | Floorball (SSBL) | Basketball (Basket.fi) | Volleyball (Lentopalloliitto) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Base URL** | `https://spl.torneopal.net/taso/rest` | `https://salibandy-api.torneopal.net/taso/rest` | `https://koripallo-api.torneopal.net/taso/rest` | `https://lentopallo-api.torneopal.net/taso/rest` |
| **Failover Base URL**| `https://spl.torneopal.fi/taso/rest` | `https://salibandy.torneopal.fi/taso/rest` | `https://basket.fi/taso/rest` | `https://tupa.api.torneopal.com/taso/rest` |
| **Public Web Portal**| `https://tulospalvelu.palloliitto.fi/` | `https://tulospalvelu.salibandy.fi/` | `https://tulospalvelu.basket.fi/` | `https://tulospalvelu.lentopallo.fi/` |
| **Torneopal Key** | `4h7dznqdxwtp3hsfdyf5r793uahfxy7x` | `zsn3anknxzcfzc23k53jqdcd4pymutsf` | `df8e84j9xtdz269euy3h` *(Shared!)* | `df8e84j9xtdz269euy3h` *(Shared!)* |
| **Required Referer** | `https://tulospalvelu.palloliitto.fi/` | `https://tulospalvelu.salibandy.fi/` | `https://tulospalvelu.basket.fi/` | `https://tulospalvelu.lentopallo.fi/` |
| **Score Units** | Goals (e.g. `2–1`) | Goals (e.g. `6–5`) | Points (e.g. `84–79`) | Sets Won (e.g. `3–1`) |
| **Subdivision Unit** | 2 Halves (`hts_A`, `fs_A`) | 3 Periods (`p1s`–`p3s`, `p4s` OT) | 4 Quarters (`p1s`–`p4s`, `p5s` OT) | 5 Sets (`p1s`–`p5s` rally points) |
| **Standings Points** | Win=3, Draw=1, Loss=0 | Win=3, OT Win=2, OT Loss=1, Loss=0 | Win=2, Loss=0 | 3-0/3-1 Win=3, 3-2 Win=2, 2-3 Loss=1 |
| **Live WebSockets** | Torneopal Polling (15s) | Torneopal Polling (15s) | FIBA LiveStats / Torneopal Polling | Centrifugo (`centrifugo.torneopal.com`) |
| **External Linkage** | None / Transfermarkt | Inssi-Divari Live | FIBA LiveStats (Genius Sports) | DataVolley / VolleyMetrics |

---

## 2. Transport, Security & Authentication Architecture

### 2.1 Hostnames, Base URLs, and Cluster Routing
All Torneopal Taso APIs follow a RESTful resource path convention:
```http
https://{cluster-subdomain}/taso/rest/{methodName}?{queryString}
```
The live production routing clusters are partitioned as follows:
1. **Football**: `spl.torneopal.net` (Primary modern cluster) and `spl.torneopal.fi` (Legacy failover). Both map to Cloudflare IP ranges in Europe with regional routing through Helsinki (HEL datacenter).
2. **Floorball**: `salibandy-api.torneopal.net` (Primary modern cluster) and `salibandy.torneopal.fi` (Legacy failover).
3. **Basketball**: `koripallo-api.torneopal.net` (Primary cluster, introduced for the 2024–2026 seasons, superseding the legacy `basket.fi/taso/rest` reverse proxy).
4. **Volleyball**: `lentopallo-api.torneopal.net` (Primary cluster) and `tupa.api.torneopal.com` (Universal cup & tournament cluster).
5. **Generic Cups (Tupa)**: `tupa.api.torneopal.com` and `*.torneopal.fi`.

### 2.2 Authentication Mechanics: Pseudo-MIME Token in Accept Header
Unlike modern web APIs that employ OAuth2 `Authorization: Bearer <token>` or HTTP Basic Auth, the Torneopal Taso engine implements a proprietary pseudo-MIME authorization mechanism embedded in the standard HTTP `Accept` request header:
```http
Accept: json/{apiKey}
```
If a client sends standard `Accept: application/json`, omits the key, or provides an invalid API key, the request is intercepted and blocked at the edge by Cloudflare Edge WAF with an **`HTTP 403 Forbidden`** response (Cloudflare HTML challenge / access block). If an unauthenticated request bypasses the edge WAF or reaches the origin PHP application layer directly, the gateway rejects the request with an `HTTP 401 Unauthorized` JSON envelope:
```json
{
  "call": {
    "parameters": [],
    "logged_in": false,
    "method": "",
    "status": "error",
    "access": [],
    "timestamp": "2026-09-03T21:50:00",
    "withapp": 0,
    "result_time": 0.001,
    "apilevel": "1",
    "time_stamp": 1788461400
  },
  "error": "Unauthorized api"
}
```

### 2.3 Anti-Scraping & Origin Protection: Referer Header Spoofing Rules
Torneopal clusters sitting behind Cloudflare WAF evaluate the HTTP `Referer` and `Origin` headers. Automated scrapers, curl invocations without headers, or client-side fetch requests originating from unverified origins (such as `http://localhost:5173`) are rejected with `HTTP 403 Forbidden` or `HTTP 406 Not Acceptable`.

To ensure guaranteed delivery in Node.js, edge workers, and test runners, all requests **must explicitly specify** the federation's canonical public web frontend URL in the `Referer` header:
- Palloliitto: `Referer: https://tulospalvelu.palloliitto.fi/`
- Salibandyliitto: `Referer: https://tulospalvelu.salibandy.fi/`
- Basket.fi: `Referer: https://tulospalvelu.basket.fi/`
- Lentopalloliitto: `Referer: https://tulospalvelu.lentopallo.fi/`
- Generic Tupa / Cups: `Referer: https://tupa.torneopal.fi/`

### 2.4 The Shared Key Discovery & Master API Key Directory
During our live network inspection of public Single Page Applications across Finnish sports portals, a groundbreaking architectural discovery was confirmed:
> **The Shared Key Breakthrough**: Both **Suomen Koripalloliitto (Basket.fi)** and **Suomen Lentopalloliitto (Volleyball)** utilize the **exact same public SPA API key**: `df8e84j9xtdz269euy3h`.

The master directory of public federation API keys is:

| Federation | Key String | Full Header Value |
| :--- | :--- | :--- |
| **Palloliitto (SPL)** | `4h7dznqdxwtp3hsfdyf5r793uahfxy7x` | `Accept: json/4h7dznqdxwtp3hsfdyf5r793uahfxy7x` |
| **Salibandyliitto (SSBL)**| `zsn3anknxzcfzc23k53jqdcd4pymutsf` | `Accept: json/zsn3anknxzcfzc23k53jqdcd4pymutsf` |
| **Koripalloliitto (Basket)**| `df8e84j9xtdz269euy3h` | `Accept: json/df8e84j9xtdz269euy3h` |
| **Lentopalloliitto (Volley)**| `df8e84j9xtdz269euy3h` | `Accept: json/df8e84j9xtdz269euy3h` |
| **Torneopal Tupa (Cups)**| `tpqgz8ddy2rt9w8xuyxr` | `Accept: json/tpqgz8ddy2rt9w8xuyxr` |

### 2.5 Standard Response Envelope & HTTP Status Codes
Every successful API call returns a standardized outer JSON envelope consisting of two root properties:
1. `call`: An operational metadata envelope containing execution timing, status, request parameters echo, and server timestamp.
2. Resource Key: A single object or array named after the requested entity (`match`, `matches`, `group`, `groups`, `team`, `player`, `competitions`, `categories`, `seasons`).

```json
{
  "call": {
    "parameters": {
      "match_id": "4036852"
    },
    "logged_in": false,
    "method": "getMatch",
    "status": "ok",
    "access": [],
    "timestamp": "2026-09-03T21:55:00",
    "withapp": 0,
    "result_time": 0.042,
    "apilevel": "1",
    "time_stamp": 1788461700
  },
  "match": { ... }
}
```

#### HTTP Status Code Conventions in Torneopal:
- `HTTP 200 OK`: Request succeeded, `call.status === "ok"`.
- `HTTP 200 OK` with `call.status === "error"`: Logical parameter error (e.g. `match_id` does not exist or "Not enough limits").
- `HTTP 401 Unauthorized`: Origin PHP application layer rejection when missing or invalid `Accept: json/{key}` reaches the origin.
- `HTTP 403 Forbidden`: Cloudflare Edge WAF block triggered by missing or invalid `Accept: json/{key}` header, missing `Referer`, or blocked User-Agent.
- `HTTP 404 Not Found`: Invalid method name (e.g. `/taso/rest/getNonExistent`).

### 2.6 Network Resiliency & The PHP Buffer Bleed Anomaly
Because Torneopal is built on a legacy PHP backend cluster with multiple output buffering layers, under peak concurrency or legacy subdomain routing, responses occasionally suffer from **PHP Buffer Bleed**:
- UTF-8 Byte Order Marks (`\uFEFF`) prepended before the opening `{`.
- PHP runtime warnings or deprecation notices (e.g. `Notice: Undefined index...`) emitted before the JSON body.
- Trailing newlines, whitespace, or HTML comments appended after the closing `}`.

If passed directly to native `JSON.parse(text)`, the parser will throw `SyntaxError: Unexpected token in JSON at position 0`. Every client module communicating with Torneopal **must** execute defensive string slicing between the first `{` and the last `}`:

```typescript
/**
 * Defensively extracts and parses valid JSON from raw Torneopal responses,
 * stripping leading UTF-8 BOMs, PHP notices, and trailing whitespace.
 */
export function parseTasoPayload<T>(raw: string): T {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Torneopal response payload is empty or non-string');
  }
  const start = raw.indexOf('{');
  if (start < 0) {
    throw new Error(`Torneopal response does not contain valid JSON: "${raw.slice(0, 100)}"`);
  }
  const end = raw.lastIndexOf('}');
  if (end < start) {
    throw new Error('Malformed Torneopal JSON: closing brace missing');
  }
  const cleanSlice = (start === 0 && end === raw.length - 1) 
    ? raw 
    : raw.slice(start, end + 1);
  return JSON.parse(cleanSlice) as T;
}
```

---

## 3. Comprehensive REST Endpoint Catalog & Request Schemas

### 3.1 Universal REST Endpoint Catalog
The eight core methods exposed by the Torneopal Taso engine across all four federations are:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TORNEOPAL TASO REST API                           │
│                                                                             │
│   getCompetitions ────► getCategories ────► getGroups ────► getGroup       │
│   (Seasons/Leagues)    (Age/Divisions)     (Pools/Stages)    (Standings)    │
│                                                                   │         │
│                                                                   ▼         │
│   getPlayer ◄──────────── getTeam ◄─────────────────────────── getMatches   │
│   (Profiles/Stats)        (Squad/Officials)                   (Fixtures)    │
│                                                                   │         │
│                                                                   ▼         │
│                                                                getMatch     │
│                                                                (Center)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Method Specifications:

#### 1. `getCompetitions`
- **Purpose**: Lists all active, historical, or planned tournament competitions for a calendar season.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getCompetitions`
- **Query Parameters**:
  - `season_id` (string, optional): 4-digit year, e.g. `"2026"`.
  - `current` (integer, optional): `"1"` returns only currently active competitions.
- **Response Root**: `competitions: CompetitionItem[]`

#### 2. `getCategories`
- **Purpose**: Lists all age classes, divisions, and leagues within a competition.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getCategories`
- **Query Parameters**:
  - `competition_id` (string, **required**): e.g. `"spljp26"` (Football), `"sb2025"` (Floorball), `"huki2526"` (Basketball Korisliiga), `"vb2025a"` (Volleyball Mestaruusliiga).
- **Response Root**: `categories: CategoryItem[]`

#### 3. `getGroups`
- **Purpose**: Lists all pools, stages (Runkosarja, Jatkosarja, Pudotuspelit), or regional groups in a category.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getGroups`
- **Query Parameters**:
  - `competition_id` (string, **required**)
  - `category_id` (string, **required**): e.g. `"VL"` (Veikkausliiga), `"402"` (F-liiga miehet), `"4"` (Korisliiga), `"ML"` (Miesten Mestaruusliiga).
- **Response Root**: `groups: GroupSummaryItem[]`

#### 4. `getGroup`
- **Purpose**: Returns the definitive league standings table (`teams[]`), top scorers list (`scorers[]`), and optional match schedule.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getGroup`
- **Query Parameters**:
  - `competition_id` (string, **required**)
  - `category_id` (string, **required**)
  - `group_id` (string, **required**): e.g. `"1"`
  - `matches` (integer, optional): `"1"` includes the complete schedule and results for the group.
- **Response Root**: `group: { teams: StandingTeamItem[], matches?: FixtureItem[], scorers?: ScorerItem[] }`

#### 5. `getMatches`
- **Purpose**: Queries a filtered list of match fixtures and results across dates, teams, or competitions.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getMatches`
- **Query Parameters**:
  - *Safety Constraint ("Not enough limits")*: Torneopal will reject queries if insufficient filtering criteria are provided. At least one of `team_id`, `competition_id`, or a bounded date range must be specified.
  - `team_id` (string, optional): e.g. `"185085"`
  - `competition_id` (string, optional): e.g. `"spljp26"`
  - `category_id` (string, optional)
  - `first_date` / `last_date` (string, optional): `YYYY-MM-DD`
  - `status` (string, optional): `"played"`, `"upcoming"`, `"live"`
- **Response Root**: `matches: FixtureItem[]`

#### 6. `getMatch`
- **Purpose**: Returns complete match center data: box score, period progression, starting lineups, substitutes, bench staff, play-by-play events, goals, penalties, fouls, venue GPS, and official referee crew.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getMatch`
- **Query Parameters**:
  - `match_id` (string, **required**): Unique match identifier, e.g. `"4036852"`, `"868865"`, `"968705"`, `"738046"`.
- **Response Root**: `match: MatchDetailObject`

#### 7. `getTeam`
- **Purpose**: Returns team profile, club crest, registered roster players, staff, and assigned competitions.
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getTeam`
- **Query Parameters**:
  - `team_id` (string, **required**): Unique team identifier.
  - `competition_id` (string, optional)
- **Response Root**: `team: TeamProfileObject`

#### 8. `getPlayer`
- **Purpose**: Returns player profile, birth year, club history, and advanced historical statistics (including DataVolley metrics in volleyball).
- **HTTP Method**: `GET`
- **Path**: `/taso/rest/getPlayer`
- **Query Parameters**:
  - `player_id` (string, **required**): Federation player identifier.
- **Response Root**: `player: PlayerProfileObject`

---

### 3.2 Tournament Schedule Widget Architecture (`widget.php` Proxying & Sandboxing)
Independent tournaments (e.g. Vierumäki Cup, Helsinki Junior Cup, Espoo Liikkuu) host results on standalone subdomains. Because these hosts lack open CORS headers and REST endpoints, web applications must ingest them via the classic Torneopal schedule widget:

```http
GET https://{host}/taso/widget.php?teamid={teamId}&widget=schedule HTTP/1.1
```

#### The `document.write` Output Format:
The widget does not return JSON. It returns an executable JavaScript snippet containing an escaped HTML string:
```javascript
document.write("<table class=\"fixture\" ...><tr class=\"match\">...</tr></table>");
```

#### Dual-Strategy Ingestion Pipeline:
1. **Edge Worker Proxy & Regex Extraction**:
   A Cloudflare Worker queries the widget endpoint with custom headers, extracts the inner HTML string using regex, and normalizes escaped slashes and quotes:
   ```typescript
   export function parseWidgetScript(js: string): string {
     const match = js.match(/document\.write\("([\s\S]*)"\);?/);
     if (!match || !match[1]) throw new Error('Invalid widget.php script payload');
     return match[1]
       .replace(/\\"/g, '"')
       .replace(/\\'/g, "'")
       .replace(/\\\//g, '/')
       .replace(/\\n/g, '\n')
       .replace(/\\r/g, '');
   }
   ```
2. **Client-Side Sandboxed Iframe Fallback**:
   If the edge proxy is unreachable, the client renders an off-screen iframe configured with `sandbox="allow-scripts allow-same-origin"`. Once the script executes, the host reads `iframe.contentDocument.body.innerHTML` and parses the DOM tables via `DOMParser`.

---

### 3.3 Universal URL Detection & Auto-Resolution Taxonomy
Users paste varied links from mobile web browsers, SMS, and WhatsApp messages into matchday applications. The table below defines the authoritative URL parsing rules:

| Input Domain / Pattern | Inferred Sport | Extracted Entities | Target API Method & Parameters |
| :--- | :--- | :--- | :--- |
| `tulospalvelu.palloliitto.fi/team/{id}/info` | `football` | `team_id = {id}` | `spl.torneopal.net/taso/rest/getTeam?team_id={id}` |
| `tulospalvelu.palloliitto.fi/match/{id}/lineups` | `football` | `match_id = {id}` | `spl.torneopal.net/taso/rest/getMatch?match_id={id}` |
| `tulospalvelu.salibandy.fi/team/{id}/info` | `floorball` | `team_id = {id}` | `salibandy-api.torneopal.net/taso/rest/getTeam?team_id={id}` |
| `tulospalvelu.salibandy.fi/match/{id}/lineups` | `floorball` | `match_id = {id}` | `salibandy-api.torneopal.net/taso/rest/getMatch?match_id={id}` |
| `tulospalvelu.basket.fi/team/{id}` | `basketball` | `team_id = {id}` | `koripallo-api.torneopal.net/taso/rest/getTeam?team_id={id}` |
| `basket.fi/basket/sarjat/joukkue/?team_id={id}` | `basketball` | `team_id = {id}` | `koripallo-api.torneopal.net/taso/rest/getTeam?team_id={id}` |
| `tulospalvelu.lentopallo.fi/team/{id}` | `volleyball` | `team_id = {id}` | `lentopallo-api.torneopal.net/taso/rest/getTeam?team_id={id}` |
| `{sub}.torneopal.fi/taso/joukkue.php?joukkue={id}` | Subdomain heuristic | `sub`, `team_id={id}` | `{sub}.torneopal.fi/taso/rest/getTeam?team_id={id}` |

---

## 4. Raw Payload Schemas & Field Dictionaries (By Sport)

### 4.1 Master Match Metadata Dictionary (`match` Root Object)
The root object returned by `getMatch` contains core fixture details across all sports:

| Field Name | Type | Nullable | Description & Semantics |
| :--- | :--- | :--- | :--- |
| `match_id` | String | No | Unique federation match identifier (e.g. `"4036852"`, `"868865"`). |
| `competition_id` | String | No | Competition code (e.g. `"spljp26"`, `"sb2025"`, `"huki2526"`, `"vb2025a"`). |
| `competition_name`| String | No | Human-readable competition title. |
| `category_id` | String | No | Division / category code (e.g. `"VL"`, `"402"`, `"4"`, `"ML"`). |
| `category_name` | String | No | Human-readable category title (e.g. `"Veikkausliiga"`, `"F-liiga miehet"`). |
| `group_id` | String | Yes | Group stage or pool identifier. |
| `group_name` | String | Yes | Human-readable group name (e.g. `"Runkosarja"`, `"Lohko 2"`). |
| `date` | String | No | Match date in ISO format `YYYY-MM-DD`. |
| `time` | String | No | Match start time in `HH:mm:ss` (Finnish local time EET/EEST). |
| `status` | String | No | Match lifecycle: `"Played"`, `"Upcoming"`, `"Live"`, `"Cancelled"`, `"Postponed"`, `"Forfeited"`. |
| `matchcard_status` | String | Yes | Official confirmation state: `"Confirmed"`, `"Locked"`, `"Draft"`, `"Forfeited"`. |
| `team_A_id` | String | No | Home team unique identifier. |
| `team_A_name` | String | No | Home team display name. |
| `team_B_id` | String | No | Away team unique identifier. |
| `team_B_name` | String | No | Away team display name. |
| `fs_A` | String | Yes | **Final Score Team A**. In football, floorball, basketball: goals/points scored. In volleyball: **Sets Won**. |
| `fs_B` | String | Yes | **Final Score Team B**. |
| `hts_A` | String | Yes | **Half-Time Score Team A** (Football). |
| `hts_B` | String | Yes | **Half-Time Score Team B** (Football). |
| `es_A` | String | Yes | **End of Regulation Score Team A** (Floorball *varsinainen peliaika*). |
| `es_B` | String | Yes | **End of Regulation Score Team B** (Floorball). |
| `ps_A` | String | Yes | **Shootout Score Team A** (Floorball penalty shootout goals). |
| `ps_B` | String | Yes | **Shootout Score Team B** (Floorball penalty shootout goals). |
| `p1s_A`..`p5s_A` | String | Yes | **Period / Quarter / Set Score Team A** (P1–P3 in floorball, Q1–Q4 in basketball, Sets 1–5 in volleyball). |
| `p1s_B`..`p5s_B` | String | Yes | **Period / Quarter / Set Score Team B**. |
| `p1_winner`..`p5_winner` | String | Yes | Leading team in period: `"A"`, `"B"`, or `"Tie"`. |
| `winner` | String | Yes | Match winner: `"Home"`, `"Away"`, or `"Tie"`. |
| `winner_id` | String | Yes | Team ID of the winning team (`null` on draws). |
| `playing_time_min`| String | Yes | Scheduled regulation time in minutes (e.g. `"90"`, `"60"`, `"65"`). |
| `period_count` | String | No | Number of played or scheduled periods (`"2"`, `"3"`, `"4"`, `"5"`). |
| `venue_name` | String | No | Pitch, arena, or court name. |
| `venue_city_name`| String | Yes | City or municipality name. |
| `venue_lat` | String | Yes | WGS84 latitude coordinate (e.g. `"60.4428"`). |
| `venue_lon` | String | Yes | WGS84 longitude coordinate (e.g. `"22.2891"`). |
| `attendance` | String | Yes | Official spectator count. |
| `weather` | String | Yes | Pitch weather conditions (Football, e.g. `"Pilvistä"`). |
| `temperature` | String | Yes | Ambient temperature in Celsius (Football, e.g. `"14"`). |
| `referee_1_name` | String | Yes | Head referee / 1. tuomari name (Last First). |
| `assistant_referee_1_name` | String | Yes | First assistant referee / line referee name. |
| `assistant_referee_2_name` | String | Yes | Second assistant referee name. |
| `fourth_official_name` | String | Yes | Fourth official name (Football). |
| `var_name` | String | Yes | Video Assistant Referee name (Football). |
| `walkover` | Number/Str | Yes | Set to `1` when the match was settled via administrative forfeit. |
| `forfeit_A` / `forfeit_B` | String | Yes | `"match"` if that specific team forfeited the match. |

---

### 4.2 Roster & Player Lineup Dictionary (`match.lineups[]`)
The `lineups` array contains every player registered on the official team sheet for both teams:

| Field Name | Type | Nullable | Description & Semantics |
| :--- | :--- | :--- | :--- |
| `lineup_id` | String | No | Unique team sheet entry ID. |
| `match_id` | String | No | Foreign key linking to match. |
| `team_id` | String | No | Foreign key linking to team (`team_A_id` or `team_B_id`). |
| `player_id` | String | No | Federation player identifier. |
| `player_name` | String | No | Full player name (e.g. `"Virtanen Matti"`). |
| `first_name` | String | Yes | First name. |
| `last_name` | String | Yes | Surname. |
| `shirt_number` | String | Yes | Jersey number (e.g. `"10"`). |
| `start` | String | No | `"1"` = Starter, `"0"` = Substitute. Exactly 11 starters in SPL 11v11 football, 5 in basketball. |
| `captain` | String | Yes | `"1"` = Team Captain. |
| `position` | String | Yes | Normalized position code (`"mv"`, `"puolustaja"`, `"keskikenttä"`, `"hyökkääjä"`, `"lait"`, `"sent"`). |
| `position_fi` | String | Yes | Localized position label. |
| `birthyear` | String | Yes | 4-digit birth year (e.g. `"2012"`). |
| `goals` | Number | No | Goals scored in this match. |
| `assists` | Number | No | Direct assists credited in this match. |
| `points` | Number | No | Total points (Basketball: scoring points; Floorball: `goals + assists`). |
| `fouls` | Number | No | Personal fouls committed (Basketball: 0–5). |
| `warnings` | Number | No | Yellow cards received (Football: 0–2). |
| `suspensions` | Number | No | Red cards / match penalties received. |
| `saves` | Number | Yes | Total goalkeeper saves recorded (Floorball). |
| `saves_by_period`| Object/Str | Yes | Goalkeeper saves breakdown per period `{ "1": 6, "2": 8, "3": 3 }`. *(Quirk: string `""` when empty!)* |
| `conceded` | Number | Yes | Goals conceded while in net (Floorball). |
| `overage` | String | Yes | `"1"` = Granted age exception (*yli-ikäisyyslupa*). |
| `dual_representation` | String | Yes | `"1"` = Dual club representation license (*kaksoisedustus*). |
| `img_url` | String | Yes | CDN profile picture URL. |

---

### 4.3 Chronological Event Stream Dictionary (`match.events[]`)
Real-time match events are recorded in `match.events`:

| Field Name | Type | Nullable | Description & Semantics |
| :--- | :--- | :--- | :--- |
| `event_id` | String | No | Unique chronological event identifier. |
| `code` | String | No | Event category code: `"maali"` (goal/basket), `"piste"` (volley point), `"syotto"` (assist), `"varoitus"` (yellow card), `"ulosajo"` (red card), `"2min"`, `"5min"`, `"virhe"` (foul), `"vaihto"` (substitution), `"aikalisa"` (timeout). |
| `code_fi` | String | Yes | Localized event description (e.g. `"Maali"`, `"2min (ETA)"`, `"Varoitus (A)"`). |
| `time` | String | No | Match elapsed time display string (`"45:00"`, `"14:22"`, `"Q3 08:12"`). |
| `time_min` | String | Yes | Elapsed minute integer (supports added time notation e.g. `"90+3"`). |
| `time_sec` | Number | Yes | Elapsed seconds remainder within the minute. |
| `wall_time` | String | Yes | Absolute clock timestamp when the event was logged by the scorekeeper (`HH:mm:ss`). |
| `period` | String | No | Period number (`"1"`, `"2"`, `"3"`, `"4"`, `"5"`). Period 5 represents shootouts in floorball, tiebreaks in volleyball, or OT in basketball. |
| `team` | String | No | Team identifier: `"A"` (Home) or `"B"` (Away). |
| `team_id` | String | Yes | Direct database team ID. |
| `lineup_id` | String | Yes | Foreign key to `match.lineups[]`. |
| `player_id` | String | Yes | Primary player ID. |
| `player_name` | String | Yes | Primary player name. |
| `shirt_number` | String | Yes | Primary player jersey number. |
| `player_2_id` | String | Yes | Secondary player ID (Incoming player on subs, or fouled player). |
| `player_2_name` | String | Yes | Secondary player name. |
| `shirt_2_number`| String | Yes | Secondary player jersey number. |
| `score_A` / `s_A`| Number | Yes | Running score for Team A after this event. |
| `score_B` / `s_B`| Number | Yes | Running score for Team B after this event. |
| `ps_A` / `ps_B` | Number | Yes | Running set rally score (Volleyball). |
| `description` | String | Yes | Tactical detail string. Football: pitch coordinates (`"@580,930 oikea"`). Basketball: shot points & score (`"3 0-5"`). Floorball: penalty reason (`"ETA"`). |
| `note` | String | Yes | Technical foul category (Basketball FIBA codes: `"P0"`, `"P1"`, `"P2"`, `"P3"`, `"T1"`, `"U2"`). |
| `connected_event_id` | String | Yes | **Relational link**. In floorball, an assist event points to the exact goal `event_id`. |

---

### 4.4 Standings & League Table Dictionary (`group.teams[]`)
The standings table returned by `getGroup` contains:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `team_id` | String | Unique team ID. |
| `team_name` | String | Team display name. |
| `club_id` | String | Club parent organization ID. |
| `crest` | String | Official club crest CDN URL. |
| `current_standing`| Number | Position in league table (1 = 1st place). |
| `starting_points` | Number | Bonus or carryover points from earlier season stages (*lähtöpisteet*). |
| `points` | Number | Total accumulated standings points. |
| `points_per_match`| Number | Average points per match (PPM). |
| `matches_played` | Number | Total matches played. |
| `matches_won` | Number | Total matches won in regulation. |
| `matches_won3` | Number | 3-point regulation wins (Floorball / Volleyball). |
| `matches_won2` | Number | 2-point overtime/shootout wins (Floorball). |
| `matches_tiedwon`| Number | Overtime / shootout wins (Floorball / Volleyball). |
| `matches_tied` | Number | Draws (Football) or Overtime/shootout losses (Floorball / Volleyball). |
| `matches_lost` | Number | Regulation losses. |
| `goals_for` | Number | Goals scored (Football / Floorball) or Sets won (Volleyball) or Points scored (Basketball). |
| `goals_against` | Number | Goals conceded or Sets lost or Points conceded. |
| `goals_diff` | Number | Goal, set, or point differential (`goals_for - goals_against`). |
| `points_home` / `points_away` | Number | Split standings points at home vs away. |
| `period_points_for` / `against` | Number | Total rally points scored and conceded (Volleyball). |
| `goals_for_powerplay` | Number | Power play goals scored (Floorball). |
| `goals_for_penaltykill`| Number | Short-handed goals scored (Floorball). |
| `shots` / `saves` | Number | Cumulative shots and goalkeeper saves (Floorball). |
| `forfeited` | Number | Count of matches forfeited by this team. |

---

### 4.5 Sport 1: Football (Suomen Palloliitto / SPL)

#### Request Signature:
```http
GET /taso/rest/getMatch?match_id=4036852 HTTP/1.1
Host: spl.torneopal.net
Accept: json/4h7dznqdxwtp3hsfdyf5r793uahfxy7x
Referer: https://tulospalvelu.palloliitto.fi/
```

#### Raw Sample Payload (`match` fragment):
```json
{
  "match_id": "4036852",
  "competition_id": "spljp26",
  "competition_name": "SPL Jalkapallo 2026",
  "category_id": "VL",
  "category_name": "Veikkausliiga",
  "group_id": "1",
  "group_name": "Runkosarja",
  "date": "2026-04-04",
  "time": "13:00:00",
  "status": "Played",
  "matchcard_status": "Confirmed",
  "team_A_name": "FC Inter",
  "team_B_name": "VPS",
  "fs_A": "0",
  "fs_B": "0",
  "hts_A": "0",
  "hts_B": "0",
  "winner": "Tie",
  "playing_time_min": "90",
  "period_count": "2",
  "venue_name": "Veritas Stadion TN",
  "venue_city_name": "Turku",
  "venue_lat": "60.4428",
  "venue_lon": "22.2891",
  "attendance": "3401",
  "referee_1_name": "Munukka Antti",
  "assistant_referee_1_name": "Kettunen Eemeli",
  "assistant_referee_2_name": "Mynttinen Simo",
  "fourth_official_name": "Kontinen Joona",
  "var_name": "Al-Emara Mohammad",
  "avar_name": "Koskinen Heini"
}
```

---

### 4.6 Sport 2: Floorball (Suomen Salibandyliitto / SSBL)

#### Request Signature:
```http
GET /taso/rest/getMatch?match_id=868865 HTTP/1.1
Host: salibandy-api.torneopal.net
Accept: json/zsn3anknxzcfzc23k53jqdcd4pymutsf
Referer: https://tulospalvelu.salibandy.fi/
```

#### Raw Sample Payload (`match` fragment):
```json
{
  "match_id": "868865",
  "competition_name": "Valtakunnalliset sarjat 2025-26",
  "category_name": "F-liiga miehet",
  "group_name": "Runkosarja",
  "team_A_name": "Westend Indians",
  "team_B_name": "EräViikingit",
  "status": "Played",
  "fs_A": "5",
  "fs_B": "4",
  "hts_A": "0",
  "hts_B": "0",
  "p1s_A": "0",
  "p1s_B": "0",
  "p2s_A": "1",
  "p2s_B": "3",
  "p3s_A": "3",
  "p3s_B": "1",
  "p4s_A": "0",
  "p4s_B": "0",
  "es_A": "4",
  "es_B": "4",
  "ps_A": "4",
  "ps_B": "2",
  "winner": "Home",
  "playing_time_min": "65",
  "period_count": "3"
}
```

---

### 4.7 Sport 3: Basketball (Suomen Koripalloliitto / Basket.fi)

#### Request Signature:
```http
GET /taso/rest/getMatch?match_id=968705 HTTP/1.1
Host: koripallo-api.torneopal.net
Accept: json/df8e84j9xtdz269euy3h
Referer: https://tulospalvelu.basket.fi/
```

#### Raw Sample Payload (`match` fragment):
```json
{
  "match_id": "968705",
  "competition_id": "huki2526",
  "category_id": "4",
  "category_name": "Korisliiga",
  "team_A_name": "Kobrat",
  "team_B_name": "Tapiolan Honka",
  "status": "Played",
  "fs_A": "74",
  "fs_B": "80",
  "p1s_A": "18",
  "p1s_B": "21",
  "p1_winner": "B",
  "p2s_A": "20",
  "p2s_B": "18",
  "p2_winner": "A",
  "p3s_A": "14",
  "p3s_B": "27",
  "p3_winner": "B",
  "p4s_A": "22",
  "p4s_B": "14",
  "p4_winner": "A",
  "p5s_A": "-",
  "p5s_B": "-",
  "period_count": "4",
  "period_min": "10",
  "extra_period_min": "5",
  "live_fouls_A": 0,
  "live_fouls_B": 0,
  "live_timeouts_A": "2",
  "live_timeouts_B": "1",
  "attendance": "632",
  "venue_name": "Lapuan urheilutalo",
  "venue_lat": "62.966388",
  "venue_lon": "23.011936",
  "match_external_id": "8272cd16-90de-11f1-9c97-a7857ed9dbd3",
  "category_external_id": "9b5e6a7c-90dc-11f1-a0b4-c9ca21b3272e"
}
```

---

### 4.8 Sport 4: Volleyball (Suomen Lentopalloliitto)

#### Request Signature:
```http
GET /taso/rest/getMatch?match_id=738046 HTTP/1.1
Host: lentopallo-api.torneopal.net
Accept: json/df8e84j9xtdz269euy3h
Referer: https://tulospalvelu.lentopallo.fi/
```

#### Raw Sample Payload (`match` fragment):
```json
{
  "match_id": "738046",
  "competition_id": "vb2025a",
  "category_id": "M1",
  "category_name": "Miesten 1-sarja",
  "team_A_name": "Isku-Veikot",
  "team_B_name": "Sampo",
  "status": "Played",
  "fs_A": "1",
  "fs_B": "3",
  "p1s_A": "22",
  "p1s_B": "25",
  "p1_winner": "B",
  "p2s_A": "18",
  "p2s_B": "25",
  "p2_winner": "B",
  "p3s_A": "25",
  "p3s_B": "23",
  "p3_winner": "A",
  "p4s_A": "22",
  "p4s_B": "25",
  "p4_winner": "B",
  "p5s_A": "-",
  "p5s_B": "-",
  "period_count": "5",
  "live_timeouts_A": "2",
  "live_timeouts_B": "1"
}
```

---

## 5. Raw vs. Derived Fields & Mathematical Derivation Engine

### 5.1 Calculation Taxonomy Matrix
To guarantee architectural clarity, the table below explicitly separates what Finnish sports federations supply directly as raw fields versus what downstream client/edge services must compute:

| Sport | Raw Field (Direct from Federation) | Derived Field (Client/Edge Calculation) | Mathematical Formula & Logic |
| :--- | :--- | :--- | :--- |
| **Football** | `fs_A`, `fs_B`, `hts_A`, `hts_B` | Second Half Score | $\text{HT2}_A = \text{fs}_A - \text{hts}_A$, $\text{HT2}_B = \text{fs}_B - \text{hts}_B$ |
| **Football** | `date`, `time`, `venue_name` | ISO 8601 Timestamp | Reconcile Helsinki DST offset (+02:00 vs +03:00) |
| **Football** | Standings `points`, `starting_points` | Effective Standings Points | $\text{Effective Points} = \text{starting\_points} + \text{points}$ |
| **Floorball**| Lineup `saves`, `conceded` | Goalkeeper Save % (T%) | $\frac{\text{saves}}{\text{saves} + \text{conceded}} \times 100\%$ (Guarded against 0 shots) |
| **Floorball**| `saves_1`..`3`, `conceded_1`..`3` | Period Save % | $\frac{\text{saves\_}n}{\text{saves\_}n + \text{conceded\_}n} \times 100\%$ |
| **Floorball**| `goals_for_powerplay`, Opponent penalties | Power Play Efficiency (YV%) | $\frac{\text{PP Goals}}{\text{Opponent 2m/5m Penalties}} \times 100\%$ |
| **Floorball**| `goals_against_penaltykill`, Own penalties | Penalty Kill Efficiency (AV%) | $\frac{\text{Own Penalties} - \text{SH Goals Allowed}}{\text{Own Penalties}} \times 100\%$ |
| **Basketball**| Event `maali` with description `"3 0-5"` | 3pt / 2pt / 1pt Box Score | Sum player points by leading description token |
| **Basketball**| `events[]` with `code: "virhe"` | Live Quarter Team Fouls | Count team fouls within current quarter period |
| **Basketball**| Quarter team fouls count | Bonus Penalty State | Bonus active when $\text{Team Fouls in Quarter} \ge 5$ |
| **Basketball**| Lineup `fouls: 5` | Fouled Out Status | Player disqualified when $\text{fouls} \ge 5$ |
| **Volleyball**| `fs_A`, `fs_B` (Sets Won) | Total Sets Played | $\text{Sets Played} = \text{fs}_A + \text{fs}_B$ |
| **Volleyball**| Standings `goals_for`, `goals_against` | Set Quotient (Eräsuhde) | $\text{Eräsuhde} = \frac{\text{goals\_for}}{\text{goals\_against}}$ |
| **Volleyball**| `period_points_for`, `against` | Point Quotient (Pistesuhde) | $\text{Pistesuhde} = \frac{\text{period\_points\_for}}{\text{period\_points\_against}}$ |
| **Volleyball**| Match set score (e.g. `3–2`) | FIVB Standings Points | 3-0 / 3-1: 3 pts (W) / 0 pts (L). 3-2: 2 pts (W) / 1 pt (L). |

---

### 5.2 Floorball Goalkeeper Save Percentage & Period Splits
Goalkeepers in Torneopal floorball data report raw integer totals for saves and goals conceded. The save percentage calculation must implement a division-by-zero guard for reserve goalkeepers who recorded zero ice/floor time:

$$\text{Save \%} = \begin{cases} \left( \frac{\text{saves}}{\text{saves} + \text{conceded}} \right) \times 100\% & \text{if } (\text{saves} + \text{conceded}) > 0 \\ 100.0\% & \text{if } (\text{saves} + \text{conceded}) = 0 \end{cases}$$

```typescript
export function computeFloorballSavePercentage(saves: number, conceded: number): number {
  const totalShots = saves + conceded;
  if (totalShots <= 0) return 100.0;
  return Number(((saves / totalShots) * 100).toFixed(1));
}
```

---

### 5.3 Special Teams Metrics: Power Play (YV%) & Penalty Kill (AV%)
Torneopal records team-level powerplay goals in `goals_for_powerplay` and penalty kill goals conceded in `goals_against_penaltykill`.

1. **Power Play Conversion (YV%)**:
   $$\text{YV\%} = \frac{\text{goals\_for\_powerplay}}{\text{Opponent Minor Penalties Drawn}} \times 100\%$$
2. **Penalty Kill Success (AV%)**:
   $$\text{AV\%} = \left( 1 - \frac{\text{goals\_against\_penaltykill}}{\text{Own Minor Penalties Taken}} \right) \times 100\%$$

---

### 5.4 Basketball Team Fouls, Bonus Thresholds & Shot Distributions
In official FIBA basketball:
1. **Team Foul Bonus**: Each team is permitted 4 team fouls per quarter. On the **5th team foul**, the opposing team enters the bonus, receiving 2 free throws on all subsequent non-shooting personal fouls.
   $$\text{Bonus Active} = \text{live\_fouls} \ge 5$$
2. **Shot Type Distribution**: Torneopal stores score events as `code: "maali"`, with the leading integer of `description` representing the point value:
   - Prefix `"1"`: Free throw (+1 pt)
   - Prefix `"2"`: Two-point field goal (+2 pts)
   - Prefix `"3"`: Three-point field goal (+3 pts)

---

### 5.5 Volleyball Set Quotient (Eräsuhde) & Point Quotient (Pistesuhde)
In Finnish volleyball standings tables, when two teams are tied on competition points and matches won, ties are resolved using **quotients** rather than subtractions:
1. **Set Quotient (Eräsuhde)**:
   $$\text{Set Quotient} = \frac{\text{goals\_for}}{\text{goals\_against}}$$
   *(Calculated to 4 decimal places, e.g. $64 / 14 = 4.5714$)*
2. **Point Quotient (Pistesuhde)**:
   $$\text{Point Quotient} = \frac{\text{period\_points\_for}}{\text{period\_points\_against}}$$
   *(Calculated to 4 decimal places, e.g. $1878 / 1502 = 1.2503$)*

---

### 5.6 Volleyball 3-Point Standings Math
The international FIVB / Lentopalloliitto point distribution follows the standard 3-point system:
$$\text{Total Points} = (\text{matches\_won} \times 3) + (\text{matches\_tiedwon} \times 2) + (\text{matches\_tied} \times 1)$$

| Result in Sets | Points to Winner | Points to Loser | Torneopal Winner Column | Torneopal Loser Column |
| :--- | :--- | :--- | :--- | :--- |
| **3–0** | 3 | 0 | `matches_won` | `matches_lost` |
| **3–1** | 3 | 0 | `matches_won` | `matches_lost` |
| **3–2** | 2 | 1 | `matches_tiedwon` | `matches_tied` |

---

### 5.7 Standings Tiebreaker Resolution Hierarchies Across Sports

#### Palloliitto (Football SPL) Tiebreaker Priority:
1. Points (`points` + `starting_points`)
2. Head-to-Head Points among tied teams
3. Head-to-Head Goal Difference
4. Head-to-Head Goals Scored
5. Overall Goal Difference (`goals_diff`)
6. Overall Goals Scored (`goals_for`)
7. Fair Play Draw / Playoff match

#### Salibandyliitto (Floorball SSBL) Tiebreaker Priority:
1. Points (`points`)
2. Regulation Wins (`matches_won3`)
3. Head-to-Head Points
4. Head-to-Head Goal Difference
5. Overall Goal Difference (`goals_diff`)
6. Overall Goals Scored (`goals_for`)

#### Koripalloliitto (Basketball Basket.fi) Tiebreaker Priority:
1. Points (`points` = `matches_won * 2`)
2. Head-to-Head Point Differential
3. Head-to-Head Points Scored
4. Overall Point Differential (`goals_diff`)
5. Overall Points Scored (`goals_for`)

#### Lentopalloliitto (Volleyball) Tiebreaker Priority:
1. Total Points (`points`)
2. Matches Won (`matches_won + matches_tiedwon`)
3. Set Quotient (`goals_for / goals_against`)
4. Point Quotient (`period_points_for / period_points_against`)
5. Head-to-Head Record

---

## 6. Deep Event Log & Roster Telemetry Analysis

### 6.1 Football: Pitch Coordinates, Card Classifications, Sub Dynamics, Referee Crews

#### 1. Pitch Shot Coordinates
In top Finnish football leagues (Veikkausliiga, Kansallinen Liiga), `match.goals[]` entries contain pitch coordinate metadata in `description`:
```json
{
  "event_id": "37006724",
  "time": "2:00",
  "player_name": "Savijoki Aleksi",
  "score_A": 1,
  "score_B": 0,
  "description": "@580,930 oikea"
}
```
- `@580,930`: Pitch grid coordinate on a normalized $1000 \times 1000$ field origin.
- `oikea` / `vasen` / `pää`: Striking anatomy (`oikea` = right foot, `vasen` = left foot, `pää` = header).

#### 2. Disciplinary Taxonomy (Yellow & Red Cards)
Disciplinary events are categorized into three codes:
- `varoitus`: Standard yellow card. The reason code appears in `description`:
  - `A`: Reckless foul / unsporting challenge (*Rikkomus*).
  - `B`: Persistent infringement (*Toistuva rikkoutuminen*).
  - `D`: Dissent / delaying restart (*Protestointi tai ajanpeluu*).
- `ulosajo2varoitus`: Second yellow card leading to dismissal (*Kentältäpoisto 2. varoituksesta*).
- `ulosajo`: Direct red card (*Kentältäpoisto suora punainen*), e.g. violent conduct or denial of an obvious goal-scoring opportunity (DOGSO).

#### 3. Substitution Invariant
```json
{
  "event_id": "36349180",
  "code": "vaihto",
  "time": "61:00",
  "player_name": "Ulundu Vincent",
  "shirt_number": "27",
  "player_2_name": "Salomaa Henri",
  "shirt_2_number": "25"
}
```
- Outgoing player: `player_name` / `shirt_number`
- Incoming player: `player_2_name` / `shirt_2_number`

#### 4. Complete Referee Crew Telemetry
Torneopal models the full professional referee crew in `match`:
- `referee_1_name`: Head Referee (*Erotuomari*)
- `assistant_referee_1_name`: 1st Assistant Referee (*1. avustava erotuomari*)
- `assistant_referee_2_name`: 2nd Assistant Referee (*2. avustava erotuomari*)
- `fourth_official_name`: 4th Official (*Tarkkailija / 4. erotuomari*)
- `var_name`: Video Assistant Referee (*Videoerotuomari*)
- `avar_name`: Assistant Video Assistant Referee (*Avustava videoerotuomari*)

---

### 6.2 Floorball: Period Structure, Assist Linkage (`connected_event_id`), Disciplinary Codes

#### 1. Period Progression
- Periods 1, 2, 3: 20-minute (or 15-minute) regulation periods.
- Period 4: Overtime (OT, *jatkoaika*), played as sudden death (5 to 10 minutes).
- Period 5: Penalty Shootout (*rangaistuslaukauskilpailu*).

#### 2. Relational Assist Linkage via `connected_event_id`
In Torneopal floorball, assists are not embedded attributes of the goal. They are emitted as separate events with `code: "syotto"` containing `connected_event_id` pointing directly to the goal's `event_id`:
```json
// Goal Event
{
  "event_id": "41212360",
  "code": "maali",
  "time": "4:04",
  "player_name": "Hyrkkö Artturi",
  "connected_event_id": "0"
}

// Linked Assist Event
{
  "event_id": "41212362",
  "code": "syotto",
  "time": "4:04",
  "player_name": "Tallgren Rodriguez Niilo",
  "connected_event_id": "41212360"
}
```

#### 3. Complete Floorball Penalty Reason Code Dictionary

| Code | Finnish Text | English Translation | Default Duration |
| :--- | :--- | :--- | :--- |
| `KP` | Kiinnipitäminen | Holding | 2 min |
| `VFP` | Varomaton fyysinen pelaaminen | Careless physical play | 2 min |
| `PFP` | Piittaamaton fyysinen pelaaminen | Reckless physical play | 5 min / PR |
| `EST` | Estäminen | Interference / Obstruction | 2 min |
| `TYO` | Työntäminen | Pushing | 2 min |
| `VMP` | Varomaton mailalla pelaaminen | Careless high stick / slash | 2 min |
| `PMP` | Piittaamaton mailalla pelaaminen | Reckless stick infraction | 5 min |
| `JVP` | Toistuva väärä pelitapa | Repeated incorrect play | 2 min |
| `ETA` | Väärä etäisyys | Failure to respect 3m distance | 2 min |
| `KOR` | Korkea maila | High sticking | 2 min |
| `MLY` | Maasta pelaaminen / Mailan lyöminen | Playing from floor / Hitting stick | 2 min |
| `MPA` | Mailaan painaminen | Pressing the opponent's stick | 2 min |
| `VAA` | Väärä varuste | Illegal equipment | 2 min |
| `VAV` | Väärä vaihto | Too many players on field | 2 min |
| `EPP` | Epäurheilijamainen käytös | Unsportsmanlike conduct | 2 min / 10 min |

---

### 6.3 Basketball: Play-by-Play Scoring Grammar, Foul Codes (P0–P3, T1, U2), FIBA LiveStats

#### 1. Play-by-Play Scoring Grammar
Basketball events use `code: "maali"` with a structured description grammar:
```json
{
  "event_id": "1284721",
  "code": "maali",
  "player_name": "Elliott Greg",
  "description": "3 0-5",
  "s_A": 0,
  "s_B": 5
}
```
- Leading character `3`: Point value of the shot (3-pointer).
- Trailing substring `0-5`: Running scoreboard state.
- Free throws appear with leading `1` (e.g. `1 6-8`), 2-pointers with `2` (e.g. `2 10-8`).

#### 2. Disciplinary Foul Classifications
Personal and team fouls use `code: "virhe"`:
- `description`: Sequential personal foul count for that player (`1`..`5`).
- `note`: Standard FIBA foul code:
  - `P0`: Common foul, no free throws.
  - `P1`: Shooting foul with 1 free throw awarded (and-one).
  - `P2`: Shooting foul with 2 free throws awarded.
  - `P3`: Shooting foul on 3-point attempt (3 free throws).
  - `T1`: Technical foul (1 free throw + ball possession).
  - `U2`: Unsportsmanlike foul (2 free throws + ball possession).

#### 3. FIBA LiveStats / Genius Sports External Integration
In Korisliiga matches, Torneopal stores external UUIDs in `match`:
- `match_external_id`: e.g. `"8272cd16-90de-11f1-9c97-a7857ed9dbd3"`
- `category_external_id`: e.g. `"9b5e6a7c-90dc-11f1-a0b4-c9ca21b3272e"`
These identifiers link directly to Genius Sports / FIBA LiveStats widgets:
`https://hosted.dcd.shared.geniussports.com/FBAA/en/match/{match_external_id}`

---

### 6.4 Volleyball: Set Rally Tracking, Deuce Extension Rules, DataVolley Player Analytics

#### 1. Set Rally Progression & Win-by-2 Deuce Rules
- Sets 1–4 are played to 25 points.
- Set 5 (Tie-break) is played to 15 points.
- **Deuce Extension Rule**: If the score reaches 24–24 (or 14–14 in Set 5), play continues until one team achieves a 2-point lead (e.g. 27–25, 31–29).
- Play-by-play points are recorded with `code: "piste"`:
  ```json
  {
    "event_id": "32383536",
    "code": "piste",
    "player_name": "Laitinen Leo",
    "period": "1",
    "description": "0-1",
    "ps_A": 0,
    "ps_B": 1
  }
  ```

#### 2. DataVolley / VolleyMetrics Advanced Player Statistics
In Mestaruusliiga and 1-sarja, `getPlayer` embeds DataVolley statistics:
- `SpikePerfPercent`: Attack kill percentage
- `SpikePosPercent`: Positive attack percentage
- `RecPerfPercent`: Perfect serve reception percentage
- `RecPosPercent`: Positive serve reception percentage
- `ServeWin`: Service aces
- `ServeErr`: Service errors
- `BlockWin`: Kill blocks

#### 3. Centrifugo Real-Time Live Score WebSocket
Lentopalloliitto streams live volleyball rally points over Centrifugo:
- URL: `wss://centrifugo.torneopal.com:8000/connection/websocket`
- Channel: `lentopallo`
- Transport: JSON over WebSocket with JWT authentication.

---

## 7. Edge-Case Payload Quirks & Defensive Parsing Rules

### 7.1 Forfeits & Walkovers (`luovutus` / `luov.`) Across All Sports
When a team forfeits an official match, Torneopal displays a severe internal schema contradiction that crashes naive client applications:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FORFEIT SCHEMA DIVERGENCE                         │
│                                                                             │
│   getGroup (Fixture List):           getMatch (Match Center):               │
│   status = "Forfeited"               status = "Played"   ◄── [DANGER!]      │
│   matchcard_status = "Forfeited"     matchcard_status = "Locked"            │
│   walkover = 1                       walkover = 1                           │
│   forfeit_B = "match"                forfeit_B = "match"                    │
│   goals = []                         goals = []                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Defensive Resolution Rule:
Clients must **never** rely solely on `status === "Played"`. A match is a walkover if:
```typescript
export function isMatchForfeit(match: { walkover?: number | string; status?: string; forfeit_A?: string; forfeit_B?: string }): boolean {
  return (
    Number(match.walkover) === 1 ||
    match.status === 'Forfeited' ||
    Boolean(match.forfeit_A) ||
    Boolean(match.forfeit_B)
  );
}
```

#### Official Administrative Forfeit Scores:
- **Football & Volleyball**: 3–0 or 0–3 (`fs_A: "3", fs_B: "0"`). In volleyball, three 25–0 sets are awarded (`p1: 25-0, p2: 25-0, p3: 25-0`).
- **Floorball (SSBL)**: 5–0 or 0–5 (`fs_A: "5", fs_B: "0"` per SSBL competition regulations § 47; empirically verified in live match 871769). Note the distinction from the 3–0 rule in football/volleyball.
- **Basketball**: 40–0 or 0–40 in Finnish regional leagues; 20–0 in national leagues (`fs_A: "40", fs_B: "0"`). Quarters are empty string `""` or `"-"`.

---

### 7.2 Shootout & Overtime Score Divergences (`es_A` vs `fs_A` vs `ps_A`)
In floorball matches decided by overtime or shootout, three distinct score fields are populated:
1. `es_A` / `es_B`: **End of Regulation Score** (*varsinainen peliaika*, e.g. `4–4`).
2. `ps_A` / `ps_B`: **Penalty Shootout Score** (*RPK*, e.g. `4–2`).
3. `fs_A` / `fs_B`: **Official Final Score**, which includes the decisive shootout goal (e.g. `5–4`).

In `match.events[]`:
- Shootout attempts are assigned to `period: "5"`.
- Successful penalty shots have `code: "rpkmaali"`.
- Missed attempts have `code: "rpkohi"`.
- The game-winning decisive penalty is logged as `code: "maali"` with description `YV 5-4` at timestamp `65:00`.

---

### 7.3 Goalkeeper Schema Anomaly: Empty String vs Object in `saves_by_period`
When a goalkeeper is listed on the roster but plays 0 minutes or records zero saves, Torneopal serializes `saves_by_period` as an **empty string `""`** instead of an empty object `{}` or `null`.

If typed as `Record<string, number>`, JavaScript calls such as `Object.keys(player.saves_by_period)` will return `['0']` or crash.

```typescript
export function safePeriodSaves(val: unknown): Record<string, number> {
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    return val as Record<string, number>;
  }
  return {};
}
```

---

### 7.4 Amateur & Youth Rostering Gaps (`"Ei pelaajia"`)
In lower regional divisions (e.g. Vitonen, Kutonen, Kuntosarjat) and grassroots youth tournaments:
- `match.lineups` is frequently `undefined` or an empty array `[]`.
- Score events have `player_name: "Ei pelaajia"` and empty `shirt_number`.
- Application logic must gracefully fallback to rendering running scores without crashing on missing player IDs.

---

### 7.5 Series Playoff Aggregates vs Single Match Fixtures
In playoff phases, Torneopal's `getMatches` returns both series aggregate items (e.g. `fs_A: 4, fs_B: 1` representing a best-of-7 series standing) and individual match scoreboards. Parsers must differentiate series summaries (`round_name` containing "Välierät" or "Puolivälierät" and scores $\le 4$) from single-game box scores.

---

### 7.6 WhatsApp Briefing Generation & Word-Boundary Token Leak Sentinel
When generating 1-tap WhatsApp briefings for coaches and parents, unhandled `undefined`, `null`, `NaN`, `[object Object]`, or template placeholders (`[PVM]`, `[SYÖTÄ TULOS]`) must never leak into shared messages.

#### Word-Boundary Rule (The MATH-10 Invariant):
Naive substring matching for `"null"` incorrectly flags legitimate Finnish and Swedish text:
- Finnish: `"Ottelu on peruttu ja annulloitu liiton päätöksellä."` (contains `"null"` in *annulloitu*).
- Swedish: `"Matchen är annullerad."` (contains `"null"` in *annullerad*).

The mandatory regex incorporates word boundaries `\b`:
```typescript
export const TOKEN_LEAK_REGEX =
  /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;

export function assertZeroTokenLeaks(text: string): void {
  if (TOKEN_LEAK_REGEX.test(text)) {
    throw new Error(`Token leak detected in briefing text: "${text}"`);
  }
}
```

---

## 8. Concrete Reproducible Verification Suite

### 8.1 Reproducible cURL Command Suite (All 4 Sports + Tupa)

#### 1. Football (Palloliitto SPL) — Live Veikkausliiga Match Center
```bash
curl -s -X GET "https://spl.torneopal.net/taso/rest/getMatch?match_id=4036852" \
  -H "Accept: json/4h7dznqdxwtp3hsfdyf5r793uahfxy7x" \
  -H "Referer: https://tulospalvelu.palloliitto.fi/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

#### 2. Floorball (Salibandyliitto SSBL) — Live F-liiga Overtime & Shootout Match
```bash
curl -s -X GET "https://salibandy-api.torneopal.net/taso/rest/getMatch?match_id=868865" \
  -H "Accept: json/zsn3anknxzcfzc23k53jqdcd4pymutsf" \
  -H "Referer: https://tulospalvelu.salibandy.fi/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

#### 3. Basketball (Koripalloliitto Basket.fi) — Live Korisliiga Match with Shared Key
```bash
curl -s -X GET "https://koripallo-api.torneopal.net/taso/rest/getMatch?match_id=968705" \
  -H "Accept: json/df8e84j9xtdz269euy3h" \
  -H "Referer: https://tulospalvelu.basket.fi/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

#### 4. Volleyball (Lentopalloliitto) — Live 1-sarja Match with Shared Key
```bash
curl -s -X GET "https://lentopallo-api.torneopal.net/taso/rest/getMatch?match_id=738046" \
  -H "Accept: json/df8e84j9xtdz269euy3h" \
  -H "Referer: https://tulospalvelu.lentopallo.fi/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

#### 5. Torneopal Tupa (Generic Cups & Tournaments)
```bash
curl -s -X GET "https://tupa.api.torneopal.com/taso/rest/getCompetitions?current=1" \
  -H "Accept: json/tpqgz8ddy2rt9w8xuyxr" \
  -H "Referer: https://tupa.torneopal.fi/" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

---

### 8.2 Standalone Node.js Verification Test Harness
Save the script below as `verify-federations.mjs` and execute with `node verify-federations.mjs`:

```javascript
/**
 * Standalone Finnish Sports Federation REST API Verification Harness
 * Tests live endpoints across Football, Floorball, Basketball, and Volleyball.
 */

const FEDERATIONS = [
  {
    sport: 'Football (SPL)',
    url: 'https://spl.torneopal.net/taso/rest/getMatch?match_id=4036852',
    key: '4h7dznqdxwtp3hsfdyf5r793uahfxy7x',
    referer: 'https://tulospalvelu.palloliitto.fi/',
    assertFn: (json) => {
      if (json.call?.status !== 'ok') throw new Error('Call status not ok');
      if (!json.match?.team_A_name || !json.match?.team_B_name) throw new Error('Teams missing');
      if (json.match.period_count !== '2') throw new Error('Football must have 2 periods');
    }
  },
  {
    sport: 'Floorball (SSBL)',
    url: 'https://salibandy-api.torneopal.net/taso/rest/getMatch?match_id=868865',
    key: 'zsn3anknxzcfzc23k53jqdcd4pymutsf',
    referer: 'https://tulospalvelu.salibandy.fi/',
    assertFn: (json) => {
      if (json.call?.status !== 'ok') throw new Error('Call status not ok');
      if (!json.match?.p1s_A || !json.match?.p2s_A || !json.match?.p3s_A) throw new Error('3 periods missing');
      if (json.match.period_count !== '3') throw new Error('Floorball must have 3 periods');
    }
  },
  {
    sport: 'Basketball (Basket.fi)',
    url: 'https://koripallo-api.torneopal.net/taso/rest/getMatch?match_id=968705',
    key: 'df8e84j9xtdz269euy3h', // Shared key
    referer: 'https://tulospalvelu.basket.fi/',
    assertFn: (json) => {
      if (json.call?.status !== 'ok') throw new Error('Call status not ok');
      if (!json.match?.p1s_A || !json.match?.p4s_A) throw new Error('4 quarters missing');
      if (json.match.period_count !== '4') throw new Error('Basketball must have 4 quarters');
    }
  },
  {
    sport: 'Volleyball (Lentopalloliitto)',
    url: 'https://lentopallo-api.torneopal.net/taso/rest/getMatch?match_id=738046',
    key: 'df8e84j9xtdz269euy3h', // Shared key
    referer: 'https://tulospalvelu.lentopallo.fi/',
    assertFn: (json) => {
      if (json.call?.status !== 'ok') throw new Error('Call status not ok');
      if (!json.match?.fs_A || !json.match?.fs_B) throw new Error('Set score missing');
      if (!json.match?.p1s_A) throw new Error('Set 1 points missing');
    }
  }
];

async function runAudit() {
  console.log('--- Starting Finnish Sports Federation API Live Audit ---');
  let passed = 0;

  for (const fed of FEDERATIONS) {
    process.stdout.write(`Testing ${fed.sport.padEnd(28)}... `);
    try {
      const response = await fetch(fed.url, {
        headers: {
          'Accept': `json/${fed.key}`,
          'Referer': fed.referer,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const rawText = await response.text();
      // Defensively parse PHP buffer bleed
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      const cleanJson = JSON.parse(rawText.slice(start, end + 1));

      fed.assertFn(cleanJson);
      console.log(`PASS [HTTP 200 OK, Result: ${cleanJson.match.team_A_name} vs ${cleanJson.match.team_B_name}]`);
      passed++;
    } catch (err) {
      console.log(`FAIL [${err.message}]`);
    }
  }

  console.log(`--- Audit Complete: ${passed}/${FEDERATIONS.length} Federations Verified ---`);
}

runAudit();
```

---

### 8.3 Live Endpoint Assertion Checklist
Before declaring federation compatibility in production environments, automated test runners must verify:
- [x] Correct header injected: `Accept: json/{apiKey}`
- [x] Correct referer spoofing applied: `Referer: https://tulospalvelu.{domain}.fi/`
- [x] PHP buffer bleed parsed safely via `parseTasoPayload()`
- [x] Missing goalie `saves_by_period: ""` handled without `TypeError`
- [x] Forfeit condition checked via `walkover === 1` or `forfeit_B`
- [x] Shootout and overtime regulation scores (`es_A` / `es_B`) separated from final score (`fs_A` / `fs_B`)
- [x] WhatsApp briefing strings validated with `assertZeroTokenLeaks()`
- [x] Standings tiebreakers calculated using sport-specific rules (H2H vs Quotients)
