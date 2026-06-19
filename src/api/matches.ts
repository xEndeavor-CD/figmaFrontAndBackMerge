/**
 * Matches API service — wraps /api/matches endpoints.
 *
 * Endpoints:
 *   POST /api/matches            → schedule a new match
 *   GET  /api/matches/:id        → get match details
 *   PUT  /api/matches/:id/score  → update live score
 *
 * Future considerations:
 *   - GET  /api/matches             → list matches (needs backend endpoint)
 *   - GET  /api/matches?tournament= → filter by tournament
 *   - POST /api/matches/:id/replay  → attach replay/highlight URL
 *   - GET  /api/matches/live        → currently live matches (WebSocket ready)
 *   - WebSocket topic: /topic/matches/{id}/score for real-time score updates
 *   - Match statistics endpoint: GET /api/matches/:id/stats
 *   - VOD / highlight embedding
 */

import { get, post, put } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  tournamentId?: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: MatchStatus;
  scheduledAt?: string; // ISO-8601
  completedAt?: string; // ISO-8601

  // Future fields:
  // replayUrl?: string;
  // streamUrl?: string;
  // mvpPlayerId?: string;
  // stats?: MatchStats;
}

export interface CreateMatchPayload {
  tournamentId?: string;
  teamAId: string;
  teamBId: string;
  scheduledAt?: string; // ISO-8601
  status?: MatchStatus;

  // Future fields:
  // venue?: string;
  // streamUrl?: string;
}

export interface ScoreUpdatePayload {
  scoreA: number;
  scoreB: number;

  // Future fields:
  // winnerId?: string;   // explicit override
  // status?: MatchStatus;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function createMatch(payload: CreateMatchPayload): Promise<Match> {
  return post<Match>('/matches', payload);
}

export function getMatch(id: string): Promise<Match> {
  return get<Match>(`/matches/${id}`);
}

export function updateScore(id: string, payload: ScoreUpdatePayload): Promise<Match> {
  return put<Match>(`/matches/${id}/score`, payload);
}
