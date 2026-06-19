/**
 * TeamsFeature.tsx
 *
 * Live data panel for the Teams door (Door 01).
 * Rendered below the existing static FeaturePage card in App.tsx.
 *
 * What it does NOW:
 *   - Lists all teams from GET /api/teams
 *   - Lets an authenticated user create a new team
 *
 * FUTURE DESIGN CHANGES — add new sections below the comment marked
 * "── FUTURE SECTIONS ──────────────────────────────────────────────────────────"
 * without touching the existing card structure above it.
 *
 * Ideas for future sections:
 *   - Team detail drawer / modal (roster, kit colors, formation viewer)
 *   - Invite captain / invite players by email
 *   - Kit color picker (visual hex swatch)
 *   - Formation selector (4-3-3, 4-4-2, etc.)
 *   - Player tryout listing (open tryouts per team)
 *   - Team chemistry score bar
 *   - Head-to-head stats between two selected teams
 */

import { useEffect, useRef, useState } from 'react';
import { Users, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTeams, createTeam } from '../../api/teams';
import type { Team } from '../../api/teams';
import type { AuthUser } from '../../api/auth';

interface TeamsFeatureProps {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

export function TeamsFeature({ isLoggedIn }: TeamsFeatureProps) {
  // ── State ───────────────────────────────────────────────────────────────────
  const [teams, setTeams]       = useState<Team[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Create team form state
  const [showForm, setShowForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ── Data loading ─────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showForm) nameRef.current?.focus();
  }, [showForm]);

  // ── Create team ──────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const newTeam = await createTeam({ name: teamName.trim() });
      setTeams(prev => [newTeam, ...prev]);
      setTeamName('');
      setShowForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section className="mt-12 space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wide">LIVE ROSTERS</h2>
            <p className="font-['Caveat'] text-lg -rotate-1 opacity-70">squads registered in the arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <motion.button
            type="button"
            onClick={load}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80"
            aria-label="Refresh teams"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>

          {/* Create team button — visible only when logged in */}
          {isLoggedIn && (
            <motion.button
              type="button"
              onClick={() => setShowForm(v => !v)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-4 py-2 font-['Space_Grotesk'] text-sm text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.35)]"
            >
              <Plus className="h-4 w-4" />
              New Squad
            </motion.button>
          )}
        </div>
      </div>

      {/* Create team form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df]/90 p-5 shadow-[6px_6px_0_rgba(43,43,43,0.18)]"
          >
            <h3 className="mb-4 font-['Bebas_Neue'] text-2xl">CREATE A SQUAD</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="flex-1 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
                Squad name
                <input
                  ref={nameRef}
                  type="text"
                  required
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Doodle Destroyers"
                  className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none placeholder:text-[#2b2b2b]/35 focus:border-[#2b2b2b] focus:shadow-[0_0_0_3px_rgba(43,43,43,0.14)]"
                />
              </label>

              {/*
               * FUTURE: Add tournament selector dropdown here
               * <TournamentSelect onChange={setSelectedTournamentId} />
               *
               * FUTURE: Add kit color pickers here
               * <KitColorPicker />
               */}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Lock In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setCreateError(null); }}
                  className="rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] px-5 py-3 font-['Space_Grotesk'] text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
            {createError && (
              <p className="mt-3 flex items-center gap-2 font-['Space_Grotesk'] text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {createError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest nudge */}
      {!isLoggedIn && (
        <p className="font-['Caveat'] text-xl opacity-60">
          — sign in to create your squad and join the arena —
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2b2b2b]/30 bg-[#efe9da] p-4 font-['Space_Grotesk'] text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
          <span>{error}</span>
          <button onClick={load} className="ml-auto underline underline-offset-4">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-3xl border-2 border-[#2b2b2b]/20 bg-[#e8dfcd]"
            />
          ))}
        </div>
      )}

      {/* Team cards */}
      {!loading && !error && (
        <AnimatePresence>
          {teams.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-['Caveat'] text-2xl opacity-50"
            >
              no squads yet — be the first to register!
            </motion.p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-3xl border-2 border-[#2b2b2b] bg-[#f7f0df] p-5 shadow-[4px_4px_0_rgba(43,43,43,0.18)] transition-transform hover:-translate-y-1"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Bebas_Neue'] text-lg">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    {/*
                     * FUTURE: Team menu (edit, disband, view roster)
                     * <TeamMenu teamId={team.id} />
                     */}
                  </div>
                  <h3 className="font-['Bebas_Neue'] text-2xl leading-tight">{team.name}</h3>
                  <p className="mt-1 font-['Space_Grotesk'] text-xs uppercase tracking-[0.15em] opacity-50">
                    {team.playerIds?.length ?? 0} player{(team.playerIds?.length ?? 0) !== 1 ? 's' : ''}
                  </p>

                  {/*
                   * FUTURE: Kit color swatches
                   * <KitSwatches primary={team.kitColors?.primary} secondary={team.kitColors?.secondary} />
                   *
                   * FUTURE: Chemistry bar
                   * <ChemistryBar value={team.chemistry} />
                   *
                   * FUTURE: View roster CTA
                   * <button onClick={() => openTeamDetail(team.id)}>View Roster →</button>
                   */}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* ── FUTURE SECTIONS ──────────────────────────────────────────────────────────
       *
       * Add new Teams feature sections here. Each section should follow the same
       * cream/black sketch visual language:
       *   - rounded-3xl border-2 border-[#2b2b2b] cards
       *   - font-['Bebas_Neue'] for headings, font-['Space_Grotesk'] for body
       *   - shadow-[Xpx_Xpx_0_rgba(43,43,43,0.XX)] for paper-cutout depth
       *   - motion.div with initial/animate for smooth entrance
       *
       * Suggested future sections (implement one at a time):
       *   1. <TryoutBoard />   — open tryout listings per team
       *   2. <FormationPicker />  — formation selector with visual grid
       *   3. <HeadToHead />    — pick two teams, show win/loss record
       *   4. <KitDesigner />   — kit color + pattern preview
       *
       * ────────────────────────────────────────────────────────────────────────── */}
    </section>
  );
}
