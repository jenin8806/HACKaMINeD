import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { useUser } from "../contexts/UserContext";
import { Camera, User as UserIcon, Mail, Shield, Bell, CreditCard, X, Check } from "lucide-react";

const NAV_TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export function UserSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ username, email, profilePic });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = username.substring(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl w-full bg-[#0A1520] border border-white/10 text-[#E8E9E8] overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold text-[#E8E9E8]">Account Settings</h2>
            <p className="text-xs text-[#E8E9E8]/40 mt-0.5">Manage your profile and preferences</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-[#E8E9E8]/40 hover:text-[#E8E9E8] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex min-h-[420px]">
          {/* Left Sidebar Nav */}
          <div className="w-44 border-r border-white/5 bg-[#070f18] py-4 flex flex-col gap-1 px-3 flex-shrink-0">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all w-full text-left ${
                  activeTab === tab.id
                    ? "bg-[#C7F711]/10 text-[#C7F711] font-medium"
                    : "text-[#E8E9E8]/50 hover:bg-white/5 hover:text-[#E8E9E8]"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Panel */}
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C7F711]/20 bg-[#1A262E]">
                      {profilePic ? (
                        <img src={profilePic} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#C7F711]/20 to-[#A9F42C]/20 flex items-center justify-center text-[#C7F711] text-2xl font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#E8E9E8]">{username || "Username"}</p>
                    <p className="text-xs text-[#E8E9E8]/50 mt-0.5">{email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#C7F711]/10 text-[#C7F711] border border-[#C7F711]/20">
                      {user.plan}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5" /> Display Name
                    </label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5" /> Profile Picture URL
                    </label>
                    <input
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 focus:ring-1 focus:ring-[#C7F711]/20 transition-all"
                    />
                    <p className="text-[10px] text-[#E8E9E8]/30">Paste any publicly accessible image URL</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <p className="text-xs text-[#E8E9E8]/40 uppercase tracking-wider font-medium">Email Notifications</p>
                {[
                  { label: "Analysis Complete", desc: "Get notified when your script analysis is done" },
                  { label: "Episode Suggestions", desc: "Weekly AI-powered content optimization tips" },
                  { label: "Product Updates", desc: "New features and platform improvements" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#1A262E]/50 border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-[#E8E9E8]">{item.label}</p>
                      <p className="text-xs text-[#E8E9E8]/50 mt-0.5">{item.desc}</p>
                    </div>
                    <button className="mt-0.5 w-9 h-5 rounded-full bg-[#C7F711]/20 border border-[#C7F711]/30 flex items-center justify-end pr-0.5 transition-colors hover:bg-[#C7F711]/30 flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-[#C7F711]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#C7F711]/5 to-transparent border border-[#C7F711]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#C7F711]">Pro Plan</p>
                      <p className="text-xs text-[#E8E9E8]/50 mt-0.5">Renews March 5, 2027</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-[#C7F711] text-[#0E1921] font-bold">ACTIVE</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#1A262E]/50 border border-white/5 text-sm text-[#E8E9E8]/60">
                  Payment method ending in <span className="text-[#E8E9E8]">••• 4242</span>
                </div>
                <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-[#E8E9E8]/70 hover:bg-white/5 hover:text-[#E8E9E8] transition-colors">
                  Manage Subscription
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#E8E9E8]/60 uppercase tracking-wider">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-xl bg-[#1A262E] border border-white/10 text-sm text-[#E8E9E8] placeholder:text-[#E8E9E8]/30 focus:outline-none focus:border-[#C7F711]/50 transition-all" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#070f18]">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-sm text-[#E8E9E8]/60 hover:text-[#E8E9E8] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-[#C7F711] text-[#0E1921] hover:bg-[#A9F42C]"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}