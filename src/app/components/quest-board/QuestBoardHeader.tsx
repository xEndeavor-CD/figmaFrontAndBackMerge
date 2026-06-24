import { RefreshCw, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestBoardHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function QuestBoardHeader({ onRefresh, isRefreshing }: QuestBoardHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[3px_3px_0_rgba(43,43,43,0.22)]">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-[0.03em] sm:text-5xl">
              Quest Board
            </h2>
            <p className="mt-1 font-[family-name:var(--font-hand)] text-2xl text-muted-foreground">
              active drills &amp; challenges
            </p>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh quest board"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[3px_3px_0_rgba(43,43,43,0.22)] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </motion.button>
    </div>
  );
}
