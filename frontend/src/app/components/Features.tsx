import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
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
    detail:
      "TheVbox's Script Intelligence engine parses every line of dialogue, stage direction, and scene transition to build a complete structural map of your script. It identifies protagonist vs. antagonist tension, tracks character development across acts, flags pacing inconsistencies, and surfaces subtext patterns — giving you a showrunner-level read in seconds rather than days.",
    bg: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=60",
  },
  {
    icon: Scissors,
    title: "Auto-Episodic Segmentation",
    description:
      "Automatically identify the perfect natural break points, pacing rhythms, and episodic structure from any raw script or manuscript.",
    tag: "Segmentation",
    detail:
      "The segmentation model analyses scene density, act-break conventions, tension build-up, and natural breathing points in your narrative. Whether you're adapting a novel or splitting a feature film into a series, it proposes episode boundaries that maximise viewer suspense and feel native to the format — no manual cutting required.",
    bg: "https://images.unsplash.com/photo-1536240478700-b869ad10e128?auto=format&fit=crop&w=800&q=60",
  },
  {
    icon: TrendingUp,
    title: "Cliffhanger Scoring",
    description:
      "Get data-driven cliffhanger scores for every episode ending, quantifying engagement potential and viewer retention probability.",
    tag: "Analytics",
    detail:
      "Each episode ending receives a score from 0–100 based on unresolved stakes, emotional intensity, revelation density, and genre-specific benchmarks drawn from thousands of successful streaming titles. Low-scoring endings come with targeted rewrite suggestions so you can strengthen the hook before it ever reaches an audience.",
    bg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60",
  },
  {
    icon: Heart,
    title: "Emotion Curve Analysis",
    description:
      "Visualize your story's emotional journey across episodes. See intensity peaks, valleys, and ensure a gripping emotional arc.",
    tag: "Insights",
    detail:
      "The emotion engine runs sentiment and affect analysis on every scene, then plots the results as an interactive time-series chart across your full series. You can instantly spot flat mid-arcs that risk drop-off, over-dense trauma clusters that fatigue viewers, or missing cathartic beats — and compare your curve against genre-ideal templates.",
    bg: "https://images.unsplash.com/photo-1516655855035-d5215bcb5604?auto=format&fit=crop&w=800&q=60",
  },
  {
    icon: Lightbulb,
    title: "AI Optimization Engine",
    description:
      "Receive actionable AI suggestions to strengthen hooks, improve pacing, deepen character moments, and maximize viewer impact.",
    tag: "Optimization",
    detail:
      "Beyond analysis, TheVbox actively co-creates with you. The Optimization Engine generates specific, scene-level recommendations: sharpen this cold open, move this reveal two scenes earlier, add a micro-tension beat here. Each suggestion is ranked by predicted audience-impact score and can be accepted, dismissed, or used as a creative springboard.",
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60",
  },
  {
    icon: Download,
    title: "Export & Publish Ready",
    description:
      "One-click export of complete episodic breakdowns with all analytics — ready for production teams, streaming pitches, or publishers.",
    tag: "Export",
    detail:
      "Export your full analysis as a polished PDF deck, a structured JSON feed for your production pipeline, or a shareable web link for collaborators. Every export includes episode synopses, cliffhanger scores, emotion charts, and optimisation notes — formatted to impress commissioning editors, co-producers, or your own writing room.",
    bg: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=60",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0E1921 0%, #0d1520 100%)" }}
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

        {/* Fixed backdrop when a card is flipped */}
        <AnimatePresence>
          {expandedIndex !== null && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              style={{ zIndex: 40 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setExpandedIndex(null)}
            />
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const isFlipped = expandedIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative min-h-[280px]"
                style={{ perspective: "1200px", zIndex: isFlipped ? 50 : 10 }}
              >
                {/* 3D flip inner */}
                <motion.div
                  className="absolute inset-0 cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  onClick={() => setExpandedIndex(isFlipped ? null : index)}
                >
                  {/* ── Front face ── */}
                  <div
                    className="absolute inset-0 p-7 rounded-2xl border border-[#C7F711]/15 overflow-hidden group flex flex-col"
                    style={{
                      background: "rgba(49, 74, 82, 0.35)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Themed context bg — slides up from bottom on hover */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${feature.bg})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg, rgba(14,25,33,0.80) 0%, rgba(14,25,33,0.60) 100%)" }}
                      />
                    </div>
                    <div className="relative z-10 flex items-start justify-between mb-5">
                      <div
                        className="p-3 rounded-xl border border-[#C7F711]/20"
                        style={{ background: "rgba(199, 247, 17, 0.1)" }}
                      >
                        <feature.icon className="w-6 h-6 text-[#C7F711]" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs text-[#C7F711]/70 border border-[#C7F711]/20 bg-[#C7F711]/5">
                        {feature.tag}
                      </span>
                    </div>
                    <div className="relative z-10 flex-1">
                      <h3 className="text-xl font-bold text-[#E8E9E8] mb-3">{feature.title}</h3>
                      <p className="text-[#E8E9E8]/60 leading-relaxed text-sm">{feature.description}</p>
                    </div>
                    <p className="relative z-10 mt-4 text-[10px] text-[#C7F711]/30 tracking-widest text-right">click to explore →</p>
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#C7F711] to-[#A9F42C] rounded-full"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* ── Back face ── */}
                  <div
                    className="absolute inset-0 p-7 rounded-2xl border border-[#C7F711]/40 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "rgba(10, 21, 32, 0.97)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      boxShadow: "0 0 40px rgba(199,247,17,0.12), 0 24px 60px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                      <div
                        className="p-2.5 rounded-xl border border-[#C7F711]/30 flex-shrink-0"
                        style={{ background: "rgba(199, 247, 17, 0.12)" }}
                      >
                        <feature.icon className="w-5 h-5 text-[#C7F711]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#C7F711] tracking-widest uppercase">{feature.tag}</p>
                        <h3 className="text-base font-bold text-[#E8E9E8] leading-tight">{feature.title}</h3>
                      </div>
                    </div>
                    <div className="h-px bg-[#C7F711]/15 mb-4 flex-shrink-0" />
                    <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#C7F711]/20 scrollbar-track-transparent">
                      <p className="text-[#E8E9E8]/80 leading-relaxed text-sm">{feature.detail}</p>
                    </div>
                    <p className="mt-4 flex-shrink-0 text-[10px] text-[#C7F711]/30 tracking-widest text-right">← click to close</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
