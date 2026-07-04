import React from "react";
import { AssistantState, GlowTheme } from "../types";
import { Volume2, VolumeX, Sparkles, Brain, Crown } from "lucide-react";

interface NavbarProps {
  state: AssistantState;
  theme: GlowTheme;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInfo: () => void;
  onOpenMemoryStorage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  isMuted,
  onToggleMute,
  onOpenInfo,
  onOpenMemoryStorage
}) => {
  const isOnline = state === "listening" || state === "speaking";

  return (
    <nav
      className="flex justify-between items-center px-6 md:px-12 py-5 z-20 shrink-0"
      style={{
        borderBottom: "1px solid rgba(123,47,190,0.15)",
        background: "rgba(5,5,8,0.6)",
        backdropFilter: "blur(20px)"
      }}
    >
      {/* === BRAND LOGO === */}
      <div className="flex items-center gap-3">
        {/* Crown Logo Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4A1080, #7B2FBE, #6C3483)",
            border: "1px solid rgba(255,215,0,0.35)",
            boxShadow: "0 0 20px rgba(123,47,190,0.5), 0 0 8px rgba(255,215,0,0.2)"
          }}
        >
          {/* Golden shimmer overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(135deg, transparent 30%, rgba(255,215,0,0.4) 50%, transparent 70%)",
            }}
          />
          <Crown className="w-5 h-5 relative z-10" style={{ color: "#FFD700" }} />
        </div>

        {/* Title block */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span
              className="text-2xl font-black tracking-tight text-golden-shimmer"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Suhani AI
            </span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest"
              style={{
                background: "rgba(0,71,255,0.15)",
                border: "1px solid rgba(0,191,255,0.3)",
                color: "#00BFFF"
              }}
            >
              v3.1-LIVE
            </span>
          </div>
          <span
            className="text-[10px] hidden sm:block tracking-wide"
            style={{ color: "rgba(155,89,182,0.7)", fontFamily: "'Space Mono', monospace" }}
          >
            Royal Neural Voice Companion
          </span>
        </div>
      </div>

      {/* === RIGHT CONTROLS === */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Status Pill */}
        <div
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full shrink-0"
          style={{
            background: "rgba(123,47,190,0.1)",
            border: isOnline
              ? "1px solid rgba(0,191,255,0.4)"
              : state === "connecting"
              ? "1px solid rgba(255,215,0,0.4)"
              : "1px solid rgba(123,47,190,0.25)",
            backdropFilter: "blur(12px)"
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline
                ? "animate-pulse"
                : state === "connecting"
                ? "animate-ping"
                : ""
            }`}
            style={{
              background: isOnline
                ? "#00BFFF"
                : state === "connecting"
                ? "#FFD700"
                : "rgba(255,255,255,0.2)",
              boxShadow: isOnline
                ? "0 0 8px rgba(0,191,255,0.7)"
                : state === "connecting"
                ? "0 0 8px rgba(255,215,0,0.7)"
                : "none"
            }}
          />
          <span
            className="text-[10px] md:text-xs font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: isOnline
                ? "#00BFFF"
                : state === "connecting"
                ? "#FFD700"
                : "rgba(255,255,255,0.3)"
            }}
          >
            {isOnline ? "Live Link Active" : state === "connecting" ? "Establishing" : "Standby"}
          </span>
        </div>

        {/* Audio Mute Toggle */}
        {isOnline && (
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute Suhani" : "Mute Suhani"}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isMuted ? "rgba(255,68,68,0.1)" : "rgba(123,47,190,0.1)",
              border: isMuted ? "1px solid rgba(255,68,68,0.5)" : "1px solid rgba(123,47,190,0.35)",
              color: isMuted ? "#FF6B6B" : "rgba(155,89,182,0.9)"
            }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Memory Storage Button */}
        <button
          onClick={onOpenMemoryStorage}
          id="memory-storage-button"
          title="Open Neural Memory Vault"
          className="px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(74,16,128,0.6), rgba(123,47,190,0.6), rgba(0,71,255,0.4))",
            border: "1px solid rgba(155,89,182,0.45)",
            boxShadow: "0 0 15px rgba(123,47,190,0.2)",
            fontFamily: "'Outfit', sans-serif"
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px rgba(255,215,0,0.3), 0 0 10px rgba(123,47,190,0.4)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,215,0,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 15px rgba(123,47,190,0.2)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(155,89,182,0.45)";
          }}
        >
          <Brain className="w-4 h-4" style={{ color: "#FFD700" }} />
          <span>Memory Vault</span>
        </button>

        {/* Info Button */}
        <button
          onClick={onOpenInfo}
          title="Architecture Info"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(0,71,255,0.08)",
            border: "1px solid rgba(0,71,255,0.3)",
            color: "rgba(0,191,255,0.8)"
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,71,255,0.15)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 15px rgba(0,71,255,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,71,255,0.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
