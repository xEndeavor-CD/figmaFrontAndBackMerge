import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestBoardErrorProps {
  message: string;
  onRetry: () => void;
}

export function QuestBoardError({ message, onRetry }: QuestBoardErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 rounded-full border-2 border-destructive/30 bg-[#fde8e8] px-5 py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-destructive/40 bg-white">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </span>
        <p className="truncate text-sm font-medium text-destructive">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 text-sm font-bold underline decoration-2 underline-offset-4"
      >
        Retry
      </button>
    </motion.div>
  );
}
