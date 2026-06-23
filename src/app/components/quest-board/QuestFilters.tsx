import type { QuestFilter } from '@/types/quest';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const FILTERS: { id: QuestFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
];

interface QuestFiltersProps {
  value: QuestFilter;
  onChange: (filter: QuestFilter) => void;
  counts: Record<QuestFilter, number>;
}

export function QuestFilters({ value, onChange, counts }: QuestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <motion.button
            key={filter.id}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(filter.id)}
            className={cn(
              'rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_rgba(43,43,43,0.28)]'
                : 'bg-background hover:bg-muted',
            )}
          >
            {filter.label}
            <span
              className={cn(
                'ml-2 text-xs',
                active ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {counts[filter.id]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
