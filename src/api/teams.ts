/**
 * Teams API service — wraps /api/teams endpoints.
 *
 * Endpoints:
 *   GET  /api/teams       → list all teams (public once auth allows)
 *   POST /api/teams       → create a new team (authenticated)
 *
 * Future considerations:
 *   - GET  /api/teams/:id          → single team detail page
 *   - PUT  /api/teams/:id          → edit team name / logo
 *   - DELETE /api/teams/:id        → disband team (captain / admin only)
 *   - POST /api/teams/:id/invite   → invite a player by email/userId
 *   - GET  /api/teams/:id/players  → list players in team
 *   - POST /api/teams/:id/join     → join request / open enrollment
 *   - Kit colors, formation, role assignment endpoints
 */

import { get, post } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  tournamentId?: string;
  playerIds?: string[];
  captainUserId?: string;
  logoUrl?: string;
  createdAt?: string;

  // Future fields:
  // formation?: string;
  // kitColors?: { primary: string; secondary: string };
  // chemistry?: number;
  // rank?: number;
}

export interface CreateTeamPayload {
  name: string;
  tournamentId?: string;
  logoUrl?: string;

  // Future fields:
  // formation?: string;
  // kitPrimary?: string;
  // kitSecondary?: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function getTeams(): Promise<Team[]> {
  return get<Team[]>('/teams');
}

export function createTeam(payload: CreateTeamPayload): Promise<Team> {
  return post<Team>('/teams', payload);
}
