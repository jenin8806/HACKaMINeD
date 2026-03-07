import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Menu, X, FolderOpen, Brain, Plus, ArrowUp, PanelLeftClose, PanelLeft,
  Zap, Sparkles, LogOut, BarChart2, TrendingUp, Clock, Layers, FileText,
  Code2, SlidersHorizontal, MessageSquare, ArrowLeft, Activity, Users, ChevronRight, Trash2,
} from "lucide-react";

import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useUser } from "../contexts/UserContext";
import { UserSettingsDialog } from "./UserSettingsDialog";
import FilmCamera3D from "./FilmCamera3D";
import { auth } from "../firebase";
import { saveProject, saveChatSession, updateChatSession, getChatSessions, deleteChatSession } from "../services/projectsService";
import { onAuthStateChanged } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type RetentionPoint = { segment: string; retention: number };
type EmotionPoint   = { time: string; intensity: number };

type EpisodeImprovement = {
  what: string;
  why: string;
  scriptFix: string;
};

type ImprovementCard = {
  episodeTitle: string;
  episodeNum: number;
  what: string;
  why: string;
  scriptFix: string;
};

type CanvasEpisode = {
  title: string;
  cliffhangerScore: number;
  pacingScore: number;
  duration: string;
  wordCount: number;
  retentionScore: number;
  cliffhangerType: string;
  emotionArc: { start: string; mid: string; end: string };
  improvementSuggestion: string;
  improvements: EpisodeImprovement;
  segments: {
    hook: string;
    conflict: string;
    twist: string;
    escalation: string;
    cliffhanger: string;
  };
  retentionCurve: RetentionPoint[];
  emotionCurve: EmotionPoint[];
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
  improvements?: ImprovementCard[];
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
  // Use real ML/NLP emotion curve when available
  if (ep.emotionCurve?.length) return ep.emotionCurve;
  // Heuristic fallback for legacy data without curves
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
  // Use real ML/NLP retention curve when available
  if (ep.retentionCurve?.length) return ep.retentionCurve;
  // Heuristic fallback for legacy data without curves
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
  const emotionData    = genEmotionData(ep, idx);
  const engagementData = genEngagementData(ep);
  const isMLCurve      = Boolean(ep.retentionCurve?.length);

  const emotionalIntensity = Math.min(9.9, parseFloat((ep.cliffhangerScore * 0.65 + ep.pacingScore * 0.35).toFixed(1)));
  const audienceRetention  = Math.round(ep.retentionScore * 100);

  // Dynamic Y-axis domain from actual retention values with padding
  const retentionValues = engagementData.map((d) => d.retention);
  const yMin = Math.max(0,   Math.min(...retentionValues) - 6);
  const yMax = Math.min(100, Math.max(...retentionValues) + 4);

  // Narrative structure computed from real segment character lengths
  const segDefs = [
    { label: "Hook (0–15s)",    len: ep.segments.hook.length,        color: "#C7F711" },
    { label: "Conflict (15–45s)", len: ep.segments.conflict.length,  color: "#7DD3FC" },
    { label: "Twist (45–60s)",  len: ep.segments.twist.length,       color: "#F472B6" },
    { label: "Escalation (60–75s)", len: ep.segments.escalation.length, color: "#FB923C" },
    { label: "Cliffhanger (75–90s)", len: ep.segments.cliffhanger.length, color: "#86EFAC" },
  ];
  const totalSegLen = segDefs.reduce((a, s) => a + s.len, 0) || 1;
  const narrative = segDefs.map((s) => ({
    ...s,
    pct: Math.max(4, Math.round((s.len / totalSegLen) * 100)),
  }));

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
          { label: "ML Retention Score", value: `${audienceRetention}%`, color: "#86EFAC", icon: <Users className="w-3.5 h-3.5" />, max: null },
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
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider">Segment Retention</h4>
          {isMLCurve ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#86EFAC]/10 border border-[#86EFAC]/30 text-[9px] font-semibold text-[#86EFAC] uppercase tracking-wider">
              <Activity className="w-2.5 h-2.5" /> NLP · ML
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#E8E9E8]/30 uppercase tracking-wider">
              estimated
            </span>
          )}
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="segment" stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} />
              <YAxis stroke="rgba(232,233,232,0.20)" tick={{ fontSize: 9 }} domain={[yMin, yMax]} tickFormatter={(v) => `${v}%`} />
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
              {/* Overall ML retention score as a reference baseline */}
              <ReferenceLine
                y={audienceRetention}
                stroke="#86EFAC"
                strokeDasharray="4 3"
                strokeOpacity={0.45}
                label={{ value: `ML: ${audienceRetention}%`, position: "right", fontSize: 8, fill: "#86EFAC", opacity: 0.6 }}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#7DD3FC"
                strokeWidth={2}
                dot={{ fill: "#7DD3FC", r: 4, stroke: "#0E1921", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#7DD3FC" }}
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

      {/* Script Segments */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-[#C7F711]" />
          Episode Script Segments
        </h4>
        <div className="space-y-2.5">
          {([
            { label: "Hook (0–15s)",          text: ep.segments.hook,        color: "#C7F711" },
            { label: "Conflict (15–45s)",      text: ep.segments.conflict,    color: "#7DD3FC" },
            { label: "Midpoint Twist (45–60s)",text: ep.segments.twist,       color: "#F472B6" },
            { label: "Escalation (60–75s)",    text: ep.segments.escalation,  color: "#FB923C" },
            { label: "Cliffhanger (75–90s)",   text: ep.segments.cliffhanger, color: "#86EFAC" },
          ] as { label: string; text: string; color: string }[]).map((seg) => (
            <div key={seg.label} className="border border-white/[0.06] rounded-lg p-3 space-y-1.5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: seg.color + "99" }}>{seg.label}</span>
              </div>
              <p className="text-[11px] text-[#E8E9E8]/60 leading-relaxed">{seg.text || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emotion Arc + Cliffhanger Type */}
      {(ep.emotionArc.start || ep.cliffhangerType) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3">Emotion Arc &amp; Cliffhanger</h4>
          {ep.emotionArc.start && (
            <div className="flex items-center gap-2 mb-3">
              {[{ label: "Start", val: ep.emotionArc.start }, { label: "Mid", val: ep.emotionArc.mid }, { label: "End", val: ep.emotionArc.end }].map((a, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="text-[9px] text-[#E8E9E8]/30 uppercase tracking-wider mb-1">{a.label}</div>
                  <div className="text-xs text-[#E8E9E8]/70 font-medium capitalize">{a.val}</div>
                </div>
              ))}
            </div>
          )}
          {ep.cliffhangerType && (
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#C7F711]" />
              <span className="text-[11px] text-[#E8E9E8]/50">Cliffhanger type: </span>
              <span className="text-[11px] text-[#C7F711] capitalize font-medium">{ep.cliffhangerType}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {ep.improvementSuggestion && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <h4 className="text-[10px] font-semibold text-[#E8E9E8]/35 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C7F711]" />
            AI Improvement Suggestion
          </h4>
          <p className="text-[11px] text-[#E8E9E8]/55 leading-relaxed">{ep.improvementSuggestion}</p>
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState<"overview" | "episodes">("overview");
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
        {(["overview", "episodes"] as const).map((tab) => (
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
                          <div>
                            <div className="flex justify-between mb-1">
                              <p className="text-[11px] text-[#E8E9E8]/35">ML Retention</p>
                              <span className="text-[10px] font-mono text-[#86EFAC]/70">{Math.round(ep.retentionScore * 100)}%</span>
                            </div>
                            <ScoreBar score={parseFloat((ep.retentionScore * 10).toFixed(1))} color="#86EFAC" />
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
  const [firestoreSessionDocId, setFirestoreSessionDocId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load chat sessions from Firestore once auth is resolved
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setChatHistory([]);
        setHistoryLoading(false);
        return;
      }
      try {
        const sessions = await getChatSessions(fbUser.uid);
        setChatHistory(sessions.map(s => ({
          id: s.id,
          name: s.name,
          messages: s.messages as Message[],
          canvases: s.canvases as Record<string, CanvasData>,
          createdAt: s.updatedAt.getTime(),
        })));
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setHistoryLoading(false);
      }
    });
    return unsub;
  }, [])
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
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

  const handleAnalyze = async () => {
    if (!scriptText.trim()) return;

    if (messages.length === 0) {
      setSessionName(scriptText.trim().slice(0, 42));
    }

    const storyText = scriptText;
    const userMsg: Message = { id: `msg-${Date.now()}`, type: "user", content: storyText };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);
    setScriptText("");

    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("Not signed in");
      const token = await fbUser.getIdToken();

      const res = await fetch("https://hackamined.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ story: storyText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(err.detail || "Analysis failed");
      }

      const result = await res.json();
      const episodes = result.episodes || [];

      const canvasId = `canvas-${Date.now()}`;
      const totalWords = storyText.split(/\s+/).length;
      const avgRetention =
        episodes.length > 0
          ? episodes.reduce((s: number, ep: any) => s + (ep.analytics?.retention_score ?? 0), 0) / episodes.length
          : 0;
      const canvas: CanvasData = {
        id: canvasId,
        title: "Script Analysis",
        wordCount: totalWords,
        episodeCount: episodes.length,
        overallScore: parseFloat((avgRetention * 10).toFixed(1)),
        episodes: episodes.map((ep: any) => {
          const rs = ep.analytics?.retention_score ?? 0;
          const scaled = rs * 10;
          const rawImp = ep.improvements || {};
          return {
            title: ep.title || `Episode ${ep.episode_number}`,
            cliffhangerScore: parseFloat(Math.min(10, scaled * 1.05).toFixed(1)),
            pacingScore: parseFloat(Math.min(10, scaled * 0.95).toFixed(1)),
            duration: "~90 sec",
            wordCount: Math.round(totalWords / (episodes.length || 1)),
            retentionScore: rs,
            cliffhangerType: ep.cliffhanger_type || "unknown",
            emotionArc: ep.emotion_arc || { start: "", mid: "", end: "" },
            improvementSuggestion: ep.improvement_suggestion || rawImp.what || "",
            improvements: {
              what: rawImp.what || "",
              why: rawImp.why || "",
              scriptFix: rawImp.script_fix || "",
            },
            segments: {
              hook: ep.segments?.hook_0_15s || "",
              conflict: ep.segments?.conflict_15_45s || "",
              twist: ep.segments?.midpoint_twist_45_60s || "",
              escalation: ep.segments?.escalation_60_75s || "",
              cliffhanger: ep.segments?.cliffhanger_75_90s || "",
            },
            retentionCurve: ep.analytics?.retention_curve ?? [],
            emotionCurve: ep.analytics?.emotion_curve ?? [],
          };
        }),
        suggestions: episodes
          .filter((ep: any) => ep.improvement_suggestion)
          .map((ep: any) => ep.improvement_suggestion),
      };

      setCanvases((prev) => ({ ...prev, [canvasId]: canvas }));
      setActiveCanvasId(canvasId);

      // Persist to Firestore in the background
      saveProject(fbUser.uid, canvas, storyText).catch(console.error);

      const episodeLines = episodes
        .map(
          (ep: any) =>
            `• "${ep.title}" — ${ep.cliffhanger_type || "cliffhanger"} · ML Retention ${((ep.analytics?.retention_score ?? 0) * 100).toFixed(0)}%`
        )
        .join("\n");

      const improvements: ImprovementCard[] = episodes
        .map((ep: any, i: number) => {
          const imp = ep.improvements || {};
          return {
            episodeTitle: ep.title || `Episode ${ep.episode_number}`,
            episodeNum: i + 1,
            what: imp.what || "",
            why: imp.why || "",
            scriptFix: imp.script_fix || "",
          };
        })
        .filter((c: ImprovementCard) => c.what);

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        type: "ai",
        content: `I've analyzed your script! Here's what I found:\n\n**${episodes.length} Episodes Designed**\nYour story has been decomposed into ${episodes.length} high-retention vertical episodes (${totalWords.toLocaleString()} words). Average ML retention score: **${(avgRetention * 100).toFixed(0)}%**.\n\n**Episode Breakdown**\n${episodeLines}\n\nOpen the canvas panel for detailed breakdown, retention scores, and segment scripts.\n\n**Improvement Suggestions**\nSee the cards below — type **"apply changes"** to apply all suggestions at once.`,
        canvasId,
        improvements,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Persist chat session to Firestore
      const sessionTitle = sessionName ?? storyText.slice(0, 42);
      const allMsgs = [...messages, userMsg, aiMsg];
      const allCvs = { ...canvases, [canvasId]: canvas };
      if (firestoreSessionDocId) {
        updateChatSession(firestoreSessionDocId, sessionTitle, allMsgs, allCvs)
          .then(() => setChatHistory(prev => prev.map(s =>
            s.id === firestoreSessionDocId ? { ...s, name: sessionTitle, messages: allMsgs, canvases: allCvs } : s
          )))
          .catch(console.error);
      } else {
        saveChatSession(fbUser.uid, sessionTitle, allMsgs, allCvs)
          .then(docId => {
            setFirestoreSessionDocId(docId);
            setSessionId(docId);
            const newSession: ChatSession = { id: docId, name: sessionTitle, messages: allMsgs, canvases: allCvs, createdAt: Date.now() };
            setChatHistory(prev => [newSession, ...prev.filter(s => s.id !== docId)]);
          })
          .catch(console.error);
      }
    } catch (err: any) {
      const errMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        type: "ai",
        content: `Sorry, analysis failed: ${err.message || "Unknown error"}. Please try again.`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAnalyzing(false);
    }
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

  const isApplyIntent = (text: string) =>
    /\b(apply|implement|use|make)\b.*\b(change|this|it|suggestion|improvement|fix|all)\b/i.test(text.trim())
    || ["apply", "yes", "do it"].includes(text.trim().toLowerCase());

  const handleSend = async () => {
    if (!scriptText.trim() || isAnalyzing) return;
    if (activeCanvasId !== null && scriptText.trim().split(/\s+/).length <= 80) {
      await handleChat();
    } else {
      await handleAnalyze();
    }
  };

  const handleChat = async () => {
    if (!scriptText.trim()) return;
    const userText = scriptText.trim();
    const userMsg: Message = { id: `msg-${Date.now()}`, type: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);
    setScriptText("");

    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("Not signed in");
      const token = await fbUser.getIdToken();
      const applyMode = isApplyIntent(userText);
      const currentCanvas = activeCanvasId ? canvases[activeCanvasId] : null;

      const canvasEpisodes = currentCanvas?.episodes.map((ep, i) => ({
        episode_number: i + 1,
        title: ep.title,
        cliffhanger_type: ep.cliffhangerType,
        emotion_arc: ep.emotionArc,
        segments: {
          hook_0_15s: ep.segments.hook,
          conflict_15_45s: ep.segments.conflict,
          midpoint_twist_45_60s: ep.segments.twist,
          escalation_60_75s: ep.segments.escalation,
          cliffhanger_75_90s: ep.segments.cliffhanger,
        },
        improvements: {
          what: ep.improvements?.what || ep.improvementSuggestion || "",
          why: ep.improvements?.why || "",
          script_fix: ep.improvements?.scriptFix || "",
        },
      })) ?? [];

      const res = await fetch("https://hackamined.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userText, canvas_episodes: canvasEpisodes, apply_changes: applyMode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Chat failed" }));
        throw new Error(err.detail || "Chat failed");
      }

      const data = await res.json();
      let aiMsg: Message;

      if (data.type === "revision" && data.episodes) {
        const totalWords = currentCanvas?.wordCount ?? 0;
        const eps = data.episodes;
        const avgRetention = eps.length > 0
          ? eps.reduce((s: number, ep: any) => s + (ep.analytics?.retention_score ?? 0), 0) / eps.length : 0;

        const updatedEpisodes: CanvasEpisode[] = eps.map((ep: any) => {
          const rs = ep.analytics?.retention_score ?? 0;
          const scaled = rs * 10;
          const rawImp = ep.improvements || {};
          return {
            title: ep.title || `Episode ${ep.episode_number}`,
            cliffhangerScore: parseFloat(Math.min(10, scaled * 1.05).toFixed(1)),
            pacingScore: parseFloat(Math.min(10, scaled * 0.95).toFixed(1)),
            duration: "~90 sec",
            wordCount: Math.round(totalWords / (eps.length || 1)),
            retentionScore: rs,
            cliffhangerType: ep.cliffhanger_type || "unknown",
            emotionArc: ep.emotion_arc || { start: "", mid: "", end: "" },
            improvementSuggestion: rawImp.what || "",
            improvements: { what: rawImp.what || "", why: rawImp.why || "", scriptFix: rawImp.script_fix || "" },
            segments: {
              hook: ep.segments?.hook_0_15s || "",
              conflict: ep.segments?.conflict_15_45s || "",
              twist: ep.segments?.midpoint_twist_45_60s || "",
              escalation: ep.segments?.escalation_60_75s || "",
              cliffhanger: ep.segments?.cliffhanger_75_90s || "",
            },
            retentionCurve: ep.analytics?.retention_curve ?? [],
            emotionCurve: ep.analytics?.emotion_curve ?? [],
          };
        });

        let revisedCanvasId = activeCanvasId;
        if (currentCanvas) {
          revisedCanvasId = `canvas-${Date.now()}`;
          const revisedCanvas: CanvasData = {
            ...currentCanvas,
            id: revisedCanvasId,
            title: `${currentCanvas.title} (Revised)`,
            overallScore: parseFloat((avgRetention * 10).toFixed(1)),
            episodes: updatedEpisodes,
            suggestions: updatedEpisodes.map((ep) => ep.improvements.what).filter(Boolean),
          };
          setCanvases((prev) => ({ ...prev, [revisedCanvasId!]: revisedCanvas }));
          setActiveCanvasId(revisedCanvasId);
        }

        const changedTitles = updatedEpisodes.map((ep) => `• ${ep.title}`).join("\n");
        aiMsg = {
          id: `msg-${Date.now() + 1}`,
          type: "ai",
          content: `All improvements applied! A new revised canvas has been created alongside the original.\n\n${changedTitles}\n\nThe original canvas is preserved — use the canvas selector to compare.`,
          canvasId: revisedCanvasId ?? undefined,
        };
      } else {
        aiMsg = {
          id: `msg-${Date.now() + 1}`,
          type: "ai",
          content: data.content || "I couldn't generate a response. Please try again.",
        };
      }

      setMessages((prev) => [...prev, aiMsg]);
      const sessionTitle = sessionName ?? userText.slice(0, 42);
      const allMsgs = [...messages, userMsg, aiMsg];
      const allCvs = { ...canvases };
      if (firestoreSessionDocId) {
        updateChatSession(firestoreSessionDocId, sessionTitle, allMsgs, allCvs).catch(console.error);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `msg-${Date.now() + 1}`, type: "ai",
        content: `Sorry, that failed: ${err.message || "Unknown error"}. Please try again.`,
      }]);
    } finally {
      setIsAnalyzing(false);
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
                    setFirestoreSessionDocId(null);
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
                  <Plus className="w-4 h-4 ml-auto text-[#E8E9E8]/30 group-hover:text-[#C7F711] transition-colors" />
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
                  {/* <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#E8E9E8]/55 hover:bg-white/5 hover:text-[#E8E9E8] transition-all group">
                    <Brain className="w-4 h-4 text-[#E8E9E8]/30 group-hover:text-[#C7F711] transition-colors" />
                    <span className="text-sm">Memory</span>
                  </button> */}
                </nav>
              </div>

              {/* Recent Chats */}
              {(historyLoading || messages.length > 0 || chatHistory.length > 0) && (
                <div className="px-3 pt-4 pb-2 flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <h3 className="px-3 text-[10px] font-semibold text-[#E8E9E8]/25 uppercase tracking-wider mb-2">Recent</h3>
                  {historyLoading && (
                    <div className="space-y-1 px-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-7 rounded-lg bg-white/[0.04] animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
                      ))}
                    </div>
                  )}
                  {!historyLoading && (
                  <div className="space-y-0.5">
                    {/* Active session — always shown at top while in progress */}
                    {messages.length > 0 && (
                      <div
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs border bg-white/[0.06] text-[#E8E9E8]/75 border-white/[0.07]"
                      >
                        <MessageSquare className="w-3 h-3 flex-shrink-0 opacity-40" />
                        <span className="truncate text-left">
                          {sessionName || messages[0]?.content.slice(0, 42) || "New Chat"}
                        </span>
                      </div>
                    )}
                    {/* Past sessions */}
                    {chatHistory.filter(s => s.id !== sessionId).map((session) => (
                      <div
                        key={session.id}
                        className="w-full flex items-center gap-1 px-3 py-2 rounded-lg transition-all text-xs border text-[#E8E9E8]/30 hover:bg-white/[0.04] hover:text-[#E8E9E8]/55 border-transparent group/item"
                      >
                        <button
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                          onClick={() => {
                            setFirestoreSessionDocId(session.id);
                            setSessionId(session.id);
                            setSessionName(session.name);
                            setMessages(session.messages);
                            setCanvases(session.canvases);
                            // Restore the canvas panel to the last canvas in this session
                            const lastCanvasMsg = [...session.messages].reverse().find(m => m.type === "ai" && m.canvasId);
                            setActiveCanvasId(lastCanvasMsg?.canvasId ?? null);
                            if (!isDesktop) setSidebarOpen(false);
                          }}
                        >
                          <MessageSquare className="w-3 h-3 flex-shrink-0 opacity-40" />
                          <span className="truncate">{session.name}</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteChatSession(session.id).catch(console.error);
                            setChatHistory(prev => prev.filter(s => s.id !== session.id));
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-[#E8E9E8]/20 hover:text-red-400 transition-all flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  )}
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
                    <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-400" onClick={() => { logout(); navigate("/"); }}>
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

          {/* Claude-style layout: centered when empty, chat layout when active */}
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4 overflow-y-auto"
              >
                <div className="w-full max-w-2xl flex flex-col items-center py-8">
                  <FilmCamera3D />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#E8E9E8] mb-2 tracking-tight text-center">
                    Welcome back, {user.username}
                  </h2>
                  <p className="text-[#E8E9E8]/40 text-sm mb-8 max-w-sm text-center leading-relaxed">
                    Drop your script or upload a file to analyze narrative structure, pacing, and cliffhangers.
                  </p>
                  <div className="w-full">
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
                            handleSend();
                          }
                        }}
                        placeholder="Message TheVbox AI..."
                        className="flex-1 max-h-[200px] mb-1 py-2.5 px-2 bg-transparent text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none resize-none text-[15px] leading-relaxed"
                        rows={1}
                      />
                      <button
                        onClick={handleSend}
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
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.1] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.18]">
                  <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-44 min-h-full flex flex-col">
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
                            {/* Improvement cards */}
                            {message.improvements && message.improvements.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C7F711]/60 mb-2">AI Improvement Suggestions</p>
                                {message.improvements.map((imp, i) => (
                                  <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md bg-[#C7F711]/10 text-[#C7F711] flex items-center justify-center text-[10px] font-bold flex-shrink-0">{imp.episodeNum}</span>
                                      <span className="text-[13px] font-medium text-[#E8E9E8] truncate">{imp.episodeTitle}</span>
                                    </div>
                                    {imp.what && (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7DD3FC]/70 mb-0.5">What to change</p>
                                        <p className="text-[13px] text-[#B8C8CC]">{imp.what}</p>
                                      </div>
                                    )}
                                    {imp.why && (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F472B6]/70 mb-0.5">Why it matters</p>
                                        <p className="text-[13px] text-[#B8C8CC]">{imp.why}</p>
                                      </div>
                                    )}
                                    {imp.scriptFix && (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86EFAC]/70 mb-0.5">Suggested script</p>
                                        <p className="text-[13px] text-[#B8C8CC] italic leading-relaxed">"{imp.scriptFix}"</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={async () => {
                                    if (isAnalyzing) return;
                                    const currentCanvas = activeCanvasId ? canvases[activeCanvasId] : null;
                                    const userMsg: Message = { id: `msg-${Date.now()}`, type: "user", content: "apply changes" };
                                    setMessages((m) => [...m, userMsg]);
                                    setIsAnalyzing(true);
                                    try {
                                      const fbUser = auth.currentUser;
                                      if (!fbUser) throw new Error("Not signed in");
                                      const token = await fbUser.getIdToken();
                                      const canvasEpisodes = currentCanvas?.episodes.map((ep, idx) => ({
                                        episode_number: idx + 1, title: ep.title,
                                        cliffhanger_type: ep.cliffhangerType, emotion_arc: ep.emotionArc,
                                        segments: { hook_0_15s: ep.segments.hook, conflict_15_45s: ep.segments.conflict, midpoint_twist_45_60s: ep.segments.twist, escalation_60_75s: ep.segments.escalation, cliffhanger_75_90s: ep.segments.cliffhanger },
                                        improvements: { what: ep.improvements?.what || ep.improvementSuggestion || "", why: ep.improvements?.why || "", script_fix: ep.improvements?.scriptFix || "" },
                                      })) ?? [];
                                      const res = await fetch("https://hackamined.onrender.com/api/chat", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ message: "apply changes", canvas_episodes: canvasEpisodes, apply_changes: true }),
                                      });
                                      if (!res.ok) throw new Error("Apply changes failed");
                                      const data = await res.json();
                                      if (data.type === "revision" && data.episodes) {
                                        const totalWords = currentCanvas?.wordCount ?? 0;
                                        const eps = data.episodes;
                                        const avgRet = eps.length > 0 ? eps.reduce((s: number, ep: any) => s + (ep.analytics?.retention_score ?? 0), 0) / eps.length : 0;
                                        const updatedEps: CanvasEpisode[] = eps.map((ep: any) => {
                                          const rs = ep.analytics?.retention_score ?? 0; const sc = rs * 10; const ri = ep.improvements || {};
                                          return { title: ep.title || `Episode ${ep.episode_number}`, cliffhangerScore: parseFloat(Math.min(10, sc * 1.05).toFixed(1)), pacingScore: parseFloat(Math.min(10, sc * 0.95).toFixed(1)), duration: "~90 sec", wordCount: Math.round(totalWords / (eps.length || 1)), retentionScore: rs, cliffhangerType: ep.cliffhanger_type || "unknown", emotionArc: ep.emotion_arc || { start: "", mid: "", end: "" }, improvementSuggestion: ri.what || "", improvements: { what: ri.what || "", why: ri.why || "", scriptFix: ri.script_fix || "" }, segments: { hook: ep.segments?.hook_0_15s || "", conflict: ep.segments?.conflict_15_45s || "", twist: ep.segments?.midpoint_twist_45_60s || "", escalation: ep.segments?.escalation_60_75s || "", cliffhanger: ep.segments?.cliffhanger_75_90s || "" }, retentionCurve: ep.analytics?.retention_curve ?? [], emotionCurve: ep.analytics?.emotion_curve ?? [] };
                                        });
                                        let newId = activeCanvasId;
                                        if (currentCanvas) {
                                          newId = `canvas-${Date.now()}`;
                                          setCanvases((prev) => ({ ...prev, [newId!]: { ...currentCanvas, id: newId!, title: `${currentCanvas.title} (Revised)`, overallScore: parseFloat((avgRet * 10).toFixed(1)), episodes: updatedEps, suggestions: updatedEps.map((ep) => ep.improvements.what).filter(Boolean) } }));
                                          setActiveCanvasId(newId);
                                        }
                                        setMessages((m) => [...m, { id: `msg-${Date.now() + 1}`, type: "ai", content: `All improvements applied! A new revised canvas has been created alongside the original.\n\n${updatedEps.map((ep) => `• ${ep.title}`).join("\n")}\n\nThe original canvas is preserved.`, canvasId: newId ?? undefined }]);
                                      }
                                    } catch (err: any) {
                                      setMessages((m) => [...m, { id: `msg-${Date.now() + 1}`, type: "ai", content: `Apply failed: ${err.message}` }]);
                                    } finally { setIsAnalyzing(false); }
                                  }}
                                  disabled={isAnalyzing}
                                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C7F711]/10 border border-[#C7F711]/30 text-[#C7F711] text-[13px] font-semibold hover:bg-[#C7F711]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  Apply All Changes
                                </button>
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
                            handleSend();
                          }
                        }}
                        placeholder="Message TheVbox AI..."
                        className="flex-1 max-h-[200px] mb-1 py-2.5 px-2 bg-transparent text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none resize-none text-[15px] leading-relaxed"
                        rows={1}
                      />
                      <button
                        onClick={handleSend}
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
              </motion.div>
            )}
          </AnimatePresence>
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
