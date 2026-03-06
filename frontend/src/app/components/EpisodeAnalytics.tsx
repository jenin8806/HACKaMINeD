import { motion, AnimatePresence } from "motion/react";
import { X, Zap, TrendingUp, Lightbulb, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Episode {
  id: number;
  episodeNumber: number;
  title: string;
  duration: string;
  cliffhangerScore: number;
  emotionalIntensity: number;
  summary: string;
  engagement: string;
}

interface Props {
  episode: Episode;
  onClose: () => void;
}

const emotionCurveData = [
  { time: "0:00", intensity: 6.0 },
  { time: "2:00", intensity: 7.5 },
  { time: "4:00", intensity: 6.8 },
  { time: "6:00", intensity: 8.9 },
  { time: "8:00", intensity: 9.5 },
  { time: "10:00", intensity: 9.2 },
];

const engagementData = [
  { segment: "Opening", retention: 95 },
  { segment: "Hook", retention: 97 },
  { segment: "Development", retention: 93 },
  { segment: "Climax", retention: 98 },
  { segment: "Resolution", retention: 94 },
];

const suggestions = [
  {
    title: "Strengthen the Hook",
    description: "The opening could be more impactful. Start with action to immediately grab attention.",
    impact: "High",
  },
  {
    title: "Adjust Pacing",
    description: "The middle section feels slightly slow. Consider tightening the dialogue in scene 3.",
    impact: "Medium",
  },
  {
    title: "Enhance Cliffhanger",
    description: "The ending is strong but could be even more powerful with a visual reveal instead of dialogue.",
    impact: "High",
  },
];

export function EpisodeAnalytics({ episode, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[#0E1921]/90 backdrop-blur-lg"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[#0E1921] backdrop-blur-xl rounded-3xl border border-white/[0.10] shadow-2xl shadow-black/50"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#0E1921]/50 border border-[#C7F711]/30 text-[#C7F711] hover:bg-[#C7F711]/20 transition-all duration-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-[#C7F711]/20 border border-[#C7F711]/50 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#C7F711]">
                    {episode.episodeNumber}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#E8E9E8]">{episode.title}</h2>
                  <p className="text-[#E8E9E8]/60">Episode {episode.episodeNumber} • {episode.duration}</p>
                </div>
              </div>
              <p className="text-[#E8E9E8]/80 leading-relaxed">{episode.summary}</p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#C7F711]/15">
                    <Zap className="w-5 h-5 text-[#C7F711]" />
                  </div>
                  <h3 className="font-semibold text-[#E8E9E8]">Cliffhanger Score</h3>
                </div>
                <p className="text-4xl font-bold text-[#C7F711]">{episode.cliffhangerScore}</p>
                <p className="text-sm text-[#E8E9E8]/60 mt-1">out of 10</p>
              </motion.div>

              <motion.div
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#C7F711]/15">
                    <TrendingUp className="w-5 h-5 text-[#C7F711]" />
                  </div>
                  <h3 className="font-semibold text-[#E8E9E8]">Emotional Intensity</h3>
                </div>
                <p className="text-4xl font-bold text-[#A9F42C]">{episode.emotionalIntensity}</p>
                <p className="text-sm text-[#E8E9E8]/60 mt-1">Peak engagement</p>
              </motion.div>

              <motion.div
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#C7F711]/15">
                    <CheckCircle className="w-5 h-5 text-[#C7F711]" />
                  </div>
                  <h3 className="font-semibold text-[#E8E9E8]">Retention</h3>
                </div>
                <p className="text-4xl font-bold text-[#8CB535]">{episode.engagement}</p>
                <p className="text-sm text-[#E8E9E8]/60 mt-1">Predicted rate</p>
              </motion.div>
            </div>

            {/* Emotion Curve Graph */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#E8E9E8] mb-4">Emotion Curve</h3>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emotionCurveData}>
                      <defs>
                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C7F711" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C7F711" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(199, 247, 17, 0.1)" />
                      <XAxis
                        dataKey="time"
                        stroke="#E8E9E8"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        stroke="#E8E9E8"
                        style={{ fontSize: "12px" }}
                        domain={[0, 10]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0E1921",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          color: "#E8E9E8",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="intensity"
                        stroke="#C7F711"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIntensity)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Engagement Prediction */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#E8E9E8] mb-4">Engagement Prediction</h3>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(199, 247, 17, 0.1)" />
                      <XAxis
                        dataKey="segment"
                        stroke="#E8E9E8"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        stroke="#E8E9E8"
                        style={{ fontSize: "12px" }}
                        domain={[85, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0E1921",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          color: "#E8E9E8",
                        }}
                        formatter={(value) => [`${value}%`, "Retention"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="retention"
                        stroke="#A9F42C"
                        strokeWidth={3}
                        dot={{
                          fill: "#A9F42C",
                          r: 6,
                          strokeWidth: 2,
                          stroke: "#0E1921",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div>
              <h3 className="text-xl font-bold text-[#E8E9E8] mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[#C7F711]" />
                AI Optimization Suggestions
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors">
                        {suggestion.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          suggestion.impact === "High"
                            ? "bg-[#C7F711]/20 text-[#C7F711] border border-[#C7F711]/50"
                            : "bg-[#8CB535]/20 text-[#8CB535] border border-[#8CB535]/50"
                        }`}
                      >
                        {suggestion.impact} Impact
                      </span>
                    </div>
                    <p className="text-[#E8E9E8]/70 mb-4">{suggestion.description}</p>
                    <motion.button
                      className="px-4 py-2 bg-[#C7F711]/20 border border-[#C7F711]/50 text-[#C7F711] rounded-lg hover:bg-[#C7F711]/30 transition-all duration-300 text-sm font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply Suggestion
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
