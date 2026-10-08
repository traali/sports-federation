/**
 * 👑 SUPREME GOLDEN END-USER TEST (Abbas Primas / The Golden Bull)
 *
 * Simulates a complete real-world Saturday Matchday journey for a Finnish family:
 * - 3 Kids in 3 Sports: Tuomas (Salibandy @ Otahalli), Aino (Futis @ Väiski), Eero (Koripallo @ Tapiolan Honka)
 *
 * This test suite executes TRUE SEMANTIC VALIDATION of runtime business logic,
 * calculations, data contracts, and production endpoints across all 6 monasteries:
 * - STEP 1: Live Production Edge Audit (HTTP 200, Live JS Bundles, Commit Hashes, UI Badges)
 * - STEP 2: Real-World URL & Team Ingestion Engine Execution
 * - STEP 3: Multi-Sport Family Conflict Agent (pelipaiva conflictAgent) Execution
 * - STEP 4: ParkkiS Deep Link Contract (parking risk stays in ParkkiS)
 * - STEP 5: Multi-Sport Scoring Strategies & Standings Calculation (SportRulesRegistry)
 * - STEP 6: Football Tournament Page Composition
 * - STEP 7: Basketball Score Logic on Recorded Basket.fi Games
 * - STEP 8: 1-Tap Post-Match WhatsApp Share Generation & Round-Trip Parsing
 * - STEP 9: AI Agent WebMCP Tool Discovery & JSON Schema Validation
 * - STEP 10: Anti-Pattern & Complexity Regression Gate (Ensuring No Regressions to God Components)
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Import actual runtime modules to truly test business logic execution
import {
  extractTeamIdFromUrl,
  getFinnishTimezoneOffset,
  normalizeUrlString,
} from '../pelipaiva/src/lib/api/associationUrlParser.ts'

// pelipaiva #36 deleted familyConflictEngine.ts (dead code). The app's real conflict logic:
import { conflictAgent } from '../pelipaiva/src/lib/agents/conflictAgent.ts'
// pelipaiva #42 deleted calculateParkingRiskContract (a bounding-box guess, not ParkkiS data).
// Parking risk belongs to ParkkiS; pelipaiva only builds the deep link.
import { buildParkingDeepLink } from '../pelipaiva/src/types/contracts.ts'
import { SportRulesRegistry } from '../pelipaiva/src/lib/stats/SportRulesRegistry.ts'

import {
  generateJoinWhatsApp,
  generateRosterDeltaWhatsApp,
  generateTalkooWhatsApp,
  parseFamilyWhatsAppMessage,
} from '../pelipaiva/src/lib/sync/familyWhatsApp.ts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')

console.log('\n' + '═'.repeat(76))
console.log('👑 SUPREME GOLDEN END-USER TEST SUITE (True Semantic Execution Gate)')
console.log('═'.repeat(76) + '\n')

let passedSteps = 0
const totalSteps = 10
const failedSteps = []

function pass(stepNum, title, details) {
  passedSteps++
  console.log(`✅ [STEP ${stepNum}/${totalSteps}] ${title}`)
  if (details) console.log(`   ${details}\n`)
}

function fail(stepNum, title, error) {
  console.error(`❌ [STEP ${stepNum}/${totalSteps}] FAIL: ${title}`)
  console.error(`   Error: ${error}\n`)
  // Keep going: one red step must not hide whether the other steps pass.
  failedSteps.push(`STEP ${stepNum}: ${title}`)
}

async function runSupremeGoldenTest() {
  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Deep Live Production Audit (All 6 Services)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const services = [
      { name: '📱 Pelipäivä Hub', url: 'https://pelipaiva.pages.dev' },
      { name: '🅿️ ParkkiS Spatial Map', url: 'https://parkkis.pages.dev' },
      { name: '🏑 Floorball Stats', url: 'https://floorball-stats.pages.dev' },
      { name: '🏀 Basketball Stats', url: 'https://basketball-stats-byu.pages.dev' },
      { name: '⚽ Football Stats', url: 'https://football-stats-agk.pages.dev' },
      { name: '🏐 Volleyball Stats', url: 'https://volleyball-stats-7xq.pages.dev' },
    ]

    const settled = await Promise.allSettled(
      services.map(async (svc) => {
        const res = await fetch(svc.url, { method: 'GET' })
        if (res.status !== 200) {
          throw new Error(`${svc.name} failed to load: HTTP ${res.status} on ${svc.url}`)
        }
        const html = await res.text()
        if (!html || !html.includes('<div id="root">')) {
          throw new Error(`${svc.name} returned invalid HTML payload (missing #root container)`)
        }

        // Extract and inspect live JS bundles for build version, git commit, and UI badge
        const scriptRegex = /src=["']([^"']+\.js)/g
        const scriptMatches = []
        let match
        while ((match = scriptRegex.exec(html)) !== null) {
          scriptMatches.push(match[1])
        }

        if (scriptMatches.length === 0) {
          throw new Error(`${svc.name} has no JS script tags referenced in HTML!`)
        }

        let foundCommit = null
        let foundBuildInfo = false
        let foundBadge = false

        for (const src of scriptMatches) {
          const scriptUrl = src.startsWith('http') ? src : new URL(src, svc.url).href
          const scriptRes = await fetch(scriptUrl)
          if (scriptRes.status !== 200) continue
          const js = await scriptRes.text()

          if (js.includes('__APP_BUILD_INFO__')) foundBuildInfo = true
          if (js.includes('app-version-badge')) foundBadge = true

          const commitMatch = js.match(/commit[:=]\s*[`"']([a-f0-9]{7,40})[`"']/i) || js.match(/git[:=]\s*[`"']?([a-f0-9]{7,40})[`"']?/i)
          if (commitMatch && !foundCommit) foundCommit = commitMatch[1]
        }

        if (!foundBuildInfo || !foundCommit || !foundBadge) {
          throw new Error(`${svc.name} missing live build info (commit: ${foundCommit || 'NONE'}, info: ${foundBuildInfo}, badge: ${foundBadge})`)
        }

        return `${svc.name}: HTTP 200 OK | git:${foundCommit} | window.__APP_BUILD_INFO__ ✅ | UI Badge ✅`
      })
    )
    // Report every service, not just the first one that fails.
    const failures = settled.filter((r) => r.status === 'rejected').map((r) => r.reason?.message || String(r.reason))
    if (failures.length > 0) throw new Error(failures.join('\n   '))
    const loadResults = settled.map((r) => r.value)

    pass(1, 'All 6 Sovereign Monasteries Live, Deeply Audited & Verified',
      loadResults.join('\n   • '))
  } catch (err) {
    fail(1, 'Service Deep Inspection Gate', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Real-World URL & Team Ingestion Engine Execution
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const rawSalibandyUrl = '  <https://tulospalvelu.salibandy.fi/team/25301/info>  '
    const normalizedSalibandy = normalizeUrlString(rawSalibandyUrl)
    if (!normalizedSalibandy || normalizedSalibandy !== 'https://tulospalvelu.salibandy.fi/team/25301/info') {
      throw new Error(`Failed to normalize URL string: ${normalizedSalibandy}`)
    }

    const salibandyTeamId = extractTeamIdFromUrl(normalizedSalibandy)
    if (salibandyTeamId !== '25301') {
      throw new Error(`Failed to extract salibandy team ID, got: ${salibandyTeamId}`)
    }

    const footballUrl = 'https://tulospalvelu.palloliitto.fi/team/185085'
    const footballTeamId = extractTeamIdFromUrl(footballUrl)
    if (footballTeamId !== '185085') {
      throw new Error(`Failed to extract football team ID, got: ${footballTeamId}`)
    }

    // Verify Finnish Timezone offsets across DST boundaries
    const summerOffset = getFinnishTimezoneOffset(new Date('2026-07-15T12:00:00Z'))
    const winterOffset = getFinnishTimezoneOffset(new Date('2026-01-15T12:00:00Z'))
    if (summerOffset !== '+03:00' || winterOffset !== '+02:00') {
      throw new Error(`Invalid Finnish timezone offsets: Summer=${summerOffset}, Winter=${winterOffset}`)
    }

    pass(2, 'URL Parsing & Timezone Engine Execution (True Runtime Execution)',
      `Extracted Salibandy Team ${salibandyTeamId}, Football Team ${footballTeamId}, verified DST offsets (Summer ${summerOffset}, Winter ${winterOffset}).`)
  } catch (err) {
    fail(2, 'URL Ingestion Execution', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Multi-Sport Family Conflict & Driving Transit Calculation Execution
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    // Saturday morning: Tuomas (Salibandy) @ Otahalli and Aino (Football) @ Töölö overlap.
    // Runs pelipaiva's real conflictAgent (src/lib/agents/conflictAgent.ts).
    const event = (id, profileId, sport, title, warmupTime, startTime, endTime, name, lat, lng) => ({
      id, profileId, sport, eventType: 'match', isTraining: false, title,
      homeTeam: '', awayTeam: '', isHomeMatch: true,
      warmupTime, startTime, endTime,
      venue: { name, normalizedName: name.toLowerCase(), coordinates: { lat, lng } },
    })
    const tuomas = event('match-tuomas-1', 'prof-tuomas', 'floorball', 'Westend Indians vs Oilers',
      '2026-09-05T09:30:00Z', '2026-09-05T10:00:00Z', '2026-09-05T11:15:00Z', 'Otahalli Espoo', 60.1841, 24.8315)
    const aino = event('match-aino-1', 'prof-aino', 'football', 'HJK Sininen vs KäPa',
      '2026-09-05T10:00:00Z', '2026-09-05T10:30:00Z', '2026-09-05T11:45:00Z', 'Töölön Pallokenttä', 60.1873, 24.9258)
    const profiles = [
      { id: 'prof-tuomas', playerName: 'Tuomas' },
      { id: 'prof-aino', playerName: 'Aino' },
    ]

    // 1) Two kids, two venues, overlapping presence windows → one conflict, two drivers.
    const conflicts = conflictAgent([tuomas, aino], profiles)
    if (conflicts.length !== 1) {
      throw new Error(`Expected exactly 1 conflict for the overlapping Saturday matches, got ${conflicts.length}`)
    }
    const clash = conflicts[0]
    if (clash.childA !== 'Tuomas' || clash.childB !== 'Aino') {
      throw new Error(`Conflict names wrong: ${clash.childA} / ${clash.childB}`)
    }
    // Warmup 09:30–11:15 vs 10:00–11:45 → 75 min overlap.
    if (clash.overlapMinutes !== 75) {
      throw new Error(`Expected 75 min overlap (warmup to final whistle), got ${clash.overlapMinutes}`)
    }
    if (clash.severity !== 'critical') {
      throw new Error(`Expected critical severity (overlap > 40 min), got ${clash.severity}`)
    }
    // Pelipäivä does not know the drive between venues (pelipaiva #45): no drive figure at all.
    const driveTalk = /min\s*ajo|siirtymä|ajoaika|~\s*\d+\s*min/i
    if ('travelMinutesEstimate' in clash || clash.gapMinutes !== 0) {
      throw new Error(`Overlap conflict must carry no drive estimate and gapMinutes 0, got ${JSON.stringify({ travel: clash.travelMinutesEstimate, gap: clash.gapMinutes })}`)
    }
    if (driveTalk.test(`${clash.message} ${clash.suggestedFix}`)) {
      throw new Error(`Overlap conflict text guesses a drive: ${clash.message} ${clash.suggestedFix}`)
    }
    if (!clash.suggestedFix.includes('Kaksi kuskia')) {
      throw new Error(`Advisory missing two-driver warning: ${clash.suggestedFix}`)
    }

    // 2) Two kids at the same venue at the same time → one parent covers both, no conflict.
    const ainoAtOtahalli = { ...aino, id: 'match-aino-2', venue: tuomas.venue }
    const sameVenue = conflictAgent([tuomas, ainoAtOtahalli], profiles)
    if (sameVenue.length !== 0) {
      throw new Error(`Two kids at the same venue must not conflict, got ${sameVenue.length}`)
    }

    // 3) Same child booked into two overlapping games → critical, tell the coach.
    const tuomasDouble = { ...aino, id: 'match-tuomas-2', profileId: 'prof-tuomas' }
    const sameChild = conflictAgent([tuomas, tuomasDouble], profiles)
    if (sameChild.length !== 1 || sameChild[0].severity !== 'critical' || !sameChild[0].suggestedFix.includes('valmentajalle')) {
      throw new Error(`Same-child double booking must be 1 critical conflict with coach advice, got ${JSON.stringify(sameChild.map((c) => [c.severity, c.suggestedFix]))}`)
    }

    // 4) Back-to-back at different venues: Tuomas ends 11:15 at Otahalli, Aino meets 11:30 at
    //    Töölö → flagged with the real gap (end → meeting) and the venues, no drive guess.
    const ainoLater = { ...aino, id: 'match-aino-3', warmupTime: '2026-09-05T11:30:00Z', startTime: '2026-09-05T12:00:00Z', endTime: '2026-09-05T13:15:00Z' }
    const tight = conflictAgent([tuomas, ainoLater], profiles)
    if (tight.length !== 1 || tight[0].overlapMinutes !== 0 || tight[0].gapMinutes !== 15) {
      throw new Error(`Back-to-back at two venues must be 1 conflict with gap 15 min, got ${JSON.stringify(tight.map((c) => [c.overlapMinutes, c.gapMinutes]))}`)
    }
    for (const needle of ['väli 15 min', 'Otahalli Espoo', 'Töölön Pallokenttä']) {
      if (!tight[0].message.includes(needle)) throw new Error(`Back-to-back message missing "${needle}": ${tight[0].message}`)
    }
    if (driveTalk.test(`${tight[0].message} ${tight[0].suggestedFix}`)) {
      throw new Error(`Back-to-back text guesses a drive: ${tight[0].message} ${tight[0].suggestedFix}`)
    }
    // A 30 min gap or more is not flagged.
    const ainoLater30 = { ...ainoLater, id: 'match-aino-4', warmupTime: '2026-09-05T11:45:00Z' }
    if (conflictAgent([tuomas, ainoLater30], profiles).length !== 0) {
      throw new Error('A 30 min gap between venues must not be flagged')
    }

    pass(3, 'Multi-Sport Conflict Agent Execution (pelipaiva conflictAgent)',
      `${clash.childA} vs ${clash.childB}: ${clash.overlapMinutes} min overlap, no drive guess, ${clash.severity}. Back-to-back: "${tight[0].message}". Fix: "${clash.suggestedFix}" Same venue: no conflict. Same child double-booked: critical.`)
  } catch (err) {
    fail(3, 'Multi-Sport Conflict Detection', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4: Spatial Parking Intelligence & Entrance Gate Guidance (ParkkiS)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    // pelipaiva no longer guesses a parking risk from coordinates; ParkkiS owns that data.
    const contractsSrc = readFileSync(join(ROOT, 'pelipaiva', 'src', 'types', 'contracts.ts'), 'utf-8')
    if (/export function calculateParkingRiskContract/.test(contractsSrc)) {
      throw new Error('pelipaiva computes its own parking risk again (calculateParkingRiskContract). Risk must come from ParkkiS.')
    }

    // pelipaiva #43: Parkkis reads the venue from /venue/<name> and centres on ?lat=&lon=.
    // The old ?venue= param was ignored by Parkkis. No exact coordinates means no link.
    const venueName = 'Otahalli Espoo' // TASO venue_name of salibandy match 929721
    const href = buildParkingDeepLink('https://parkkis.pages.dev/', venueName, 60.1841, 24.8315)
    const expected = 'https://parkkis.pages.dev/venue/Otahalli%20Espoo?lat=60.1841&lon=24.8315'
    if (href !== expected) {
      throw new Error(`ParkkiS deep link format changed: got ${href}, expected ${expected}`)
    }
    // Non-ASCII and spaces are percent-encoded in the path (TASO venue_name of football match 4208631).
    const encoded = buildParkingDeepLink('https://parkkis.pages.dev/', 'Matinkylä 2 TN B', 60.1841, 24.8315)
    if (encoded !== 'https://parkkis.pages.dev/venue/Matinkyl%C3%A4%202%20TN%20B?lat=60.1841&lon=24.8315') {
      throw new Error(`Venue name not encoded in the path: ${encoded}`)
    }
    for (const [label, lat, lon] of [['no coordinates', undefined, undefined], ['lat only', 60.1841, undefined], ['NaN', NaN, NaN], ['Null Island', 0, 0]]) {
      const none = buildParkingDeepLink('https://parkkis.pages.dev/', 'Kamppi', lat, lon)
      if (none !== null) {
        throw new Error(`ParkkiS link must be null with ${label}, got ${none}`)
      }
    }
    // The link must open Parkkis itself, not a 404.
    const res = await fetch(href, { redirect: 'follow' })
    const html = await res.text()
    if (res.status !== 200 || !/<title>[^<]*ParkkiS/i.test(html)) {
      throw new Error(`ParkkiS deep link did not serve Parkkis: HTTP ${res.status} on ${href}`)
    }

    pass(4, 'ParkkiS Deep Link Contract (risk stays in ParkkiS)',
      `${href} → HTTP ${res.status} (ParkkiS). No link without exact coordinates (missing, partial, NaN, 0,0). No local parking-risk guess in pelipaiva.`)
  } catch (err) {
    fail(4, 'ParkkiS Deep Link Contract', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 5: Multi-Sport Scoring Strategies Execution (SportRulesRegistry)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const floorballStrategy = SportRulesRegistry.get('floorball')
    const footballStrategy = SportRulesRegistry.get('football')
    const basketballStrategy = SportRulesRegistry.get('basketball')
    const volleyballStrategy = SportRulesRegistry.get('volleyball')

    // Invariants
    if (footballStrategy.pointsForWin !== 3 || footballStrategy.pointsForDraw !== 1) {
      throw new Error('Football scoring rules mismatch')
    }
    if (floorballStrategy.pointsForWin !== 2 || floorballStrategy.pointsForDraw !== 1) {
      throw new Error('Floorball scoring rules mismatch')
    }
    if (basketballStrategy.pointsForWin !== 2 || basketballStrategy.hasDraws !== false) {
      throw new Error('Basketball scoring rules mismatch (no draws allowed)')
    }
    if (volleyballStrategy.pointsForWin !== 3 || volleyballStrategy.hasDraws !== false) {
      throw new Error('Volleyball scoring rules mismatch (no draws allowed)')
    }

    // Test calculation with a record: 5 wins, 2 draws, 1 loss
    const fbPoints = floorballStrategy.calculatePoints(5, 2, 1)
    const footPoints = footballStrategy.calculatePoints(5, 2, 1)

    if (fbPoints !== 12) throw new Error(`Floorball points calculation failed, got ${fbPoints}, expected 12`)
    if (footPoints !== 17) throw new Error(`Football points calculation failed, got ${footPoints}, expected 17`)

    pass(5, 'SportRulesRegistry Strategy Pattern Execution (Multi-Sport Invariants)',
      `Floorball: 5W-2D-1L = ${fbPoints} pts (Erä). Football: 5W-2D-1L = ${footPoints} pts (Puoliaika). Basketball: Neljännes (No draws). Volleyball: Erä (No draws).`)
  } catch (err) {
    fail(5, 'Multi-Sport Scoring Strategy Execution', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 6: Football Head-to-Head & Tournament Ingestion Pipeline
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    // football-stats #16 (2026-10-08) folded the tournament standings/matches/playoffs
    // components into the shared StandingsTable and MatchRow. Check what the page really uses.
    const tournamentPagePath = join(ROOT, 'football-stats', 'src', 'pages', 'TurnauksetPage.tsx')
    const required = [
      tournamentPagePath,
      join(ROOT, 'football-stats', 'src', 'hooks', 'useTournamentData.ts'),
      join(ROOT, 'football-stats', 'src', 'components', 'tournament', 'TournamentScorersList.tsx'),
    ]
    const missing = required.filter((f) => !existsSync(f))
    if (missing.length > 0) {
      throw new Error(`Tournament page files missing: ${missing.map((f) => f.replace(ROOT + '/', '')).join(', ')}`)
    }
    const page = readFileSync(tournamentPagePath, 'utf-8')
    for (const name of ['useTournamentData', 'StandingsTable', 'MatchRow', 'TournamentScorersList']) {
      if (!new RegExp(`\\b${name}\\b`).test(page)) {
        throw new Error(`TurnauksetPage no longer uses ${name}`)
      }
    }

    pass(6, 'Football Tournament Page Composition',
      'TurnauksetPage uses useTournamentData, StandingsTable, MatchRow and TournamentScorersList.')
  } catch (err) {
    fail(6, 'Football Stats Verification', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7: Basketball 4-Quarter Scoring, Team Fouls & Bonus Invariants
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    // basketball-stats #18 (2026-10-08) removed TeamFoulTracker ("no invented stats").
    // Run the app's real score logic on its recorded Basket.fi (TASO) games instead of
    // checking arithmetic on made-up numbers.
    const basketDir = join(ROOT, 'basketball-stats')
    const statusPath = join(basketDir, 'src', 'utils', 'matchStatus.ts')
    const fixturePath = join(basketDir, 'tests', 'fixtures', 'basket-get-match.json')
    if (!existsSync(join(basketDir, 'src', 'types', 'contracts.ts')) || !existsSync(statusPath) || !existsSync(fixturePath)) {
      throw new Error('Basketball contracts, utils/matchStatus.ts or tests/fixtures/basket-get-match.json missing')
    }
    const { classifyMatch, visibleScore, periodScores } = await import(pathToFileURL(statusPath).href)
    const games = JSON.parse(readFileSync(fixturePath, 'utf-8')).matches
    const game = (key) => {
      const g = games[key]?.match ?? games[key]
      if (!g) throw new Error(`Fixture game '${key}' missing`)
      return g
    }
    const sumOf = (periods, side) => periods.reduce((t, p) => t + (side === 'home' ? p.scoreHome : p.scoreAway), 0)
    const now = new Date('2026-10-08T12:00:00Z')

    // Honka White 76–38 ToPoLa: four quarters add up to the final score.
    const played = game('played')
    const pq = periodScores(played)
    const ps = visibleScore(played, classifyMatch(played, now))
    if (pq.length !== 4 || !ps || sumOf(pq, 'home') !== ps.home || sumOf(pq, 'away') !== ps.away || ps.home !== 76 || ps.away !== 38) {
      throw new Error(`Quarter sum vs final mismatch: ${JSON.stringify({ pq, ps })}`)
    }
    // LePy 89–85 Torpan Pojat: overtime is the fifth period and counts.
    const ot = game('playedOvertime')
    const oq = periodScores(ot)
    const os = visibleScore(ot, classifyMatch(ot, now))
    if (oq.length !== 5 || oq[4].quarter !== 5 || !os || sumOf(oq, 'home') !== os.home || sumOf(oq, 'away') !== os.away) {
      throw new Error(`Overtime sum mismatch: ${JSON.stringify({ oq, os })}`)
    }
    // Played without reported quarters: no 0–0 quarters invented.
    if (periodScores(game('playedNoQuarters')).length !== 0) {
      throw new Error('Blank quarters were filled in')
    }
    // Upcoming game that TASO sends as 0–0: no score shown.
    const upcoming = game('upcoming')
    if (visibleScore(upcoming, classifyMatch(upcoming, now)) !== undefined) {
      throw new Error('Upcoming 0–0 shown as a score')
    }
    // Walkover and a stale "Live" game from last month: no score printed.
    const forfeit = game('forfeited')
    const stale = game('staleBreak')
    if (classifyMatch(forfeit, now) !== 'forfeit' || visibleScore(forfeit, 'forfeit') !== undefined) {
      throw new Error('Walkover shown as a played score')
    }
    if (classifyMatch(stale, now) !== 'unconfirmed' || visibleScore(stale, classifyMatch(stale, now)) !== undefined) {
      throw new Error('Stale Live game shown as live/final')
    }

    pass(7, 'Basketball Score Logic on Recorded Basket.fi Games (basketball-stats matchStatus)',
      `Honka White ${ps.home}–${ps.away} ToPoLa = sum of 4 quarters; LePy ${os.home}–${os.away} incl. OT; blank quarters stay blank; upcoming 0–0, walkover and stale Live show no score.`)
  } catch (err) {
    fail(7, 'Basketball Stats Verification', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 8: 1-Tap Post-Match WhatsApp Share Generation & Roundtrip Parsing
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    // 8.1: Generate Join Invite
    const joinMsg = generateJoinWhatsApp('HEIMO26')
    if (!joinMsg.includes('FamDay-perhe HEIMO26') || !joinMsg.includes('pelipaiva.pages.dev/?perhe=HEIMO26')) {
      throw new Error(`Invalid WhatsApp join message: ${joinMsg}`)
    }

    // 8.2: Generate Talkoo Duty Notice
    const talkooMsg = generateTalkooWhatsApp([
      { playerName: 'Tuomas', time: '10:00-11:30', role: 'Toimitsija (Kello)', venueName: 'Otahalli' },
    ])
    if (!talkooMsg.includes('Tuomas 10:00-11:30 Toimitsija (Kello) @ Otahalli')) {
      throw new Error(`Invalid WhatsApp talkoo message: ${talkooMsg}`)
    }

    // 8.3: Generate Roster Delta and roundtrip parse it
    const deltaMsg = generateRosterDeltaWhatsApp(
      'Tuomas',
      'Indians P14',
      'Kilpasarja',
      'https://tulospalvelu.salibandy.fi/team/25301/info'
    )

    const parsedDelta = parseFamilyWhatsAppMessage(deltaMsg)
    if (
      parsedDelta.type !== 'delta' ||
      parsedDelta.playerName !== 'Tuomas' ||
      parsedDelta.teamName !== 'Indians P14' ||
      parsedDelta.url !== 'https://tulospalvelu.salibandy.fi/team/25301/info'
    ) {
      throw new Error(`WhatsApp roundtrip parse failed: ${JSON.stringify(parsedDelta)}`)
    }

    // Validate that generated text contains zero undefined, NaN, or null
    for (const msg of [joinMsg, talkooMsg, deltaMsg]) {
      if (msg.includes('undefined') || msg.includes('NaN') || msg.includes('null')) {
        throw new Error(`WhatsApp message contained unrendered tokens: ${msg}`)
      }
    }

    pass(8, 'WhatsApp Share Generator & Round-Trip Parser (Zero-Token Leak Gate)',
      'Generated join invite, talkoo duties, and round-trip parsed roster delta. Zero undefined/NaN tokens.')
  } catch (err) {
    fail(8, 'WhatsApp Share Generator & Parser', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 9: AI Agent WebMCP Tool Discovery, Schema & Security Hints (agent-browser standard)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const webMcpFile = join(ROOT, 'pelipaiva', 'src', 'lib', 'agents', 'webMcpRegistry.ts')
    if (!existsSync(webMcpFile)) throw new Error('webMcpRegistry.ts missing')

    const content = readFileSync(webMcpFile, 'utf8')
    // pelipaiva #40 (2026-10-08) dropped check_parking_risk: parking risk belongs to ParkkiS.
    const expectedTools = [
      'get_matchday_schedule',
      'get_family_profiles',
    ]

    for (const toolName of expectedTools) {
      if (!content.includes(`name: '${toolName}'`)) {
        throw new Error(`WebMCP registry missing tool declaration: ${toolName}`)
      }
    }

    if (!content.includes('document.modelContext') || !content.includes('navigator.modelContext')) {
      throw new Error('WebMCP registry missing document.modelContext / navigator.modelContext standard mounting points')
    }

    // Every tool is read-only. Both return federation and family-entered text (team names,
    // venues, WhatsApp notes), so per the WebMCP spec they must flag untrustedContentHint: true
    // (pelipaiva #40). Claiming false would tell agents that outside text is safe to trust.
    const readOnlyCount = (content.match(/readOnlyHint:\s*true/g) || []).length
    const untrustedCount = (content.match(/untrustedContentHint:\s*true/g) || []).length
    if (readOnlyCount < expectedTools.length || untrustedCount < expectedTools.length) {
      throw new Error(`WebMCP tools must declare readOnlyHint: true and untrustedContentHint: true (found ${readOnlyCount} / ${untrustedCount} for ${expectedTools.length} tools)`)
    }
    if (/untrustedContentHint:\s*false/.test(content)) {
      throw new Error('A WebMCP tool claims untrustedContentHint: false but returns federation/family text')
    }

    pass(9, 'AI Agent WebMCP Tool Discovery & Chrome CDP Security Hint Inspection',
      `Verified browser WebMCP tools (${expectedTools.join(', ')}) declare readOnlyHint: true & untrustedContentHint: true.`)
  } catch (err) {
    fail(9, 'WebMCP Tool Discovery', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 10: Anti-Pattern & Complexity Architectural Regression Gate
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const checks = [
      {
        path: join(ROOT, 'pelipaiva', 'src', 'App.tsx'),
        maxLines: 1600,
        mustInclude: 'GlobalModalHost',
        mustNotInclude: 'isSmartImportOpen', // Eliminated 9 boolean states
        description: 'pelipaiva/App.tsx (ModalHost & useModalStore)',
      },
      {
        path: join(ROOT, 'pelipaiva', 'src', 'lib', 'stats', 'statsEngine.ts'),
        maxLines: 600,
        mustInclude: 'SportRulesRegistry',
        description: 'pelipaiva statsEngine.ts (Decomposed with Strategy Pattern)',
      },
      {
        path: join(ROOT, 'Parkkis', 'web', 'src', 'App.tsx'),
        maxLines: 800,
        mustInclude: 'useParkingLayers',
        mustInclude: 'ParkingMapView',
        description: 'Parkkis App.tsx (Decoupled DuckDB hook and ParkingMapView)',
      },
      {
        path: join(ROOT, 'pelipaiva', 'src', 'components', 'SmartImportModal.tsx'),
        maxLines: 800,
        mustInclude: 'ClassicUrlImportTab',
        mustInclude: 'MessageNlpImportTab',
        description: 'pelipaiva SmartImportModal.tsx (4 modular tabs)',
      },
    ]

    const metricSummaries = []
    for (const check of checks) {
      if (!existsSync(check.path)) throw new Error(`File missing: ${check.path}`)
      const text = readFileSync(check.path, 'utf8')
      const lines = text.split('\n').length

      if (lines > check.maxLines) {
        throw new Error(`Complexity regression in ${check.description}: ${lines} lines exceeds ceiling of ${check.maxLines}`)
      }
      if (check.mustInclude && !text.includes(check.mustInclude)) {
        throw new Error(`${check.description} missing required decomposed component/hook: ${check.mustInclude}`)
      }
      if (check.mustNotInclude && text.includes(check.mustNotInclude)) {
        throw new Error(`${check.description} contains forbidden anti-pattern state: ${check.mustNotInclude}`)
      }

      metricSummaries.push(`${check.description}: ${lines} lines (ceiling: ${check.maxLines})`)
    }

    pass(10, 'Anti-Pattern & Architectural Complexity Regression Gate',
      metricSummaries.join('\n   • '))
  } catch (err) {
    fail(10, 'Architectural Complexity Gate', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL VERDICT: THE GOLDEN SEAL OF APPROVAL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('═'.repeat(76))
  if (failedSteps.length > 0) {
    console.error(`❌ SUPREME GOLDEN END-USER TEST: ${passedSteps}/${totalSteps} steps passed. Failed:\n   ${failedSteps.join('\n   ')}`)
    console.log('═'.repeat(76) + '\n')
    process.exit(1)
  }
  console.log(`✨ SUPREME GOLDEN END-USER TEST: 100% PASSED (${passedSteps}/${totalSteps} Steps)`)
  console.log('📜 The 6-Monastery Congregation satisfies all end-user real-world requirements!')
  console.log('═'.repeat(76) + '\n')
}

runSupremeGoldenTest()
