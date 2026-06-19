/**
 * MatchesFeature.tsx
 *
 * Live data panel for the Matches door (Door 02).
 * Rendered below the existing static FeaturePage card in App.tsx.
 *
 * What it does NOW:
 *   - Lists active tournaments from GET /api/tournaments
 *   - Shows a schedule-match form (two team IDs + datetime)
 *   - Shows a score-update panel (match ID + scores)
 *
 * FUTURE DESIGN CHANGES — add new sections below the comment marked
 * "── FUTURE SECTIONS ──────────────────────────────────────────────────────────"
 * without touching the existing card structure above it.
 *
 * Ideas for future sections:
 *   - Live bracket visualiser (single/double elimination tree)
 *   - Real-time score ticker via WebSocket (/topic/matches/{id}/score)
 *   - Match highlight reel / VOD embed (YouTube / Twitch iframe)
 *   - Head-to-head history between two teams
 *   - Match timeline (goal-by-goal event log)
 *   - Post-match MVP voting
 */

import { useEffect, useState } from 'react';
import { CalendarDays, Trophy, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTournaments } from '../../api/tournaments';
import { createMatch, updateScore } from '../../api/matches';
import type { Tournament } from '../../api/tournaments';
import type { AuthUser } from '../../api/auth';

interface MatchesFeatureProps {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

export function MatchesFeature({ isLoggedIn }: MatchesFeatureProps) {
  // ── State ────────────────────────────────────────────────────────────────────
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Schedule form
  const [showSchedule, setShowSchedule] = useState(false);
  const [teamA, setTeamA]               = useState('');
  const [teamB, setTeamB]               = useState('');
  const [scheduledAt, setScheduledAt]   = useState('');
  const [scheduling, setScheduling]     = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Score update form
  const [showScore, setShowScore]     = useState(false);
  const [matchId, setMatchId]         = useState('');
  const [scoreA, setScoreA]           = useState('');
  const [scoreB, setScoreB]           = useState('');
  const [updating, setUpdating]       = useState(false);
  const [scoreError, setScoreError]   = useState<string | null>(null);
  const [scoreSuccess, setScoreSuccess] = useState(false);

  // ── Data loading ─────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getTournaments({ size: 6 });
      setTournaments(page.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Schedule match ────────────────────────────────────────────────────────────
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim()) return;
    setScheduling(true);
    setScheduleError(null);
    try {
      await createMatch({
        teamAId: teamA.trim(),
        teamBId: teamB.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        status: 'SCHEDULED',
      });
      setScheduleSuccess(true);
      setTeamA(''); setTeamB(''); setScheduledAt('');
      setTimeout(() => setScheduleSuccess(false), 3000);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to schedule match');
    } finally {
      setScheduling(false);
    }
  };

  // ── Update score ──────────────────────────────────────────────────────────────
  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId.trim()) return;
    setUpdating(true);
    setScoreError(null);
    try {
      await updateScore(matchId.trim(), {
        scoreA: parseInt(scoreA, 10) || 0,
        scoreB: parseInt(scoreB, 10) || 0,
      });
      setScoreSuccess(true);
      setMatchId(''); setScoreA(''); setScoreB('');
      setTimeout(() => setScoreSuccess(false), 3000);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Failed to update score');
    } finally {
      setUpdating(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const statusColor: Record<string, string> = {
    UPCOMING:  'bg-[#d9b45f]/30 text-[#8a6a00]',
    ONGOING:   'bg-green-100 text-green-800',
    COMPLETED: 'bg-[#2b2b2b]/10 text-[#2b2b2b]/60',
    CANCELLED: 'bg-red-50 text-red-700',
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <section className="mt-12 space-y-8">
      {/* Tournaments panel */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wide">TOURNAMENTS</h2>
              <p className="font-['Caveat'] text-lg -rotate-1 opacity-70">active brackets &amp; brackets</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={load}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
            aria-label="Refresh tournaments"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2b2b2b]/30 bg-[#efe9da] p-4 font-['Space_Grotesk'] text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
            <span>{error}</span>
            <button onClick={load} className="ml-auto underline underline-offset-4">Retry</button>
          </div>
        )}

        {loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-3xl border-2 border-[#2b2b2b]/20 bg-[#e8dfcd]" />
            ))}
          </div>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <p className="font-['Caveat'] text-2xl opacity-50">no tournaments running yet.</p>
        )}

        {!loading && !error && tournaments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {tournaments.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df] p-5 shadow-[4px_4px_0_rgba(43,43,43,0.18)] transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-['Bebas_Neue'] text-2xl leading-tight">{t.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-['Space_Grotesk'] text-[10px] uppercase tracking-widest ${statusColor[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </div>
                <p className="font-['Space_Grotesk'] text-xs uppercase tracking-[0.15em] opacity-60">
                  {t.game} · {t.format.replace('_', ' ')}
                </p>
                <p className="mt-2 font-['Space_Grotesk'] text-xs opacity-50">
                  {t.teamIds?.length ?? 0} / {t.maxTeams} teams
                </p>

                {/*
                 * FUTURE: Bracket viewer button
                 * <button onClick={() => openBracket(t.id)}>View Bracket →</button>
                 *
                 * FUTURE: Register team button (for logged-in team captains)
                 * <RegisterButton tournamentId={t.id} />
                 *
                 * FUTURE: Stream link
                 * {t.streamUrl && <StreamBadge url={t.streamUrl} />}
                 */}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Match scheduling form — authenticated users only */}
      {isLoggedIn && (
        <div className="rounded-[2rem] border-2 border-[#2b2b2b] bg-[#f7f0df]/90 p-6 shadow-[8px_8px_0_rgba(43,43,43,0.18)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5" />
              <h2 className="font-['Bebas_Neue'] text-2xl">SCHEDULE A MATCH</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(v => !v)}
              className="font-['Space_Grotesk'] text-sm underline underline-offset-4 opacity-60"
            >
              {showSchedule ? 'collapse' : 'expand'}
            </button>
          </div>

          <AnimatePresence>
            {showSchedule && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSchedule}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                    Team A ID
                    <input type="text" required value={teamA} onChange={e => setTeamA(e.target.value)}
                      placeholder="MongoDB ObjectId"
                      className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none placeholder:text-[#2b2b2b]/35 focus:border-[#2b2b2b]" />
                  </label>
                  <label className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                    Team B ID
                    <input type="text" required value={teamB} onChange={e => setTeamB(e.target.value)}
                      placeholder="MongoDB ObjectId"
                      className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none placeholder:text-[#2b2b2b]/35 focus:border-[#2b2b2b]" />
                  </label>
                </div>
                <label className="block font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Kick-off time</span>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none focus:border-[#2b2b2b]" />
                </label>

                {/*
                 * FUTURE: Tournament selector dropdown
                 * <TournamentSelect onChange={setSelectedTournamentId} />
                 *
                 * FUTURE: Venue / stream URL fields
                 * <VenueInput />
                 */}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={scheduling}
                    className="rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50">
                    {scheduling ? 'Scheduling…' : 'Lock Fixture'}
                  </button>
                  {scheduleSuccess && (
                    <span className="font-['Caveat'] text-xl text-green-700">Match scheduled! ✓</span>
                  )}
                </div>
                {scheduleError && (
                  <p className="flex items-center gap-2 font-['Space_Grotesk'] text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" /> {scheduleError}
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Score update panel — authenticated users only */}
      {isLoggedIn && (
        <div className="rounded-[2rem] border-2 border-[#2b2b2b] bg-[#f7f0df]/90 p-6 shadow-[8px_8px_0_rgba(43,43,43,0.18)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Bebas_Neue'] text-2xl">UPDATE SCORE</h2>
            <button type="button" onClick={() => setShowScore(v => !v)}
              className="font-['Space_Grotesk'] text-sm underline underline-offset-4 opacity-60">
              {showScore ? 'collapse' : 'expand'}
            </button>
          </div>

          <AnimatePresence>
            {showScore && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleScore}
                className="space-y-4 overflow-hidden"
              >
                <label className="block font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                  Match ID
                  <input type="text" required value={matchId} onChange={e => setMatchId(e.target.value)}
                    placeholder="MongoDB ObjectId of the match"
                    className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none placeholder:text-[#2b2b2b]/35 focus:border-[#2b2b2b]" />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                    Team A score
                    <input type="number" min="0" value={scoreA} onChange={e => setScoreA(e.target.value)}
                      placeholder="0"
                      className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-['Bebas_Neue'] text-3xl outline-none focus:border-[#2b2b2b]" />
                  </label>
                  <label className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                    Team B score
                    <input type="number" min="0" value={scoreB} onChange={e => setScoreB(e.target.value)}
                      placeholder="0"
                      className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-['Bebas_Neue'] text-3xl outline-none focus:border-[#2b2b2b]" />
                  </label>
                </div>

                {/*
                 * FUTURE: Replace these raw ID inputs with:
                 *   - Match selector dropdown (list of LIVE matches)
                 *   - Real-time score ticker (WebSocket subscription)
                 *   - Auto-submit on score change (debounced)
                 *   - Goal event log (who scored, minute)
                 */}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={updating}
                    className="rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50">
                    {updating ? 'Updating…' : 'Post Score'}
                  </button>
                  {scoreSuccess && (
                    <span className="font-['Caveat'] text-xl text-green-700">Score updated! ✓</span>
                  )}
                </div>
                {scoreError && (
                  <p className="flex items-center gap-2 font-['Space_Grotesk'] text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" /> {scoreError}
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── FUTURE SECTIONS ──────────────────────────────────────────────────────────
       *
       * Add new Matches feature sections here. Keep the cream/black sketch style:
       *   - rounded-3xl border-2 border-[#2b2b2b] cards
       *   - font-['Bebas_Neue'] headings, font-['Space_Grotesk'] body
       *
       * Suggested future sections (implement one at a time):
       *   1. <BracketViewer tournamentId={...} /> — SVG bracket tree
       *   2. <LiveTicker />  — WebSocket score feed for LIVE matches
       *   3. <HighlightReel /> — embedded VOD / clip gallery per match
       *   4. <HeadToHeadStats teamAId={...} teamBId={...} />
       *   5. <MatchTimeline matchId={...} /> — goal/event log
       *   6. <MVPVoting matchId={...} /> — post-match player vote
       *
       * ────────────────────────────────────────────────────────────────────────── */}
    </section>
  );
}
