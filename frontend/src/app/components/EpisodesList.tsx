import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { EpisodeAnalytics } from "./EpisodeAnalytics";

const mockEpisodes = [
  {
    id: 1,
    episodeNumber: 1,
    title: "Shadows in the Night",
    duration: "12 min",
    cliffhangerScore: 8.5,
    emotionalIntensity: 7.8,
    summary:
      "Detective Sarah Chen arrives at a crime scene unlike any she's seen before. The victim's mysterious symbols hint at something far more sinister.",
    engagement: "92%",
  },
  {
    id: 2,
    episodeNumber: 2,
    title: "The Web Tightens",
    duration: "11 min",
    cliffhangerScore: 9.2,
    emotionalIntensity: 8.5,
    summary:
      "Sarah's investigation leads her to an underground network. Just as she pieces things together, someone close to her goes missing.",
    engagement: "96%",
  },
  {
    id: 3,
    episodeNumber: 3,
    title: "Breaking Point",
    duration: "10 min",
    cliffhangerScore: 9.5,
    emotionalIntensity: 9.2,
    summary:
      "The stakes reach their peak as Sarah races against time. A shocking revelation about her partner changes everything.",
    engagement: "98%",
  },
  {
    id: 4,
    episodeNumber: 4,
    title: "Truth Unveiled",
    duration: "10 min",
    cliffhangerScore: 8.8,
    emotionalIntensity: 8.9,
    summary:
      "Sarah confronts the truth behind the murders, but the cost is higher than she ever imagined. The real enemy emerges from the shadows.",
    engagement: "95%",
  },
  {
    id: 5,
    episodeNumber: 5,
    title: "Dawn's Reckoning",
    duration: "9 min",
    cliffhangerScore: 7.8,
    emotionalIntensity: 8.3,
    summary:
      "In the final confrontation, Sarah must make an impossible choice. The city will never be the same, and neither will she.",
    engagement: "94%",
  },
];

function getScoreColor(score: number) {
  if (score >= 9) return "text-[#C7F711]";
  if (score >= 8) return "text-[#A9F42C]";
  if (score >= 7) return "text-[#8CB535]";
  return "text-[#E8E9E8]";
}

function getScoreBgColor(score: number) {
  if (score >= 9) return "bg-[#C7F711]/20 border-[#C7F711]/50";
  if (score >= 8) return "bg-[#A9F42C]/20 border-[#A9F42C]/50";
  if (score >= 7) return "bg-[#8CB535]/20 border-[#8CB535]/50";
  return "bg-[#E8E9E8]/20 border-[#E8E9E8]/50";
}

export function EpisodesList() {
  const { id } = useParams();
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

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
          <p className="text-[#E8E9E8]/60 mt-2">
            Detailed analysis of each episode segment
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Episodes List */}
        <div className="space-y-4">
          {mockEpisodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <motion.div
                className="relative px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group cursor-pointer"
                whileHover={{ x: 4 }}
                onClick={() => setSelectedEpisode(episode.id)}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/[0.02] transition-all duration-300" />

                <div className="relative z-10 flex items-center gap-5">
                  {/* Episode number */}
                  <div className="w-11 h-11 rounded-xl bg-[#C7F711]/15 border border-[#C7F711]/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold text-[#C7F711]">{episode.episodeNumber}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors truncate">
                        {episode.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[#E8E9E8]/40 text-xs flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{episode.duration}</span>
                        <span className="text-[#E8E9E8]/20">·</span>
                        <span>Episode {episode.episodeNumber}</span>
                      </div>
                    </div>
                    <p className="text-[#E8E9E8]/55 text-sm leading-relaxed line-clamp-2">
                      {episode.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#E8E9E8]/40 text-xs">Predicted Engagement:</span>
                      <span className="text-[#C7F711] text-xs font-semibold">{episode.engagement}</span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-[11px] text-[#E8E9E8]/40 mb-1.5">Cliffhanger</div>
                      <div className={`px-3.5 py-1.5 rounded-xl border ${getScoreBgColor(episode.cliffhangerScore)} flex items-center gap-1.5`}>
                        <Zap className={`w-3.5 h-3.5 ${getScoreColor(episode.cliffhangerScore)}`} />
                        <span className={`text-base font-bold ${getScoreColor(episode.cliffhangerScore)}`}>{episode.cliffhangerScore}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-[#E8E9E8]/40 mb-1.5">Intensity</div>
                      <div className={`px-3.5 py-1.5 rounded-xl border ${getScoreBgColor(episode.emotionalIntensity)} flex items-center gap-1.5`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${getScoreColor(episode.emotionalIntensity)}`} />
                        <span className={`text-base font-bold ${getScoreColor(episode.emotionalIntensity)}`}>{episode.emotionalIntensity}</span>
                      </div>
                    </div>
                    <span className="text-[#C7F711]/40 text-sm group-hover:text-[#C7F711] group-hover:translate-x-1 transition-all ml-1">
                      →
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Episode Analytics Modal */}
      {selectedEpisode && (
        <EpisodeAnalytics
          episode={mockEpisodes.find((ep) => ep.id === selectedEpisode)!}
          onClose={() => setSelectedEpisode(null)}
        />
      )}
    </div>
  );
}
