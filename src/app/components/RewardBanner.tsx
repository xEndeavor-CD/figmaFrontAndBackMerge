/**
 * RewardBanner - Displays user stats: total XP, current streak, completed quest count
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Trophy, RefreshCw, Flame } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface UserStats {
  totalXP: number;
  currentStreak: number;
  completedQuests: number;
  level: number;
}

interface RewardBannerProps {
  userStats?: UserStats | null;
  isLoading?: boolean;
}

export function RewardBanner({ userStats, isLoading = false }: RewardBannerProps) {
  const [animatedStats, setAnimatedStats] = useState<UserStats>({
    totalXP: 0,
    currentStreak: 0,
    completedQuests: 0,
    level: 1
  });

  // Animate stats when they change
  useEffect(() => {
    if (!userStats) return;

    // Simple animation by updating state with delay
    const timer = setTimeout(() => {
      setAnimatedStats(userStats);
    }, 100);

    return () => clearTimeout(timer);
  }, [userStats]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonLoader type="stat-card" />
        <SkeletonLoader type="stat-card" />
        <SkeletonLoader type="stat-card" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3 px-4">
      {/* Total XP */}
      <motion.div
        key="xp"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-1 flex items-center gap-3 rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df] p-4"
      >
        <Zap className="h-5 w-5" />
        <div>
          <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-70">
            TOTAL XP
          </p>
          <p className="font-['Bebas_Neue'] text-2xl leading-none">
            {animatedStats.totalXP.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        key="streak"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-1 flex items-center gap-3 rounded-3xl border-2 border-[#2b2b2b] bg-[#efe9da]/70 p-4"
      >
        <Flame className="h-5 w-5" />
        <div>
          <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-70">
            CURRENT STREAK
          </p>
          <p className="font-['Bebas_Neue'] text-2xl leading-none">
            {animatedStats.currentStreak} days
          </p>
        </div>
      </motion.div>

      {/* Completed Quests */}
      <motion.div
        key="completed"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-1 flex items-center gap-3 rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df] p-4"
      >
        <Trophy className="h-5 w-5" />
        <div>
          <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-70">
            QUESTS COMPLETED
          </p>
          <p className="font-['Bebas_Neue'] text-2xl leading-none">
            {animatedStats.completedQuests}
          </p>
        </div>
      </motion.div>
    </div>
  );
}