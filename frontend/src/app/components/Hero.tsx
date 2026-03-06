import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import CountUp from "./ui/CountUp";

const TOTAL_FRAMES = 111;

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let frameIndex = 0;
    let lastTime = 0;
    const FPS = 24;
    const INTERVAL = 1000 / FPS;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const frames: HTMLImageElement[] = [];
    let loaded = 0;
    let ready = false;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const idx = String(i).padStart(3, "0");
      img.src = `/frames/frame-${idx}.png`;
      img.onload = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) ready = true;
      };
      frames.push(img);
    }

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (!ready) return;
      if (now - lastTime < INTERVAL) return;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const img = frames[frameIndex];
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(w / iw, h / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#010305" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: "hue-rotate(88deg) saturate(1.4) brightness(0.82)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(1,3,5,0.45) 0%, rgba(1,3,5,0.25) 40%, rgba(1,3,5,0.72) 85%, rgba(1,3,5,0.97) 100%)",
        }}
      />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-4">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C7F711]/30 bg-[#010305]/50 backdrop-blur-sm mb-7"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7F711] animate-pulse" />
          <span className="text-[10px] tracking-[0.26em] text-[#C7F711]/80 uppercase font-medium">
            AI&nbsp;·&nbsp;Scripts&nbsp;·&nbsp;Episodes
          </span>
        </motion.div>
        <motion.h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          <span className="text-[#E8E9E8] block" style={{ textShadow: "0 2px 30px rgba(1,3,5,0.9)" }}>
            Turn Stories Into
          </span>
          <span
            className="block text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #C7F711 0%, #A9F42C 55%, #8CB535 100%)",
              filter: "drop-shadow(0 0 22px rgba(199,247,17,0.55))",
            }}
          >
            Binge-Worthy Episodes
          </span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-[#E8E9E8]/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ textShadow: "0 1px 18px rgba(1,3,5,0.8)" }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          AI-powered episodic intelligence with adaptive cliffhanger scoring and creative optimization.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
        >
          <Link to="/signup">
            <motion.button
              className="relative px-10 py-4 rounded-xl font-semibold text-lg text-[#0E1921] overflow-hidden"
              style={{ background: "#C7F711", boxShadow: "0 4px 28px rgba(199,247,17,0.30)" }}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 36px rgba(199,247,17,0.45)" }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#A9F42C]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.22 }}
              />
              <span className="relative z-10">Get Started Free</span>
            </motion.button>
          </Link>
          <motion.a
            href="#how-it-works"
            className="px-10 py-4 border-2 border-[#C7F711]/45 text-[#C7F711] rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            How It Works
          </motion.a>
        </motion.div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5 pb-10 px-6">
        <motion.div
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            className="flex flex-col items-center gap-1.5"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[10px] text-[#E8E9E8]/35 tracking-[0.24em] uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#C7F711]/50 to-transparent" />
          </motion.div>
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          {[
            { num: 10, suffix: "K+", label: "Scripts Analyzed" },
            { num: 94, suffix: "%", label: "Avg. Retention Score" },
            { num: 5, suffix: "x", label: "Faster Breakdown" },
          ].map((stat, i) => (
            <div key={i} className="text-center px-6">
              <div
                className="text-4xl font-bold text-[#C7F711] font-orbitron flex items-center justify-center"
                style={{ textShadow: "0 0 22px rgba(199,247,17,0.55)" }}
              >
                <CountUp from={0} to={stat.num} duration={2} />
                <span>{stat.suffix}</span>
              </div>
              <div className="text-sm text-[#E8E9E8]/45 mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
