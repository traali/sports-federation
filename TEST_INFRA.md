# 🏛️ Weather Stats Test Infrastructure & Methodology Specification (TEST_INFRA.md)

**Monastery:** `c:\compdev\weather-stats`  
**Test Suite:** `c:\compdev\scripts\weather-e2e-tests.mjs`  
**Standard:** AAIF / W3C WebMCP Standard, Sakkoja/Navikka Meteorological Invariants, Finnish 30/30 Lightning Rule  
**Version:** 1.0.0  

---

## 1. Executive Summary & Quality Philosophy

The `weather-stats` sovereign monastery delivers meteorological forecasts, real-time lightning safety risk assessments, dynamic radar/satellite map layers, and autonomous WebMCP agent interfaces for the Finnish Youth Sports Federation ecosystem.

Because weather conditions directly affect player safety (e.g. hypothermia from wind chill, ligament injuries on frozen turf, lethal lightning strikes on outdoor pitches), verification of `weather-stats` must be **uncompromising, independent, and strictly opaque-box**.

The test infrastructure strictly adheres to the **Antigravity Quality & Verification Philosophy**:
1. **Opaque-Box Independence**: The test harness treats `weather-stats` as an untrusted black box, asserting only against observable contract outputs, JSON schemas, mathematical invariants, and browser bridge events.
2. **Zero-Mock Fallback Invariant**: Safety dictates that offline states must return cached observations marked `isCacheFallback: true` or explicit error states, **never fabricating synthetic weather or fake lightning strikes**. Fabricating 0 lightning strikes during an active thunderstorm creates severe physical hazard.
3. **Mandatory 5-Point Test Plan Specification**: Every test case defines User Journey, Reason It Exists, What It Tests, When It Succeeds, and When It Should Fail.

---

## 2. Testing Methodologies

The test architecture integrates four rigorous testing methodologies to maximize defect detection while keeping execution lightning fast (< 2 seconds):

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                           4-TIER TEST METHODOLOGY ARCHITECTURE                            │
├──────────────────────────┬──────────────────────────┬─────────────────────────────────────┤
│ 1. Category-Partition    │ Equivalent classes for   │ Temp, Wind, Rain, Distance, Age,    │
│    Method                │ input parameters         │ Coordinates, Latency                │
├──────────────────────────┼──────────────────────────┼─────────────────────────────────────┤
│ 2. Boundary Value        │ Extreme edges & zero-    │ -1.0°C freeze, 0.3 mm/h slickness,  │
│    Analysis (BVA)        │ crossing discontinuities │ 0 m/s calm, 10 km / 20 km lightning │
├──────────────────────────┼──────────────────────────┼─────────────────────────────────────┤
│ 3. Pairwise /            │ Combinatorial orthogonal │ Temp × Wind × Precip × Lightning    │
│    Combinatorial Matrix  │ compound conditions      │ Freezing rain, severe squalls       │
├──────────────────────────┼──────────────────────────┼─────────────────────────────────────┤
│ 4. Real-World Workload   │ End-user family and      │ Väiski matchday thunderstorm,       │
│    Testing               │ tournament scenarios     │ multi-venue Saturday, Tampere cold  │
└──────────────────────────┴──────────────────────────┴─────────────────────────────────────┘
```

### 2.1 Category-Partition Method
Parameters are partitioned into discrete, non-overlapping equivalence classes:

| Parameter | Equivalence Classes | Representative Values |
|---|---|---|
| **Air Temperature ($T_a$)** | Extreme Cold ($< -10^\circ\text{C}$), Freezing ($-10^\circ\text{C}$ to $-1^\circ\text{C}$), Marginal ($-1^\circ\text{C}$ to $10^\circ\text{C}$), Mild ($10^\circ\text{C}$ to $20^\circ\text{C}$), Summer Heat ($> 20^\circ\text{C}$) | $-25^\circ\text{C}, -3^\circ\text{C}, 5^\circ\text{C}, 16^\circ\text{C}, 28^\circ\text{C}$ |
| **Wind Speed ($V$)** | Calm ($0\text{ m/s}$), Light breeze ($1-4\text{ m/s}$), Moderate ($5-10\text{ m/s}$), Gale ($> 12\text{ m/s}$), Storm gust ($> 20\text{ m/s}$) | $0.0, 2.5, 7.0, 14.0, 26.0\text{ m/s}$ |
| **Precipitation ($r$)** | Dry ($0.0\text{ mm/h}$), Dew/Mist ($0.1-0.3\text{ mm/h}$), Rain ($> 0.3-5.0\text{ mm/h}$), Downpour ($> 5.0\text{ mm/h}$) | $0.0, 0.2, 1.8, 12.0\text{ mm/h}$ |
| **Lightning Distance ($d$)** | Direct hit ($0.0\text{ km}$), Danger zone ($< 10\text{ km}$), Watch zone ($10-20\text{ km}$), Safe zone ($> 20\text{ km}$) | $0.0, 4.2, 14.5, 35.0\text{ km}$ |
| **Strike Freshness ($\Delta t$)** | Fresh / Pulsing halo ($< 15\text{ min}$), Older / Muted dot ($15-30\text{ min}$), Stale / Expired ($> 30\text{ min}$) | $6\text{ min}, 22\text{ min}, 45\text{ min}$ |
| **Bridge Latency** | Instant cache ($< 50\text{ ms}$), Normal network ($100-350\text{ ms}$), SLA ceiling ($500\text{ ms}$) | $20\text{ ms}, 210\text{ ms}, 490\text{ ms}$ |

### 2.2 Boundary Value Analysis (BVA)
Key mathematical transition boundaries subjected to single-step and epsilon-step verification:

1. **Turf Freeze Transition**:
   - $T_a = -1.00^\circ\text{C}$ with rain $1.0\text{ mm/h}$ $\implies$ `'slick'` ($T \ge -1.0^\circ\text{C}$).
   - $T_a = -1.01^\circ\text{C}$ with rain $1.0\text{ mm/h}$ $\implies$ `'frozen'` ($T < -1.0^\circ\text{C}$).
2. **Turf Slickness Precipitation Transition**:
   - $T_a = 15.0^\circ\text{C}$, $r = 0.30\text{ mm/h}$ $\implies$ `'dry'` ($r \le 0.30$).
   - $T_a = 15.0^\circ\text{C}$, $r = 0.31\text{ mm/h}$ $\implies$ `'slick'` ($r > 0.30$).
3. **Calm Wind Discontinuity Guard**:
   - $T_a = 5.0^\circ\text{C}$, $V = 0.0\text{ m/s}$ $\implies$ exactly $5.0^\circ\text{C}$ (FMI continuous formula convergence).
4. **Lightning Match Suspension Boundary**:
   - $d = 9.99\text{ km}$, $\Delta t = 10\text{ min}$ $\implies$ `status: 'danger'`, `suspendMatchRecommended: true`.
   - $d = 10.01\text{ km}$, $\Delta t = 10\text{ min}$ $\implies$ `status: 'watch'`, `suspendMatchRecommended: false`.
5. **Lightning Watch Boundary**:
   - $d = 19.99\text{ km}$ $\implies$ `status: 'watch'`.
   - $d = 20.01\text{ km}$ $\implies$ `status: 'clear'`.
6. **Clock Skew Clamp Boundary**:
   - Strike timestamp in future ($\Delta t = -5\text{ min}$) clamped to 0 elapsed minutes, preventing negative values from bypassing safety timers.

### 2.3 Pairwise / Combinatorial Testing
Interaction of environmental variables:
- `T < -1°C` + `Rain > 0.3 mm/h` (Freezing Rain): verifies freeze classification takes precedence over slickness while noting icing hazard.
- `T > 20°C` + `Rain > 10 mm/h` + `Lightning < 10 km` (Summer Thunderstorm Squall): verifies rain downpour warning, slick turf, match suspension, and animated radar layer synchrony.
- `High Wind Gust > 15 m/s` + `Dry`: verifies wind advisory badge generation without unnecessary rain or turf warnings.

### 2.4 Real-World Workload Testing
Realistic Finnish youth sports family and matchday scenarios:
- **Scenario 1**: Saturday match at Töölön Pallokenttä (Väiski) with an incoming afternoon thunderstorm cell.
- **Scenario 2**: Multi-venue Saturday family schedule coordination (Tuomas at Otahalli, Aino at Leppävaara, Eero at Kisahalli).
- **Scenario 3**: Sub-zero winter football fixture on artificial turf in Tampere (Kauppi Sports Park).
- **Scenario 4**: High-frequency concurrent WebMCP bridge message burst stress test.

---

## 3. Four-Tier Test Suite Architecture

The executable test suite `scripts/weather-e2e-tests.mjs` executes tests across 4 structured tiers:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             TIER 1: FEATURE COVERAGE                                     │
│  >= 5 tests per feature: get_venue_weather_forecast, get_pitch_lightning_risk,           │
│  get_radar_satellite_layer, and cross-frame postMessage bridge (24 tests total).         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                             TIER 2: BOUNDARY & CORNER CASES                              │
│  Extreme cold (-25°C), heatwave (35°C 90% RH), calm wind (0 m/s), storm gusts,          │
│  direct strike (0 km), 9.9 vs 10.1 km, 19.9 vs 20.1 km, clock skew, offline cache       │
│  fallback with zero synthetic strikes, anti-token leak invariant (12 tests total).       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                             TIER 3: CROSS-FEATURE COMBINATIONS                           │
│  Freezing rain compound event, severe thunderstorm downpour + suspension,                │
│  60°N BBOX aspect ratio correction, 5-min radar cadence, UI URI parity (5 tests).        │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                             TIER 4: REAL-WORLD MATCHDAY WORKLOADS                        │
│  Väiski matchday thunderstorm, 3-venue multi-sport family Saturday,                      │
│  Tampere winter drizzle, rapid concurrent WebMCP bridge burst (4 scenarios).             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The 5-Point Test Plan Specifications (Sample Representative Tests)

Following `docs/plans/TEST_PLAN_STANDARD.md`, key tests are specified as follows:

### Step 1: Venue Point Forecast & Apparent Temperature (`T1.1.1`)
* **👤 User Journey:** A coach checks the weather card for Töölön Pallokenttä before Saturday 14:00 kickoff to select team gear and warmup intensity.
* **🎯 Reason Why It Exists:** Raw thermometer temperature is misleading in coastal Helsinki; players get hypothermia if wind chill and dampness are ignored.
* **🧪 What It Tests:** `get_venue_weather_forecast` tool output, feels-like calculation, turfCondition='dry' ('Kuiva'), and `uiResourceUri` formatting.
* **🟢 When It Succeeds:** Returns complete typed payload with finite temperature, matching feelsLike, valid turfCondition, and non-empty UI URI.
* **🔴 When It Should Fail:** If temperature is NaN/undefined, if turf condition is missing, or if UI URI does not begin with `ui://weather/venue-card`.

### Step 2: Imminent Pitch Lightning Danger & 30/30 Suspension (`T1.2.2`)
* **👤 User Journey:** During a junior match at Käpylä, dark clouds roll in. A cloud-to-ground strike occurs 4.2 km away. The referee's phone sounds an emergency alert.
* **🎯 Reason Why It Exists:** Lightning kills and injures youth players on open sports fields. Referees need immediate, decisive suspension instructions.
* **🧪 What It Tests:** Finnish 30/30 lightning safety engine, `suspendMatchRecommended: true`, `resumeCountdownMinutes: 22`, and Finnish advisory text.
* **🟢 When It Succeeds:** Evaluates `status: 'danger'`, recommends immediate suspension, calculates remaining countdown minutes, and formats warning message.
* **🔴 When It Should Fail:** If `suspendMatchRecommended` is false for a strike < 10 km, if countdown minutes are negative, or if strike distance divides by zero.

### Step 3: FMI Open Data WMS Radar Layer with 60°N BBOX Correction (`T3.3`)
* **👤 User Journey:** A parent opens the radar drawer to see if the rain front will hit the field during the second half.
* **🎯 Reason Why It Exists:** At 60°N latitude in Finland, standard square degree bounding boxes compress maps horizontally by almost 50% due to meridian convergence.
* **🧪 What It Tests:** `get_radar_satellite_layer` BBOX calculation ($\Delta\text{lng} = \Delta\text{lat} \times 1.8$), 5-minute timestep rounding, and WMS 1.3.0 URL parameters.
* **🟢 When It Succeeds:** Returns valid WMS URL with `CRS:84` or `EPSG:3857`, BBOX aspect ratio $\approx 1.8$, and transparent PNG format.
* **🔴 When It Should Fail:** If BBOX coordinates are NaN, if aspect ratio is 1:1 (uncompensated distortion), or if timestamp is not aligned to 5 minutes.

### Step 4: Cross-Frame WebMCP postMessage Bridge 500 ms SLA (`T1.4.5`)
* **👤 User Journey:** Pelipäivä embeds the weather drawer inside an iframe. The parent opens the drawer, and the weather status renders instantaneously without lag.
* **🎯 Reason Why It Exists:** Slow iframe handshakes freeze the UI and degrade user trust.
* **🧪 What It Tests:** `window.postMessage` bridge protocol (`webmcp:request` / `webmcp:response`), correlation ID matching, and latency $< 500\text{ ms}$.
* **🟢 When It Succeeds:** Query returns valid result with matching correlation ID in $< 500\text{ ms}$ (typically $< 50\text{ ms}$).
* **🔴 When It Should Fail:** If response ID mismatches request ID, if promise times out after 500 ms, or if unhandled exception breaks the window listener.

---

## 5. Execution Environment & CLI Invocations

The test suite is built in native ECMAScript Modules (`.mjs`) compatible with modern Node.js ($v26+$), requiring zero external testing framework dependencies for maximum execution speed and zero CI friction.

### Standalone E2E Test Suite Run:
```powershell
node scripts/weather-e2e-tests.mjs
```

### Verification in Full Federation Pipeline:
```powershell
npm test
```

### Exit Code Contracts:
- `0`: All test cases passed with 100% assertions fulfilled.
- `1`: Any assertion failure, contract violation, or unparsed token detected.
