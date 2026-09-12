/**
 * CANONICAL SHARED CONTRACTS v1.0.0
 *
 * Non-Breaking Evolution Rules:
 * 1. Semantic Versioning: Major.Minor.Patch
 * 2. Invariant: All newly added fields in minor/patch versions MUST be optional (?).
 * 3. Invariant: Existing fields, keys, and types CANNOT be removed or mutated in v1.x.
 * 4. All satellite apps and the core hub (pelipaiva) must adhere to these interfaces.
 *
 * 2026-09-12: `weather` added to SupportedSport (union widening, non-breaking).
 * WeatherForecastContract remains the payload for meteorological data.
 */

export const CONTRACT_VERSION = '1.0.0' as const;

export type SupportedSport = 'football' | 'volleyball' | 'floorball' | 'basketball' | 'weather' | 'other';

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
  association?: 'palloliitto' | 'salibandy' | 'basket' | 'torneopal' | 'fmi' | 'other';
  /** External association team/match ID */
  externalId?: string;
}

/**
 * Standardized parking risk & safety intelligence provided by Parkkis.
 */
export interface ParkingRiskContract {
  venueSlug: string;
  riskRating: number;
  safetyCategory: 'safe' | 'moderate' | 'trap';
  parkingZone?: string;
  walkDistanceMeters?: number;
  walkTimeMinutes?: number;
  deepLinkUrl: string;
  advisoryNote?: string;
  updatedAt?: string;
}

/**
 * Standardized sport analytics & head-to-head stats provided by sport satellites.
 */
export interface SportStatsContract {
  sport: SupportedSport;
  matchOrTeamId: string;
  recentForm?: string[];
  standingsSummary?: {
    rank: number;
    totalTeams: number;
    points: number;
    playedMatches: number;
  };
  headToHead?: {
    wins: number;
    draws: number;
    losses: number;
    lastResult?: string;
  };
  keyMetrics?: Record<string, string | number>;
  deepLinkUrl: string;
}

/**
 * Query parameter format for cross-repo URL navigation and embedded sheets.
 */
export interface CrossRepoQueryContract {
  theme?: string;
  embed?: boolean;
  parentOrigin?: string;
  targetId?: string;
}

/**
 * Standardized meteorological forecast & safety intelligence provided by weather-stats.
 */
export interface WeatherForecastContract {
  venueId?: string;
  venueName?: string;
  coordinates: { latitude: number; longitude: number };
  kickoffTime: string;
  temperatureC: number;
  feelsLikeC: number;
  windSpeedMs: number;
  windGustMs: number;
  precipitationMmh: number;
  turfCondition: 'dry' | 'slick' | 'frozen' | 'snowy';
  turfConditionLabelFi: string;
  lightningRiskStatus: 'clear' | 'watch' | 'danger';
  suspendMatchRecommended: boolean;
  deepLinkUrl: string;
  isCacheFallback: boolean;
  updatedAt?: string;
}
