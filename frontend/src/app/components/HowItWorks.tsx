import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Upload, Sparkles, Target, Lightbulb, Send, ChevronDown } from "lucide-react";

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
    details: "Powered by custom LLMs fine-tuned on thousands of successful episodic scripts, the engine maps out story arcs, character developments, and subplots to find the absolute perfect points for an episode break."
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
    icon: Send,
    title: "Export & Publish",
    description: "Download your episodic breakdown with all analytics, ready for production or pitching.",
    details: "Export cleanly to industry-standard formats including Final Draft, PDF, or interactive web presentations. Generate executive summaries for producers and full breakdowns for writers rooms."
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
      className="relative py-24 lg:py-32 bg-[#0E1921] overflow-hidden"
    >
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(199, 247, 17, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(199, 247, 17, 0.1) 1px, transparent 1px)`,
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
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Content Card */}
                <div className="flex-1 w-full">
                  <motion.div
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                    className="relative p-6 sm:p-8 rounded-2xl bg-[#314A52]/70 backdrop-blur-md border border-[#C7F711]/10 hover:border-[#C7F711]/30 transition-all duration-300 group cursor-pointer overflow-hidden"
                    whileHover={{ 
                      scale: 1.01,
                      boxShadow: "0 10px 30px rgba(199, 247, 17, 0.05)",
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

                    {/* Extremely subtle pulse animation, almost unnoticeable to fix harshness */}
                    <motion.div
                      className="absolute -inset-1 rounded-2xl bg-[#C7F711]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      animate={{
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Center Node */}
                <div className="hidden lg:flex items-center justify-center w-24 shrink-0">
                  <motion.div
                    className="relative w-12 h-12 rounded-full bg-[#0E1921] border-4 border-[#C7F711] flex items-center justify-center z-10"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-[#C7F711]"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Pulse rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#C7F711]"
                      animate={{
                        scale: [1, 2, 2],
                        opacity: [0.5, 0, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
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
