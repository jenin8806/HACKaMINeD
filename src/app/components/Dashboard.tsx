import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Menu, X, FolderOpen, Brain, Plus, ArrowUp, PanelLeftClose, PanelLeft,
  Zap, Sparkles, LogOut, BarChart2, TrendingUp, Clock, Layers, FileText,
  Code2, SlidersHorizontal, MessageSquare, ArrowLeft, Activity, Users, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useUser } from "../contexts/UserContext";
import { UserSettingsDialog } from "./UserSettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type CanvasEpisode = {
  title: string;
  cliffhangerScore: number;
  pacingScore: number;
  duration: string;
  wordCount: number;
};

type CanvasData = {
  id: string;
  title: string;
  wordCount: number;
  episodeCount: number;
  overallScore: number;
  episodes: CanvasEpisode[];
  suggestions: string[];
};

type Message = {
  id: string;
  type: "user" | "ai";
  content: string;
  canvasId?: string;
};

type ChatSession = {
  id: string;
  name: string;
  messages: Message[];
  canvases: Record<string, CanvasData>;
  createdAt: number;
};

// ─── Episode data helpers ────────────────────────────────────────────────────

function genEmotionData(ep: CanvasEpisode, idx: number) {
  const base = (ep.cliffhangerScore + ep.pacingScore) / 2;
  const s = idx + 1;
  return [
    { time: "0:00",  intensity: parseFloat(Math.max(1, base * 0.55 + s * 0.1).toFixed(1)) },
    { time: "25%",   intensity: parseFloat(Math.max(1, base * 0.70 + s * 0.15).toFixed(1)) },
    { time: "50%",   intensity: parseFloat(Math.max(1, base * 0.85 + s * 0.1).toFixed(1)) },
    { time: "75%",   intensity: parseFloat(Math.min(10, base + s * 0.12).toFixed(1)) },
    { time: "90%",   intensity: parseFloat(Math.min(10, ep.cliffhangerScore * 0.96).toFixed(1)) },
    { time: "100%",  intensity: parseFloat(Math.min(10, ep.cliffhangerScore).toFixed(1)) },
  ];
}

function genEngagementData(ep: CanvasEpisode) {
  const base = 80 + ep.pacingScore * 1.4 + ep.cliffhangerScore * 0.6;
  return [
    { segment: "Opening",  retention: Math.min(99, Math.round(base * 0.97)) },
    { segment: "Hook",     retention: Math.min(99, Math.round(base * 1.0)) },
    { segment: "Dev.",     retention: Math.min(99, Math.round(base * 0.94)) },
    { segment: "Climax",   retention: Math.min(99, Math.round(base + 0.8)) },
    { segment: "Ending",   retention: Math.min(99, Math.round(base * 0.92)) },
  ];
}

// ─── Episode Detail In Panel ─────────────────────────────────────────────────

function EpisodeDetailInPanel({ ep, idx, onBack }: { ep: CanvasEpisode; idx: number; onBack: () => void }) {
  const emotionData = genEmotionData(ep, idx);
  const engagementData = genEngagementData(ep);

  const emotionalIntensity = Math.min(9.9, parseFloat((ep.cliffhangerScore * 0.65 + ep.pacingScore * 0.35).toFixed(1)));
  const audienceRetention = Math.min(99, Math.round(80 + (ep.cliffhangerScore + ep.pacingScore) * 0.85));

  const narrative = [
    { label: "Setup",         pct: Math.max(10, 22 + idx * 2),      color: "#C7F711" },
    { label: "Rising Action", pct: Math.max(10, 35 - idx),          color: "#7DD3FC" },
    { label: "Climax",        pct: Math.max(10, 20 + idx * 2),      color: "#F472B6" },
    { label: "Resolution",    pct: Math.max(10, 23 - idx * 3),      color: "#86EFAC" },
  ];

  const suggestions = [
    ep.cliffhangerScore < 8.5
      ? { title: "Boost the Cliffhanger", desc: "The ending hook can be sharpened. Try introducing an unresolved visual surprise or question in the final 60 seconds.", impact: "High" }
      : { title: "Cliffhanger is Excellent", desc: "Your ending hook scores very high. Maintain this momentum and consider teasing a future plot thread.", impact: "Keep" },
    ep.pacingScore < 8.5
      ? { title: "Tighten the Pacing", desc: "Some scenes feel stretched. Cutting 10–15% of mid-section dialogue could sharpen audience engagement.", impact: "Medium" }
      : { title: "Pacing is Solid", desc: "The episode flows naturally. Keep using scene transitions to preserve this rhythm across the series.", impact: "Keep" },
    { title: "Expand the Emotional Arc", desc: `Emotional intensity peaks at ${ep.cliffhangerScore}/10. Adding a quiet beat before the climax would amplify the contrast and impact.`, impact: "Medium" },
  ];

  return (
    <motion.div
      key={`ep-detail-${idx}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-[#E8E9E8]/40 hover:text-[#C7F711] transition-colors group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
        Back to episodes
      </button>

      {/* Episode Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C7F711]/10 border border-[#C7F711]/20 flex items-center justify-center text-sm font-bold text-[#C7F711] flex-shrink-0">
          {idx + 1}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#E8E9E8] leading-tight">{ep.title}</h3>
          <div className="flex items-center gap-2 text-[11px] text-[#E8E9E8]/35 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{ep.duration}</span>
            <span className="opacity-30">·</span>
            <span>{ep.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>

      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Cliffhanger", value: ep.cliffhangerScore, color: "#C7F711", icon: <Zap className="w-3.5 h-3.5" />, max: 10 },
          { label: "Pacing", value: ep.pacingScore, color: "#7DD3FC", icon: <TrendingUp className="w-3.5 h-3.5" />, max: 10 },
          { label: "Emotional Intensity", value: emotionalIntensity, color: "#F472B6", icon: <Activity className="w-3.5 h-3.5" />, max: 10 },
          { label: "Audience Retention", value: `${audienceRetention}%`, color: "#86EFAC", icon: <Users className="w-3.5 h-3.5" />, max: null },
        ].map((m) => (
          <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-1 mb-2" style={{ color: m.color }}>
              {m.icon}
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: m.color + "80" }}>{m.label}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
            {m.max && (
              <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((m.value as number) / m.max) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emotion Curve */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3">Emotion Curve</h4>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emotionData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id={`emGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C7F711" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C7F711" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} />
              <YAxis stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E1921",
                  border: "1px solid rgba(199,247,17,0.25)",
                  borderRadius: "10px",
                  fontSize: "11px",
                  color: "#E8E9E8",
                }}
                formatter={(v: number) => [v, "Intensity"]}
              />
              <Area type="monotone" dataKey="intensity" stroke="#C7F711" strokeWidth={2} fill={`url(#emGrad${idx})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Retention */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3">Segment Retention</h4>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="segment" stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} />
              <YAxis stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} domain={[78, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E1921",
                  border: "1px solid rgba(125,211,252,0.25)",
                  borderRadius: "10px",
                  fontSize: "11px",
                  color: "#E8E9E8",
                }}
                formatter={(v: number) => [`${v}%`, "Retention"]}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#7DD3FC"
                strokeWidth={2}
                dot={{ fill: "#7DD3FC", r: 4, stroke: "#0E1921", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative Breakdown */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3">Narrative Structure</h4>
        <div className="space-y-2.5">
          {narrative.map((n) => (
            <div key={n.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#E8E9E8]/50">{n.label}</span>
                <span className="text-[10px] font-mono text-[#E8E9E8]/30">{n.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${n.pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: n.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C7F711]" />
          AI Suggestions
        </h4>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="border border-white/[0.06] rounded-lg p-3 space-y-1.5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#E8E9E8]">{s.title}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    s.impact === "High"
                      ? "bg-[#C7F711]/10 text-[#C7F711]"
                      : s.impact === "Medium"
                      ? "bg-[#7DD3FC]/10 text-[#7DD3FC]"
                      : "bg-[#86EFAC]/10 text-[#86EFAC]"
                  }`}
                >
                  {s.impact}
                </span>
              </div>
              <p className="text-[11px] text-[#E8E9E8]/45 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, max = 10, color = "#C7F711" }: { score: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-[#E8E9E8]/40 w-7 text-right">{score}</span>
    </div>
  );
}

// ─── Canvas Panel ─────────────────────────────────────────────────────────────

function CanvasPanel({
  canvas,
  onClose,
  allCanvases,
  onSelectCanvas,
}: {
  canvas: CanvasData;
  onClose: () => void;
  allCanvases: CanvasData[];
  onSelectCanvas: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "export">("overview");
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-[360px] lg:w-[440px] xl:w-[490px] flex-shrink-0 border-l border-white/5 bg-[#070E15] flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="w-6 h-6 rounded-md bg-[#C7F711]/10 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-3.5 h-3.5 text-[#C7F711]" />
        </div>
        <span className="text-sm font-semibold text-[#E8E9E8] flex-1 truncate">{canvas.title}</span>
        {allCanvases.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#E8E9E8]/40 hover:text-[#E8E9E8] hover:bg-white/5 border border-white/5 transition-colors">
                <Layers className="w-3 h-3" />
                <span>{allCanvases.length}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0E1921] border border-white/10 text-[#E8E9E8] w-52" align="end">
              <DropdownMenuLabel className="text-[10px] text-[#E8E9E8]/40 uppercase tracking-wider">Canvas History</DropdownMenuLabel>
              {allCanvases.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onSelectCanvas(c.id)}
                  className={`text-xs cursor-pointer hover:bg-white/5 focus:bg-[#C7F711]/10 ${c.id === canvas.id ? "text-[#C7F711] focus:text-[#C7F711]" : "focus:text-[#E8E9E8]"}`}
                >
                  {c.id === canvas.id && <span className="mr-1">✦</span>}
                  {c.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#E8E9E8]/30 hover:text-[#E8E9E8] hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-1 flex-shrink-0">
        {(["overview", "episodes", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-[#C7F711]/10 text-[#C7F711] border border-[#C7F711]/20"
                : "text-[#E8E9E8]/40 hover:text-[#E8E9E8] hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Episodes", value: String(canvas.episodeCount), icon: <Layers className="w-3.5 h-3.5" /> },
                  { label: "Words", value: canvas.wordCount.toLocaleString(), icon: <FileText className="w-3.5 h-3.5" /> },
                  { label: "Score", value: `${canvas.overallScore}/10`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-white/10 transition-colors">
                    <div className="text-[#C7F711]/50 mb-2">{stat.icon}</div>
                    <div className="text-base font-semibold text-[#E8E9E8] leading-none mb-1">{stat.value}</div>
                    <div className="text-[10px] text-[#E8E9E8]/30 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-4">Cliffhanger Scores</h4>
                <div className="flex items-end gap-2" style={{ height: "72px" }}>
                  {canvas.episodes.map((ep, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="relative w-full flex flex-col justify-end" style={{ height: "56px" }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(ep.cliffhangerScore / 10) * 56}px` }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                          className="w-full rounded-t-md"
                          style={{ background: "linear-gradient(to top, #C7F711cc, #C7F71144)", minHeight: "4px" }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-[#E8E9E8]/30">{ep.cliffhangerScore}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  {canvas.episodes.map((_, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] text-[#E8E9E8]/20">Ep {i + 1}</div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3">Optimization Suggestions</h4>
                <div className="space-y-2.5">
                  {canvas.suggestions.map((sug, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#C7F711]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-[#C7F711]">{i + 1}</span>
                      </div>
                      <p className="text-sm text-[#E8E9E8]/60 leading-snug">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "episodes" && (
            <motion.div key="episodes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnimatePresence mode="wait">
                {selectedEpisodeIdx !== null && canvas.episodes[selectedEpisodeIdx] ? (
                  <EpisodeDetailInPanel
                    key={`detail-${selectedEpisodeIdx}`}
                    ep={canvas.episodes[selectedEpisodeIdx]}
                    idx={selectedEpisodeIdx}
                    onBack={() => setSelectedEpisodeIdx(null)}
                  />
                ) : (
                  <motion.div
                    key="ep-list"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3"
                  >
                    {canvas.episodes.map((ep, i) => (
                      <button
                        key={ep.title}
                        onClick={() => setSelectedEpisodeIdx(i)}
                        className="w-full text-left bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3 hover:border-[#C7F711]/25 hover:bg-[#C7F711]/[0.03] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-[#C7F711]/10 flex items-center justify-center text-[10px] font-bold text-[#C7F711]">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium text-[#E8E9E8]">{ep.title}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#E8E9E8]/30">
                            <Clock className="w-3 h-3" />
                            <span>{ep.duration}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[11px] text-[#E8E9E8]/35 mb-1">Cliffhanger</p>
                            <ScoreBar score={ep.cliffhangerScore} color="#C7F711" />
                          </div>
                          <div>
                            <p className="text-[11px] text-[#E8E9E8]/35 mb-1">Pacing</p>
                            <ScoreBar score={ep.pacingScore} color="#7DD3FC" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <p className="text-[11px] text-[#E8E9E8]/25">{ep.wordCount.toLocaleString()} words</p>
                          <div className="flex items-center gap-1 text-[10px] text-[#C7F711]/40 group-hover:text-[#C7F711]/70 transition-colors">
                            <span>View details</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "export" && (
            <motion.div key="export" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-[#040B11] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <Code2 className="w-3.5 h-3.5 text-[#C7F711]" />
                  <span className="text-xs text-[#E8E9E8]/40">analysis.json</span>
                </div>
                <pre className="p-4 font-mono text-xs text-[#E8E9E8]/60 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      title: canvas.title,
                      wordCount: canvas.wordCount,
                      episodeCount: canvas.episodeCount,
                      overallScore: canvas.overallScore,
                      episodes: canvas.episodes,
                      suggestions: canvas.suggestions,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [scriptText, setScriptText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [canvases, setCanvases] = useState<Record<string, CanvasData>>({});
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop && sidebarOpen) setSidebarOpen(false);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [scriptText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const handleAnalyze = () => {
    if (!scriptText.trim()) return;

    if (messages.length === 0) {
      setSessionName(scriptText.trim().slice(0, 42));
    }

    const userMsg: Message = { id: `msg-${Date.now()}`, type: "user", content: scriptText };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);
    setScriptText("");

    setTimeout(() => {
      const canvasId = `canvas-${Date.now()}`;
      const wc = 1100 + Math.floor(Math.random() * 400);
      const canvas: CanvasData = {
        id: canvasId,
        title: "Script Analysis",
        wordCount: wc,
        episodeCount: 3,
        overallScore: 8.5,
        episodes: [
          { title: "The Setup", cliffhangerScore: 8.5, pacingScore: 7.8, duration: "~10 min", wordCount: Math.round(wc * 0.31) },
          { title: "Rising Action", cliffhangerScore: 9.2, pacingScore: 8.9, duration: "~12 min", wordCount: Math.round(wc * 0.37) },
          { title: "Resolution", cliffhangerScore: 7.8, pacingScore: 8.2, duration: "~11 min", wordCount: Math.round(wc * 0.32) },
        ],
        suggestions: [
          "Strengthen the opening hook in Episode 1 to grab viewers in the first 60 seconds.",
          "Consider splitting Episode 2 — the pacing plateau at the mid-point softens tension.",
          "Add a post-credits scene to Episode 3 to seed storylines for a future season.",
        ],
      };

      setCanvases((prev) => ({ ...prev, [canvasId]: canvas }));
      setActiveCanvasId(canvasId);

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        type: "ai",
        content: `I've analyzed your script! Here's what I found:\n\n**Overall Score: 8.5 / 10**\nYour script demonstrates strong narrative structure across ${canvas.episodeCount} episodes (${canvas.wordCount.toLocaleString()} words total).\n\n**Episode Breakdown**\n• "The Setup" — Cliffhanger 8.5/10 · ~10 min\n• "Rising Action" — Cliffhanger 9.2/10 · ~12 min\n• "Resolution" — Cliffhanger 7.8/10 · ~11 min\n\n**Key Insight:** Episode 2 carries your strongest emotional peak — ideal for mid-season engagement. Open the canvas panel for detailed score breakdowns, a visual chart, and export options.`,
        canvasId,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScriptText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const activeCanvas = activeCanvasId ? canvases[activeCanvasId] : null;
  const canvasList = Object.values(canvases);

  return (
    <div className="absolute inset-0 bg-[#0E1921] flex overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            className="fixed inset-0 bg-[#0E1921]/80 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${isDesktop ? "relative" : "fixed"} z-40 w-[260px] h-full flex-shrink-0 border-r border-white/5 bg-[#091015]`}
          >
            {isDesktop && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-[#1A262E] border border-white/10 rounded-r-xl flex items-center justify-center text-[#E8E9E8]/40 hover:text-[#C7F711] hover:border-[#C7F711]/40 transition-colors z-50 shadow-md"
              >
                <PanelLeftClose className="w-4 h-4 ml-1" />
              </button>
            )}

            <div className="flex flex-col h-full">
              {/* Branding */}
              <div className="p-4 flex items-center justify-between">
                <Link to="/" className="flex-1">
                  <h1 className="text-lg font-bold tracking-[0.2em] text-[#E8E9E8] font-orbitron hover:text-[#C7F711] transition-colors">
                    THEVBOX
                  </h1>
                </Link>
                {!isDesktop && (
                  <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2 text-[#E8E9E8]/50 hover:text-[#E8E9E8]">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* New Chat */}
              <div className="px-3 py-2">
                <button
                  onClick={() => {
                    if (messages.length > 0) {
                      const name = sessionName || messages[0].content.slice(0, 42);
                      setChatHistory(prev => {
                        const idx = prev.findIndex(s => s.id === sessionId);
                        const snap: ChatSession = { id: sessionId, name, messages, canvases, createdAt: Date.now() };
                        if (idx >= 0) { const u = [...prev]; u[idx] = snap; return u; }
                        return [snap, ...prev];
                      });
                    }
                    setSessionId(`session-${Date.now()}`);
                    setSessionName(null);
                    setMessages([]);
                    setScriptText("");
                    setActiveCanvasId(null);
                    setCanvases({});
                    if (!isDesktop) setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#E8E9E8] hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="p-1 rounded-md bg-[#C7F711]/10 text-[#C7F711] group-hover:bg-[#C7F711] group-hover:text-[#0E1921] transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">New Chat</span>
                </button>
              </div>

              {/* Workspace */}
              <div className="px-3 pt-5 pb-2">
                <h3 className="px-3 text-[10px] font-semibold text-[#E8E9E8]/30 uppercase tracking-wider mb-2">Workspace</h3>
                <nav className="space-y-0.5">
                  <Link
                    to="/projects"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#E8E9E8]/55 hover:bg-white/5 hover:text-[#E8E9E8] transition-all group"
                  >
                    <FolderOpen className="w-4 h-4 text-[#E8E9E8]/30 group-hover:text-[#C7F711] transition-colors" />
                    <span className="text-sm">My Projects</span>
                  </Link>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#E8E9E8]/55 hover:bg-white/5 hover:text-[#E8E9E8] transition-all group">
                    <Brain className="w-4 h-4 text-[#E8E9E8]/30 group-hover:text-[#C7F711] transition-colors" />
                    <span className="text-sm">Memory</span>
                  </button>
                </nav>
              </div>

              {/* Recent Chats */}
              {chatHistory.length > 0 && (
                <div className="px-3 pt-4 pb-2 flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <h3 className="px-3 text-[10px] font-semibold text-[#E8E9E8]/25 uppercase tracking-wider mb-2">Recent</h3>
                  <div className="space-y-0.5">
                    {chatHistory.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          if (messages.length > 0) {
                            const name = sessionName || messages[0].content.slice(0, 42);
                            setChatHistory(prev => {
                              const idx = prev.findIndex(s => s.id === sessionId);
                              const cur: ChatSession = { id: sessionId, name, messages, canvases, createdAt: Date.now() };
                              if (idx >= 0) { const u = [...prev]; u[idx] = cur; return u; }
                              return [cur, ...prev];
                            });
                          }
                          setSessionId(session.id);
                          setSessionName(session.name);
                          setMessages(session.messages);
                          setCanvases(session.canvases);
                          setActiveCanvasId(null);
                          if (!isDesktop) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs border ${
                          session.id === sessionId
                            ? "bg-white/[0.06] text-[#E8E9E8]/75 border-white/[0.07]"
                            : "text-[#E8E9E8]/30 hover:bg-white/[0.04] hover:text-[#E8E9E8]/55 border-transparent"
                        }`}
                      >
                        <MessageSquare className="w-3 h-3 flex-shrink-0 opacity-40" />
                        <span className="truncate text-left">{session.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Account */}
              <div className="p-3 mt-auto mb-2 mx-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-2 rounded-xl text-[#E8E9E8]/80 hover:bg-white/5 transition-all">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#0E1921] font-bold text-sm overflow-hidden flex-shrink-0">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#C7F711] to-[#A9F42C] flex items-center justify-center">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-medium text-[#E8E9E8] truncate">{user.username}</span>
                        <span className="text-xs text-[#E8E9E8]/40 truncate">{user.plan}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#0E1921] border border-[#C7F711]/15 text-[#E8E9E8] ml-2 mb-2" align="start" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{user.username}</p>
                        <p className="text-xs leading-none text-[#E8E9E8]/50 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-[#C7F711]/10 focus:text-[#C7F711]" onClick={() => setSettingsOpen(true)}>
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-400" onClick={() => navigate("/")}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Main content: chat column + canvas panel side by side */}
      <div className="flex-1 flex min-w-0 h-full">
        {/* ── Chat Column ── */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Open sidebar button */}
          {!sidebarOpen && (
            <div className="absolute top-4 left-4 z-20">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-[#E8E9E8]/50 hover:text-[#E8E9E8] hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                {isDesktop ? <PanelLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.1] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.18]">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-44 min-h-full flex flex-col">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="my-auto flex flex-col items-center justify-center pb-16 w-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C7F711]/10 flex items-center justify-center mb-5">
                    <Sparkles className="w-5 h-5 text-[#C7F711]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#E8E9E8] mb-2 tracking-tight">
                    Welcome back, {user.username}
                  </h2>
                  <p className="text-[#E8E9E8]/40 text-sm mb-8 max-w-sm text-center leading-relaxed">
                    Drop your script or upload a file to analyze narrative structure, pacing, and cliffhangers.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    {[
                      "Analyze my comedy pilot episode",
                      "Check pacing on episode 3",
                      "Find the best cliffhanger moments",
                      "Summarize this act structure",
                    ].map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setScriptText(s)}
                        className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-[#E8E9E8]/55 text-sm hover:bg-white/[0.05] hover:text-[#E8E9E8] hover:border-white/10 transition-all text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-5 flex-1 pt-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex w-full ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] p-4 rounded-2xl ${
                          message.type === "user"
                            ? "bg-[#1E2E38] border border-white/5 text-[#E8E9E8]"
                            : "text-[#E8E9E8]"
                        }`}
                      >
                        {message.type === "ai" && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md bg-[#C7F711]/10 flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5 text-[#C7F711]" />
                            </div>
                            <span className="text-sm font-semibold text-[#E8E9E8]">TheVbox AI</span>
                          </div>
                        )}
                        {message.type === "user" ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                        ) : (
                          <div className="text-[15px] leading-relaxed space-y-1">
                            {message.content.split("\n").map((line, i) =>
                              line.includes("**") ? (
                                <p key={i} className="font-semibold text-[#D4DDE0]">{line.replace(/\*\*/g, "")}</p>
                              ) : line === "" ? (
                                <div key={i} className="h-1" />
                              ) : (
                                <p key={i} className="text-[#8FA3A8]">{line}</p>
                              )
                            )}
                          </div>
                        )}
                        {/* Canvas chip */}
                        {message.canvasId && (
                          <button
                            onClick={() =>
                              setActiveCanvasId(activeCanvasId === message.canvasId ? null : message.canvasId!)
                            }
                            className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              activeCanvasId === message.canvasId
                                ? "bg-[#C7F711]/10 text-[#C7F711] border-[#C7F711]/20"
                                : "bg-white/5 text-[#E8E9E8]/55 border-white/5 hover:bg-white/10 hover:text-[#E8E9E8]"
                            }`}
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            {activeCanvasId === message.canvasId ? "Canvas open" : "Open canvas →"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-[#C7F711]/10 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-[#C7F711] animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C7F711]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay }} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input (pinned bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0E1921] via-[#0E1921]/95 to-transparent pt-10 pb-6">
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex items-end gap-2 bg-[#1A262E] border border-white/10 rounded-3xl p-2 transition-all duration-300 focus-within:border-[#C7F711]/40 focus-within:ring-1 focus-within:ring-[#C7F711]/15 shadow-lg shadow-black/30">
                <label title="Upload script file" className="cursor-pointer mb-0.5 p-2.5 text-[#E8E9E8]/40 hover:text-[#C7F711] transition-colors rounded-full hover:bg-white/5 flex-shrink-0">
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                  <Plus className="w-5 h-5" />
                </label>
                <textarea
                  ref={textareaRef}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  placeholder="Message TheVbox AI..."
                  className="flex-1 max-h-[200px] mb-1 py-2.5 px-2 bg-transparent text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none resize-none text-[15px] leading-relaxed"
                  rows={1}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!scriptText.trim() || isAnalyzing}
                  className="mb-1 p-2 bg-[#E8E9E8] text-[#0E1921] rounded-full hover:bg-[#C7F711] disabled:opacity-20 disabled:cursor-not-allowed transition-all flex-shrink-0"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center mt-2.5 text-[10px] text-[#E8E9E8]/20">
                AI can make mistakes. Consider verifying important information.
              </p>
            </div>
          </div>
        </div>

        {/* ── Canvas Panel ── */}
        <AnimatePresence>
          {activeCanvas && (
            <CanvasPanel
              canvas={activeCanvas}
              onClose={() => setActiveCanvasId(null)}
              allCanvases={canvasList}
              onSelectCanvas={setActiveCanvasId}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
