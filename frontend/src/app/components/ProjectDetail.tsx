import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const emotionData = [
  { point: "Opening", intensity: 6.5 },
  { point: "Act 1", intensity: 7.2 },
  { point: "Midpoint", intensity: 8.9 },
  { point: "Act 2", intensity: 7.5 },
  { point: "Climax", intensity: 9.5 },
  { point: "Resolution", intensity: 6.8 },
];

const mockProject = {
  id: 1,
  title: "The Midnight Chronicles",
  date: "March 2, 2026",
  summary:
    "A thrilling mystery series set in a noir-inspired city where nothing is as it seems. Detective Sarah Chen must navigate a web of corruption and supernatural elements to solve a series of murders that threaten to tear the city apart. As she digs deeper, she discovers that the line between reality and nightmare is thinner than she ever imagined.",
  cliffhangerScore: 9.2,
  episodes: 5,
  totalDuration: "52 minutes",
  averageEngagement: "94%",
};

export function ProjectDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1921] via-[#0E1921] to-[#243615]">
      {/* Header */}
      <div className="bg-[#0E1921]/50 backdrop-blur-sm border-b border-[#C7F711]/20 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[#C7F711] hover:text-[#A9F42C] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-5xl font-bold text-[#E8E9E8] mb-4">
                {mockProject.title}
              </h1>
              <div className="flex items-center gap-4 text-[#E8E9E8]/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{mockProject.date}</span>
                </div>
                <span>•</span>
                <span>{mockProject.episodes} Episodes</span>
                <span>•</span>
                <span>{mockProject.totalDuration}</span>
              </div>
            </div>

            {/* Overall Score Badge */}
            <motion.div
              className="px-8 py-6 rounded-2xl bg-gradient-to-br from-[#C7F711]/20 to-[#A9F42C]/20 border-2 border-[#C7F711]/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="text-sm text-[#E8E9E8]/70 mb-2">Overall Score</div>
                <div className="text-5xl font-bold text-[#C7F711] mb-1">
                  {mockProject.cliffhangerScore}
                </div>
                <div className="text-sm text-[#E8E9E8]/60">out of 10</div>
              </div>
            </motion.div>
          </div>

          <p className="text-lg text-[#E8E9E8]/80 leading-relaxed max-w-4xl">
            {mockProject.summary}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="p-6 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#C7F711]/20">
                <TrendingUp className="w-5 h-5 text-[#C7F711]" />
              </div>
              <h3 className="font-semibold text-[#E8E9E8]">Episodes</h3>
            </div>
            <p className="text-3xl font-bold text-[#C7F711]">{mockProject.episodes}</p>
            <p className="text-sm text-[#E8E9E8]/60 mt-1">Total segments</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#C7F711]/20">
                <Zap className="w-5 h-5 text-[#C7F711]" />
              </div>
              <h3 className="font-semibold text-[#E8E9E8]">Engagement</h3>
            </div>
            <p className="text-3xl font-bold text-[#C7F711]">{mockProject.averageEngagement}</p>
            <p className="text-sm text-[#E8E9E8]/60 mt-1">Predicted retention</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#C7F711]/20">
                <BarChart3 className="w-5 h-5 text-[#C7F711]" />
              </div>
              <h3 className="font-semibold text-[#E8E9E8]">Duration</h3>
            </div>
            <p className="text-3xl font-bold text-[#C7F711]">{mockProject.totalDuration}</p>
            <p className="text-sm text-[#E8E9E8]/60 mt-1">Total runtime</p>
          </div>
        </motion.div>

        {/* Emotion Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="p-8 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20">
            <h2 className="text-2xl font-bold text-[#E8E9E8] mb-6">
              Emotional Intensity Curve
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(199, 247, 17, 0.1)" />
                  <XAxis
                    dataKey="point"
                    stroke="#E8E9E8"
                    style={{ fontSize: "14px" }}
                  />
                  <YAxis
                    stroke="#E8E9E8"
                    style={{ fontSize: "14px" }}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#314A52",
                      border: "1px solid rgba(199, 247, 17, 0.3)",
                      borderRadius: "12px",
                      color: "#E8E9E8",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#C7F711"
                    strokeWidth={3}
                    dot={{
                      fill: "#C7F711",
                      r: 6,
                      strokeWidth: 2,
                      stroke: "#0E1921",
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#A9F42C",
                      stroke: "#C7F711",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Optimization Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#E8E9E8] mb-6">
            AI Optimization Suggestions
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Strengthen Opening Hook",
                desc: "Episode 1's opening could be more impactful. Consider starting with the discovery scene instead.",
                priority: "High",
              },
              {
                title: "Adjust Pacing in Act 2",
                desc: "The middle section could benefit from a faster pace to maintain momentum.",
                priority: "Medium",
              },
              {
                title: "Enhanced Character Development",
                desc: "Add more backstory for Sarah in Episode 2 to deepen emotional connection.",
                priority: "Medium",
              },
            ].map((suggestion, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-[#314A52]/50 backdrop-blur-sm border border-[#C7F711]/20 hover:border-[#C7F711]/50 transition-all duration-300 group"
                whileHover={{ x: 5 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors">
                        {suggestion.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          suggestion.priority === "High"
                            ? "bg-[#C7F711]/20 text-[#C7F711]"
                            : "bg-[#8CB535]/20 text-[#8CB535]"
                        }`}
                      >
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-[#E8E9E8]/70">{suggestion.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View Episodes Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center"
        >
          <Link to={`/project/${id}/episodes`}>
            <motion.button
              className="px-10 py-4 bg-[#C7F711] text-[#0E1921] rounded-xl font-semibold text-lg shadow-md shadow-[#C7F711]/20 hover:shadow-[#C7F711]/30 transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 12px 28px rgba(199, 247, 17, 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              View Episode Breakdown
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
