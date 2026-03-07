import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Upload, Sparkles, Target, Lightbulb, RefreshCw, ChevronDown } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Script",
    description: "Drop your story, script, or manuscript in any format. PDF, TXT, or paste directly.",
    details: "You can securely upload files up to 50MB. We support multi-file uploads and auto-formatting. Our ingestion engine strips out formatting artifacts, standardizes the text, and prepares it for deep learning analysis."
  },
  {
    icon: Sparkles,
    title: "AI Segments the Story",
    description: "Our AI analyzes narrative structure, pacing, and emotional beats to create natural episode breaks.",
    details: "Powered by LLMs fine-tuned on thousands of successful episodic scripts, the engine maps out story arcs, character developments, and subplots to find the absolute perfect points for an episode break."
  },
  {
    icon: Target,
    title: "Cliffhanger Score Generated",
    description: "Get data-driven scores for each episode ending's engagement potential and viewer retention.",
    details: "Scores are calculated based on unresolved conflicts, emotional tension, and narrative stakes. The dashboard visualizes these metrics to help you gauge whether an audience is likely to automatically click 'Next Episode'."
  },
  {
    icon: Lightbulb,
    title: "Episode Optimization Suggestions",
    description: "Receive AI-powered recommendations to strengthen hooks, improve pacing, and maximize impact.",
    details: "Our intelligent coach points out structural weaknesses, suggests moving specific scenes forward or backward, and highlights dialogue that can be sharper to enhance the overall episode rhythm."
  },
  {
    icon: RefreshCw,
    title: "Iterative Re-Scoring",
    description: "Apply AI suggestions to your script and instantly regenerate all metrics to see exactly how each change improves your score.",
    details: "Once you apply any AI-recommended edit — sharpening a cliffhanger, adjusting pacing, or deepening a character beat — TheVbox re-runs the full analytics pipeline on the updated script. Every score refreshes: cliffhanger ratings, emotion curves, retention probability. Compare before-and-after snapshots and keep refining until your metrics match your creative vision."
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080d11 0%, #060b0f 100%)" }}
    >
      {/* Background Grid — base dim layer */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.07 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(199,247,17,0.18) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(199,247,17,0.18) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>



      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#C7F711]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#E8E9E8] mb-6">
            How It <span className="text-[#C7F711]">Works</span>
          </h2>
          <p className="text-xl text-[#E8E9E8]/70 max-w-2xl mx-auto">
            Transform your creative content into episodic gold in five simple steps
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C7F711]/20 via-[#C7F711]/50 to-[#C7F711]/20 hidden lg:block" />

          {/* Animated flowing dots on timeline */}
          {isInView && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 w-2 h-2 rounded-full bg-[#C7F711] hidden lg:block"
                  style={{ x: "-50%" }}
                  animate={{
                    y: ["0%", "100%"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 1.3,
                  }}
                />
              ))}
            </>
          )}

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7 }}
              >
                {/* Content Card */}
                <div className="flex-1 w-full">
                  <motion.div
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                    className="relative p-6 sm:p-8 rounded-2xl bg-[#314A52]/70 backdrop-blur-md border border-[#C7F711]/10 hover:border-[#C7F711]/30 transition-all duration-300 group cursor-pointer overflow-hidden"
                    whileHover={{ 
                      scale: 1.01,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    }}
                    layout
                  >
                    {/* Soft gradient hover effect instead of bright glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C7F711]/0 to-[#C7F711]/0 group-hover:from-[#C7F711]/5 group-hover:to-[#A9F42C]/5 transition-all duration-500" />
                    
                    <motion.div className="relative z-10" layout>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-[#0E1921]/50 border border-[#C7F711]/20 group-hover:border-[#C7F711]/40 transition-colors duration-300">
                            <step.icon className="w-6 h-6 text-[#C7F711]" />
                          </div>
                          <span className="text-4xl sm:text-5xl font-bold text-[#C7F711]/20 font-mono">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <motion.div 
                          animate={{ rotate: activeStep === index ? 180 : 0 }}
                          className="p-2 text-[#C7F711]/50 group-hover:text-[#C7F711] transition-colors"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                      
                      <motion.h3 layout className="text-xl sm:text-2xl font-bold text-[#E8E9E8] mb-3">
                        {step.title}
                      </motion.h3>
                      <motion.p layout className="text-[#E8E9E8]/70 leading-relaxed">
                        {step.description}
                      </motion.p>

                      <AnimatePresence>
                        {activeStep === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-[#C7F711]/10">
                              <p className="text-[#E8E9E8]/90 text-sm sm:text-base leading-relaxed">
                                {step.details}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>


                  </motion.div>
                </div>

                {/* Center Node */}
                <div className="hidden lg:flex items-center justify-center w-24 shrink-0">
                  <motion.div
                    className="relative w-7 h-7 rounded-full bg-[#0E1921] border-2 border-[#C7F711] flex items-center justify-center z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C7F711]" />
                  </motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 w-full hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
