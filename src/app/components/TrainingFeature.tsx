/**
 * TrainingFeature.tsx
 *
 * Live data panel for the Training door (Door 03).
 * Rendered below the existing static FeaturePage card in App.tsx.
 *
 * What it does NOW:
 *   - Lists available quests from GET /api/quests
 *   - Lets an authenticated user submit proof for a quest (file upload)
 *   - Shows the top-10 leaderboard from GET /api/quests/leaderboard
 *
 * FUTURE DESIGN CHANGES — add new sections below the comment marked
 * "── FUTURE SECTIONS ──────────────────────────────────────────────────────────"
 * without touching the existing card structure above it.
 *
 * Ideas for future sections:
 *   - Drill timer / stopwatch (in-browser timed challenge)
 *   - Video proof recording (MediaRecorder API → upload)
 *   - Quest difficulty filter tabs (EASY / MEDIUM / HARD / LEGEND)
 *   - Achievement badge showcase (unlocked via quest completions)
 *   - Streak counter (how many days in a row a player completed a quest)
 *   - XP progress bar toward next level
 *   - Daily quest countdown timer
 */

import { useEffect, useRef, useState } from 'react';
import { Zap, Trophy, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getQuests, submitQuest, getLeaderboard } from '../../api/quests';
import type { Quest, LeaderboardEntry, QuestCategory } from '../../api/quests';
import type { SpringPage } from '../../api/tournaments';
import type { AuthUser } from '../../api/auth';

interface TrainingFeatureProps {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

// ── Category badge colours ────────────────────────────────────────────────────
const categoryStyle: Record<QuestCategory, string> = {
  TECHNICAL:  'bg-blue-50 text-blue-800',
  PHYSICAL:   'bg-orange-50 text-orange-800',
  TACTICAL:   'bg-purple-50 text-purple-800',
  MENTAL:     'bg-green-50 text-green-800',
  GENERAL:    'bg-[#d9b45f]/20 text-[#8a6a00]',
};

export function TrainingFeature({ isLoggedIn }: TrainingFeatureProps) {
  // ── State ─────────────────────────────────────────────────────────────────────
  const [quests, setQuests]             = useState<Quest[]>([]);
  const [questPage, setQuestPage]       = useState<SpringPage<Quest> | null>(null);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [questError, setQuestError]     = useState<string | null>(null);

  const [leaderboard, setLeaderboard]   = useState<LeaderboardEntry[]>([]);
  const [loadingLB, setLoadingLB]       = useState(true);
  const [lbError, setLbError]           = useState<string | null>(null);

  // Proof submission
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [proofFile, setProofFile]       = useState<File | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category filter (future: real filter tabs)
  // const [category, setCategory] = useState<QuestCategory | undefined>();

  // ── Data loading ──────────────────────────────────────────────────────────────
  const loadQuests = async () => {
    setLoadingQuests(true);
    setQuestError(null);
    try {
      const page = await getQuests({ size: 9 });
      setQuestPage(page);
      setQuests(page.content);
    } catch (err) {
      setQuestError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setLoadingQuests(false);
    }
  };

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
    loadQuests();
    loadLeaderboard();
  }, []);

  // ── Proof submission ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestId || !proofFile) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitQuest(selectedQuestId, proofFile);
      setSubmitSuccess(true);
      setProofFile(null);
      setSelectedQuestId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSubmitSuccess(false), 4000);
      // Refresh leaderboard after submission (score may update after review)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit proof');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <section className="mt-12 space-y-10">

      {/* ── Quest board ──────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wide">QUEST BOARD</h2>
              <p className="font-['Caveat'] text-lg -rotate-1 opacity-70">active drills &amp; challenges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/*
             * FUTURE: Category filter tabs
             * <QuestCategoryFilter value={category} onChange={setCategory} />
             */}
            <motion.button
              type="button" onClick={loadQuests}
              whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
              aria-label="Refresh quests"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {questError && (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2b2b2b]/30 bg-[#efe9da] p-4 font-['Space_Grotesk'] text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
            <span>{questError}</span>
            <button onClick={loadQuests} className="ml-auto underline underline-offset-4">Retry</button>
          </div>
        )}

        {loadingQuests && !questError && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 animate-pulse rounded-3xl border-2 border-[#2b2b2b]/20 bg-[#e8dfcd]" />
            ))}
          </div>
        )}

        {!loadingQuests && !questError && quests.length === 0 && (
          <p className="font-['Caveat'] text-2xl opacity-50">the trickbook is empty — check back soon.</p>
        )}

        {!loadingQuests && !questError && quests.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quests.map((quest, i) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`group relative rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df] p-5 shadow-[4px_4px_0_rgba(43,43,43,0.18)] transition-all hover:-translate-y-1 ${selectedQuestId === quest.id ? 'ring-2 ring-[#2b2b2b] ring-offset-2' : ''}`}
                >
                  {/* Category badge */}
                  <span className={`mb-3 inline-block rounded-full px-2 py-0.5 font-['Space_Grotesk'] text-[10px] uppercase tracking-widest ${categoryStyle[quest.category]}`}>
                    {quest.category}
                  </span>

                  <h3 className="font-['Bebas_Neue'] text-2xl leading-tight">{quest.title}</h3>

                  {quest.description && (
                    <p className="mt-1 font-['Space_Grotesk'] text-xs leading-5 opacity-60 line-clamp-2">
                      {quest.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-['Bebas_Neue'] text-xl text-[#d9b45f]">
                      +{quest.pointsReward} XP
                    </span>

                    {/* Select for submission */}
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => setSelectedQuestId(prev => prev === quest.id ? null : quest.id)}
                        className="rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] px-3 py-1 font-['Space_Grotesk'] text-xs transition-colors hover:bg-[#2b2b2b] hover:text-[#f3eee1]"
                      >
                        {selectedQuestId === quest.id ? 'Selected ✓' : 'Submit Proof'}
                      </button>
                    )}
                  </div>

                  {/*
                   * FUTURE: Quest detail expansion
                   * <QuestDetailDrawer quest={quest} />
                   *
                   * FUTURE: Difficulty indicator
                   * <DifficultyBadge level={quest.difficulty} />
                   *
                   * FUTURE: Expiry countdown
                   * {quest.expiresAt && <ExpiryTimer expiresAt={quest.expiresAt} />}
                   *
                   * FUTURE: Tutorial video thumbnail
                   * {quest.videoUrl && <VideoThumb url={quest.videoUrl} />}
                   */}
                </motion.div>
              ))}
            </div>

            {/* Pagination hint */}
            {questPage && questPage.totalPages > 1 && (
              <p className="mt-4 font-['Space_Grotesk'] text-xs opacity-50">
                Showing {quests.length} of {questPage.totalElements} quests
                {/*
                 * FUTURE: Add pagination controls
                 * <PaginationBar page={questPage.number} total={questPage.totalPages} onChange={loadPage} />
                 */}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Proof submission form ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoggedIn && selectedQuestId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-[2rem] border-2 border-[#2b2b2b] bg-[#f7f0df]/90 p-6 shadow-[8px_8px_0_rgba(43,43,43,0.18)]"
          >
            <div className="mb-4 flex items-center gap-3">
              <Upload className="h-5 w-5" />
              <h2 className="font-['Bebas_Neue'] text-2xl">SUBMIT PROOF</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="font-['Space_Grotesk'] text-sm opacity-70">
                Quest selected: <span className="font-bold">
                  {quests.find(q => q.id === selectedQuestId)?.title ?? selectedQuestId}
                </span>
              </p>

              <label className="block font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                Proof file (image or video)
                <div className="mt-2 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept="image/*,video/*"
                    onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal file:mr-4 file:rounded-full file:border-2 file:border-[#2b2b2b] file:bg-[#2b2b2b] file:px-4 file:py-1 file:font-['Space_Grotesk'] file:text-xs file:text-[#f3eee1]"
                  />
                </div>
                {proofFile && (
                  <p className="mt-1 font-['Caveat'] text-lg opacity-60">
                    {proofFile.name} · {(proofFile.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </label>

              {/*
               * FUTURE: Video recording via MediaRecorder
               * <RecordButton onRecorded={file => setProofFile(file)} />
               *
               * FUTURE: Notes / description field for the submission
               * <textarea placeholder="Describe your technique..." />
               */}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || !proofFile}
                  className="rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {submitting ? 'Uploading…' : 'Submit for Review'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedQuestId(null); setProofFile(null); setSubmitError(null); }}
                  className="rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] px-5 py-3 font-['Space_Grotesk'] text-sm"
                >
                  Cancel
                </button>
                {submitSuccess && (
                  <span className="font-['Caveat'] text-xl text-green-700">Proof submitted! ✓</span>
                )}
              </div>

              {submitError && (
                <p className="flex items-center gap-2 font-['Space_Grotesk'] text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" /> {submitError}
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest nudge for submission */}
      {!isLoggedIn && (
        <p className="font-['Caveat'] text-xl opacity-60">
          — sign in to submit proof and earn XP —
        </p>
      )}

      {/* ── Leaderboard ───────────────────────────────────────────────────────── */}
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
            type="button" onClick={loadLeaderboard}
            whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 animate-pulse rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#e8dfcd]" />
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
                {/* Rank */}
                <span className={`w-8 shrink-0 font-['Bebas_Neue'] text-2xl ${i === 0 ? 'text-[#d9b45f]' : i === 1 ? 'text-[#9b9b9b]' : i === 2 ? 'text-[#b87333]' : 'opacity-40'}`}>
                  {i + 1}
                </span>

                {/* Player initial avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Bebas_Neue'] text-lg">
                  {(entry.username ?? 'P').charAt(0).toUpperCase()}
                </div>

                <span className="flex-1 font-['Space_Grotesk'] text-sm font-bold">
                  {entry.username ?? `Player ${entry.userId.slice(-4)}`}
                </span>

                <span className="font-['Bebas_Neue'] text-xl text-[#d9b45f]">
                  {entry.totalPoints.toLocaleString()} XP
                </span>

                {/*
                 * FUTURE: Player profile link
                 * <Link to={`/players/${entry.userId}`}>View Profile →</Link>
                 *
                 * FUTURE: Achievement badges row
                 * <AchievementBadges userId={entry.userId} />
                 *
                 * FUTURE: Trend arrow (up/down since last week)
                 * <TrendIndicator delta={entry.weeklyDelta} />
                 */}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── FUTURE SECTIONS ──────────────────────────────────────────────────────────
       *
       * Add new Training feature sections here. Keep the cream/black sketch style.
       *
       * Suggested future sections (implement one at a time):
       *   1. <DrillTimer />       — in-browser stopwatch / countdown for timed challenges
       *   2. <StreakTracker />    — daily login + quest-completion streak counter
       *   3. <XPProgressBar />   — progress toward next level badge
       *   4. <AchievementGrid /> — unlocked badges showcase
       *   5. <FormReview />      — side-by-side proof comparison (submitted vs expected)
       *   6. <DailyQuest />      — featured daily quest with countdown
       *   7. <SavedRoutines />   — user's saved training routine list
       *
       * ────────────────────────────────────────────────────────────────────────── */}
    </section>
  );
}
