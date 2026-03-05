import { motion, useScroll, useTransform } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "../contexts/UserContext";
import { UserSettingsDialog } from "./UserSettingsDialog";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(14, 25, 33, 0)", "rgba(14, 25, 33, 0.8)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg border-b border-[#C7F711]/20 shadow-lg shadow-[#C7F711]/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="group">
            <motion.h1
              className="text-2xl font-bold tracking-[0.3em] text-[#E8E9E8] relative font-orbitron"
              style={{ textShadow: "0 0 20px rgba(199,247,17,0)" }}
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 20px rgba(199,247,17,0.4)",
              }}
            >
              THEVBOX
              <motion.div
                className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-[#C7F711] to-[#A9F42C]"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-[#E8E9E8]/80 hover:text-[#C7F711] transition-colors duration-300 relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C7F711] group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="text-[#E8E9E8]/80 hover:text-[#C7F711] transition-colors duration-300 relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C7F711] group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#pricing"
              className="text-[#E8E9E8]/80 hover:text-[#C7F711] transition-colors duration-300 relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C7F711] group-hover:w-full transition-all duration-300" />
            </a>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative w-10 h-10 rounded-full border border-[#C7F711]/30 hover:border-[#C7F711] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#C7F711] transition-all duration-300">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user.profilePic} alt={user.username} className="object-cover" />
                    <AvatarFallback className="bg-[#0E1921] text-[#C7F711]">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#0E1921] border border-[#C7F711]/20 text-[#E8E9E8]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground text-[#E8E9E8]/60">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#C7F711]/10" />
                <DropdownMenuItem className="cursor-pointer hover:bg-[#C7F711]/10 focus:bg-[#C7F711]/10 focus:text-[#C7F711]" onClick={() => navigate('/dashboard')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-[#C7F711]/10 focus:bg-[#C7F711]/10 focus:text-[#C7F711]" onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#C7F711]/10" />
                <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-400" onClick={() => navigate('/')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#C7F711]">
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}