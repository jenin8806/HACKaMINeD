import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import CountUp from "./ui/CountUp";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulsePhase: number;
}

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const N = 110;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.8,
      alpha: Math.random() * 0.45 + 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const MAX_DIST = 150;
    const MOUSE_RADIUS = 200;
    let time = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.09;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += (Math.random() - 0.5) * 0.015;
        p.vy += (Math.random() - 0.5) * 0.015;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.5) {
          p.vx = (p.vx / speed) * 2.5;
          p.vy = (p.vy / speed) * 2.5;
        }
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const baseAlpha = (1 - dist / MAX_DIST) * 0.32;
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mdx = midX - mx;
            const mdy = midY - my;
            const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const glowBoost = mouseDist < MOUSE_RADIUS ? (1 - mouseDist / MOUSE_RADIUS) * 0.4 : 0;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(199, 247, 17, ${baseAlpha + glowBoost})`;
            ctx.lineWidth = 0.5 + glowBoost * 1.2;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const pulse = Math.sin(time * 1.8 + p.pulsePhase) * 0.15 + 0.85;
        const pdx = p.x - mx;
        const pdy = p.y - my;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
        const nearMouse = pDist < MOUSE_RADIUS;
        const proximity = nearMouse ? 1 - pDist / MOUSE_RADIUS : 0;

        const drawSize = p.size * pulse * (1 + proximity * 0.8);
        const drawAlpha = Math.min(p.alpha * (1 + proximity * 0.6), 0.95);

        if (nearMouse && proximity > 0.2) {
          ctx.shadowColor = "#C7F711";
          ctx.shadowBlur = 8 + proximity * 12;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199, 247, 17, ${drawAlpha})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (mx > 0 && my > 0) {
        const aura = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 0.7);
        aura.addColorStop(0, "rgba(199, 247, 17, 0.05)");
        aura.addColorStop(1, "rgba(199, 247, 17, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mx, my, MOUSE_RADIUS * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0E1921 0%, #0D1C1A 70%, #1a2e18 100%)" }}
    >
      {/* Fast interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radial vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(14,25,33,0.8) 100%)",
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">

        {/* Headline */}
        <motion.h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-[#E8E9E8] block"
          style={{
            marginTop:180
          }}>Turn Stories Into</span>
          <span
            className="block text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #C7F711 0%, #A9F42C 50%, #8CB535 100%)",
            }}
          >
            Binge-Worthy Episodes
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-xl md:text-2xl text-[#E8E9E8]/60 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          AI-powered episodic intelligence with adaptive cliffhanger scoring and creative
          optimization.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/signup">
            <motion.button
              className="relative px-10 py-4 rounded-xl font-semibold text-lg text-[#0E1921] overflow-hidden group"
              style={{
                background: "#C7F711",
                boxShadow: "0 4px 16px rgba(199, 247, 17, 0.12)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 6px 24px rgba(199, 247, 17, 0.20)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#A9F42C]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.25 }}
              />
              <span className="relative z-10">Get Started</span>
            </motion.button>
          </Link>

          <motion.a
            href="#how-it-works"
            className="px-10 py-4 border-2 border-[#C7F711]/50 text-[#C7F711] rounded-xl font-semibold text-lg backdrop-blur-sm hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            How It Works
          </motion.a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="mt-20 flex flex-col sm:flex-row gap-8 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { num: 10, suffix: "K+", label: "Scripts Analyzed" },
            { num: 94, suffix: "%", label: "Avg. Retention Score" },
            { num: 5, suffix: "x", label: "Faster Breakdown" },
          ].map((stat, i) => (
            <div key={i} className="text-center px-6">
              <div
                className="text-4xl font-bold text-[#C7F711] font-orbitron flex items-center justify-center"
                style={{ textShadow: "0 0 20px rgba(199, 247, 17, 0.5)" }}
              >
                <CountUp from={0} to={stat.num} duration={2} />
                <span>{stat.suffix}</span>
              </div>
              <div className="text-sm text-[#E8E9E8]/50 mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xs text-[#E8E9E8]/30 tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#C7F711]/50 to-transparent" />
      </motion.div>
    </section>
  );
}
