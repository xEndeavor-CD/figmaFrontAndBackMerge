import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";


import doorsVideo from "../../imports/smooth_the_motion_of_this_vide.mp4";
import transitionVideo from "../../imports/video_202606171249.mp4";

export type DoorFeature = "teams" | "matches" | "training";

/** Crossfade length between the two clips — long & gentle. */
const FADE_MS = 1100;

export function DoorsPage({ onBack, onDoorSelect, authSlot }: { onBack: () => void; onDoorSelect: (feature: DoorFeature) => void; authSlot?: ReactNode }) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeARef = useRef(true);
  const lockRef = useRef(false);
  const [activeA, setActiveA] = useState(true);
  const [fadeMs, setFadeMs] = useState(FADE_MS);

  useEffect(() => {
    aRef.current?.play().catch(() => {});
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Hand off to the other clip. The main loop (A) switches right at its final
  // frame with a near-instant cut, so the transition clip's first frame — which
  // matches the main's end frame — lines up seamlessly. The transition clip (B)
  // crossfades gently back into the main loop.
  const handleTime = (isA: boolean) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isA !== activeARef.current || lockRef.current) return;
    const cur = e.currentTarget;
    if (!isFinite(cur.duration)) return;

    const lead = isA ? 0.04 : FADE_MS / 1000; // main: a hair before its end frame
    const fade = isA ? 120 : FADE_MS; // main→transition: quick cut on matching frames

    if (cur.duration - cur.currentTime <= lead) {
      lockRef.current = true;
      setFadeMs(fade);
      const incoming = isA ? bRef.current : aRef.current;
      if (incoming) {
        incoming.currentTime = 0;
        incoming.play().catch(() => {});
      }
      activeARef.current = !isA;
      setActiveA(!isA);
      timeoutRef.current = setTimeout(() => {
        lockRef.current = false;
      }, fade + 150);
    }
  };

  const layer = "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out";
  const fadeStyle = { transitionDuration: `${fadeMs}ms` };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#efe9da] text-[#2b2b2b]">
      {/* Main doors loop and the transition clip alternate, crossfading into
          each other: doors → transition → doors → transition … */}
      <video
        ref={aRef}
        src={doorsVideo}
        className={`${layer} ${activeA ? "opacity-100" : "opacity-0"}`}
        style={fadeStyle}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTime(true)}
      />
      <video
        ref={bRef}
        src={transitionVideo}
        className={`${layer} ${activeA ? "opacity-0" : "opacity-100"}`}
        style={fadeStyle}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTime(false)}
      />

      {/* Readability wash + vignette to match the landing */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#efe9da]/90 via-transparent to-[#efe9da]/40" />
      <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(43,43,43,0.18)]" />

      {/* Chrome */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1320px] flex-col px-6 py-6 lg:px-12">
        <header className="flex items-center justify-between">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/70 px-4 py-2 shadow-[3px_3px_0_0_rgba(43,43,43,0.4)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px" }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </motion.button>

<div className="flex items-center gap-3"><span
            className="rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/70 px-3 py-1 uppercase tracking-[0.22em]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px" }}
          >
            The Arena
          </span>{authSlot}</div>
        </header>

        <div className="pointer-events-none absolute inset-0 z-20">
          <DoorHotspot feature="teams" label="Teams" className="left-[24%] top-[54%] h-[48%] w-[20%]" onDoorSelect={onDoorSelect} />
          <DoorHotspot feature="matches" label="Matches" className="left-[50%] top-[52%] h-[52%] w-[22%]" onDoorSelect={onDoorSelect} />
          <DoorHotspot feature="training" label="Training" className="left-[76%] top-[54%] h-[48%] w-[20%]" onDoorSelect={onDoorSelect} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-end pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <h1
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 8vw, 104px)", lineHeight: 0.9, letterSpacing: "0.02em" }}
            >
              CHOOSE YOUR DOOR
            </h1>
            <p
              className="mt-1 rotate-[-1.5deg]"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "26px", lineHeight: 1.1 }}
            >
              three paths. one champion.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DoorHotspot({
  feature,
  label,
  className,
  onDoorSelect,
}: {
  feature: DoorFeature;
  label: string;
  className: string;
  onDoorSelect: (feature: DoorFeature) => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`Open ${label} door`}
      onClick={() => onDoorSelect(feature)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`pointer-events-auto group absolute -translate-x-1/2 -translate-y-1/2 rounded-[32%] focus:outline-none ${className}`}
    >
      <span className="absolute inset-0 rounded-[32%] border-2 border-[#2b2b2b] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <span
        className="absolute left-1/2 top-[86%] -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#2b2b2b] bg-[#f3eee1]/95 px-4 py-1 opacity-0 shadow-[3px_3px_0_rgba(43,43,43,0.28)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ fontFamily: "'Caveat', cursive", fontSize: "22px" }}
      >
        enter {label}
      </span>
    </motion.button>
  );
}
