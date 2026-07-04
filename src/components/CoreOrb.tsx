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

          {/* Responsive Premium Realistic Avatar Shell */}
          <div 
            className="relative flex-shrink-0" 
            style={{ 
              width: "320px",
              height: "427px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: isOnline ? "0 0 40px rgba(0,71,255,0.45), 0 0 80px rgba(0,71,255,0.2)" : "0 0 25px rgba(0,0,0,0.6)",
              border: isOnline ? "2px solid rgba(0,191,255,0.5)" : "2px solid rgba(255,255,255,0.08)"
            }}
          >

            <img 
              src="/src/assets/images/new_girl_avatar.png" 
              alt="New Avatar" 
              style={{ 
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                pointerEvents: "none"
              }}
            />
            
            {/* Interactive SVG Overlay — viewBox matches image 768x1024 */}

            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 768 1024" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Skin-tone blur patch to cover original static features */}
                <filter id="skinPatch" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                {/* Soft feather for eyelid cover */}
                <filter id="lidSoft" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" />
                </filter>

                {/* Eye clip paths — control how closed/open eyelid is */}
                {/* When isBlinking, ry approaches 0 to close eye */}
                <clipPath id="clipLeft">
                  <ellipse 
                    cx="297" cy="400" 
                    rx="32" 
                    ry={isBlinking ? 1 : 12}
                  />
                </clipPath>
                <clipPath id="clipRight">
                  <ellipse 
                    cx="467" cy="400" 
                    rx="32" 
                    ry={isBlinking ? 1 : 12}
                  />
                </clipPath>
              </defs>

              {/* === ALL FEATURES WRAPPED IN PARALLAX GROUP === */}
              <g style={{ 
                transform: `translate(${headX * 0.4}px, ${headY * 0.4}px)`,
                transition: "transform 0.08s ease-out"
              }}>

                {/* ═══════════════════════════════════════ */}
                {/* EYEBROWS                               */}
                {/* ═══════════════════════════════════════ */}
                <g>
                  {/* Skin cover — removes original static eyebrows */}
                  {/* Left eyebrow skin cover */}
                  <ellipse cx="297" cy="290" rx="48" ry="16" fill="#e3c2b1" filter="url(#skinPatch)" />
                  {/* Right eyebrow skin cover */}
                  <ellipse cx="467" cy="290" rx="48" ry="16" fill="#e3c2b1" filter="url(#skinPatch)" />

                  {/* LEFT EYEBROW */}
                  <g style={{ 
                    transform: `rotate(${activeEmotion.eyebrowAngle}deg)`,
                    transformOrigin: "297px 290px",
                    transition: "transform 0.4s ease"
                  }}>
                    <path 
                      d="M 260 295 Q 285 280, 335 292" 
                      stroke="#221108" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none"
                    />
                    <path 
                      d="M 260 295 Q 285 280, 335 292" 
                      stroke="rgba(30,15,5,0.4)" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      fill="none"
                      filter="url(#lidSoft)"
                    />
                  </g>

                  {/* RIGHT EYEBROW */}
                  <g style={{ 
                    transform: `rotate(${-activeEmotion.eyebrowAngle}deg)`,
                    transformOrigin: "467px 290px",
                    transition: "transform 0.4s ease"
                  }}>
                    <path 
                      d="M 429 292 Q 479 280, 504 295" 
                      stroke="#221108" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none"
                    />
                    <path 
                      d="M 429 292 Q 479 280, 504 295" 
                      stroke="rgba(30,15,5,0.4)" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      fill="none"
                      filter="url(#lidSoft)"
                    />
                  </g>
                </g>

                {/* ═══════════════════════════════════════ */}
                {/* EYES                                   */}
                {/* ═══════════════════════════════════════ */}
                <g>
                  {/* LEFT EYE */}
                  <g>
                    {/* Skin cover */}
                    <ellipse cx="297" cy="400" rx="38" ry="18" fill="#e3c2b1" filter="url(#skinPatch)" />
                    
                    {/* Sclera (white of eye) — clipped to eye opening */}
                    <g clipPath="url(#clipLeft)">
                      <ellipse cx="297" cy="400" rx="32" ry="13" fill="#faf7f5" />
                      
                      {/* Iris + Pupil — constrained movement with gaze */}
                      <g style={{ 
                        transform: `translate(${Math.max(-6, Math.min(6, pupilX * 0.4))}px, ${Math.max(-4, Math.min(4, pupilY * 0.4))}px)`,
                        transition: "transform 0.06s ease-out"
                      }}>
                        {/* Iris */}
                        <circle cx="297" cy="400" r="11" fill="#442918" />
                        {/* Pupil */}
                        <circle cx="297" cy="400" r="5" fill="#0a0502" />
                        {/* Catchlight (main) */}
                        <circle cx="293" cy="396" r="3" fill="white" opacity="0.95" />
                        {/* Catchlight (secondary) */}
                        <circle cx="302" cy="404" r="1.5" fill="white" opacity="0.65" />
                      </g>
                    </g>

                    {/* Upper eyelid arc — closes on blink */}
                    <path
                      d={isBlinking 
                        ? "M 264 334 Q 297 348, 330 334"
                        : "M 264 329 Q 297 318, 330 329"
                      }
                      stroke="#180a04"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Lower lash line */}
                    {!isBlinking && (
                      <path
                        d="M 266 340 Q 297 346, 328 340"
                        stroke="rgba(24,10,4,0.4)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                    {/* Eyelash ticks */}
                    {!isBlinking && [264,275,286,297,308,319,328].map((x, i) => {
                      const baseY = 329 - Math.sin(((x - 264) / 66) * Math.PI) * 11;
                      return (
                        <line 
                          key={i}
                          x1={x} y1={baseY} 
                          x2={x - 1.5} y2={baseY - 5} 
                          stroke="#0a0502" strokeWidth="1.8" strokeLinecap="round" 
                        />
                      );
                    })}
                  </g>

                  {/* RIGHT EYE */}
                  <g>
                    <ellipse cx="467" cy="400" rx="38" ry="18" fill="#e3c2b1" filter="url(#skinPatch)" />
                    
                    <g clipPath="url(#clipRight)">
                      <ellipse cx="467" cy="400" rx="32" ry="13" fill="#faf7f5" />
                      
                      <g style={{ 
                        transform: `translate(${Math.max(-6, Math.min(6, pupilX * 0.4))}px, ${Math.max(-4, Math.min(4, pupilY * 0.4))}px)`,
                        transition: "transform 0.06s ease-out"
                      }}>
                        <circle cx="467" cy="400" r="11" fill="#442918" />
                        <circle cx="467" cy="400" r="5" fill="#0a0502" />
                        <circle cx="463" cy="396" r="3" fill="white" opacity="0.95" />
                        <circle cx="472" cy="404" r="1.5" fill="white" opacity="0.65" />
                      </g>
                    </g>

                    <path
                      d={isBlinking 
                        ? "M 434 334 Q 467 348, 500 334"
                        : "M 434 329 Q 467 318, 500 329"
                      }
                      stroke="#180a04"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {!isBlinking && (
                      <path
                        d="M 436 340 Q 467 346, 498 340"
                        stroke="rgba(24,10,4,0.4)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                    {!isBlinking && [434,445,456,467,478,489,498].map((x, i) => {
                      const baseY = 329 - Math.sin(((x - 434) / 66) * Math.PI) * 11;
                      return (
                        <line 
                          key={i}
                          x1={x} y1={baseY} 
                          x2={x - 1.5} y2={baseY - 5} 
                          stroke="#0a0502" strokeWidth="1.8" strokeLinecap="round" 
                        />
                      );
                    })}
                  </g>
                </g>

                {/* ═══════════════════════════════════════ */}
                {/* LIPS / MOUTH                           */}
                {/* ═══════════════════════════════════════ */}
                <g style={{ 
                  transform: `translate(${pupilX * 0.15}px, ${pupilY * 0.15}px)`,
                  transition: "transform 0.1s ease-out"
                }}>
                  {state === "speaking" ? (
                    <g>
                      {/* Skin cover */}
                      <ellipse cx="384" cy="475" rx="55" ry="22" fill="#e3c2b1" filter="url(#skinPatch)" />
                      
                      {/* Mouth cavity opening */}
                      <ellipse 
                        cx="384" cy="478" 
                        rx={24 + normalizedVol * 12} 
                        ry={4 + normalizedVol * 15} 
                        fill="#1e0505"
                      />
                      {/* Upper teeth visible when open */}
                      {normalizedVol > 0.15 && (
                        <rect x="364" y="473" width="40" height="7" rx="3" fill="#f0ede8" />
                      )}
                      {/* Tongue */}
                      {normalizedVol > 0.3 && (
                        <ellipse cx="384" cy={484 + normalizedVol * 4} rx="14" ry="6" fill="#b85858" />
                      )}

                      {/* Upper Lip */}
                      <path 
                        d={`M 344 474 Q 364 ${465 - normalizedVol * 8}, 384 470 Q 404 ${465 - normalizedVol * 8}, 424 474`}
                        fill="#b24c4e" 
                        stroke="#803032" 
                        strokeWidth="1.2"
                      />

                      {/* Lower Lip */}
                      <path 
                        d={`M 346 482 Q 384 ${498 + normalizedVol * 12}, 422 482 Q 384 ${488 + normalizedVol * 4}, 346 482`}
                        fill="#cc5a5c"
                        stroke="#803032"
                        strokeWidth="1.2"
                      />
                      {/* Lower lip highlight */}
                      <ellipse cx="384" cy={491 + normalizedVol * 6} rx="15" ry="3.5" fill="rgba(255,190,170,0.35)" />
                    </g>
                  ) : (
                    /* Idle closed mouth */
                    <g>
                      {/* Upper Lip */}
                      <path 
                        d="M 346 473 Q 364 466, 384 470 Q 404 466, 422 473 Q 384 478, 346 473"
                        fill="#9e353e"
                        stroke="none"
                      />
                      {/* Lower Lip */}
                      <path 
                        d="M 348 476 Q 384 488, 420 476 Q 384 481, 348 476"
                        fill="#b8424b"
                        stroke="none"
                      />
                      {/* Mouth line */}
                      <path 
                        d="M 346 474 Q 384 479, 422 474"
                        stroke="#5c1a1f"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  )}
                </g>

              </g>{/* end parallax group */}
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
