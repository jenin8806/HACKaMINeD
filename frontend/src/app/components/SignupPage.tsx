import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulsePhase: number;
}

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isAuthenticated } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    const N = 50;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.35 + 0.15,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const MAX_DIST = 130;
    const MOUSE_RADIUS = 180;
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
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.07;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(199, 247, 17, ${alpha})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const pulse = Math.sin(time * 1.8 + p.pulsePhase) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199, 247, 17, ${p.alpha})`;
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

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strengthPercent = (passwordStrength / PASSWORD_RULES.length) * 100;
  const strengthColor =
    strengthPercent <= 25
      ? "#ef4444"
      : strengthPercent <= 50
        ? "#f59e0b"
        : strengthPercent <= 75
          ? "#C7F711"
          : "#22c55e";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength < PASSWORD_RULES.length) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    const result = await signup(username, email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Signup failed.");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-12"
      style={{ background: "linear-gradient(135deg, #0E1921 0%, #0D1C1A 70%, #1a2e18 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(14,25,33,0.85) 100%)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <motion.h1
            className="text-3xl font-bold tracking-[0.3em] text-[#E8E9E8] font-orbitron inline-block"
            whileHover={{ textShadow: "0 0 20px rgba(199,247,17,0.4)" }}
          >
            THEVBOX
          </motion.h1>
        </Link>

        {/* Card */}
        <div className="bg-[#0A1520]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-semibold text-[#E8E9E8]">Create your account</h2>
            <p className="text-sm text-[#E8E9E8]/50 mt-1">Start turning stories into binge-worthy episodes</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                autoComplete="username"
                className="w-full h-11 px-4 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-11 px-4 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8E9E8]/40 hover:text-[#E8E9E8] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-2"
                >
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: strengthColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {PASSWORD_RULES.map((rule) => (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[10px] transition-colors ${
                          rule.test(password) ? "text-[#C7F711]" : "text-[#E8E9E8]/30"
                        }`}
                      >
                        <Check className="w-3 h-3 flex-shrink-0" />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className={`w-full h-11 px-4 pr-11 rounded-xl bg-[#1A262E] border text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/50"
                      : confirmPassword && confirmPassword === password
                        ? "border-[#C7F711]/50"
                        : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8E9E8]/40 hover:text-[#E8E9E8] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`mt-0.5 w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${
                  agreedToTerms
                    ? "bg-[#C7F711] border-[#C7F711]"
                    : "border-white/20 hover:border-[#C7F711]/50"
                }`}
              >
                {agreedToTerms && (
                  <svg className="w-3 h-3 text-[#0E1921]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-[#E8E9E8]/50 group-hover:text-[#E8E9E8]/70 transition-colors leading-relaxed select-none">
                I agree to the{" "}
                <button type="button" className="text-[#C7F711]/70 hover:text-[#C7F711] transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-[#C7F711]/70 hover:text-[#C7F711] transition-colors">
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="relative w-full h-11 rounded-xl font-semibold text-sm text-[#0E1921] overflow-hidden group disabled:opacity-70"
              style={{
                background: "#C7F711",
                boxShadow: "0 4px 14px rgba(199, 247, 17, 0.12)",
              }}
              whileHover={{
                boxShadow: "0 6px 20px rgba(199, 247, 17, 0.18)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#A9F42C]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.25 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0E1921]/30 border-t-[#0E1921] rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0A1520] text-[#E8E9E8]/30">or sign up with</span>
              </div>
            </div>

            {/* Social Signup — Google only */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={async () => {
                  const result = await loginWithGoogle();
                  if (!result.success) setError(result.error || "Google sign-up failed.");
                }}
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 bg-[#1A262E]/50 text-sm text-[#E8E9E8]/70 hover:bg-[#1A262E] hover:text-[#E8E9E8] hover:border-white/20 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-white/5 bg-[#070f18]/50 text-center">
            <p className="text-sm text-[#E8E9E8]/40">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C7F711] hover:text-[#A9F42C] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-[#E8E9E8]/30 hover:text-[#E8E9E8]/60 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
