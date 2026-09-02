/**
 * CANONICAL SHARED CONTRACTS v1.0.0
 * 
 * Non-Breaking Evolution Rules:
 * 1. Semantic Versioning: Major.Minor.Patch
 * 2. Invariant: All newly added fields in minor/patch versions MUST be optional (?).
 * 3. Invariant: Existing fields, keys, and types CANNOT be removed or mutated in v1.x.
 * 4. All satellite apps (football-stats, Parkkis, volleyball-stats) and the core hub (pelipaiva)
 *    must adhere to these interfaces for cross-repo interoperability.
 */

export const CONTRACT_VERSION = '1.0.0' as const;

export type SupportedSport = 'football' | 'volleyball' | 'floorball' | 'basketball' | 'other';

/**
 * Universal event context shared between Pelipäivä and all satellites.
 */
export interface MatchdayContextContract {
  /** Canonical match or training event ID */
  eventId: string;
  /** Primary sport classification */
  sport: SupportedSport;
  /** ISO 8601 UTC timestamp of start time (or kickoff) */
  startTime: string;
  /** ISO 8601 UTC timestamp of scheduled warmup arrival, if known */
  warmupTime?: string;
  /** Home team normalized name */
  homeTeam: string;
  /** Away team normalized name */
  awayTeam: string;
  /** Venue name or nickname (e.g., "Bubu", "Väiski", "Kisakallio") */
  venueName: string;
  /** Geographic coordinates for spatial queries (WGS84) */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Association/federation source */
  association?: 'palloliitto' | 'salibandy' | 'basket' | 'torneopal' | 'other';
  /** External association team/match ID */
  externalId?: string;
}

/**
 * Standardized parking risk & safety intelligence provided by Parkkis.
 */
export interface ParkingRiskContract {
  /** Venue identifier or slug */
  venueSlug: string;
  /** Calculated risk score from 1 (safest) to 10 (high risk trap area) */
  riskRating: number;
  /** Qualitative category for fast visual badges */
  safetyCategory: 'safe' | 'moderate' | 'trap';
  /** Helsinki parking payment zone (e.g., "1", "2", "3", "Free", "Resident-only") */
  parkingZone?: string;
  /** Walking distance from recommended parking spot to venue entrance (in meters) */
  walkDistanceMeters?: number;
  /** Estimated walking time in minutes */
  walkTimeMinutes?: number;
  /** Direct deep-link URL to open interactive vector tile map in Parkkis */
  deepLinkUrl: string;
  /** Diagnostic human-readable advice (e.g., "Park on north side; residential disc trap on south") */
  advisoryNote?: string;
  /** Timestamp when risk data was computed */
  updatedAt?: string;
}

/**
 * Standardized sport analytics & head-to-head stats provided by sport satellites.
 */
export interface SportStatsContract {
  /** Primary sport */
  sport: SupportedSport;
  /** Contextual match or team ID */
  matchOrTeamId: string;
  /** Recent form string (e.g., "W-W-D-L-W") */
  recentForm?: string[];
  /** League table position summary */
  standingsSummary?: {
    rank: number;
    totalTeams: number;
    points: number;
    playedMatches: number;
  };
  /** Head-to-head historical match count or record */
  headToHead?: {
    wins: number;
    draws: number;
    losses: number;
    lastResult?: string;
  };
  /** Sport-specific key summary metrics (e.g., "Top Scorer: 12 goals" or "Set Win Rate: 75%") */
  keyMetrics?: Record<string, string | number>;
  /** Direct deep-link URL to open the detailed match view in the sport satellite app */
  deepLinkUrl: string;
}

/**
 * Query parameter format for cross-repo URL navigation and embedded sheets.
 */
export interface CrossRepoQueryContract {
  /** Theme synchronization ('night-captain' | 'light' | 'dark') */
  theme?: string;
  /** Whether the satellite is rendering in an embedded modal/drawer sheet */
  embed?: boolean;
  /** Parent origin for postMessage communication */
  parentOrigin?: string;
  /** Focus entity ID (match, team, or venue) */
  targetId?: string;
}
