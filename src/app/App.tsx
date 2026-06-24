/**
 * App.tsx — Main application shell for STICK LEAGUE
 *
 * Architecture overview:
 *   - Page state is managed with local React state (no URL router).
 *   - Auth state comes from the Spring Session backend (GET /api/auth/me on mount).
 *   - Animated transitions use AnimatePresence + motion.div (motion/react).
 *   - The three feature pages load live data from the backend via the api/ layer.
 *
 * Page states:
 *   "landing"  → full-screen interactive sketch scene
 *   "doors"    → arena door selection (Teams / Matches / Training)
 *   "login"    → auth page (login + register)
 *   "teams"    → Teams feature page (Door 01)
 *   "matches"  → Matches feature page (Door 02)
 *   "training" → Training feature page (Door 03)
 *
 * Future considerations:
 *   - Migrate page state to React Router for deep-linking / browser back button
 *   - Add a user context / provider instead of prop-drilling auth state
 *   - Add a global toast / notification system (sonner is already installed)
 *   - Add an admin portal page behind a ROLE_ADMIN gate
 *   - Add a player profile page (route: /players/:id)
 *   - Add a settings page (theme toggle, notification prefs)
 */

import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { ArrowLeft, CalendarDays, Shield, Trophy, Users, Zap } from "lucide-react";

import { InteractiveBackground } from "./components/InteractiveBackground";
import { DoorsPage, type DoorFeature } from "./components/DoorsPage";

// ── Backend API imports ───────────────────────────────────────────────────────
import { getMe, signIn, signOut, signUp } from "../api/auth";
import type { AuthUser } from "../api/auth";
import type { ApiError } from "../api/client";

// ── Live feature panel imports ────────────────────────────────────────────────
import { TeamsFeature }    from "./components/TeamsFeature";
import { MatchesFeature }  from "./components/MatchesFeature";
import { TrainingFeature } from "./components/TrainingFeature";
import { QuestBoardPage }  from "./components/QuestBoardPage";

// ── Page type ─────────────────────────────────────────────────────────────────
type Page = "landing" | "doors" | "login" | DoorFeature | "quests";

// ── Static feature copy (visual hero section — do not change these) ───────────
// The stats and actions here are display copy for the feature page header card.
// Live data is loaded separately by each feature component below the card.
//
// FUTURE: Replace static stats with real aggregates from the backend
// e.g. stats[0] = `${teamCount} active squads` fetched from GET /api/teams
const featureCopy: Record<DoorFeature, {
  eyebrow: string;
  title: string;
  note: string;
  stats: string[];
  actions: string[];
}> = {
  teams: {
    eyebrow: "Door 01 · Teams",
    title: "Build your squad",
    note: "Draft stick players, set roles, and lock a formation before match night.",
    stats: ["12 active squads", "4 open tryouts", "88% chemistry"],
    actions: ["Create roster", "Invite captain", "Set kit colors"],
  },
  matches: {
    eyebrow: "Door 02 · Matches",
    title: "Match control room",
    note: "Queue fixtures, track brackets, and publish highlights from one sketchbook console.",
    stats: ["6 games today", "21 goals logged", "Final at 21:00"],
    actions: ["Schedule match", "Open bracket", "Post replay"],
  },
  training: {
    eyebrow: "Door 03 · Training",
    title: "Practice the trickbook",
    note: "Run juggling drills, reaction tests, and arena challenges before the crowd arrives.",
    stats: ["9 drills ready", "42 min session", "+14 form boost"],
    actions: ["Start drill", "Review form", "Save routine"],
  },
};

// ── Root application component ────────────────────────────────────────────────

export default function App() {
  const [page, setPage]           = useState<Page>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser]           = useState<AuthUser | null>(null);

  // ── Restore session on mount ────────────────────────────────────────────────
  // Silently check if the user has an active session (backend sends session cookie).
  // If GET /api/auth/me returns a user, restore login state without any redirect.
  useEffect(() => {
    getMe().then(existingUser => {
      if (existingUser) {
        setUser(existingUser);
        setIsLoggedIn(true);
      }
    });
  }, []);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goLogin = () => setPage("login");

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Even if the backend call fails, clear local state so the UI is consistent
    }
    setUser(null);
    setIsLoggedIn(false);
    setPage("landing");
  };

  /**
   * Called by LoginPage after a successful signin or signup.
   * Stores the returned user object and navigates to the arena.
   */
  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setPage("doors");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DndProvider backend={HTML5Backend}>
    <div className="relative min-h-screen w-full overflow-hidden bg-[#efe9da] text-[#2b2b2b]">
      <AnimatePresence mode="wait">
        {page === "landing" && (
          <Screen key="landing">
            <Landing
              onEnterArena={() => setPage("doors")}
              isLoggedIn={isLoggedIn}
              onLogin={goLogin}
              onLogout={handleLogout}
            />
          </Screen>
        )}

        {page === "doors" && (
          <Screen key="doors" zoom>
            <DoorsPage
              onBack={() => setPage("landing")}
              onDoorSelect={setPage}
              authSlot={
                <AuthButtons
                  isLoggedIn={isLoggedIn}
                  onLogin={goLogin}
                  onLogout={handleLogout}
                />
              }
            />
          </Screen>
        )}

        {page === "login" && (
          <Screen key="login">
            <LoginPage
              onBack={() => setPage("landing")}
              onLoginSuccess={handleLoginSuccess}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          </Screen>
        )}

        {(page === "teams" || page === "matches" || page === "training") && (
          <Screen key={page}>
            <FeaturePage
              feature={page}
              onBack={() => setPage("doors")}
              isLoggedIn={isLoggedIn}
              user={user}
              onLogin={goLogin}
              onLogout={handleLogout}
            />
          </Screen>
        )}

        {page === "quests" && (
          <Screen key="quests">
            <QuestBoardPage
              onBack={() => setPage("doors")}
              isLoggedIn={isLoggedIn}
              user={user}
              onLogin={goLogin}
              onLogout={handleLogout}
            />
          </Screen>
        )}
      </AnimatePresence>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "rounded-2xl border-2 border-[#2b2b2b] bg-[#f7f0df] font-['Space_Grotesk'] text-[#2b2b2b] shadow-[4px_4px_0_rgba(43,43,43,0.22)]",
          },
        }}
      />
    </div>
    </DndProvider>
  );
}

// ── Page wrapper (fade / zoom transition) ─────────────────────────────────────

function Screen({ children, zoom = false }: { children: ReactNode; zoom?: boolean }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, scale: zoom ? 1.06 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: zoom ? 0.7 : 0.55, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────
// ⚠️ DO NOT CHANGE: visual design is intentional and must not be modified.

function Landing({
  onEnterArena,
  isLoggedIn,
  onLogin,
  onLogout,
}: {
  onEnterArena: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#efe9da] text-[#2b2b2b]">
      <InteractiveBackground onPortalEnd={onEnterArena} />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-[#efe9da]/85 via-[#efe9da]/25 to-transparent" />
      <div className="pointer-events-none relative z-40 mx-auto flex min-h-screen max-w-[1320px] flex-col px-6 py-6 lg:px-12">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="pointer-events-auto flex items-center gap-3">
            <nav className="pointer-events-auto hidden items-center gap-7 font-['Space_Grotesk'] text-sm md:flex">
              {["Teams", "Matches", "Arena", "About"].map((item) => (
                <a key={item} href="#" className="relative uppercase tracking-[0.14em] opacity-80 transition-opacity hover:opacity-100">
                  {item}
                </a>
              ))}
            </nav>
            <AuthButtons isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
          </div>
        </header>
        <main className="flex flex-1 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-md"
          >
            <span className="pointer-events-auto inline-block rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/70 px-3 py-1 font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.22em]">
              Hand-drawn e-sports
            </span>
            <h1 className="mt-6 font-['Bebas_Neue'] text-[clamp(64px,9vw,132px)] leading-[0.9] tracking-[0.01em]">
              STICK<br />LEAGUE
            </h1>
            <p className="mt-2 -rotate-2 font-['Caveat'] text-[28px] leading-[1.1]">where doodles go pro.</p>
            <p className="mt-6 max-w-sm font-['Space_Grotesk'] text-base leading-[1.6] opacity-80">
              The whole scene is alive — kick the football to watch our star player juggle, tap again to switch the trick, or step through the portal into the arena.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {[
                ["Join the League", "bg-[#2b2b2b] text-[#f3eee1] shadow-[4px_4px_0_0_rgba(43,43,43,0.4)]"],
                ["Watch Matches",   "bg-[#efe9da]/70 shadow-[4px_4px_0_0_rgba(43,43,43,0.25)]"],
              ].map(([label, cls]) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1, scale: 0.98 }}
                  className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] px-7 py-3 font-['Space_Grotesk'] text-[15px] ${cls}`}
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-3 font-['Space_Grotesk'] text-xs uppercase tracking-[0.18em] opacity-70">
          <span>© 2026 Stick League</span>
          <span>Season 01 · Now live</span>
        </footer>
      </div>
    </div>
  );
}

// ── Feature page ──────────────────────────────────────────────────────────────
// ⚠️ The top hero section and static card are the original design — do NOT change.
// The live data panels (TeamsFeature, MatchesFeature, TrainingFeature) are added
// BELOW the existing grid section and can be freely extended.

function FeaturePage({
  feature,
  onBack,
  isLoggedIn,
  user,
  onLogin,
  onLogout,
}: {
  feature: DoorFeature;
  onBack: () => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const copy = featureCopy[feature];
  const icons =
    feature === "teams"
      ? [Users, Shield, Trophy]
      : feature === "matches"
      ? [CalendarDays, Trophy, Zap]
      : [Zap, Shield, Users];

  return (
    <div className="min-h-screen overflow-auto bg-[#efe9da] text-[#2b2b2b]">
      {/* Grid background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(#2b2b2b_1px,transparent_1px),linear-gradient(90deg,#2b2b2b_1px,transparent_1px)] [background-size:46px_46px]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-10">

        {/* ── Header (unchanged) ──────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <BackButton onClick={onBack} />
          <Logo />
          <AuthButtons isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
        </header>

        {/* ── Static hero + stats card (unchanged — original design) ─────── */}
        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="rounded-full border-2 border-[#2b2b2b] bg-[#f7f0df] px-3 py-1 font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.22em]">
              {copy.eyebrow}
            </span>
            <h1 className="mt-6 font-['Bebas_Neue'] text-[clamp(58px,10vw,126px)] leading-[0.88] tracking-[0.015em]">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl font-['Space_Grotesk'] text-lg leading-8 opacity-80">
              {copy.note}
            </p>
          </div>

          <div className="rotate-[-1deg] rounded-[2rem] border-[3px] border-[#2b2b2b] bg-[#f7f0df]/90 p-5 shadow-[10px_10px_0_rgba(43,43,43,0.22)]">
            <div className="grid gap-4 sm:grid-cols-3">
              {copy.stats.map((stat, i) => {
                const Icon = icons[i];
                return (
                  <div key={stat} className="min-h-36 rounded-3xl border-2 border-[#2b2b2b] bg-[#efe9da] p-4">
                    <Icon className="mb-4 h-7 w-7" />
                    <p className="font-['Bebas_Neue'] text-3xl leading-none">{stat}</p>
                  </div>
                );
              })}
            </div>

            {/* Static action buttons — these are display elements, not wired to API */}
            {/* FUTURE: Wire each action button to the relevant API call or open a modal */}
            <div className="mt-5 space-y-3">
              {copy.actions.map((action, i) => (
                <button
                  key={action}
                  className="flex w-full items-center justify-between rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] px-5 py-3 font-['Space_Grotesk'] transition-transform hover:-translate-y-0.5"
                >
                  <span>{String(i + 1).padStart(2, "0")} · {action}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live data panels ─────────────────────────────────────────────────
         *
         * Each feature component is kept in its own file so future design changes
         * can be made independently without touching this parent layout.
         *
         * To extend a feature:
         *   1. Open the relevant component file (TeamsFeature / MatchesFeature /
         *      TrainingFeature).
         *   2. Add new sections below the "── FUTURE SECTIONS ──" comment block
         *      inside that file.
         *   3. The cream/black sketch style guide is documented inside each file.
         *
         * ─────────────────────────────────────────────────────────────────── */}
        <div className="pb-16">
          {feature === "teams"    && <TeamsFeature    isLoggedIn={isLoggedIn} user={user} />}
          {feature === "matches"  && <MatchesFeature  isLoggedIn={isLoggedIn} user={user} />}
          {feature === "training" && <TrainingFeature isLoggedIn={isLoggedIn} user={user} />}
        </div>

      </main>
    </div>
  );
}

// ── Shared UI components (unchanged) ─────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/80 px-4 py-2 font-['Space_Grotesk'] text-sm shadow-[3px_3px_0_0_rgba(43,43,43,0.35)]"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
      Back
    </motion.button>
  );
}

function Logo() {
  return (
    <div className="pointer-events-auto flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/70">
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="4" r="3" />
          <path d="M11 7v9" />
          <path d="M11 16l-5 7M11 16l5 7" />
          <path d="M11 10l-6 1M11 10l6 1" />
        </svg>
      </div>
      <span className="font-['Bebas_Neue'] text-[26px] tracking-[0.04em]">STICK&nbsp;LEAGUE</span>
    </div>
  );
}

// ── Auth button animation state machine ───────────────────────────────────────
// (unchanged from original design)

const buttonStates: Record<string, Record<string, string>> = {
  default:  { "--figure-duration": "100", "--transform-figure": "none", "--walking-duration": "100", "--transform-arm1": "none", "--transform-wrist1": "none", "--transform-arm2": "none", "--transform-wrist2": "none", "--transform-leg1": "none", "--transform-calf1": "none", "--transform-leg2": "none", "--transform-calf2": "none" },
  hover:    { "--figure-duration": "100", "--transform-figure": "translateX(1.5px)", "--walking-duration": "100", "--transform-arm1": "rotate(-5deg)", "--transform-wrist1": "rotate(-15deg)", "--transform-arm2": "rotate(5deg)", "--transform-wrist2": "rotate(6deg)", "--transform-leg1": "rotate(-10deg)", "--transform-calf1": "rotate(5deg)", "--transform-leg2": "rotate(20deg)", "--transform-calf2": "rotate(-20deg)" },
  walking1: { "--figure-duration": "300", "--transform-figure": "translateX(11px)", "--walking-duration": "300", "--transform-arm1": "translateX(-4px) translateY(-2px) rotate(120deg)", "--transform-wrist1": "rotate(-5deg)", "--transform-arm2": "translateX(4px) rotate(-110deg)", "--transform-wrist2": "rotate(-5deg)", "--transform-leg1": "translateX(-3px) rotate(80deg)", "--transform-calf1": "rotate(-30deg)", "--transform-leg2": "translateX(4px) rotate(-60deg)", "--transform-calf2": "rotate(20deg)" },
  walking2: { "--figure-duration": "400", "--transform-figure": "translateX(17px)", "--walking-duration": "300", "--transform-arm1": "rotate(60deg)", "--transform-wrist1": "rotate(-15deg)", "--transform-arm2": "rotate(-45deg)", "--transform-wrist2": "rotate(6deg)", "--transform-leg1": "rotate(-5deg)", "--transform-calf1": "rotate(10deg)", "--transform-leg2": "rotate(10deg)", "--transform-calf2": "rotate(-20deg)" },
  falling1: { "--figure-duration": "1600", "--walking-duration": "400", "--transform-arm1": "rotate(-60deg)", "--transform-wrist1": "none", "--transform-arm2": "rotate(30deg)", "--transform-wrist2": "rotate(120deg)", "--transform-leg1": "rotate(-30deg)", "--transform-calf1": "rotate(-20deg)", "--transform-leg2": "rotate(20deg)" },
  falling2: { "--walking-duration": "300", "--transform-arm1": "rotate(-100deg)", "--transform-arm2": "rotate(-60deg)", "--transform-wrist2": "rotate(60deg)", "--transform-leg1": "rotate(80deg)", "--transform-calf1": "rotate(20deg)", "--transform-leg2": "rotate(-60deg)" },
  falling3: { "--walking-duration": "500", "--transform-arm1": "rotate(-30deg)", "--transform-wrist1": "rotate(40deg)", "--transform-arm2": "rotate(50deg)", "--transform-wrist2": "none", "--transform-leg1": "rotate(-30deg)", "--transform-leg2": "rotate(20deg)", "--transform-calf2": "none" },
};

function AuthButtons({
  isLoggedIn,
  onLogin,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {isLoggedIn ? (
        <PrimeDoorButton variant="logout" label="Log Out" onComplete={onLogout} />
      ) : (
        <PrimeDoorButton variant="login" label="Log In" onComplete={onLogin} />
      )}
    </div>
  );
}

function PrimeDoorButton({
  variant,
  label,
  onComplete,
}: {
  variant: "login" | "logout";
  label: string;
  onComplete: () => void;
}) {
  const [phase, setPhase]   = useState("default");
  const [classes, setClasses] = useState("");
  const setButtonState = (key: string) => setPhase(key);

  const run = () => {
    if (variant === "login") {
      setClasses("clicked entered");
      window.setTimeout(onComplete, 420);
      return;
    }
    if (phase !== "default" && phase !== "hover") return;
    setClasses("clicked"); setButtonState("walking1");
    window.setTimeout(() => {
      setClasses("clicked door-slammed"); setButtonState("walking2");
      window.setTimeout(() => {
        setClasses("clicked door-slammed falling"); setButtonState("falling1");
        window.setTimeout(() => {
          setButtonState("falling2");
          window.setTimeout(() => {
            setButtonState("falling3");
            window.setTimeout(() => { setClasses(""); setButtonState("default"); onComplete(); }, 700);
          }, 300);
        }, 400);
      }, 400);
    }, 300);
  };

  return (
    <button
      type="button"
      title={label}
      onMouseEnter={() => phase === "default" && setButtonState("hover")}
      onMouseLeave={() => phase === "hover" && setButtonState("default")}
      onClick={run}
      className={`primeDoorButton ${variant} ${classes}`}
      style={buttonStates[phase] as CSSProperties}
    >
      <DoorFigure />
      <span className="button-text">{label}</span>
    </button>
  );
}

function DoorFigure() {
  return (
    <>
      <svg className="doorway" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z"/>
        <path className="bang" d="M40.5 43.7L26.6 31.4l-2.5 6.7zM41.9 50.4l-19.5-4-1.4 6.3zM40 57.4l-17.7 3.9 3.9 5.7z"/>
      </svg>
      <svg className="figure" viewBox="0 0 100 100">
        <circle cx="52.1" cy="32.4" r="6.4"/>
        <path d="M50.7 62.8c-1.2 2.5-3.6 5-7.2 4-3.2-.9-4.9-3.5-4-7.8.7-3.4 3.1-13.8 4.1-15.8 1.7-3.4 1.6-4.6 7-3.7 4.3.7 4.6 2.5 4.3 5.4-.4 3.7-2.8 15.1-4.2 17.9z"/>
        <g className="arm1">
          <path d="M55.5 56.5l-6-9.5c-1-1.5-.6-3.5.9-4.4 1.5-1 3.7-1.1 4.6.4l6.1 10c1 1.5.3 3.5-1.1 4.4-1.5.9-3.5.5-4.5-.9z"/>
          <path className="wrist1" d="M69.4 59.9L58.1 58c-1.7-.3-2.9-1.9-2.6-3.7.3-1.7 1.9-2.9 3.7-2.6l11.4 1.9c1.7.3 2.9 1.9 2.6 3.7-.4 1.7-2 2.9-3.8 2.6z"/>
        </g>
        <g className="arm2">
          <path d="M34.2 43.6L45 40.3c1.7-.6 3.5.3 4 2 .6 1.7-.3 4-2 4.5l-10.8 2.8c-1.7.6-3.5-.3-4-2-.6-1.6.3-3.4 2-4z"/>
          <path className="wrist2" d="M27.1 56.2L32 45.7c.7-1.6 2.6-2.3 4.2-1.6 1.6.7 2.3 2.6 1.6 4.2L33 58.8c-.7 1.6-2.6 2.3-4.2 1.6-1.7-.7-2.4-2.6-1.7-4.2z"/>
        </g>
        <g className="leg1">
          <path d="M52.1 73.2s-7-5.7-7.9-6.5c-.9-.9-1.2-3.5-.1-4.9 1.1-1.4 3.8-1.9 5.2-.9l7.9 7c1.4 1.1 1.7 3.5.7 4.9-1.1 1.4-4.4 1.5-5.8.4z"/>
          <path className="calf1" d="M52.6 84.4l-1-12.8c-.1-1.9 1.5-3.6 3.5-3.7 2-.1 3.7 1.4 3.8 3.4l1 12.8c.1 1.9-1.5 3.6-3.5 3.7-2 0-3.7-1.5-3.8-3.4z"/>
        </g>
        <g className="leg2">
          <path d="M37.8 72.7s1.3-10.2 1.6-11.4 2.4-2.8 4.1-2.6c1.7.2 3.6 2.3 3.4 4l-1.8 11.1c-.2 1.7-1.7 3.3-3.4 3.1-1.8-.2-4.1-2.4-3.9-4.2z"/>
          <path className="calf2" d="M29.5 82.3l9.6-10.9c1.3-1.4 3.6-1.5 5.1-.1 1.5 1.4.4 4.9-.9 6.3l-8.5 9.6c-1.3 1.4-3.6 1.5-5.1.1-1.4-1.3-1.5-3.5-.2-5z"/>
        </g>
      </svg>
      <svg className="door" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z"/>
        <circle cx="66" cy="50" r="3.7"/>
      </svg>
    </>
  );
}

// ── Login / Register page ─────────────────────────────────────────────────────
// ⚠️ Visual layout is unchanged from original design.
// Backend auth calls wired to the form submits below.

function LoginPage({
  onBack,
  onLoginSuccess,
  isLoggedIn,
  onLogout,
}: {
  onBack: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
  const [mode, setMode]   = useState<"login" | "register">("login");
  const [isWide, setIsWide] = useState(false);
  const isRegister = mode === "register";

  // Auth form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(false); // FUTURE: persist session preference
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  // ── Responsive layout ───────────────────────────────────────────────────────
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync  = () => setIsWide(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Clear errors when switching modes
  useEffect(() => { setFormError(null); }, [mode]);

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      let loggedInUser: AuthUser;

      if (isRegister) {
        // Register: send firstName + lastName to backend
        loggedInUser = await signUp({ firstName, lastName, email, password });

        // After signup, sign in immediately to establish session cookie
        // (the backend doesn't set a session cookie on signup, only on signin)
        loggedInUser = await signIn({ email, password });
      } else {
        // Login with email + password
        loggedInUser = await signIn({ email, password });
      }

      onLoginSuccess(loggedInUser);
    } catch (err) {
      const apiErr = err as ApiError;
      setFormError(apiErr.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-auto bg-[#efe9da] text-[#2b2b2b]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:radial-gradient(#2b2b2b_1px,transparent_1px)] [background-size:22px_22px]" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <BackButton onClick={onBack} />
          <Logo />
          <PrimeDoorButton variant="logout" label="Log Out" onComplete={onLogout} />
        </header>

        <section className="flex flex-1 items-center py-10">
          <div className="relative grid w-full overflow-hidden rounded-[2rem] border-[3px] border-[#2b2b2b] bg-[#f7f0df] shadow-[12px_12px_0_rgba(43,43,43,0.22)] lg:grid-cols-2">

            {/* Dark brand panel */}
            <motion.aside
              animate={{ x: isWide && isRegister ? "100%" : "0%", borderRadius: isRegister ? "0 2rem 2rem 0" : "2rem 0 0 2rem" }}
              transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
              className="relative z-10 hidden min-h-[620px] flex-col justify-between bg-[#2b2b2b] p-10 text-[#f3eee1] lg:flex"
            >
              <div>
                <div className="mb-12 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#f3eee1]">
                    <svg width="25" height="28" viewBox="0 0 22 26" fill="none" stroke="#f3eee1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="4" r="3" />
                      <path d="M11 7v9" />
                      <path d="M11 16l-5 7M11 16l5 7" />
                      <path d="M11 10l-6 1M11 10l6 1" />
                    </svg>
                  </div>
                  <span className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">STICK LEAGUE</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: isRegister ? 28 : -28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.22 }}
                  >
                    <h1 className="whitespace-pre-line font-['Bebas_Neue'] text-[72px] leading-[0.9] tracking-[0.015em]">
                      {isRegister ? "JOIN THE\nROSTER" : "WELCOME\nBACK"}
                    </h1>
                    <p className="mt-5 max-w-sm font-['Space_Grotesk'] text-base leading-7 text-[#f3eee1]/65">
                      {isRegister
                        ? "Create your player card, save your squad, and enter the arena with your own league identity."
                        : "Sign in to keep your teams, fixtures, drills, and match progress synced across the clubhouse."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                {["Save squads", "Track match history", "Unlock training drills"].map((item) => (
                  <div key={item} className="flex items-center gap-3 font-['Space_Grotesk'] text-sm text-[#f3eee1]/80">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f3eee1]" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.aside>

            {/* Form panel */}
            <motion.div
              animate={{ x: isWide && isRegister ? "-100%" : "0%" }}
              transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
              className="relative min-h-[620px] p-6 sm:p-10 lg:col-start-2"
            >
              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: isRegister ? 28 : -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                  transition={{ duration: 0.22 }}
                  className="mx-auto flex h-full max-w-md flex-col justify-center"
                >
                  <span className="mb-5 w-fit rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] px-3 py-1 font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.22em]">
                    {isRegister ? "Register" : "Login"}
                  </span>
                  <h2 className="font-['Bebas_Neue'] text-6xl leading-none">
                    {isRegister ? "Create account" : "Welcome back"}
                  </h2>
                  <p className="mt-2 font-['Space_Grotesk'] text-sm leading-6 opacity-65">
                    {isRegister ? "Start saving your player profile today." : "Enter your credentials to continue."}
                  </p>

                  <div className="mt-8 space-y-4">
                    {/* Register fields: firstName + lastName */}
                    {isRegister && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField
                          label="First name"
                          placeholder="Stick"
                          value={firstName}
                          onChange={setFirstName}
                        />
                        <AuthField
                          label="Last name"
                          placeholder="Captain"
                          value={lastName}
                          onChange={setLastName}
                        />
                      </div>
                    )}
                    <AuthField
                      label="Email address"
                      placeholder="player@stickleague.gg"
                      type="email"
                      value={email}
                      onChange={setEmail}
                    />
                    <AuthField
                      label="Password"
                      placeholder={isRegister ? "Minimum 6 characters" : "Enter your password"}
                      type="password"
                      value={password}
                      onChange={setPassword}
                    />
                  </div>

                  {/* Login extras */}
                  {!isRegister && (
                    <div className="mt-4 flex items-center justify-between font-['Space_Grotesk'] text-sm">
                      <label className="flex items-center gap-2 opacity-70">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#2b2b2b]"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                        />
                        Remember me
                        {/* FUTURE: Pass rememberMe to signIn so backend sets longer session TTL */}
                      </label>
                      <button type="button" className="font-bold underline decoration-2 underline-offset-4">
                        Forgot password?
                        {/* FUTURE: Link to POST /api/auth/forgot-password flow */}
                      </button>
                    </div>
                  )}

                  {/* API error message */}
                  {formError && (
                    <div className="mt-4 rounded-2xl border-2 border-red-200 bg-red-50 p-3 font-['Space_Grotesk'] text-sm text-red-700">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-7 rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] px-5 py-3 font-['Space_Grotesk'] font-bold text-[#f3eee1] shadow-[4px_4px_0_rgba(43,43,43,0.28)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {submitting
                      ? (isRegister ? "Creating…" : "Signing in…")
                      : (isRegister ? "Create Account" : "Sign In")}
                  </button>

                  <p className="mt-6 text-center font-['Space_Grotesk'] text-sm opacity-75">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}
                    <button
                      type="button"
                      onClick={() => setMode(isRegister ? "login" : "register")}
                      className="ml-2 font-bold underline decoration-2 underline-offset-4"
                    >
                      {isRegister ? "Sign in" : "Create an account"}
                    </button>
                  </p>

                  {/* Demo credentials hint (login mode only) */}
                  {!isRegister && (
                    <div className="mt-6 rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] p-4 font-['Space_Grotesk'] text-xs leading-6 opacity-80">
                      <strong>Demo access:</strong> player@stickleague.gg · demo1234
                      {/* FUTURE: Auto-fill demo credentials on click */}
                    </div>
                  )}
                </motion.form>
              </AnimatePresence>
            </motion.div>

          </div>
        </section>
      </main>
    </div>
  );
}

// ── Auth field (controlled input) ─────────────────────────────────────────────

function AuthField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block font-['Space_Grotesk'] text-sm font-bold uppercase tracking-[0.12em]">
      <span>{label}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border-2 border-[#2b2b2b]/20 bg-[#efe9da] px-4 py-3 font-normal normal-case tracking-normal outline-none placeholder:text-[#2b2b2b]/35 focus:border-[#2b2b2b] focus:shadow-[0_0_0_3px_rgba(43,43,43,0.14)]"
      />
    </label>
  );
}
