import React from "react";
import { Cpu, Mic, Volume2, Wrench, Shield, X, Radio, Crown, Zap } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cards = [
    {
      icon: <Cpu className="w-5 h-5" />,
      iconBg: "rgba(0,71,255,0.15)",
      iconBorder: "rgba(0,191,255,0.3)",
      iconColor: "#00BFFF",
      title: "Gemini 3.1 Flash Live Preview",
      body: "Operates exclusively in audio-to-audio modality via continuous WebSocket proxy. Zero text generation delay. Features human-like pacing, witty personality, natural interruptions, and emotional inflection."
    },
    {
      icon: <Mic className="w-5 h-5" />,
      iconBg: "rgba(74,16,128,0.15)",
      iconBorder: "rgba(155,89,182,0.35)",
      iconColor: "#9B59B6",
      title: "PCM16 16kHz Stream & Equalizer",
      body: "Raw microphone audio is captured via Web Audio ScriptProcessor, encoded as Int16 Little-Endian PCM at 16,000Hz, and streamed in real time over TLS. Input RMS drives dynamic HUD ring scaling."
    },
    {
      icon: <Volume2 className="w-5 h-5" />,
      iconBg: "rgba(255,215,0,0.08)",
      iconBorder: "rgba(255,215,0,0.25)",
      iconColor: "#FFD700",
      title: "Web Audio Gapless 24kHz Player",
      body: "Incoming audio turn chunks are decoded to Float32 and scheduled gaplessly on a 24,000Hz AudioContext clock. Instant interruption cancellation clears audio queues on user speech cutoff."
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      iconBg: "rgba(123,47,190,0.12)",
      iconBorder: "rgba(155,89,182,0.25)",
      iconColor: "#C084FC",
      title: "Autonomous Function Calling",
      body: (
        <span>
          Suhani AI autonomously triggers client tools:{" "}
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#FFD700" }}>openWebsite</span>,{" "}
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#00BFFF" }}>changeUiColor</span>,{" "}
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#9B59B6" }}>showHolographicCard</span>, and{" "}
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#FFD700" }}>triggerSpecialEffect</span>{" "}
          (particle confetti).
        </span>
      )
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(5,5,8,0.88)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative w-full max-w-xl text-white max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(145deg, #0A0A18, #0D0820, #080A18)",
          border: "1px solid rgba(123,47,190,0.4)",
          boxShadow: "0 0 80px rgba(123,47,190,0.2), 0 0 40px rgba(0,71,255,0.1), inset 0 1px 0 rgba(255,215,0,0.06)"
        }}
      >
        {/* Decorative corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #FFD700, transparent)" }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between mb-7 pb-5"
          style={{ borderBottom: "1px solid rgba(123,47,190,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #4A1080, #7B2FBE)",
                border: "1px solid rgba(255,215,0,0.3)",
                boxShadow: "0 0 20px rgba(123,47,190,0.4)"
              }}
            >
              <Crown className="w-5 h-5" style={{ color: "#FFD700" }} />
            </div>
            <div>
              <h3
                className="text-lg font-black"
                style={{ fontFamily: "'Outfit', sans-serif", color: "#E8D5FF" }}
              >
                Suhani AI Architecture
              </h3>
              <p
                className="text-xs"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "rgba(0,191,255,0.6)"
                }}
              >
                Real-Time Voice-to-Voice Neural Interface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all"
            style={{ color: "rgba(200,180,255,0.5)", border: "1px solid rgba(123,47,190,0.2)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(123,47,190,0.15)";
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(200,180,255,0.5)";
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="space-y-5">
          {cards.map((card, i) => (
            <div key={i} className="flex gap-4">
              <div
                className="p-2.5 rounded-xl h-fit shrink-0"
                style={{
                  background: card.iconBg,
                  border: `1px solid ${card.iconBorder}`,
                  color: card.iconColor
                }}
              >
                {card.icon}
              </div>
              <div>
                <h4
                  className="font-bold mb-1.5"
                  style={{
                    color: card.iconColor,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "13px"
                  }}
                >
                  {card.title}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(200,185,255,0.7)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-5 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid rgba(123,47,190,0.2)" }}
        >
          <span
            className="flex items-center gap-2"
            style={{ fontFamily: "'Space Mono', monospace", color: "#00BFFF" }}
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span style={{ color: "#00BFFF" }}>TLS</span>
            <span style={{ color: "rgba(255,215,0,0.7)" }}>SECURE LINK</span>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-white font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(74,16,128,0.7), rgba(0,47,200,0.5))",
              border: "1px solid rgba(123,47,190,0.45)",
              fontFamily: "'Outfit', sans-serif"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(255,215,0,0.2)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,215,0,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(123,47,190,0.45)";
            }}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
