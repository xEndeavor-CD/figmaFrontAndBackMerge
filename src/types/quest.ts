export type QuestCategory = 'drill' | 'challenge' | 'arena' | 'routine';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestStatus = 'active' | 'completed' | 'locked' | 'claimable';
export type QuestFilter = 'all' | 'active' | 'completed' | 'daily' | 'weekly';

export interface QuestReward {
  label: string;
  value: number;
  unit: string;
}

export interface Quest {
  id: string;
  order: number;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  progress: number;
  reward: QuestReward;
  durationMinutes: number;
  cadence: 'daily' | 'weekly' | 'session';
  expiresAt?: string;
}

export interface QuestBoardStats {
  activeCount: number;
  completedToday: number;
  xpToday: number;
  streakDays: number;
}

export type QuestBoardState = 'idle' | 'loading' | 'error' | 'success';
