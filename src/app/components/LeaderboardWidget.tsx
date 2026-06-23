/**
 * LeaderboardWidget - Top 5 users card for sidebar
 */
import { mapRange } from 'motion';
import { motion } from 'motion/react';
import { Trophy, Zap, Users, RefreshCw } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface LeaderboardEntry {
  id: string;
  userId: string;
  username?: string;
  totalPoints: number;
  rank?: number;
}

interface LeaderboardWidgetProps {
  users: LeaderboardEntry[];
  isLoading?: boolean;
}

export function LeaderboardWidget({ users = [], isLoading = false }: LeaderboardWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="leaderboard-header" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} type="leaderboard-item" />
        ))}
      </div>
    );
  }

  const topUsers = users.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-['Bebas_Neue'] text-xl tracking-wider">LEADERBOARD</h2>
        <motion.button
          onClick={() => {/* Refresh leaderboard */}}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2b2b2b]/30 bg-[#efe9da]/80"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        {topUsers.map((user, index) => {
          const isTop3 = index < 3;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 border-[#2b2b2b]/15
                ${index < 3 ? 'bg-[#f7f0df]' : 'bg-[#efe9da]'}
                ${index === 0 ? 'border-[2b2b2b]/40' : ''}`}
            >
              {/* Rank badge */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Bebas_Neue'] text-lg
                ${index === 0 ? 'bg-[#d9b45f]/20 text-[#8a6a00]' : ''}
                ${index === 1 ? 'bg-[#9b9b9b]/20 text-[#6b7280]' : ''}
                ${index === 2 ? 'bg-[#b87333]/20 text-[#784212]' : ''}
              `}>
                {index + 1}
              </div>

              {/* User info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Bebas_Neue'] text-sm">
                    {(user.username?.charAt(0) || '?').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-['Space_Grotesk'] text-sm font-bold truncate">
                      {user.username || `Player ${user.userId.slice(-4)}`}
                    </p>
                    <p className="font-['Space_Grotesk'] text-xs opacity-60">
                      Rank #{user.rank || (index + 1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4" />
                <span className="font-['Bebas_Neue'] text-lg font-bold">
                  {user.totalPoints.toLocaleString()} XP
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View all link */}
      {users.length > 5 && (
        <div className="text-center pt-3 border-t border-[#2b2b2b]/20">
          <motion.a
            href="#"
            whileHover={{ y: -2 }}
            whileTap={{ y: 1, scale: 0.98 }}
            className="font-['Space_Grotesk'] text-sm font-medium underline decoration-2"
          >
            View All ({users.length} players)
          </motion.a>
        </div>
      )}
    </div>
  );
}