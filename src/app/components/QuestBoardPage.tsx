/**
 * QuestBoardPage — Main quest board page for STICK LEAGUE
 *
 * Implements the quest board with:
 * - Header with navigation
 * - Reward banner (XP, streak, completed count)
 * - Filter tabs (All, Active, Completed, Expired)
 * - Sport filter dropdown
 * - Sort selector
 * - Quest grid with QuestCard components
 * - JumpBackIn horizontal scroll of in-progress quests
 * - QuestDetailDrawer slide-in panel
 * - LeaderboardWidget sidebar
 * - Skeleton loading states
 */

import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Trophy, RefreshCw, MessageCircle, Calendar, TrendingUp, Users } from 'lucide-react';

import { useQuests } from './hooks/useQuests';
import { useQuestProgress } from './hooks/useQuestProgress';
import { useUserStats } from './hooks/useUserStats';

import {
  QuestCard,
  JumpBackIn,
  ProgressBar,
  RewardBanner,
  FilterBar,
  QuestDetailDrawer,
  LeaderboardWidget,
  SkeletonLoader
} from './index';

interface QuestBoardPageProps {
  onBack: () => void;
  isLoggedIn: boolean;
  user: any; // AuthUser type
  onLogin: () => void;
  onLogout: () => void;
}

export function QuestBoardPage({ onBack, isLoggedIn, user, onLogin, onLogout }: QuestBoardPageProps) {
  // Quest filtering and sorting state
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'xp' | 'deadline'>('newest');
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  // Fetch data using hooks
  const { quests: allQuests, isLoading, error } = useQuests({
    tab: activeTab,
    sport: selectedSport,
    sortBy
  });

  const { userStats, isLoading: userStatsLoading, error: userStatsError } = useUserStats();

  // Track loading states
  const isInitialLoading = isLoading || userStatsLoading;
  const hasError = error || userStatsError;

  // Helper function to get empty state message based on tab
  const getEmptyStateMessage = (tab: 'all' | 'active' | 'completed' | 'expired'): string => {
    switch (tab) {
      case 'all':
        return 'No quests available right now';
      case 'active':
        return 'No active quests to show';
      case 'completed':
        return "You haven't completed any quests yet";
      case 'expired':
        return 'No expired quests';
      default:
        return 'No quests available';
    }
  };

  // Create a map of quest promises for progress tracking
  const [questProgressMap, setQuestProgressMap] = useState<Record<string, number>>({});

  // Update progress for all quests when the list changes
  useEffect(() => {
    if (!allQuests || allQuests.length === 0) {
      setQuestProgressMap({});
      return;
    }

    // Create promises for all quests
    const progressPromises = allQuests.map(async (quest: any) => {
      const progress = await new Promise<number>((resolve) => {
        // Simulate getting progress from useQuestProgress hook
        // In a real implementation, we'd use the hook directly in QuestCard
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Deterministic but varied progress based on quest ID
          let hash = 0;
          for (let i = 0; i < quest.id.length; i++) {
            hash = quest.id.charCodeAt(i) + ((hash << 5) - hash);
          }
          const progress = Math.abs(hash) % 101;
          resolve(progress);
        }, Math.random() * 200); // Staggered loading
      });
      return [quest.id, progress] as const;
    });

    // Resolve all promises and update state
    Promise.allSettled(progressPromises).then((results) => {
      const newMap: Record<string, number> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [id, progress] = result.value;
          newMap[id] = progress;
        }
      });
      setQuestProgressMap(newMap);
    });
  }, [allQuests]);

  // Filter quests based on selected tab
  const filteredQuests = allQuests?.filter(quest => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active' && quest.status === 'ACTIVE') return true;
    if (activeTab === 'completed' && quest.status === 'COMPLETED') return true;
    if (activeTab === 'expired' && quest.status === 'EXPIRED') return true;
    return false;
  }) || [];

  return (
    <div className="min-h-screen bg-[#efe9da] text-[#2b2b2b]">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-6 py-4 bg-[#efe9da]/80 backdrop-blur">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80 px-4 py-2 font-['Space_Grotesk'] text-sm shadow-[3px_3px_0_0_rgba(43,43,43,0.35)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </motion.button>

        <div className="flex-1 text-center">
          <h1 className="font-['Bebas_Neue'] text-3xl tracking-wider">QUEST BOARD</h1>
          <p className="font-['Caveat'] text-lg -rotate-1 opacity-70">where doodles train to win</p>
        </div>

        {/* Auth button (simplified for quest page) */}
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="ml-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
          >
            <Zap className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="ml-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
          >
            <Zap className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-160px)] px-6 py-4">
        {/* Left sidebar - Leaderboard */}
        <aside className="w-[280px] shrink-0">
          <LeaderboardWidget
            users={userStats?.leaderboard || []}
            isLoading={isInitialLoading}
          />
        </aside>

        {/* Main content area */}
        <section className="flex-1 space-y-6">
          {/* Reward Banner */}
          <RewardBanner
            userStats={userStats}
            isLoading={isInitialLoading}
          />

          {/* JumpBackIn - In-progress quests carousel */}
          <JumpBackIn
            quests={filteredQuests.map(quest => ({
              ...quest,
              progress: questProgressMap[quest.id] || 0
            }))}
            isLoading={isInitialLoading}
          />

          {/* Filter Controls */}
          <FilterBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedSport={selectedSport}
            onSportChange={setSelectedSport}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableSports={Array.from(new Set(allQuests?.map(q => q.sport) || []))}
            isLoading={isInitialLoading}
          />

          {/* Quest Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isInitialLoading ? (
              // Skeleton loading states
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader key={i} type="quest-card" />
              ))
            ) : error ? (
              <div className="col-span-3">
                <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2b2b2b]/30 bg-[#efe9da] p-4">
                  <MessageCircle className="h-5 w-5 shrink-0 text-red-700" />
                  <span>{error}</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-auto underline underline-offset-4"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredQuests.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="font-['Caveat'] text-2xl opacity-50">
                  {getEmptyStateMessage(activeTab)}
                </p>
                {!isLoggedIn && (
                  <p className="mt-4 font-['Space_Grotesk'] text-sm opacity-60">
                    — sign in to track progress and claim rewards —
                  </p>
                )}
                {!isLoggedIn && (
                  <button
                    key="login-btn"
                    onClick={onLogin}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] hover:bg-[#2b2b2b]/10 transition-all duration-200"
                  >
                    Sign In
                  </button>
                )}
              </div>
            ) : (
              filteredQuests.map((quest: any) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  progress={questProgressMap[quest.id] || 0}
                  isLoggedIn={isLoggedIn}
                  onSelect={() => setSelectedQuest(quest)}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Quest Detail Drawer */}
      <AnimatePresence>
        {selectedQuest && (
          <QuestDetailDrawer
            quest={selectedQuest}
            isOpen={true}
            onClose={() => setSelectedQuest(null)}
            isLoggedIn={isLoggedIn}
            user={user}
            onClaim={() => {
              // Handle quest claim logic
              console.log('Claim quest:', selectedQuest.id);
              setSelectedQuest(null);
              // In a real app, we'd update the quest status here
            }}
            onStart={() => {
              // Handle quest start logic
              console.log('Start quest:', selectedQuest.id);
              setSelectedQuest(null);
              // In a real app, we'd update the quest progress here
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}