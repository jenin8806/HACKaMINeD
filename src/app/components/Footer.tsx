import { motion } from "motion/react";
import { Link } from "react-router";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#243615] to-[#0E1921] border-t border-[#C7F711]/20">
      {/* Glow divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C7F711] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Left - Logo & Tagline */}
          <div>
            <Link to="/">
              <h2 className="text-2xl font-bold tracking-[0.3em] text-[#E8E9E8] mb-4 font-orbitron">
                THEVBOX
              </h2>
            </Link>
            <p className="text-[#E8E9E8]/60 leading-relaxed">
              AI-powered episodic intelligence for storytellers and content creators.
            </p>
          </div>

          {/* Center - Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#C7F711] mb-4">Quick Links</h3>
            <nav className="space-y-3">
              <a
                href="#features"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                How It Works
              </a>
              <a
                href="#"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block text-[#E8E9E8]/70 hover:text-[#C7F711] transition-colors duration-300"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Right - Social */}
          <div>
            <h3 className="text-lg font-semibold text-[#C7F711] mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="p-3 rounded-lg border border-[#C7F711]/30 text-[#C7F711] hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="p-3 rounded-lg border border-[#C7F711]/30 text-[#C7F711] hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="p-3 rounded-lg border border-[#C7F711]/30 text-[#C7F711] hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="p-3 rounded-lg border border-[#C7F711]/30 text-[#C7F711] hover:bg-[#C7F711]/10 hover:border-[#C7F711] transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="pt-8 border-t border-[#C7F711]/10">
          <p className="text-center text-[#E8E9E8]/50 text-sm">
            © {new Date().getFullYear()} TheVbox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}