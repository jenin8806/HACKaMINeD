
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TARGET  = "THEVBOX";
const GLYPHS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%?!><[]{}|~^";

const START_MS = 420;   // delay before first char resolves
const CHAR_MS  = 330;   // ms between each character locking in
const LOAD_MS  = 2500;  // ms to fill the progress bar
const ZOOM_MS  = 1700;  // ms for zoom + fade before onComplete

// Total ≈ 420 + 7×330 + 250 + 2500 + 350 + 1700 = ~7530ms

function rnd(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TheVboxLoader({ onComplete }: { onComplete?: () => void }) {
  const [phase,    setPhase]    = useState<"scramble" | "loading" | "zoom" | "done">("scramble");
  const [chars,    setChars]    = useState<string[]>(() => Array.from({ length: TARGET.length }, rnd));
  const [lockIdx,  setLockIdx]  = useState(-1);
  const [progress, setProgress] = useState(0);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  // Lock body scroll for duration of loader
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Phase: scramble — cycle random glyphs, resolve each char left-to-right ──
  useEffect(() => {
    if (phase !== "scramble") return;
    let currentLock = -1;

    const scramIt = setInterval(() => {
      setChars(prev => prev.map((c, i) => (i <= currentLock ? TARGET[i] : rnd())));
    }, 48);

    const lockTimers: ReturnType<typeof setTimeout>[] = TARGET.split("").map((_, i) =>
      setTimeout(() => {
        currentLock = i;
        setLockIdx(i);
      }, START_MS + i * CHAR_MS)
    );

    const advanceTimer = setTimeout(() => {
      clearInterval(scramIt);
      setChars(TARGET.split(""));
      setLockIdx(TARGET.length - 1);
      setPhase("loading");
    }, START_MS + TARGET.length * CHAR_MS + 250);

    return () => {
      clearInterval(scramIt);
      lockTimers.forEach(clearTimeout);
      clearTimeout(advanceTimer);
    };
  }, [phase]);

  // ── Phase: loading — rAF-driven progress bar 0 → 1 ───────────────────────
  useEffect(() => {
    if (phase !== "loading") return;
    let rafId: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / LOAD_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setPhase("zoom"), 350);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  // ── Phase: zoom → done ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "zoom") return;
    const t = setTimeout(() => {
      setPhase("done");
      cbRef.current?.();
    }, ZOOM_MS);
    return () => clearTimeout(t);
  }, [phase]);


  if (phase === "done") return null;

  const isZoom = phase === "zoom";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0E1921",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* ── Dot grid ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(199,247,17,0.055) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          pointerEvents: "none",
        }}
      />

      {/* ── Edge vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 66% at 50% 50%, transparent 26%, rgba(4,9,15,0.78) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── THEVBOX title — zoom target ── */}
      <motion.div
        animate={
          isZoom
            ? { scale: 15, opacity: 0 }
            : { scale: 1,  opacity: 1 }
        }
        transition={
          isZoom
            ? {
                scale:   { duration: 1.4, ease: [0.55, 0, 1, 1] as [number,number,number,number] },
                opacity: { duration: 1.4, ease: [0.12, 0, 0.5, 1] as [number,number,number,number] },
              }
            : { duration: 0.001 }
        }
        style={{
          display: "flex",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(52px, 10vw, 88px)",
          lineHeight: 1,
        }}
      >
        {chars.map((ch, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              minWidth: "0.88em",
              textAlign: "center",
              color: i <= lockIdx ? "#C7F711" : "rgba(199,247,17,0.13)",
              textShadow:
                i <= lockIdx
                  ? "0 0 18px rgba(199,247,17,0.55), 0 0 44px rgba(199,247,17,0.22)"
                  : "none",
            }}
          >
            {ch}
          </span>
        ))}
      </motion.div>

      {/* ── Tagline ── */}
      {!isZoom && (
        <div
          style={{
            marginTop: 14,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "rgba(199,247,17,0.25)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          AI Story Engine
        </div>
      )}

      {/* ── Loading bar ── */}
      {phase === "loading" && (
        <div style={{ marginTop: 52, width: "min(300px, 68vw)" }}>
          {/* Track */}
          <div
            style={{
              width: "100%",
              height: 2,
              background: "rgba(255,255,255,0.055)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Fill */}
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background:
                  "linear-gradient(90deg, rgba(199,247,17,0.45) 0%, #C7F711 100%)",
                boxShadow: "0 0 10px rgba(199,247,17,0.38)",
                borderRadius: 2,
              }}
            />
          </div>

          {/* Labels */}
          <div
            style={{
              marginTop: 9,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "rgba(199,247,17,0.22)",
              fontFamily: "monospace",
            }}
          >
            <span>INITIALIZING</span>
            <span>{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

