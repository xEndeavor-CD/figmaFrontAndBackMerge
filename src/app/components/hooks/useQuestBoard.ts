import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { fetchQuestBoard } from '@/data/questApi';
import type { Quest, QuestBoardState, QuestBoardStats, QuestFilter } from '@/types/quest';

function filterQuests(quests: Quest[], filter: QuestFilter) {
  switch (filter) {
    case 'active':
      return quests.filter((q) => q.status === 'active' || q.status === 'claimable');
    case 'completed':
      return quests.filter((q) => q.status === 'completed');
    case 'daily':
      return quests.filter((q) => q.cadence === 'daily');
    case 'weekly':
      return quests.filter((q) => q.cadence === 'weekly');
    default:
      return quests;
  }
}

export function useQuestBoard() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [stats, setStats] = useState<QuestBoardStats | null>(null);
  const [filter, setFilter] = useState<QuestFilter>('all');
  const [state, setState] = useState<QuestBoardState>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchQuestBoard();
      setQuests(data.quests);
      setStats(data.stats);
      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQuests = useMemo(() => filterQuests(quests, filter), [quests, filter]);

  const refresh = useCallback(async () => {
    toast.message('Refreshing quest board…');
    await load();
    toast.success('Quest board updated');
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  const startQuest = useCallback((questId: string) => {
    setQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId && quest.status === 'active'
          ? {
              ...quest,
              progress: Math.min(quest.progress + 25, 100),
              status: quest.progress + 25 >= 100 ? 'claimable' : 'active',
            }
          : quest,
      ),
    );
    toast.success('Drill started — good luck!');
  }, []);

  const claimReward = useCallback((questId: string) => {
    setQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId && quest.status === 'claimable'
          ? { ...quest, status: 'completed', progress: 100 }
          : quest,
      ),
    );
    toast.success('Reward claimed!');
  }, []);

  const reorderQuests = useCallback((fromIndex: number, toIndex: number) => {
    setQuests((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next.map((quest, index) => ({ ...quest, order: index + 1 }));
    });
  }, []);

  return {
    quests: filteredQuests,
    allQuests: quests,
    stats,
    filter,
    setFilter,
    state,
    error,
    refresh,
    retry,
    startQuest,
    claimReward,
    reorderQuests,
  };
}
