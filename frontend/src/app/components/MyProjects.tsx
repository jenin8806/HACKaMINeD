import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";

const mockProjects = [
  {
    id: 1,
    title: "The Midnight Chronicles",
    date: "March 2, 2026",
    summary: "A thrilling mystery series set in a noir-inspired city where nothing is as it seems...",
    cliffhangerScore: 9.2,
    episodes: 5,
  },
  {
    id: 2,
    title: "Echoes of Tomorrow",
    date: "March 1, 2026",
    summary: "Sci-fi drama exploring the consequences of time travel on a family torn apart...",
    cliffhangerScore: 8.7,
    episodes: 4,
  },
  {
    id: 3,
    title: "The Last Sanctuary",
    date: "February 28, 2026",
    summary: "Post-apocalyptic survival story following a group seeking refuge in dangerous territory...",
    cliffhangerScore: 8.9,
    episodes: 6,
  },
  {
    id: 4,
    title: "Whispers in the Code",
    date: "February 25, 2026",
    summary: "Tech thriller about a programmer who discovers a mysterious AI with its own agenda...",
    cliffhangerScore: 9.5,
    episodes: 3,
  },
  {
    id: 5,
    title: "Hearts Unbound",
    date: "February 20, 2026",
    summary: "Romantic drama set against the backdrop of a revolution that changes everything...",
    cliffhangerScore: 7.8,
    episodes: 4,
  },
  {
    id: 6,
    title: "Shadow Protocol",
    date: "February 15, 2026",
    summary: "Espionage action series with international intrigue and unexpected betrayals...",
    cliffhangerScore: 9.1,
    episodes: 7,
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

export function MyProjects() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0E1921 0%, #0d1520 100%)" }}>
      {/* Header */}
      <div className="bg-[#0E1921]/80 backdrop-blur-sm border-b border-white/[0.06] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[#C7F711] hover:text-[#A9F42C] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-[#E8E9E8]">My Projects</h1>
          <p className="text-[#E8E9E8]/60 mt-2">
            Manage and view all your analyzed scripts
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/project/${project.id}`}>
                <motion.div
                  className="relative h-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group cursor-pointer"
                  whileHover={{
                    scale: 1.02,
                    y: -3,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Subtle hover tint */}
                  <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/[0.02] transition-all duration-300" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#E8E9E8] group-hover:text-[#C7F711] transition-colors">
                        {project.title}
                      </h3>
                      <motion.div
                        className={`px-3 py-1 rounded-full border ${getScoreBgColor(
                          project.cliffhangerScore
                        )}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className={`text-sm font-bold ${getScoreColor(project.cliffhangerScore)}`}>
                          {project.cliffhangerScore}
                        </span>
                      </motion.div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-[#E8E9E8]/60 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{project.date}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-[#E8E9E8]/70 text-sm leading-relaxed mb-4 line-clamp-3">
                      {project.summary}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-[#E8E9E8]/60 text-sm">
                        <TrendingUp className="w-4 h-4 text-[#C7F711]" />
                        <span>{project.episodes} Episodes</span>
                      </div>
                      <span className="text-[#C7F711] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        View Details →
                      </span>
                    </div>
                  </div>


                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
