import React from "react";
import { GlowTheme, SessionStats } from "../types";
import { Globe, Brain, Zap, MessageSquareHeart } from "lucide-react";

interface SideIndicatorsProps {
  stats: SessionStats;
  theme: GlowTheme;
}

export const SideIndicators: React.FC<SideIndicatorsProps> = ({ stats }) => {
  return (
    <>
      {/* Left HUD Panel */}
      <div className="hidden xl:flex absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-10 select-none pointer-events-none">
        {/* Web Search Tool */}
        <div
          className="pointer-events-auto p-4 rounded-2xl w-52 transition-all duration-300"
          style={{
            background: "rgba(0,47,128,0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,191,255,0.2)",
            boxShadow: "0 0 20px rgba(0,71,255,0.08)"
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,47,128,0.18)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,191,255,0.4)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px rgba(0,71,255,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,47,128,0.1)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,191,255,0.2)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,71,255,0.08)";
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5" style={{ color: "#00BFFF" }} />
            <p
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: "#00BFFF", fontFamily: "'Space Mono', monospace" }}
            >
              Web Search Tool
            </p>
          </div>
          <p className="text-xs" style={{ color: "rgba(180,220,255,0.65)", fontFamily: "'Outfit', sans-serif" }}>
            Ready to launch browser portals & fetch live links
          </p>
        </div>

        {/* Context Memory */}
        <div
          className="pointer-events-auto p-4 rounded-2xl w-52 transition-all duration-300"
          style={{
            background: "rgba(74,16,128,0.12)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(155,89,182,0.3)",
            boxShadow: "0 0 20px rgba(123,47,190,0.12)"
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,215,0,0.35)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px rgba(255,215,0,0.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(155,89,182,0.3)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(123,47,190,0.12)";
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-3.5 h-3.5" style={{ color: "#FFD700" }} />
            <p
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: "#FFD700", fontFamily: "'Space Mono', monospace" }}
            >
              Context Memory
            </p>
          </div>
          <p className="text-xs" style={{ color: "rgba(220,200,255,0.65)", fontFamily: "'Outfit', sans-serif" }}>
            Continuous audio session stream retention active
          </p>
        </div>
      </div>

      {/* Right HUD Panel */}
      <div className="hidden xl:flex absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-10 select-none pointer-events-none">
        <div
          className="pointer-events-auto p-5 rounded-3xl w-56 space-y-5"
          style={{
            background: "rgba(10,10,20,0.65)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(123,47,190,0.25)",
            boxShadow: "0 0 30px rgba(123,47,190,0.1), inset 0 1px 0 rgba(255,215,0,0.05)"
          }}
        >
          {/* Latency Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5"
                style={{ color: "#00BFFF", fontFamily: "'Space Mono', monospace" }}
              >
                <Zap className="w-3 h-3" /> Latency
              </span>
              <span
                className="text-[10px] font-bold"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#FFD700",
                  textShadow: "0 0 8px rgba(255,215,0,0.4)"
                }}
              >
                {stats.latencyMs}ms
              </span>
            </div>

            {/* Equalizer bars — Electric Blue + Royal Purple + Gold */}
            <div className="flex items-end gap-1.5 h-8">
              {[
                { base: 25, vol: stats.outputVolume, color: "#0047FF", glow: "rgba(0,71,255,0.4)" },
                { base: 40, vol: stats.inputVolume, color: "#7B2FBE", glow: "rgba(123,47,190,0.4)" },
                { base: 65, vol: 0.5, color: "#FFD700", glow: "rgba(255,215,0,0.4)", pulse: true },
                { base: 30, vol: stats.outputVolume, color: "#7B2FBE", glow: "rgba(123,47,190,0.4)" },
                { base: 50, vol: stats.inputVolume, color: "#0047FF", glow: "rgba(0,71,255,0.4)" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-sm transition-all duration-300 ${bar.pulse ? "animate-pulse" : ""}`}
                  style={{
                    height: `${bar.base + bar.vol * 60}%`,
                    background: bar.color,
                    boxShadow: `0 0 6px ${bar.glow}`
                  }}
                />
              ))}
            </div>
            <p
              className="text-[10px] mt-2"
              style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace" }}
            >
              Ultra-Low Latency PCM16
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(123,47,190,0.2)" }} />

          {/* Voice Tone */}
          <div>
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-2.5 flex items-center gap-1.5"
              style={{ color: "#9B59B6", fontFamily: "'Space Mono', monospace" }}
            >
              <MessageSquareHeart className="w-3 h-3" style={{ color: "#FFD700" }} /> Voice Tone
            </p>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium inline-block"
              style={{
                background: "rgba(123,47,190,0.2)",
                border: "1px solid rgba(155,89,182,0.4)",
                color: "rgba(220,200,255,0.9)",
                boxShadow: "0 0 10px rgba(123,47,190,0.15)"
              }}
            >
              ✦ Playful, Witty & Warm
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
