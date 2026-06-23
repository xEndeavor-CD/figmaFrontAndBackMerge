/**
 * JumpBackIn - Horizontal scroll strip showing in-progress quests
 * Encourages users to continue quests they've already started
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Trophy, RefreshCw } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  progress: number; // 0-100
  pointsReward: number;
  category: string;
}

interface JumpBackInProps {
  quests: Quest[]; // Should be quests with progress > 0 and < 100
  title?: string;
  isLoading?: boolean;
}

export function JumpBackIn({ quests, title = "Jump Back In", isLoading = false }: JumpBackInProps) {
  // Filter for in-progress quests (0 < progress < 100)
  const inProgressQuests = quests.filter(q => q.progress > 0 && q.progress < 100);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider">{title}</h2>
        </div>
        <div className="flex space-x-4 pb-2 overflow-x-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-20 w-72 rounded-3xl border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (inProgressQuests.length === 0) {
    return null; // Don't show if no in-progress quests
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider">{title}</h2>
        <motion.button
          type="button"
          onClick={() => {/* Refresh in-progress quests */ }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
          aria-label="Refresh quests"
        >
          <RefreshCw className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="overflow-x-auto space-x-4 pb-2">
        <div className="flex space-x-4">
          {inProgressQuests.map((quest) => (
            <QuestProgressChip key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuestProgressChipProps {
  quest: Quest;
}

function QuestProgressChip({ quest }: QuestProgressChipProps) {
  // Determine progress color
  let progressColor = 'bg-[#2b2b2b]/20';
  if (quest.progress >= 80) progressColor = 'bg-[#4ade80]/20';
  else if (quest.progress >= 50) progressColor = 'bg-[#fbbf24]/20';

  return (
    <motion.div
      key={quest.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.random() * 0.2 }}
      className="flex-shrink-0 flex items-center gap-3 rounded-3xl border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50 p-4 hover:bg-[#efe9da]/70 transition-all duration-300"
    >
      {/* Progress circle */}
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-8 w-8" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              stroke="#efe9da"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              stroke="url(#gradient)"
              strokeDasharray="125.6"
              strokeDashoffset={(100 - quest.progress) * 1.256}
            >
              {/* Define gradient */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </circle>
          </svg>
          <div className="absolute flex items-center justify-center text-xs font-['Bebas_Neue'] font-bold">
            {Math.round(quest.progress)}%
          </div>
        </div>
      </div>

      {/* Quest info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-['Space_Grotesk'] text-sm line-clamp-2 truncate">
          {quest.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>{quest.category}</span>
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>+{quest.pointsReward} XP</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}