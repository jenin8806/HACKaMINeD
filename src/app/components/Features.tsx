import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Brain,
  Scissors,
  TrendingUp,
  Heart,
  Lightbulb,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Script Intelligence",
    description:
      "Deep AI analysis of your narrative structure, character arcs, and story beats — understanding your story the way a seasoned showrunner would.",
    tag: "AI Core",
  },
  {
    icon: Scissors,
    title: "Auto-Episodic Segmentation",
    description:
      "Automatically identify the perfect natural break points, pacing rhythms, and episodic structure from any raw script or manuscript.",
    tag: "Segmentation",
  },
  {
    icon: TrendingUp,
    title: "Cliffhanger Scoring",
    description:
      "Get data-driven cliffhanger scores for every episode ending, quantifying engagement potential and viewer retention probability.",
    tag: "Analytics",
  },
  {
    icon: Heart,
    title: "Emotion Curve Analysis",
    description:
      "Visualize your story's emotional journey across episodes. See intensity peaks, valleys, and ensure a gripping emotional arc.",
    tag: "Insights",
  },
  {
    icon: Lightbulb,
    title: "AI Optimization Engine",
    description:
      "Receive actionable AI suggestions to strengthen hooks, improve pacing, deepen character moments, and maximize viewer impact.",
    tag: "Optimization",
  },
  {
    icon: Download,
    title: "Export & Publish Ready",
    description:
      "One-click export of complete episodic breakdowns with all analytics — ready for production teams, streaming pitches, or publishers.",
    tag: "Export",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0E1921 0%, #111f14 100%)" }}
    >
      {/* Background glow accents */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(199,247,17,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(169,244,44,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs tracking-widest text-[#C7F711] border border-[#C7F711]/30 bg-[#C7F711]/10 mb-6 uppercase"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Platform Features
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#E8E9E8] mb-6">
            Everything You Need to{" "}
            <span className="text-[#C7F711]">Dominate</span> Streaming
          </h2>
          <p className="text-xl text-[#E8E9E8]/60 max-w-2xl mx-auto">
            TheVbox combines cinematic storytelling expertise with cutting-edge AI to help creators
            produce binge-worthy content at scale.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl border border-[#C7F711]/15 backdrop-blur-sm cursor-default overflow-hidden"
              style={{ background: "rgba(49, 74, 82, 0.35)" }}
              whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: "0 20px 50px rgba(199, 247, 17, 0.1)",
                borderColor: "rgba(199, 247, 17, 0.4)",
              }}
            >
              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(199,247,17,0.06) 0%, rgba(169,244,44,0.04) 100%)"
                }}
              />

              {/* Top row: icon + tag */}
              <div className="relative z-10 flex items-start justify-between mb-5">
                <div
                  className="p-3 rounded-xl border border-[#C7F711]/20 group-hover:border-[#C7F711]/50 transition-colors duration-300"
                  style={{ background: "rgba(199, 247, 17, 0.1)" }}
                >
                  <feature.icon className="w-6 h-6 text-[#C7F711]" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs text-[#C7F711]/70 border border-[#C7F711]/20 bg-[#C7F711]/5">
                  {feature.tag}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-[#E8E9E8] mb-3 group-hover:text-[#C7F711] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#E8E9E8]/60 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#C7F711] to-[#A9F42C] rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
