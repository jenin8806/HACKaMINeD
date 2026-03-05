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
    <div className="min-h-screen bg-gradient-to-br from-[#0E1921] via-[#0E1921] to-[#243615]">
      {/* Header */}
      <div className="bg-[#0E1921]/50 backdrop-blur-sm border-b border-[#C7F711]/20 px-6 py-6">
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Episodes List */}
        <div className="space-y-6">
          {mockEpisodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="relative p-6 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20 hover:border-[#C7F711]/50 transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.01, x: 5 }}
                onClick={() => setSelectedEpisode(episode.id)}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C7F711]/0 to-[#C7F711]/0 group-hover:from-[#C7F711]/10 group-hover:to-[#A9F42C]/10 transition-all duration-300" />

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left - Episode Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-xl bg-[#C7F711]/20 border border-[#C7F711]/50 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#C7F711]">
                            {episode.episodeNumber}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors">
                            {episode.title}
                          </h3>
                          <div className="flex items-center gap-4 text-[#E8E9E8]/60 text-sm mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{episode.duration}</span>
                            </div>
                            <span>•</span>
                            <span>Episode {episode.episodeNumber}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#E8E9E8]/70 leading-relaxed ml-20">
                        {episode.summary}
                      </p>
                    </div>

                    {/* Right - Scores */}
                    <div className="flex lg:flex-col gap-4 lg:items-end">
                      {/* Cliffhanger Score */}
                      <div className="text-center">
                        <div className={`text-sm text-[#E8E9E8]/60 mb-1`}>
                          Cliffhanger
                        </div>
                        <motion.div
                          className={`px-4 py-2 rounded-xl border ${getScoreBgColor(
                            episode.cliffhangerScore
                          )}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="flex items-center gap-1">
                            <Zap className={`w-4 h-4 ${getScoreColor(episode.cliffhangerScore)}`} />
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                episode.cliffhangerScore
                              )}`}
                            >
                              {episode.cliffhangerScore}
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Emotional Intensity */}
                      <div className="text-center">
                        <div className="text-sm text-[#E8E9E8]/60 mb-1">
                          Intensity
                        </div>
                        <motion.div
                          className={`px-4 py-2 rounded-xl border ${getScoreBgColor(
                            episode.emotionalIntensity
                          )}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`w-4 h-4 ${getScoreColor(episode.emotionalIntensity)}`} />
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                episode.emotionalIntensity
                              )}`}
                            >
                              {episode.emotionalIntensity}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom - Engagement */}
                  <div className="mt-6 pt-4 border-t border-[#C7F711]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#E8E9E8]/60 text-sm">Predicted Engagement:</div>
                      <div className="text-[#C7F711] font-semibold">{episode.engagement}</div>
                    </div>
                    <span className="text-[#C7F711] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      View Analytics →
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
