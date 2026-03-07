import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for exploring AI episodic intelligence.",
    features: [
      "3 script analyses/month",
      "Episode segmentation",
      "Basic cliffhanger scores",
      "PDF export",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Creator",
    price: "₹499",
    period: "/mo",
    description: "For serious storytellers and content creators.",
    features: [
      "Unlimited script analyses",
      "Advanced AI segmentation",
      "Full cliffhanger analytics",
      "Emotion curve graphs",
      "AI optimization suggestions",
      "Priority support",
    ],
    cta: "Start Creating",
    highlight: true,
  },
  {
    name: "Studio",
    price: "₹1,299",
    period: "/mo",
    description: "For production teams and professional studios.",
    features: [
      "Everything in Creator",
      "Team collaboration (5 seats)",
      "Custom AI training",
      "API access",
      "White-label exports",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="pricing"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0E1921 0%, #0a1610 100%)" }}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(199,247,17,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
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
            Pricing
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#E8E9E8] mb-6">
            Simple, <span className="text-[#C7F711]">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-[#E8E9E8]/60 max-w-2xl mx-auto">
            Start free, scale as your story grows. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className={`relative rounded-2xl p-8 border ${
                plan.highlight
                  ? "border-[#C7F711]/60"
                  : "border-[#C7F711]/15"
              }`}
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, rgba(49,74,82,0.7) 0%, rgba(36,54,21,0.7) 100%)"
                  : "rgba(49,74,82,0.35)",
                backdropFilter: "blur(12px)",
                boxShadow: plan.highlight
                  ? "0 0 30px rgba(199,247,17,0.07), 0 16px 32px rgba(0,0,0,0.35)"
                  : "none",
              }}
              whileHover={{
                y: -6,
                boxShadow: plan.highlight
                  ? "0 0 30px rgba(199,247,17,0.10), 0 20px 40px rgba(0,0,0,0.35)"
                  : "0 12px 30px rgba(0,0,0,0.25)",
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C7F711] text-[#0E1921] text-xs font-bold">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#E8E9E8] mb-1">{plan.name}</h3>
                <p className="text-[#E8E9E8]/50 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-5xl font-bold font-orbitron"
                    style={{
                      color: plan.highlight ? "#C7F711" : "#E8E9E8",
                      textShadow: plan.highlight ? "0 0 20px rgba(199,247,17,0.4)" : "none",
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[#E8E9E8]/40 text-lg">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(199,247,17,0.15)" }}
                    >
                      <Check className="w-3 h-3 text-[#C7F711]" />
                    </div>
                    <span className="text-[#E8E9E8]/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  plan.highlight
                    ? "bg-[#C7F711] text-[#0E1921] hover:bg-[#A9F42C]"
                    : "border border-[#C7F711]/40 text-[#C7F711] hover:bg-[#C7F711]/10 hover:border-[#C7F711]"
                }`}
                style={
                  plan.highlight
                    ? { boxShadow: "0 4px 14px rgba(199,247,17,0.12)" }
                    : {}
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
