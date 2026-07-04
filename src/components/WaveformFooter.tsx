import React from "react";
import { AssistantState, GlowTheme } from "../types";
import { Power, Radio, Zap } from "lucide-react";

interface WaveformFooterProps {
  state: AssistantState;
  theme: GlowTheme;
  inputVolume: number; // 0 to 1
  outputVolume: number; // 0 to 1
  sessionDurationSec: number;
  onDisconnect: () => void;
}

export const WaveformFooter: React.FC<WaveformFooterProps> = ({
  state,
  inputVolume,
  outputVolume,
  sessionDurationSec,
  onDisconnect
}) => {
  const isOnline = state === "listening" || state === "speaking";
  const activeVol = state === "speaking" ? outputVolume : state === "listening" ? inputVolume : 0;

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Symmetric 15 bars — royal colors alternate: Electric Blue (high), Royal Purple (mid), Gold (low)
  const baseHeights = [10, 22, 38, 60, 82, 108, 78, 98, 78, 108, 82, 60, 38, 22, 10];

  const getBarColor = (idx: number, isActive: boolean): string => {
    if (!isActive) return "rgba(123,47,190,0.15)";
    if (idx % 3 === 0) return "#00BFFF";           // Electric Blue (high)
    if (idx % 3 === 1) return "#9B59B6";           // Royal Purple (mid)
    return "#FFD700";                               // Bright Gold (low)
  };

  const getBarGlow = (idx: number, isActive: boolean): string => {
    if (!isActive) return "none";
    if (idx % 3 === 0) return "0 0 8px rgba(0,191,255,0.6)";
    if (idx % 3 === 1) return "0 0 8px rgba(155,89,182,0.6)";
    return "0 0 8px rgba(255,215,0,0.5)";
  };

  return (
    <footer className="w-full px-4 md:px-8 pb-3 md:pb-4 pt-2 flex flex-col justify-end z-20 shrink-0">
      {/* Symmetric Waveform Equalizer */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-10 sm:h-12 mb-3 max-w-2xl mx-auto w-full">
        {baseHeights.map((bh, idx) => {
          const multiplier = isOnline ? 0.35 + activeVol * 1.6 : 0.15;
          const dynamicH = Math.min(100, Math.max(8, bh * multiplier));
          const barColor = getBarColor(idx, isOnline);
          const barGlow = getBarGlow(idx, isOnline);

          return (
            <div
              key={idx}
              className="rounded-full transition-all duration-100"
              style={{
                width: "5px",
                height: `${dynamicH}%`,
                background: barColor,
                boxShadow: barGlow,
                transition: "height 100ms ease, box-shadow 200ms ease"
              }}
            />
          );
        })}
      </div>

      {/* Futuristic Controls Bar */}
      <div
        className="flex flex-col sm:flex-row justify-between items-center gap-2.5 rounded-xl py-2.5 px-4 sm:px-5"
        style={{
          background: "rgba(10,10,20,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(123,47,190,0.25)",
          boxShadow: "0 0 30px rgba(123,47,190,0.08), inset 0 1px 0 rgba(255,215,0,0.05)"
        }}
      >
        {/* Left — Stream Status */}
        <div className="flex items-center gap-3">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: isOnline ? "rgba(0,71,255,0.15)" : "rgba(123,47,190,0.08)",
              border: isOnline ? "1px solid rgba(0,191,255,0.3)" : "1px solid rgba(123,47,190,0.2)"
            }}
          >
            <Radio
              className={`w-4 h-4 ${isOnline ? "animate-pulse" : ""}`}
              style={{ color: isOnline ? "#00BFFF" : "rgba(255,255,255,0.25)" }}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-[11px] sm:text-xs font-bold tracking-wider"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: isOnline ? "#00BFFF" : "rgba(155,89,182,0.6)"
              }}
            >
              {isOnline ? "BIDIRECTIONAL AUDIO LIVE" : "STREAM STANDBY"}
            </span>
            <span
              className="text-[9px] hidden sm:block"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,255,255,0.25)"
              }}
            >
              PCM16 16kHz MIC // WEB AUDIO 24kHz OUT
            </span>
          </div>
        </div>

        {/* Right — Session Timer + Disconnect */}
        <div className="flex items-center gap-5 sm:gap-7">
          {/* Session Timer */}
          <div className="flex flex-col items-center sm:items-end">
            <span
              className="text-[8px] font-bold uppercase tracking-widest"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,215,0,0.4)"
              }}
            >
              Session
            </span>
            <span
              className="text-sm sm:text-base font-bold"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: isOnline ? "#FFD700" : "rgba(255,255,255,0.2)",
                textShadow: isOnline ? "0 0 10px rgba(255,215,0,0.4)" : "none"
              }}
            >
              {formatTime(sessionDurationSec)}
            </span>
          </div>

          {/* Disconnect / Offline Button */}
          {isOnline ? (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer rounded-lg px-3.5 py-1.5"
              style={{
                background: "rgba(255,68,68,0.1)",
                border: "1px solid rgba(255,68,68,0.35)",
                color: "#FF8A8A",
                fontFamily: "'Space Mono', monospace"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.2)";
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 15px rgba(255,68,68,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.1)";
                (e.currentTarget as HTMLElement).style.color = "#FF8A8A";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <div
              className="px-3 py-1 rounded-lg text-xs"
              style={{
                background: "rgba(123,47,190,0.08)",
                border: "1px solid rgba(123,47,190,0.2)",
                fontFamily: "'Space Mono', monospace",
                color: "rgba(155,89,182,0.4)"
              }}
            >
              <Zap className="w-3 h-3 inline mr-1 opacity-50" />
              Offline
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
