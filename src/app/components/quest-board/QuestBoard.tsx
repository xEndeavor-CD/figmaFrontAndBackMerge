import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useQuestBoard } from '@/app/components/hooks/useQuestBoard';
import type { QuestFilter } from '@/types/quest';

import { QuestBoardEmpty } from './QuestBoardEmpty';
import { QuestBoardError } from './QuestBoardError';
import { QuestBoardHeader } from './QuestBoardHeader';
import { QuestBoardSkeleton } from './QuestBoardSkeleton';
import { QuestCard } from './QuestCard';
import { QuestFilters } from './QuestFilters';
import { QuestStatsBar } from './QuestStatsBar';

export function QuestBoard() {
  const {
    quests,
    allQuests,
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
  } = useQuestBoard();

  const counts = useMemo<Record<QuestFilter, number>>(
    () => ({
      all: allQuests.length,
      active: allQuests.filter((q) => q.status === 'active' || q.status === 'claimable').length,
      completed: allQuests.filter((q) => q.status === 'completed').length,
      daily: allQuests.filter((q) => q.cadence === 'daily').length,
      weekly: allQuests.filter((q) => q.cadence === 'weekly').length,
    }),
    [allQuests],
  );

  return (
    <section className="mt-14">
      <QuestBoardHeader onRefresh={() => void refresh()} isRefreshing={state === 'loading'} />

      <div className="mt-8 rounded-[2rem] border-[3px] border-primary bg-card/90 p-5 shadow-[var(--sketch-shadow)] sm:p-6">
        {state === 'error' && error ? (
          <QuestBoardError message={error} onRetry={retry} />
        ) : null}

        {state === 'loading' ? <QuestBoardSkeleton /> : null}

        {state === 'success' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {stats ? <QuestStatsBar stats={stats} /> : null}

            <QuestFilters value={filter} onChange={setFilter} counts={counts} />

            <AnimatePresence mode="popLayout">
              {quests.length === 0 ? (
                <QuestBoardEmpty />
              ) : (
                <div className="space-y-3">
                  {quests.map((quest, index) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      index={index}
                      canReorder={filter === 'all'}
                      onStart={startQuest}
                      onClaim={claimReward}
                      onMove={reorderQuests}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
