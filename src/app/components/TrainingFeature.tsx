/**
 * TrainingFeature.tsx
 *
 * Live data panel for the Training door (Door 03).
 * Renders the integrated Quest Board (from quest-board/) plus leaderboard.
 */

import { useEffect, useState } from 'react';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { QuestBoard } from './quest-board/QuestBoard';
import { getLeaderboard } from '../../api/quests';
import type { LeaderboardEntry } from '../../api/quests';
import type { AuthUser } from '../../api/auth';

interface TrainingFeatureProps {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

export function TrainingFeature({ isLoggedIn }: TrainingFeatureProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [lbError, setLbError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setLoadingLB(true);
    setLbError(null);
    try {
      const page = await getLeaderboard(0, 10);
      setLeaderboard(page.content);
    } catch (err) {
      setLbError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoadingLB(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <section className="mt-12 space-y-10">
      <QuestBoard />

      {!isLoggedIn && (
        <p className="font-['Caveat'] text-xl opacity-60">
          — sign in to submit proof and earn XP —
        </p>
      )}

      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wide">LEADERBOARD</h2>
              <p className="font-['Caveat'] text-lg -rotate-1 opacity-70">top players by XP</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={loadLeaderboard}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        </div>

        {lbError && (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2b2b2b]/30 bg-[#efe9da] p-4 font-['Space_Grotesk'] text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
            <span>{lbError}</span>
          </div>
        )}

        {loadingLB && !lbError && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#e8dfcd]"
              />
            ))}
          </div>
        )}

        {!loadingLB && !lbError && leaderboard.length === 0 && (
          <p className="font-['Caveat'] text-2xl opacity-50">no scores yet — be first on the board!</p>
        )}

        {!loadingLB && !lbError && leaderboard.length > 0 && (
          <div className="overflow-hidden rounded-3xl border-2 border-[#2b2b2b]">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 px-5 py-3 ${i < leaderboard.length - 1 ? 'border-b-2 border-[#2b2b2b]/15' : ''} ${i < 3 ? 'bg-[#f7f0df]' : 'bg-[#efe9da]'}`}
              >
                <span
                  className={`w-8 shrink-0 font-['Bebas_Neue'] text-2xl ${i === 0 ? 'text-[#d9b45f]' : i === 1 ? 'text-[#9b9b9b]' : i === 2 ? 'text-[#b87333]' : 'opacity-40'}`}
                >
                  {i + 1}
                </span>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Bebas_Neue'] text-lg">
                  {(entry.username ?? 'P').charAt(0).toUpperCase()}
                </div>

                <span className="flex-1 font-['Space_Grotesk'] text-sm font-bold">
                  {entry.username ?? `Player ${entry.userId.slice(-4)}`}
                </span>

                <span className="font-['Bebas_Neue'] text-xl text-[#d9b45f]">
                  {entry.totalPoints.toLocaleString()} XP
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
