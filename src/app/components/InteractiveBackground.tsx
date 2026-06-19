import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
// Interactive line-art scene: looping background + clickable football & portal.

import bgVideo from "../../imports/Line-art_background_animation_st__202606140228.mp4";
import jugglingA from "../../imports/Stickman_juggling_and_kicking_so__202606140242.mp4";
import jugglingB from "../../imports/Stickman_juggling_and_kicking_so__202606140243.mp4";
import portalVideo from "../../imports/Stickman_pulled_into_portal_202606140256.mp4";

type Mode = "idle" | "juggle" | "portal";
type Variant = "a" | "b";

export function InteractiveBackground({ onPortalEnd }: { onPortalEnd?: () => void }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [variant, setVariant] = useState<Variant>("a");

  const jugglingSrc = variant === "a" ? jugglingA : jugglingB;

  // Fire the page handoff once, a hair before the portal clip's final frame.
  const portalFiredRef = useRef(false);
  const handlePortalEnd = () => {
    if (portalFiredRef.current) return;
    portalFiredRef.current = true;
    onPortalEnd?.();
    setMode("idle");
  };

  const handlePortalTime = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    // Hand off ~0.3s early so we never sit on a frozen last frame.
    if (isFinite(v.duration) && v.duration - v.currentTime <= 0.3) {
      handlePortalEnd();
    }
  };

  const kickBall = () => {
    if (mode === "juggle") {
      // Back-to-back click on the ball always switches to the other animation.
      setVariant((v) => (v === "a" ? "b" : "a"));
    } else {
      // Fresh kick: pick one of the two at random.
      setVariant(Math.random() < 0.5 ? "a" : "b");
      setMode("juggle");
    }
  };

  const enterPortal = () => {
    portalFiredRef.current = false;
    setMode("portal");
  };
  const returnToLoop = () => setMode("idle");

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Looping ambient line-art animation (default state) — seamless crossfade loop */}
      <SeamlessLoopVideo src={bgVideo} className="absolute inset-0 h-full w-full object-cover" />

      {/* Triggered animations crossfade over the loop */}
      <AnimatePresence>
        {mode !== "idle" && (
          <motion.video
            key={mode === "juggle" ? jugglingSrc : portalVideo}
            src={mode === "juggle" ? jugglingSrc : portalVideo}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            loop={mode === "juggle"}
            onTimeUpdate={mode === "portal" ? handlePortalTime : undefined}
            onEnded={mode === "portal" ? handlePortalEnd : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Click-anywhere-to-return layer while the juggle animation loops */}
      {mode === "juggle" && (
        <button
          type="button"
          aria-label="Return to the looping scene"
          onClick={returnToLoop}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      {/* Clickable football */}
      <Hotspot
        onClick={kickBall}
        label={mode === "juggle" ? "tap to switch trick" : "kick the ball ⚽"}
        className="left-[40.5%] top-[89%] h-[20%] w-[11%]"
        round
      />

      {/* Clickable portal — only while looping */}
      {mode === "idle" && (
        <Hotspot
          onClick={enterPortal}
          label="enter the portal 🌀"
          className="left-[76%] top-[42%] h-[32%] w-[17%]"
          round
        />
      )}

      {/* Hint shown while the juggle animation loops */}
      <AnimatePresence>
        {mode === "juggle" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border-2 border-[#2b2b2b] bg-[#f3eee1]/90 px-4 py-1"
            style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
          >
            tap the ball to switch · tap anywhere to stop
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Plays a video on a seamless loop by crossfading between two stacked copies.
 * Native `loop` re-seeks the single element to frame 0, dropping a frame and
 * briefly revealing the page background — this avoids that by fading in a
 * fresh-from-start copy just before the playing one ends.
 */
function SeamlessLoopVideo({ src, className = "" }: { src: string; className?: string }) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const [activeA, setActiveA] = useState(true);
  const activeARef = useRef(true);
  const lockRef = useRef(false);
  const FADE = 0.7; // seconds of overlap

  useEffect(() => {
    aRef.current?.play().catch(() => {});
  }, []);

  const handleTime = (isA: boolean) => () => {
    if (isA !== activeARef.current || lockRef.current) return;
    const cur = isA ? aRef.current : bRef.current;
    const other = isA ? bRef.current : aRef.current;
    if (!cur || !other || !isFinite(cur.duration)) return;

    if (cur.duration - cur.currentTime <= FADE) {
      lockRef.current = true;
      other.currentTime = 0;
      other.play().catch(() => {});
      activeARef.current = !isA;
      setActiveA(!isA);
      // Allow the next cycle to trigger once the crossfade has settled.
      window.setTimeout(() => {
        lockRef.current = false;
      }, FADE * 1000 + 120);
    }
  };

  const base = `${className} transition-opacity ease-linear`;
  const style = { transitionDuration: `${FADE * 1000}ms` };

  return (
    <>
      <video
        ref={aRef}
        src={src}
        className={`${base} ${activeA ? "opacity-100" : "opacity-0"}`}
        style={style}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTime(true)}
      />
      <video
        ref={bRef}
        src={src}
        className={`${base} ${activeA ? "opacity-0" : "opacity-100"}`}
        style={style}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTime(false)}
      />
    </>
  );
}

function Hotspot({
  onClick,
  label,
  className,
  round,
}: {
  onClick: () => void;
  label: string;
  className?: string;
  round?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const radius = round ? "rounded-full" : "rounded-[40%]";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none ${className ?? ""}`}
    >
      <span
        className={`absolute inset-0 ${radius} border-2 border-[#2b2b2b] transition-opacity duration-300 ${
          hover ? "opacity-100" : "opacity-0"
        } group-focus-visible:opacity-100`}
      />

      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#2b2b2b] bg-[#f3eee1] px-3 py-1"
            style={{ fontFamily: "'Caveat', cursive", fontSize: "18px" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
