import { getQuests } from '../api/quests';
import type { Quest as ApiQuest, QuestCategory as ApiCategory } from '../api/quests';
import type { Quest, QuestBoardStats } from '../types/quest';

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q-01',
    order: 1,
    title: 'Juggling warmup',
    description: 'Keep the ball in the air for 3 clean minutes before match prep.',
    category: 'drill',
    difficulty: 'easy',
    status: 'active',
    progress: 0,
    reward: { label: 'Form boost', value: 6, unit: 'pts' },
    durationMinutes: 8,
    cadence: 'daily',
  },
  {
    id: 'q-02',
    order: 2,
    title: 'Reaction sprint',
    description: 'Hit every cone cue within 1.2s — no missed signals.',
    category: 'challenge',
    difficulty: 'medium',
    status: 'active',
    progress: 42,
    reward: { label: 'XP', value: 120, unit: 'xp' },
    durationMinutes: 12,
    cadence: 'daily',
  },
  {
    id: 'q-03',
    order: 3,
    title: 'Arena dribble circuit',
    description: 'Complete the full arena loop without losing control.',
    category: 'arena',
    difficulty: 'hard',
    status: 'claimable',
    progress: 100,
    reward: { label: 'Form boost', value: 14, unit: 'pts' },
    durationMinutes: 18,
    cadence: 'weekly',
    expiresAt: '2026-06-25T21:00:00',
  },
  {
    id: 'q-04',
    order: 4,
    title: 'Trickbook volley chain',
    description: 'Land 5 volleys in a row using only trickbook moves.',
    category: 'routine',
    difficulty: 'medium',
    status: 'completed',
    progress: 100,
    reward: { label: 'XP', value: 90, unit: 'xp' },
    durationMinutes: 10,
    cadence: 'session',
  },
  {
    id: 'q-05',
    order: 5,
    title: 'Crowd wave challenge',
    description: 'Unlock after finishing 3 arena drills this week.',
    category: 'challenge',
    difficulty: 'hard',
    status: 'locked',
    progress: 0,
    reward: { label: 'Badge', value: 1, unit: 'badge' },
    durationMinutes: 15,
    cadence: 'weekly',
  },
  {
    id: 'q-06',
    order: 6,
    title: 'Form review routine',
    description: 'Record and compare your stance against the trickbook reference.',
    category: 'routine',
    difficulty: 'easy',
    status: 'active',
    progress: 65,
    reward: { label: 'Form boost', value: 8, unit: 'pts' },
    durationMinutes: 6,
    cadence: 'daily',
  },
];

export const MOCK_STATS: QuestBoardStats = {
  activeCount: 3,
  completedToday: 2,
  xpToday: 210,
  streakDays: 4,
};

const CATEGORY_MAP: Record<ApiCategory, Quest['category']> = {
  TECHNICAL: 'drill',
  PHYSICAL: 'challenge',
  TACTICAL: 'arena',
  MENTAL: 'routine',
  GENERAL: 'drill',
};

function mapApiQuest(quest: ApiQuest, index: number): Quest {
  const cadence: Quest['cadence'] =
    quest.expiresAt && new Date(quest.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
      ? 'daily'
      : 'session';

  return {
    id: quest.id,
    order: index + 1,
    title: quest.title,
    description: quest.description ?? '',
    category: CATEGORY_MAP[quest.category],
    difficulty: 'medium',
    status: quest.status === 'ACTIVE' ? 'active' : quest.status === 'EXPIRED' ? 'locked' : 'locked',
    progress: 0,
    reward: { label: 'XP', value: quest.pointsReward, unit: 'xp' },
    durationMinutes: 10,
    cadence,
    expiresAt: quest.expiresAt,
  };
}

function buildStats(quests: Quest[]): QuestBoardStats {
  return {
    activeCount: quests.filter((q) => q.status === 'active' || q.status === 'claimable').length,
    completedToday: quests.filter((q) => q.status === 'completed').length,
    xpToday: quests
      .filter((q) => q.status === 'completed')
      .reduce((sum, q) => sum + q.reward.value, 0),
    streakDays: 0,
  };
}

export async function fetchQuestBoard(): Promise<{ quests: Quest[]; stats: QuestBoardStats }> {
  try {
    const page = await getQuests({ size: 50 });
    if (page.content.length === 0) {
      return {
        quests: MOCK_QUESTS.map((quest) => ({ ...quest })),
        stats: { ...MOCK_STATS },
      };
    }

    const quests = page.content.map(mapApiQuest);
    return { quests, stats: buildStats(quests) };
  } catch {
    return {
      quests: MOCK_QUESTS.map((quest) => ({ ...quest })),
      stats: { ...MOCK_STATS },
    };
  }
}

export function resetQuestBoardDemo() {
  // No-op — kept for hook compatibility with the standalone quest board build
}
