import React, { useState, useEffect, useRef } from "react";
import { AssistantState, GlowTheme } from "../types";
import { 
  Mic, 
  Power, 
  Radio, 
  Sparkles, 
  Loader2, 
  Smile, 
  Cpu, 
  Activity, 
  Sliders, 
  Eye, 
  Flame, 
  ShieldCheck,
  Zap,
  Volume2
} from "lucide-react";

interface CoreOrbProps {
  state: AssistantState;
  theme: GlowTheme;
  inputVolume: number; // 0 to 1
  outputVolume: number; // 0 to 1
  onTogglePower: () => void;
}

type EmotionMode = "calm" | "analytical" | "alert" | "deep";

const themeColors: Record<GlowTheme, { 
  glowPrimary: string; 
  glowSecondary: string; 
  border: string; 
  text: string; 
  shadow: string;
  fill: string;
  ring: string;
}> = {
  cyan: {
    glowPrimary: "bg-cyan-600/20",
    glowSecondary: "bg-blue-600/15",
    border: "border-cyan-500/40",
    text: "text-cyan-400",
    shadow: "shadow-cyan-500/30",
    fill: "#22d3ee",
    ring: "rgba(6, 182, 212, 0.4)"
  },
  emerald: {
    glowPrimary: "bg-emerald-600/20",
    glowSecondary: "bg-teal-600/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    shadow: "shadow-emerald-500/30",
    fill: "#34d399",
    ring: "rgba(16, 185, 129, 0.4)"
  },
  magenta: {
    glowPrimary: "bg-indigo-600/20",
    glowSecondary: "bg-pink-600/15",
    border: "border-pink-500/40",
    text: "text-pink-400",
    shadow: "shadow-indigo-500/30",
    fill: "#f472b6",
    ring: "rgba(236, 72, 153, 0.4)"
  },
  amber: {
    glowPrimary: "bg-amber-600/20",
    glowSecondary: "bg-orange-600/15",
    border: "border-amber-500/40",
    text: "text-amber-400",
    shadow: "shadow-amber-500/30",
    fill: "#fbbf24",
    ring: "rgba(245, 158, 11, 0.4)"
  },
  // ROYAL THEME — Electric Blue + Royal Purple (default)
  violet: {
    glowPrimary: "bg-violet-600/20",
    glowSecondary: "bg-blue-600/15",
    border: "border-violet-500/40",
    text: "text-violet-400",
    shadow: "shadow-violet-500/30",
    fill: "#0047FF",
    ring: "rgba(0, 71, 255, 0.45)"
  },
  crimson: {
    glowPrimary: "bg-rose-600/20",
    glowSecondary: "bg-red-600/15",
    border: "border-rose-500/40",
    text: "text-rose-400",
    shadow: "shadow-rose-500/30",
    fill: "#fb7185",
    ring: "rgba(244, 63, 94, 0.4)"
  }
};

export const CoreOrb: React.FC<CoreOrbProps> = ({
  state,
  theme,
  inputVolume,
  outputVolume,
  onTogglePower
}) => {
  const currentColors = themeColors[theme] || themeColors.magenta;
  const isOnline = state === "listening" || state === "speaking";

  // Mouse coordinate state for 3D parallax head tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });

  // Custom visual settings
  const [emotion, setEmotion] = useState<EmotionMode>("calm");
  const [isBlinking, setIsBlinking] = useState(false);
  const [gazeSensitivity, setGazeSensitivity] = useState(1);
  const [showWireframe, setShowWireframe] = useState(false);

  // Monitor mouse motion over the screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert coordinates relative to center of screen
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const rx = (e.clientX - cx) / cx; // -1 to 1
      const ry = (e.clientY - cy) / cy; // -1 to 1
      setMousePos({ x: rx, y: ry });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth mouse interpolation loop
  useEffect(() => {
    let frameId: number;
    const updateSmoothCoords = () => {
      setSmoothMouse((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        // Dampened spring equation for smooth cinematic follow-through
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      frameId = requestAnimationFrame(updateSmoothCoords);
    };
    frameId = requestAnimationFrame(updateSmoothCoords);
    return () => cancelAnimationFrame(frameId);
  }, [mousePos]);

  // Handle auto-blinking intervals
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerBlink();
        // Occasionally double blink
        if (Math.random() > 0.6) {
          setTimeout(triggerBlink, 350);
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  // Calculate face and head parallax transforms based on mouse coordinates
  const lookSensitivity = 12 * gazeSensitivity;
  const headX = smoothMouse.x * lookSensitivity;
  const headY = smoothMouse.y * lookSensitivity;

  const pupilX = smoothMouse.x * (lookSensitivity * 0.7);
  const pupilY = smoothMouse.y * (lookSensitivity * 0.7);

  // Mouth animation logic reactive to volumes
  const activeVolume = state === "speaking" ? outputVolume : state === "listening" ? inputVolume : 0;
  const normalizedVol = Math.max(0, Math.min(1, activeVolume));

  const stateHeadings: Record<AssistantState, string> = {
    disconnected: "Local System Offline",
    connecting: "Syncing Handshakes...",
    listening: "Awaiting Core Inputs...",
    speaking: "Myraa Synth Active..."
  };

  const stateSubtexts: Record<AssistantState, string> = {
    disconnected: "Synthesizer offline. Activate system companion mode.",
    connecting: "Authenticating gateway token with local loopback daemon...",
    listening: "High-privilege local bridge ready. Synthesize your request.",
    speaking: "Streaming bidirectional high-fidelity brainwave synthesis..."
  };

  // Eyebrow and eye configurations based on emotion modes
  const getEmotionStyles = () => {
    switch (emotion) {
      case "analytical":
        return {
          eyebrowAngle: 8,
          eyeColor: "#00BFFF",
          eyeGlow: "drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]",
          glowColor: "rgba(0,191,255,0.15)",
          description: "Analyzing hardware neural network nodes..."
        };
      case "alert":
        return {
          eyebrowAngle: -12,
          eyeColor: "#FF4444",
          eyeGlow: "drop-shadow-[0_0_15px_rgba(255,68,68,1)]",
          glowColor: "rgba(255,68,68,0.2)",
          description: "Full local access elevation logs monitoring..."
        };
      case "deep":
        return {
          eyebrowAngle: 4,
          eyeColor: "#9B59B6",
          eyeGlow: "drop-shadow-[0_0_12px_rgba(155,89,182,0.9)]",
          glowColor: "rgba(155,89,182,0.15)",
          description: "Formulating deep planning strategies..."
        };
      default:
        return {
          eyebrowAngle: 0,
          eyeColor: currentColors.fill,
          eyeGlow: `drop-shadow-[0_0_10px_${currentColors.fill}]`,
          glowColor: currentColors.glowPrimary,
          description: "System standing by. Idle breathing loop connected."
        };
    }
  };

  const activeEmotion = getEmotionStyles();

  return (
    <div id="ai-companion-avatar" className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* Background Neon Aura overlays */}
      <div className={`absolute w-[320px] md:w-[480px] h-[320px] md:h-[480px] rounded-full blur-[100px] transition-all duration-700 pointer-events-none -z-10 ${isOnline ? "opacity-30 scale-115 animate-pulse" : "opacity-10 scale-95"}`}
        style={{ backgroundColor: activeEmotion.eyeColor }}
      />

      <div className="w-full flex flex-col items-center justify-center relative z-10">
        
        {/* MIDDLE COMPONENT: THE HIGH-TECH VECTOR ANIMATED AVATAR FACE */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Outer rotating decorative scope widgets */}
          <div className={`absolute border border-dashed rounded-full -z-10 transition-all duration-700 ${isOnline ? "w-[340px] h-[340px] animate-[spin_40s_linear_infinite]" : "w-[280px] h-[280px]"}`}
            style={{ borderColor: isOnline ? "rgba(0,71,255,0.25)" : "rgba(123,47,190,0.1)" }}
          />
          <div className="absolute rounded-full -z-10 transition-all duration-700 w-[400px] h-[400px] animate-[spin_60s_linear_reverse_infinite]"
            style={{ border: "1px solid rgba(255,215,0,0.08)" }}
          />

          {/* Responsive SVG Anime Girl Avatar Shell */}
          <div className="relative w-80 h-80 flex items-center justify-center pointer-events-none">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Definitions for gorgeous gradient hair, skin, and eyes */}
              <defs>
                {/* Silver Lavender Hair Gradient from video */}
                <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5f3ff" /> {/* Luminous silver-white highlight */}
                  <stop offset="35%" stopColor="#ddd6fe" /> {/* Soft lavender */}
                  <stop offset="70%" stopColor="#c084fc" /> {/* Gentle violet */}
                  <stop offset="100%" stopColor="#8b5cf6" /> {/* Warm purple shadow */}
                </linearGradient>

                {/* Shading hair gradient for depth */}
                <linearGradient id="hairShadeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>

                {/* Hair Glossy Highlights */}
                <linearGradient id="hairHighlight" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.75)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>

                {/* Skin Gradient with soft peach/shadow */}
                <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fffafb" />
                  <stop offset="75%" stopColor="#ffe4e6" />
                  <stop offset="100%" stopColor="#fecdd3" />
                </linearGradient>

                {/* Purple-Violet Anime Eye Gradient from video */}
                <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                  <stop offset="0%" stopColor="#e9d5ff" /> {/* Bright lavender-violet sparkle */}
                  <stop offset="45%" stopColor="#a855f7" /> {/* Deep royal purple */}
                  <stop offset="85%" stopColor="#6d28d9" /> {/* Rich violet */}
                  <stop offset="100%" stopColor="#3b0764" /> {/* Deep shadow rim */}
                </radialGradient>

                {/* Deep Cyber Eye Sparkle for special modes */}
                <radialGradient id="cyberEyeGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="60%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2e1065" />
                </radialGradient>

                {/* Blush Gradient */}
                <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(244,63,94,0.35)" />
                  <stop offset="100%" stopColor="rgba(244,63,94,0)" />
                </radialGradient>

                {/* Elegant Purple Cold-shoulder Dress Gradient from video */}
                <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" /> {/* Vibrant amethyst violet */}
                  <stop offset="60%" stopColor="#5b21b6" /> {/* Rich medium purple */}
                  <stop offset="100%" stopColor="#4c1d95" /> {/* Deep violet shade */}
                </linearGradient>

                {/* Holographic Halo behind her */}
                <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
                  <stop offset="70%" stopColor="rgba(139,92,246,0.06)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>

              {/* 1. Cyber-Aesthetic Holographic Halo Backdrop */}
              <circle cx="100" cy="100" r="92" fill="url(#haloGrad)" />
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
                strokeDasharray="5 3"
                className="animate-[spin_50s_linear_infinite]"
              />
              <circle
                cx="100"
                cy="100"
                r="78"
                stroke={isOnline ? `${activeEmotion.eyeColor}22` : "rgba(255,255,255,0.02)"}
                strokeWidth="0.75"
                strokeDasharray="20 40"
                className="animate-[spin_30s_linear_infinite]"
                style={{ animationDirection: "reverse" }}
              />

              {/* Parallax Group following gaze tracker coordinates */}
              <g style={{ transform: `translate(${headX}px, ${headY}px)`, transformOrigin: "100px 100px", transition: "transform 0.05s ease-out" }}>
                
                {/* 3D Breathing Layer wrapper */}
                <g className="anime-breathing">
                  {/* 2. BACK HAIR (Long flowing silver-lavender layers from video) */}
                  {/* Left long flowing rear hair */}
                  <path
                    d="M 50 80 C 30 110, 15 150, 10 210 C 25 210, 45 190, 52 165 C 48 135, 48 110, 50 80 Z"
                    fill="url(#hairGrad)"
                    opacity="0.95"
                  />
                  {/* Right long flowing rear hair */}
                  <path
                    d="M 150 80 C 170 110, 185 150, 190 210 C 175 210, 155 190, 148 165 C 152 135, 152 110, 148 80 Z"
                    fill="url(#hairGrad)"
                    opacity="0.95"
                  />
                  {/* Deep under-shading for hair layers */}
                  <path
                    d="M 45 90 C 25 125, 18 160, 15 210 C 28 205, 42 195, 48 170 C 42 140, 42 115, 45 90 Z"
                    fill="url(#hairShadeGrad)"
                    opacity="0.8"
                  />
                  <path
                    d="M 155 90 C 175 125, 182 160, 185 210 C 172 205, 158 195, 152 170 C 158 140, 158 115, 155 90 Z"
                    fill="url(#hairShadeGrad)"
                    opacity="0.8"
                  />

                  {/* 3. BODY & SHOULDER SLATE (White halter high collar + Purple cold-shoulder dress) */}
                  {/* Bare neck and collar base */}
                  <path
                    d="M 88 135 L 88 152 C 88 160, 112 160, 112 152 L 112 135 Z"
                    fill="url(#skinGrad)"
                  />
                  {/* Neck shadow */}
                  <path
                    d="M 88 135 C 94 141, 106 141, 112 135 C 112 142, 88 142, 88 135 Z"
                    fill="#fda4af"
                    opacity="0.6"
                  />

                  {/* High mock neck white halter collar from video */}
                  <path
                    d="M 86 138 C 86 134, 114 134, 114 138 L 112 154 C 112 162, 88 162, 88 154 Z"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                  />
                  {/* Vertical ruffles on white halter */}
                  <line x1="94" y1="140" x2="94" y2="155" stroke="#cbd5e1" strokeWidth="0.5" />
                  <line x1="100" y1="138" x2="100" y2="157" stroke="#cbd5e1" strokeWidth="0.75" />
                  <line x1="106" y1="140" x2="106" y2="155" stroke="#cbd5e1" strokeWidth="0.5" />

                  {/* White halter neckline borders */}
                  <path d="M 86 138 C 92 136, 108 136, 114 138" stroke="#ffffff" strokeWidth="1" fill="none" />
                  <path d="M 88 154 C 92 158, 108 158, 112 154" stroke="#e2e8f0" strokeWidth="1" fill="none" />

                  {/* Bare skin of off-the-shoulder chest & shoulders area */}
                  <path
                    d="M 55 170 C 65 156, 85 152, 100 152 C 115 152, 135 156, 145 170 C 152 178, 155 188, 155 210 L 45 210 C 45 188, 48 178, 55 170 Z"
                    fill="url(#skinGrad)"
                  />

                  {/* Elegant off-shoulder Purple Dress sleeve borders */}
                  {/* Left Sleeve off-shoulder band */}
                  <path
                    d="M 45 174 C 48 171, 68 174, 72 184 L 62 210 L 40 210 Z"
                    fill="url(#dressGrad)"
                  />
                  {/* Right Sleeve off-shoulder band */}
                  <path
                    d="M 155 174 C 152 171, 132 174, 128 184 L 138 210 L 160 210 Z"
                    fill="url(#dressGrad)"
                  />

                  {/* Bare shoulder neckline skin border shadow */}
                  <path
                    d="M 72 184 C 74 175, 86 170, 100 170 C 114 170, 126 175, 128 184"
                    stroke="#fecdd3"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Main Purple Dress center piece from video */}
                  <path
                    d="M 70 182 C 80 178, 120 178, 130 182 L 136 210 L 64 210 Z"
                    fill="url(#dressGrad)"
                  />

                  {/* White ruffled lace trim under the dress neckline */}
                  <path
                    d="M 68 182 C 80 178, 120 178, 132 182"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="3 2"
                    fill="none"
                    opacity="0.95"
                  />

                  {/* Sweet delicate belt with ribbon bow at waist */}
                  <path
                    d="M 66 205 L 134 205"
                    stroke="#3b0764"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  {/* Bow tie in center */}
                  <circle cx="100" cy="205" r="3.5" fill="#4c1d95" stroke="#1e1b4b" strokeWidth="0.5" />
                  <path d="M 97 205 C 93 201, 91 209, 97 205 Z" fill="#4c1d95" stroke="#1e1b4b" strokeWidth="0.5" />
                  <path d="M 103 205 C 107 201, 109 209, 103 205 Z" fill="#4c1d95" stroke="#1e1b4b" strokeWidth="0.5" />
                  {/* Hanging ribbon tails */}
                  <path d="M 99 206 C 97 212, 95 215, 96 220" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M 101 206 C 103 212, 105 215, 104 220" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                  {/* ANIME POINTED ELF EARS (Highly realistic details from video) */}
                  {/* Left pointed elf ear */}
                  <g className="anime-ear-l">
                    <path
                      d="M 55 90 C 32 87, 28 100, 55 109 Z"
                      fill="url(#skinGrad)"
                      stroke="#fda4af"
                      strokeWidth="0.75"
                    />
                    <path
                      d="M 52 92 C 38 92, 36 98, 52 103 Z"
                      fill="#fda4af"
                      opacity="0.65"
                    />
                  </g>
                  {/* Right pointed elf ear */}
                  <g className="anime-ear-r">
                    <path
                      d="M 145 90 C 168 87, 172 100, 145 109 Z"
                      fill="url(#skinGrad)"
                      stroke="#fda4af"
                      strokeWidth="0.75"
                    />
                    <path
                      d="M 148 92 C 162 92, 164 98, 148 103 Z"
                      fill="#fda4af"
                      opacity="0.65"
                    />
                  </g>

                  {/* 4. FACE BASE */}
                  <path
                    d="M 55 90 C 55 125, 70 148, 100 148 C 130 148, 145 125, 145 90 C 145 60, 130 55, 100 55 C 70 55, 55 60, 55 90 Z"
                    fill="url(#skinGrad)"
                  />

                  {/* Elegant thoughtful hand-to-chin pose from video (resting near left chin) */}
                  <g style={{ transform: `translate(${-pupilX * 0.05}px, ${-pupilY * 0.05}px)`, transition: "transform 0.1s ease-out" }}>
                    {/* Sleeve covering hand arm */}
                    <path
                      d="M 45 208 C 48 185, 60 168, 68 152 L 74 156 C 68 174, 58 192, 54 210 Z"
                      fill="url(#dressGrad)"
                    />
                    {/* White lace sleeve cuff */}
                    <path
                      d="M 68 152 C 70 150, 73 154, 74 156"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Hand knuckles and slender thoughtful fingers resting on chin */}
                    {/* Hand base */}
                    <path
                      d="M 69 152 C 72 144, 76 136, 80 127 C 82 127, 83 129, 81 131 C 77 141, 74 148, 72 154 Z"
                      fill="url(#skinGrad)"
                      stroke="#fecdd3"
                      strokeWidth="0.5"
                    />
                    {/* Thoughtful curved index finger pointing to chin */}
                    <path
                      d="M 80 127 C 82 122, 85 119, 88 120 C 89 121, 87 124, 85 126 C 82 128, 81 129, 80 127 Z"
                      fill="url(#skinGrad)"
                      stroke="#fecdd3"
                      strokeWidth="0.5"
                    />
                    {/* Middle finger folded slightly */}
                    <path
                      d="M 77 131 C 79 127, 81 125, 83 126 C 84 127, 82 129, 80 131 Z"
                      fill="url(#skinGrad)"
                      stroke="#fecdd3"
                      strokeWidth="0.5"
                    />
                  </g>

                  {/* Soft blushy cheeks (active-pulse when talking or listening!) */}
                  <ellipse
                    cx="72"
                    cy="114"
                    rx="11"
                    ry="6"
                    fill="url(#blushGrad)"
                    className="transition-all duration-300"
                    style={{ transform: `scale(${isOnline ? 1.35 : 1.05})`, transformOrigin: "72px 114px" }}
                  />
                  <ellipse
                    cx="128"
                    cy="114"
                    rx="11"
                    ry="6"
                    fill="url(#blushGrad)"
                    className="transition-all duration-300"
                    style={{ transform: `scale(${isOnline ? 1.35 : 1.05})`, transformOrigin: "128px 114px" }}
                  />

                  {/* Mini cute blush lines */}
                  <line x1="68" y1="112" x2="71" y2="116" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <line x1="72" y1="112" x2="75" y2="116" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <line x1="124" y1="112" x2="127" y2="116" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <line x1="128" y1="112" x2="131" y2="116" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

                  {/* Cute small Anime nose */}
                  <path d="M 100 105 Q 101.5 107, 100 108" stroke="#fda4af" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                  {/* 5. EYES & GAZE HUB */}
                  {/* Left Eye Gaze Subgroup */}
                  <g style={{ transform: `translate(${pupilX * 0.28}px, ${pupilY * 0.28}px)`, transition: "transform 0.04s ease-out" }}>
                    {/* Eyebrow */}
                    <path
                      d="M 62 80 Q 74 74, 84 81"
                      stroke={isOnline ? "#0f172a" : "#334155"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    style={{ transform: `rotate(${activeEmotion.eyebrowAngle}deg)`, transformOrigin: "73px 77px" }}
                    className="transition-all duration-300"
                  />
                  
                  {/* Eye socket / Eyelash base shadow */}
                  <ellipse cx="73" cy="94" rx="13" ry="8" fill="rgba(244,114,182,0.1)" />

                  {!isBlinking ? (
                    <g>
                      {/* White of Left Eye */}
                      <ellipse cx="73" cy="94" rx="11" ry="7.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      
                      {/* Gorgeous Violet Pupil from video */}
                      <g>
                        <ellipse
                          cx={73 + pupilX * 0.08}
                          cy={94 + pupilY * 0.08}
                          rx="7.5"
                          ry="7"
                          fill={emotion === "deep" || emotion === "analytical" ? "url(#cyberEyeGrad)" : "url(#eyeGrad)"}
                        />
                        {/* Deep royal-purple inner pupil dark spot */}
                        <circle
                          cx={73 + pupilX * 0.12}
                          cy={94 + pupilY * 0.12}
                          r="3"
                          fill="#2e1065"
                        />
                        {/* Luminous main eye reflection sparkle */}
                        <circle
                          cx={70.5 + pupilX * 0.06}
                          cy={91.5 + pupilY * 0.06}
                          r="2.4"
                          fill="#ffffff"
                        />
                        {/* Secondary soft gaze reflection */}
                        <circle
                          cx={75.5 + pupilX * 0.06}
                          cy={96.5 + pupilY * 0.06}
                          r="1.4"
                          fill="#ffffff"
                          opacity="0.85"
                        />
                        {/* Extra tiny glamorous sparkle */}
                        <circle
                          cx={76 + pupilX * 0.06}
                          cy={91.5 + pupilY * 0.06}
                          r="0.8"
                          fill="#ffffff"
                          opacity="0.9"
                        />
                        {/* Extra tiny futuristic network sparkle if analytical/deep */}
                        {(emotion === "analytical" || emotion === "deep") && (
                          <path
                            d="M 73 91 L 73 97 M 70 94 L 76 94"
                            stroke="#ffffff"
                            strokeWidth="0.75"
                            opacity="0.9"
                            className="animate-pulse"
                          />
                        )}
                      </g>

                      {/* Top eyelash curve for realistic depth */}
                      <path d="M 61 90 Q 73 83, 85 90" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </g>
                  ) : (
                    /* Blink/Closed Eyelash Path */
                    <path
                      d="M 61 93 Q 73 99, 85 93"
                      stroke="#0f172a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>

                {/* Right Eye Gaze Subgroup */}
                <g style={{ transform: `translate(${pupilX * 0.28}px, ${pupilY * 0.28}px)`, transition: "transform 0.04s ease-out" }}>
                  {/* Eyebrow */}
                  <path
                    d="M 138 80 Q 126 74, 116 81"
                    stroke={isOnline ? "#0f172a" : "#334155"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    style={{ transform: `rotate(${-activeEmotion.eyebrowAngle}deg)`, transformOrigin: "127px 77px" }}
                    className="transition-all duration-300"
                  />
                  
                  {/* Eye socket / Eyelash base shadow */}
                  <ellipse cx="127" cy="94" rx="13" ry="8" fill="rgba(244,114,182,0.1)" />

                  {!isBlinking ? (
                    <g>
                      {/* White of Right Eye */}
                      <ellipse cx="127" cy="94" rx="11" ry="7.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      
                      {/* Gorgeous Violet Pupil from video */}
                      <g>
                        <ellipse
                          cx={127 + pupilX * 0.08}
                          cy={94 + pupilY * 0.08}
                          rx="7.5"
                          ry="7"
                          fill={emotion === "deep" || emotion === "analytical" ? "url(#cyberEyeGrad)" : "url(#eyeGrad)"}
                        />
                        {/* Deep royal-purple inner pupil dark spot */}
                        <circle
                          cx={127 + pupilX * 0.12}
                          cy={94 + pupilY * 0.12}
                          r="3"
                          fill="#2e1065"
                        />
                        {/* Luminous main eye reflection sparkle */}
                        <circle
                          cx={124.5 + pupilX * 0.06}
                          cy={91.5 + pupilY * 0.06}
                          r="2.4"
                          fill="#ffffff"
                        />
                        {/* Secondary soft gaze reflection */}
                        <circle
                          cx={129.5 + pupilX * 0.06}
                          cy={96.5 + pupilY * 0.06}
                          r="1.4"
                          fill="#ffffff"
                          opacity="0.85"
                        />
                        {/* Extra tiny glamorous sparkle */}
                        <circle
                          cx={122 + pupilX * 0.06}
                          cy={91.5 + pupilY * 0.06}
                          r="0.8"
                          fill="#ffffff"
                          opacity="0.9"
                        />
                        {/* Extra tiny futuristic network sparkle if analytical/deep */}
                        {(emotion === "analytical" || emotion === "deep") && (
                          <path
                            d="M 127 91 L 127 97 M 124 94 L 130 94"
                            stroke="#ffffff"
                            strokeWidth="0.75"
                            opacity="0.9"
                            className="animate-pulse"
                          />
                        )}
                      </g>

                      {/* Top eyelash curve for realistic depth */}
                      <path d="M 115 90 Q 127 83, 139 90" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </g>
                  ) : (
                    /* Blink/Closed Eyelash Path */
                    <path
                      d="M 115 93 Q 127 99, 139 93"
                      stroke="#0f172a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>

                {/* 6. DYNAMIC LIP-SYNC MOUTH SYSTEM */}
                <g style={{ transform: `translate(${pupilX * 0.05}px, ${pupilY * 0.05}px)` }}>
                  {isOnline ? (
                    /* Open speaking mouth reacting directly to PCM audio volume */
                    <g>
                      {/* Deep speaking mouth cavity */}
                      <ellipse
                        cx="100"
                        cy="123"
                        rx="7"
                        ry={3 + normalizedVol * 10}
                        fill="#be123c"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      {/* Cute inner tongue */}
                      <path
                        d={`M 95 125 C 97 ${123 + normalizedVol * 8}, 103 ${123 + normalizedVol * 8}, 105 125 C 105 ${127 + normalizedVol * 10}, 95 ${127 + normalizedVol * 10}, 95 125 Z`}
                        fill="#fb7185"
                      />
                    </g>
                  ) : (
                    /* Cute quiet smile when idle/disconnected */
                    <path
                      d="M 94 122 Q 100 126, 106 122"
                      stroke="#334155"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>

                {/* 7. FRONT HAIR (Overlapping gorgeous bangs & side locks) */}
                {/* Side hair strands framing cheeks */}
                <path
                  d="M 54 75 C 50 90, 48 110, 52 128 C 55 128, 57 120, 58 105 C 57 90, 58 80, 60 75 Z"
                  fill="url(#hairGrad)"
                />
                <path
                  d="M 146 75 C 150 90, 152 110, 148 128 C 145 128, 143 120, 142 105 C 143 90, 142 80, 140 75 Z"
                  fill="url(#hairGrad)"
                />

                {/* Detailed flowing side strands (as seen in image) */}
                <path
                  d="M 52 80 Q 42 110, 40 145 C 44 145, 48 130, 49 110"
                  stroke="#1e1b4b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 148 80 Q 158 110, 160 145 C 156 145, 152 130, 151 110"
                  stroke="#1e1b4b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Hair Cap & Forehead Bangs */}
                {/* Main Hair helmet dome */}
                <path
                  d="M 50 82 C 50 45, 150 45, 150 82 C 150 85, 50 85, 50 82 Z"
                  fill="url(#hairGrad)"
                />

                {/* Beautiful front hair strands (bangs) */}
                {/* Center bang strand */}
                <path
                  d="M 94 60 L 100 86 L 103 60 Z"
                  fill="url(#hairGrad)"
                />
                {/* Left forehead bang */}
                <path
                  d="M 72 60 Q 82 72, 85 82 Q 78 72, 75 60 Z"
                  fill="url(#hairGrad)"
                />
                {/* Right forehead bang */}
                <path
                  d="M 128 60 Q 118 72, 115 82 Q 122 72, 125 60 Z"
                  fill="url(#hairGrad)"
                />
                {/* Extra messy wisps as in the photo */}
                <path d="M 64 62 Q 72 80, 68 85" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 136 62 Q 128 80, 132 85" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 98 58 Q 106 78, 108 83" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Glossy hair highlight ring */}
                <path
                  d="M 62 68 C 75 58, 125 58, 138 68"
                  stroke="url(#hairHighlight)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g> {/* End anime-breathing */}
            </g> {/* End parallax group */}
          </svg>
        </div>
      </div>

      </div>

      {/* Primary Voice Status Text Labels */}
      <div className="mt-8 flex flex-col items-center text-center max-w-lg px-4 select-text">
        <h2
          className="text-2xl sm:text-4xl font-black tracking-tighter drop-shadow-lg mb-1.5 transition-all flex items-center gap-2"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: state === "speaking" ? "#00BFFF" : state === "listening" ? "#E8D5FF" : "rgba(255,255,255,0.6)"
          }}
        >
          {stateHeadings[state]}
          {state === "speaking" && (
            <span className="flex gap-0.5 items-end h-4 pb-0.5">
              <span className="w-1 h-2 rounded animate-pulse" style={{ background: "#0047FF" }} />
              <span className="w-1 h-3.5 rounded animate-pulse" style={{ background: "#7B2FBE", animationDelay: "0.15s" }} />
              <span className="w-1 h-1.5 rounded animate-pulse" style={{ background: "#FFD700", animationDelay: "0.3s" }} />
            </span>
          )}
        </h2>
        <p
          className="text-xs font-medium min-h-[20px] select-all"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(155,89,182,0.7)"
          }}
        >
          {stateSubtexts[state]}
        </p>
      </div>

      {/* Floating Activation/Power trigger in the bottom-left corner */}
      <div className="absolute left-4 bottom-4 lg:left-6 lg:bottom-6 z-30 flex flex-col items-center gap-1.5">
        <button
          onClick={onTogglePower}
          disabled={state === "connecting"}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center group cursor-pointer transition-all duration-300 active:scale-95 hover:scale-105 pointer-events-auto"
          style={{
            background: isOnline
              ? "linear-gradient(135deg, #0A2060, #0047FF)"
              : "linear-gradient(135deg, #1A0830, #4A1080)",
            border: isOnline
              ? "1px solid rgba(0,191,255,0.5)"
              : "1px solid rgba(123,47,190,0.4)",
            boxShadow: isOnline
              ? "0 0 25px rgba(0,71,255,0.4), 0 0 8px rgba(0,191,255,0.3)"
              : "0 0 20px rgba(123,47,190,0.3)"
          }}
          title={isOnline ? "Deactivate Voice Assistant" : "Activate Voice Assistant"}
        >
          {state === "connecting" ? (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#FFD700" }} />
          ) : isOnline ? (
            <Mic className="w-5 h-5 animate-pulse" style={{ color: "#00BFFF" }} />
          ) : (
            <Power className="w-5 h-5" style={{ color: "rgba(155,89,182,0.8)" }} />
          )}
        </button>
        <span
          className="text-[9px] font-bold tracking-widest uppercase select-none"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(123,47,190,0.5)" }}
        >
          POWER
        </span>
      </div>
    </div>
  );
};
