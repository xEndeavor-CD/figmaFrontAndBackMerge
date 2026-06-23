import { useRef } from 'react';
import * as Progress from '@radix-ui/react-progress';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowRight,
  GripVertical,
  Lock,
  Sparkles,
  Timer,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useDrag, useDrop } from 'react-dnd';

import { cn } from '@/lib/utils';
import type { Quest } from '@/types/quest';

const CATEGORY_LABELS: Record<Quest['category'], string> = {
  drill: 'Drill',
  challenge: 'Challenge',
  arena: 'Arena',
  routine: 'Routine',
};

const DIFFICULTY_STYLES: Record<Quest['difficulty'], string> = {
  easy: 'bg-[#e8f5e1] text-[#2f5d22]',
  medium: 'bg-[#fff3d6] text-[#7a5a12]',
  hard: 'bg-[#fde8e8] text-[#9f2b22]',
};

interface QuestCardProps {
  quest: Quest;
  index: number;
  canReorder?: boolean;
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onMove: (from: number, to: number) => void;
}

const ITEM_TYPE = 'quest-card';

export function QuestCard({ quest, index, canReorder = true, onStart, onClaim, onMove }: QuestCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const canDrag = canReorder && (quest.status === 'active' || quest.status === 'claimable');

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    canDrag,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  drag(handleRef);
  drop(cardRef);
  preview(cardRef);

  const actionLabel =
    quest.status === 'claimable'
      ? 'Claim reward'
      : quest.status === 'completed'
        ? 'Completed'
        : quest.status === 'locked'
          ? 'Locked'
          : quest.progress > 0
            ? 'Continue'
            : 'Start drill';

  const handleAction = () => {
    if (quest.status === 'claimable') onClaim(quest.id);
    else if (quest.status === 'active') onStart(quest.id);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.55 : 1, y: 0 }}
      className={cn(
        'rounded-[1.5rem] border-2 border-primary bg-background transition-shadow',
        quest.status === 'locked' && 'opacity-70',
        quest.status === 'completed' && 'bg-muted/40',
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {canDrag ? (
            <button
              ref={handleRef}
              type="button"
              aria-label="Reorder quest"
              className="mt-1 cursor-grab rounded-lg p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : (
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 text-xs font-bold">
              {String(quest.order).padStart(2, '0')}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-wide">
                {quest.title}
              </h3>
              <span className="rounded-full border border-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                {CATEGORY_LABELS[quest.category]}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                  DIFFICULTY_STYLES[quest.difficulty],
                )}
              >
                {quest.difficulty}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{quest.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {quest.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                +{quest.reward.value} {quest.reward.unit}
              </span>
              {quest.expiresAt && (
                <span>Ends {formatDistanceToNow(new Date(quest.expiresAt), { addSuffix: true })}</span>
              )}
            </div>

            {quest.status !== 'locked' && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em]">
                  <span>Progress</span>
                  <span>{quest.progress}%</span>
                </div>
                <Progress.Root className="h-2 overflow-hidden rounded-full bg-muted" value={quest.progress}>
                  <Progress.Indicator
                    className="h-full rounded-full bg-primary transition-transform duration-500"
                    style={{ transform: `translateX(-${100 - quest.progress}%)` }}
                  />
                </Progress.Root>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            disabled={quest.status === 'locked' || quest.status === 'completed'}
            onClick={handleAction}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50',
              quest.status === 'claimable'
                ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_rgba(43,43,43,0.28)]'
                : 'bg-card',
            )}
          >
            {quest.status === 'locked' ? <Lock className="h-4 w-4" /> : null}
            <span>{actionLabel}</span>
            {quest.status !== 'locked' && quest.status !== 'completed' ? (
              <ArrowRight className="h-4 w-4" />
            ) : null}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
