import type { QuestBoardStats } from '@/types/quest';
import { Flame, Target, Trophy, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestStatsBarProps {
  stats: QuestBoardStats;
}

const items = [
  { key: 'active', icon: Target, label: 'Active quests', getValue: (s: QuestBoardStats) => s.activeCount },
  { key: 'xp', icon: Zap, label: 'XP today', getValue: (s: QuestBoardStats) => s.xpToday },
  { key: 'done', icon: Trophy, label: 'Completed today', getValue: (s: QuestBoardStats) => s.completedToday },
  { key: 'streak', icon: Flame, label: 'Day streak', getValue: (s: QuestBoardStats) => s.streakDays },
] as const;

export function QuestStatsBar({ stats }: QuestStatsBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-3xl border-2 border-primary bg-background p-4"
          >
            <Icon className="mb-3 h-5 w-5" strokeWidth={2.25} />
            <p className="font-[family-name:var(--font-display)] text-4xl leading-none">
              {item.getValue(stats)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
