/**
 * Tournaments API service — wraps /api/tournaments endpoints.
 *
 * Endpoints:
 *   GET    /api/tournaments           → paginated list with optional status/game filter
 *   POST   /api/tournaments           → create (ADMIN only)
 *   PUT    /api/tournaments/:id       → update (ADMIN only)
 *   DELETE /api/tournaments/:id       → delete (ADMIN only)
 *
 * Future considerations:
 *   - GET  /api/tournaments/:id              → single tournament details
 *   - POST /api/tournaments/:id/register     → team registers for tournament
 *   - GET  /api/tournaments/:id/bracket      → bracket / round structure
 *   - POST /api/tournaments/:id/generate-bracket → admin generates bracket
 *   - GET  /api/tournaments/:id/standings    → live standings
 *   - WebSocket subscription for live bracket updates
 */

import { del, get, post, put } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: string;
  endDate?: string;
  maxTeams: number;
  teamIds?: string[];
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Future fields:
  // prizePool?: string;
  // streamUrl?: string;
  // bannerImageUrl?: string;
  // region?: string;
}

export interface TournamentPayload {
  name: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: string; // ISO-8601 datetime string
  endDate?: string;
  maxTeams: number;

  // Future fields:
  // prizePool?: string;
  // streamUrl?: string;
  // region?: string;
}

/** Spring Page wrapper returned by the backend for paginated endpoints. */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface TournamentQuery {
  status?: TournamentStatus;
  game?: string;
  page?: number;
  size?: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function getTournaments(query: TournamentQuery = {}): Promise<SpringPage<Tournament>> {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.game)   params.set('game', query.game);
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.size !== undefined) params.set('size', String(query.size));

  const qs = params.toString();
  return get<SpringPage<Tournament>>(`/tournaments${qs ? `?${qs}` : ''}`);
}

export function createTournament(payload: TournamentPayload): Promise<Tournament> {
  return post<Tournament>('/tournaments', payload);
}

export function updateTournament(id: string, payload: TournamentPayload): Promise<Tournament> {
  return put<Tournament>(`/tournaments/${id}`, payload);
}

export function deleteTournament(id: string): Promise<void> {
  return del<void>(`/tournaments/${id}`);
}
