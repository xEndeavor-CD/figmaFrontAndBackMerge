/**
 * Quests API service — wraps /api/quests endpoints.
 * Used by the Training door (Door 03).
 *
 * Endpoints:
 *   GET  /api/quests                      → paginated quest list
 *   POST /api/quests/{id}/submit          → submit proof (multipart)
 *   GET  /api/quests/leaderboard          → top players by XP (public)
 *
 * (Admin-only — not called from the frontend directly)
 *   POST /api/quests                      → create quest
 *   PUT  /api/quests/:id                  → update quest
 *   DELETE /api/quests/:id                → remove quest
 *   PUT  /api/quests/submissions/:id/review → approve/reject submission
 *
 * Future considerations:
 *   - GET  /api/quests/:id                → quest detail page
 *   - GET  /api/quests/my-submissions     → player's own submission history
 *   - Timed / daily quests with countdown UI
 *   - Video proof upload (currently image/file only)
 *   - Push notification when submission is reviewed
 *   - Quest difficulty tiers (EASY, MEDIUM, HARD, LEGEND)
 *   - Achievement badges tied to quest completion streaks
 */

import { get, postFormData } from './client';
import type { SpringPage } from './tournaments';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestCategory = 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL' | 'GENERAL';
export type QuestStatus   = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  category: QuestCategory;
  pointsReward: number;
  status: QuestStatus;
  expiresAt?: string; // ISO-8601
  createdAt?: string;

  // Future fields:
  // difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGEND';
  // imageUrl?: string;   // hero image for the quest card
  // videoUrl?: string;   // tutorial video
  // completedCount?: number;
}

export interface QuestSubmission {
  id: string;
  questId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofFileName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewNote?: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username?: string;
  totalPoints: number;
  rank?: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface QuestQuery {
  category?: QuestCategory;
  page?: number;
  size?: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function getQuests(query: QuestQuery = {}): Promise<SpringPage<Quest>> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.size !== undefined) params.set('size', String(query.size));

  const qs = params.toString();
  return get<SpringPage<Quest>>(`/quests${qs ? `?${qs}` : ''}`);
}

/**
 * Submit quest proof — multipart/form-data.
 * The file is sent as the "proof" form field as required by the backend.
 */
export function submitQuest(questId: string, proofFile: File): Promise<QuestSubmission> {
  const formData = new FormData();
  formData.append('proof', proofFile);
  return postFormData<QuestSubmission>(`/quests/${questId}/submit`, formData);
}

export function getLeaderboard(page = 0, size = 10): Promise<SpringPage<LeaderboardEntry>> {
  return get<SpringPage<LeaderboardEntry>>(`/quests/leaderboard?page=${page}&size=${size}`);
}
