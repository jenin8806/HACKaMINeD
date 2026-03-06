import { motion, AnimatePresence } from "motion/react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft, Clock, Zap, TrendingUp, Users, FileText, ChevronDown, ChevronUp,
  Loader2, Sparkles, Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getProject, type StoredProject, type StoredEpisode } from "../services/projectsService";

function ScoreBar({ score, max = 10, color }: { score: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-mono w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

function SegmentRow({ label, text, color }: { label: string; text: string; color: string }) {
  if (!text) return null;
  return (
    <div className="border border-white/[0.07] rounded-xl p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: color + "99" }}>{label}</span>
      </div>
      <p className="text-sm text-[#E8E9E8]/65 leading-relaxed">{text}</p>
    </div>
  );
}

function EpisodeCard({ ep, idx }: { ep: StoredEpisode; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const retention = Math.round(ep.retentionScore * 100);
  const emotionalIntensity = parseFloat(
    Math.min(9.9, ep.cliffhangerScore * 0.65 + ep.pacingScore * 0.35).toFixed(1)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: idx * 0.07 }}
      className="rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20 hover:border-[#C7F711]/40 transition-all duration-300 overflow-hidden"
    >
      {/* ── Card Header ── */}
      <button
        className="w-full text-left p-6 group"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#C7F711]/15 border border-[#C7F711]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[#C7F711]">{idx + 1}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors truncate">
                {ep.title}
              </h3>
              <div className="flex items-center gap-3 text-[#E8E9E8]/50 text-sm mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ep.duration}</span>
                </div>
                <span>·</span>
                <span>{ep.wordCount.toLocaleString()} words</span>
                {ep.cliffhangerType && ep.cliffhangerType !== "unknown" && (
                  <>
                    <span>·</span>
                    <span className="capitalize text-[#C7F711]/60">{ep.cliffhangerType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right – score badges */}
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="text-center px-4 py-2 rounded-xl bg-[#C7F711]/10 border border-[#C7F711]/30">
              <div className="text-[10px] text-[#E8E9E8]/40 uppercase tracking-wider mb-0.5 flex items-center gap-1 justify-center">
                <Zap className="w-3 h-3" /> Cliffhanger
              </div>
              <span className="text-lg font-bold text-[#C7F711]">{ep.cliffhangerScore}</span>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-[#7DD3FC]/10 border border-[#7DD3FC]/30">
              <div className="text-[10px] text-[#E8E9E8]/40 uppercase tracking-wider mb-0.5 flex items-center gap-1 justify-center">
                <TrendingUp className="w-3 h-3" /> Pacing
              </div>
              <span className="text-lg font-bold text-[#7DD3FC]">{ep.pacingScore}</span>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-[#86EFAC]/10 border border-[#86EFAC]/30">
              <div className="text-[10px] text-[#E8E9E8]/40 uppercase tracking-wider mb-0.5 flex items-center gap-1 justify-center">
                <Users className="w-3 h-3" /> Retention
              </div>
              <span className="text-lg font-bold text-[#86EFAC]">{retention}%</span>
            </div>
            <div className="ml-2 text-[#E8E9E8]/30 group-hover:text-[#C7F711] transition-colors">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Score bars preview */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[#E8E9E8]/35 mb-1.5">Cliffhanger</p>
            <ScoreBar score={ep.cliffhangerScore} color="#C7F711" />
          </div>
          <div>
            <p className="text-xs text-[#E8E9E8]/35 mb-1.5">Pacing</p>
            <ScoreBar score={ep.pacingScore} color="#7DD3FC" />
          </div>
          <div>
            <p className="text-xs text-[#E8E9E8]/35 mb-1.5">Emotional Intensity</p>
            <ScoreBar score={emotionalIntensity} color="#F472B6" />
          </div>
        </div>
      </button>

      {/* ── Expanded Detail ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6 border-t border-white/5 pt-5">

              {/* Emotion Arc */}
              {(ep.emotionArc?.start || ep.emotionArc?.mid || ep.emotionArc?.end) && (
                <div>
                  <h4 className="text-sm font-semibold text-[#E8E9E8]/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#F472B6]" /> Emotion Arc
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Start", val: ep.emotionArc.start },
                      { label: "Mid", val: ep.emotionArc.mid },
                      { label: "End", val: ep.emotionArc.end },
                    ].map((a) => (
                      <div key={a.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                        <div className="text-[10px] text-[#E8E9E8]/30 uppercase tracking-wider mb-1">{a.label}</div>
                        <div className="text-sm text-[#E8E9E8]/75 font-medium capitalize">{a.val || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script Segments */}
              {ep.segments && (
                <div>
                  <h4 className="text-sm font-semibold text-[#E8E9E8]/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C7F711]" /> Script Segments
                  </h4>
                  <div className="space-y-2.5">
                    <SegmentRow label="Hook (0–15s)" text={ep.segments.hook} color="#C7F711" />
                    <SegmentRow label="Conflict (15–45s)" text={ep.segments.conflict} color="#7DD3FC" />
                    <SegmentRow label="Midpoint Twist (45–60s)" text={ep.segments.twist} color="#F472B6" />
                    <SegmentRow label="Escalation (60–75s)" text={ep.segments.escalation} color="#FB923C" />
                    <SegmentRow label="Cliffhanger (75–90s)" text={ep.segments.cliffhanger} color="#86EFAC" />
                  </div>
                </div>
              )}

              {/* AI Suggestion */}
              {ep.improvementSuggestion && (
                <div className="rounded-xl bg-[#C7F711]/5 border border-[#C7F711]/20 p-4">
                  <h4 className="text-sm font-semibold text-[#C7F711]/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Improvement Suggestion
                  </h4>
                  <p className="text-sm text-[#E8E9E8]/65 leading-relaxed">{ep.improvementSuggestion}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function EpisodesList() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<StoredProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then((p) => {
        setProject(p);
        if (!p) setError("Project not found.");
      })
      .catch((err) => setError(err.message ?? "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0E1921 0%, #0d1520 100%)" }}>
      {/* Header */}
      <div className="bg-[#0E1921]/80 backdrop-blur-sm border-b border-white/[0.06] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to={`/project/${id}`}
            className="inline-flex items-center gap-2 text-[#C7F711] hover:text-[#A9F42C] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Project
          </Link>
          <h1 className="text-4xl font-bold text-[#E8E9E8]">Episode Breakdown</h1>
          {project && (
            <p className="text-[#E8E9E8]/60 mt-2">
              {project.episodeCount} episode{project.episodeCount !== 1 ? "s" : ""} · click any card to expand full details
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-[#C7F711] animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24 text-red-400">{error}</div>
        )}

        {!loading && project && project.episodes.length === 0 && (
          <div className="text-center py-24 text-[#E8E9E8]/40">No episode data found for this project.</div>
        )}

        {!loading && project && project.episodes.length > 0 && (
          <div className="space-y-5">
            {project.episodes.map((ep, idx) => (
              <EpisodeCard key={idx} ep={ep} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
