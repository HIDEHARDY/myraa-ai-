import React, { useEffect, useRef, useState, useCallback } from "react";
import { AppState, StateManager } from "./modules/StateManager";
import { AudioStreamer } from "./modules/AudioStreamer";
import { AudioPlayer } from "./modules/AudioPlayer";
import { LiveSession } from "./modules/LiveSession";
import { ToolManager } from "./modules/ToolManager";
import { globalMemoryManager } from "./modules/MemoryManager";
import { AssistantState, GlowTheme, HolographicCardData, ToolExecutionNotification } from "./types";

import { Navbar } from "./components/Navbar";
import { SideIndicators } from "./components/SideIndicators";
import { CoreOrb } from "./components/CoreOrb";
import { WaveformFooter } from "./components/WaveformFooter";
import { WebPortalModal } from "./components/WebPortalModal";
import { InfoModal } from "./components/InfoModal";
import { MemoryStorageModal } from "./components/MemoryStorageModal";
import { Sparkles, Globe, Palette, PartyPopper, CloudSun, AlertTriangle, RefreshCw, Zap } from "lucide-react";

export default function App() {
  const stateManagerRef = useRef<StateManager>(new StateManager());
  const audioStreamerRef = useRef<AudioStreamer>(new AudioStreamer());
  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());
  const liveSessionRef = useRef<LiveSession | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);

  const [uiState, setUiState] = useState<AppState>(stateManagerRef.current.getState());
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const handleUpdateState = useCallback((partial: Partial<AppState>) => {
    stateManagerRef.current.setState(partial);
  }, []);

  // Sync state manager to React state
  useEffect(() => {
    const unsubscribe = stateManagerRef.current.subscribe((nextState) => {
      setUiState(nextState);
    });
    return unsubscribe;
  }, []);

  // Load persistent memories from server database on app startup
  useEffect(() => {
    globalMemoryManager.loadMemoriesFromServer().catch((err) => {
      console.error("Failed to load persistent memories from server:", err);
    });
  }, []);

  // Initialize ToolManager
  useEffect(() => {
    toolManagerRef.current = new ToolManager({
      onSetTheme: (theme: GlowTheme) => {
        stateManagerRef.current.setState({ theme });
      },
      onShowCard: (card: HolographicCardData) => {
        stateManagerRef.current.setState({ activeCard: card });
      },
      onOpenWeb: (url: string, title: string) => {
        stateManagerRef.current.setState({ activePortal: { url, title } });
      },
      onAddNotification: (notif: ToolExecutionNotification) => {
        stateManagerRef.current.addNotification(notif);
      },
      onUpdateOsState: (partialState: any) => {
        stateManagerRef.current.setState(partialState);
      },
      getOsState: () => {
        return stateManagerRef.current.getState();
      },
      onRequestApproval: (command: string, terminalType: string) => {
        return new Promise<boolean>((resolve) => {
          stateManagerRef.current.setState({
            terminalApprovalRequest: {
              command,
              terminalType,
              resolve: (approved: boolean) => {
                stateManagerRef.current.setState({ terminalApprovalRequest: null });
                resolve(approved);
              }
            }
          });
        });
      }
    });
  }, []);

  // Initialize LiveSession
  useEffect(() => {
    liveSessionRef.current = new LiveSession({
      onConnect: () => {
        stateManagerRef.current.setAssistantState("listening");
        stateManagerRef.current.setState({
          errorMessage: null,
          activeCard: {
            id: "connected_card",
            title: "Myraa Voice Companion Online",
            content: "Bidirectional PCM audio stream established. Speak naturally into your microphone or try asking Myraa to open a web portal, check weather, or change HUD theme.",
            category: "fact",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        });
      },
      onDisconnect: () => {
        stateManagerRef.current.setAssistantState("disconnected");
        audioStreamerRef.current.stop();
        audioPlayerRef.current.close();
      },
      onAudioOutput: (base64PCM: string) => {
        audioPlayerRef.current.playChunk(base64PCM);
        if (stateManagerRef.current.getState().assistantState !== "speaking") {
          stateManagerRef.current.setAssistantState("speaking");
        }
      },
      onInterrupted: () => {
        audioPlayerRef.current.interrupt();
        stateManagerRef.current.setAssistantState("listening");
      },
      onToolCalls: async (calls) => {
        if (toolManagerRef.current) {
          const responses = await toolManagerRef.current.executeToolCalls(calls);
          liveSessionRef.current?.sendToolResponses(responses);
        }
      },
      onError: (err) => {
        console.warn("Session Error:", err);
        stateManagerRef.current.setState({ errorMessage: err });
        stateManagerRef.current.setAssistantState("disconnected");
        audioStreamerRef.current.stop();
      }
    });

    return () => {
      liveSessionRef.current?.disconnect();
    };
  }, []);

  // Check when speaking finishes
  useEffect(() => {
    const checkPlayingInterval = setInterval(() => {
      const state = stateManagerRef.current.getState();
      if (state.assistantState === "speaking") {
        if (!audioPlayerRef.current.getIsPlaying()) {
          stateManagerRef.current.setAssistantState("listening");
        }
      }
    }, 200);

    return () => clearInterval(checkPlayingInterval);
  }, []);

  const handleConnect = useCallback(async () => {
    setMicError(null);
    stateManagerRef.current.setAssistantState("connecting");

    try {
      // Start microphone capturing
      await audioStreamerRef.current.start(
        (base64PCM) => {
          liveSessionRef.current?.sendAudioInput(base64PCM);
        },
        (inputVol) => {
          stateManagerRef.current.setState({ inputVolume: inputVol });
        }
      );

      // Initialize audio player
      audioPlayerRef.current.initialize((outputVol) => {
        stateManagerRef.current.setState({ outputVolume: outputVol });
      });

      // Connect websocket proxy
      liveSessionRef.current?.connect();
    } catch (err: any) {
      console.warn("Microphone or Connect Notice:", err);
      let errorMsg = err?.message || (typeof err === "string" ? err : "Could not access microphone.");
      const errStr = (err?.message || err?.name || String(err)).toLowerCase();
      if (errStr.includes("permission") || errStr.includes("notallowed") || errStr.includes("denied")) {
        errorMsg = "Microphone access was denied. If you are viewing inside AI Studio live preview, please click the 'Open in new tab' button at the top right of the preview window to grant microphone access, or allow microphone permission in your browser address bar.";
      }
      setMicError(errorMsg);
      stateManagerRef.current.setAssistantState("disconnected");
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    liveSessionRef.current?.disconnect();
    audioStreamerRef.current.stop();
    audioPlayerRef.current.close();
    stateManagerRef.current.setAssistantState("disconnected");
  }, []);

  const handleTogglePower = useCallback(() => {
    if (uiState.assistantState === "disconnected") {
      handleConnect();
    } else if (uiState.assistantState === "listening" || uiState.assistantState === "speaking") {
      handleDisconnect();
    }
  }, [uiState.assistantState, handleConnect, handleDisconnect]);

  const handleToggleMute = useCallback(() => {
    const nextMute = !uiState.isMuted;
    audioPlayerRef.current.setMute(nextMute);
    stateManagerRef.current.setState({ isMuted: nextMute });
  }, [uiState.isMuted]);

  // Voice Prompt Helper Chips (simulates user speaking or prompts them what to say)
  const voiceHints = [
    { label: "Open Wikipedia", icon: <Globe className="w-3.5 h-3.5" style={{color: '#00BFFF'}} />, prompt: "Open wikipedia.org for me" },
    { label: "Weather Report", icon: <CloudSun className="w-3.5 h-3.5" style={{color: '#FFD700'}} />, prompt: "Show me a holographic card with a sci-fi weather report for Neo Tokyo" },
    { label: "Theme: Violet", icon: <Palette className="w-3.5 h-3.5" style={{color: '#9B59B6'}} />, prompt: "Change UI color theme to violet" },
    { label: "Celebrate!", icon: <PartyPopper className="w-3.5 h-3.5" style={{color: '#FFC107'}} />, prompt: "Trigger special celebration effect confetti!" }
  ];

  return (
    <div className="w-full h-screen text-[#E8E0FF] overflow-hidden flex flex-col relative select-none" style={{background: '#050508', fontFamily: "'Outfit', 'Inter', sans-serif"}}>
      {/* Royal Atmosphere Gradients: Purple + Electric Blue + Golden */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Royal Purple orb — top left */}
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full animate-pulse" style={{background: '#7B2FBE', opacity: 0.18, filter: 'blur(140px)'}} />
        {/* Electric Blue orb — bottom right */}
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full" style={{background: '#0047FF', opacity: 0.15, filter: 'blur(130px)'}} />
        {/* Golden accent orb — center top */}
        <div className="absolute top-[5%] right-[25%] w-[30%] h-[30%] rounded-full animate-pulse" style={{background: '#FFD700', opacity: 0.07, filter: 'blur(120px)', animationDelay: '1.5s'}} />
        {/* Deep purple secondary — bottom left */}
        <div className="absolute bottom-[10%] left-[15%] w-[35%] h-[35%] rounded-full" style={{background: '#4A1080', opacity: 0.2, filter: 'blur(110px)'}} />
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(123,47,190,0.3) 2px, rgba(123,47,190,0.3) 3px)'}} />
      </div>

      {/* Navbar */}
      <Navbar
        state={uiState.assistantState}
        theme={uiState.theme}
        isMuted={uiState.isMuted}
        onToggleMute={handleToggleMute}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onOpenMemoryStorage={() => setIsMemoryModalOpen(true)}
      />

      {/* Main AI Interaction Space */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 md:px-12 overflow-y-auto">
        {/* Side Indicator HUD Panels */}
        <SideIndicators
          stats={{
            latencyMs: uiState.latencyMs,
            inputVolume: uiState.inputVolume,
            outputVolume: uiState.outputVolume,
            sessionDurationSec: uiState.sessionDurationSec
          }}
          theme={uiState.theme}
        />

        {/* Error / Permission Banner */}
        {(micError || uiState.errorMessage) && (
          <div className="w-full max-w-lg mb-6 p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-xl z-30" style={{background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', color: '#FFB3B3'}}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{color: '#FF6B6B'}} />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold mb-1" style={{color: '#FFD0D0'}}>Attention Required</p>
              <p className="leading-relaxed" style={{color: 'rgba(255,179,179,0.8)'}}>{micError || uiState.errorMessage}</p>
              <button
                onClick={handleConnect}
                className="mt-3 px-4 py-1.5 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                style={{background: 'linear-gradient(135deg, #FF4444, #CC0000)', border: '1px solid rgba(255,68,68,0.5)'}}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Central Core Microphone / Power Orb */}
        <CoreOrb
          state={uiState.assistantState}
          theme={uiState.theme}
          inputVolume={uiState.inputVolume}
          outputVolume={uiState.outputVolume}
          onTogglePower={handleTogglePower}
        />

        {/* Voice Trigger Helper Chips (Only displayed when connected to inspire conversation) */}
        {uiState.assistantState !== "disconnected" && uiState.assistantState !== "connecting" && (
          <div className="mt-4 mb-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-xl px-4 animate-fade-in">
            <span className="text-[10px] uppercase tracking-widest w-full text-center mb-1 font-mono" style={{color: 'rgba(255,215,0,0.45)'}}>
              ✦ Voice Commands — Speak Freely ✦
            </span>
            {voiceHints.map((hint, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-default select-none"
                style={{
                  background: 'rgba(123,47,190,0.12)',
                  border: '1px solid rgba(123,47,190,0.35)',
                  color: 'rgba(220,200,255,0.9)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {hint.icon}
                <span className="font-medium">{hint.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Tool Execution Notification Ticker */}
        {uiState.notifications.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-mono animate-fade-in pointer-events-none" style={{background: 'rgba(0,47,255,0.15)', border: '1px solid rgba(0,191,255,0.3)', color: 'rgba(180,220,255,0.9)'}}>
            <Zap className="w-3 h-3 animate-spin" style={{color: '#FFD700'}} />
            <span className="font-bold" style={{color: '#00BFFF'}}>TOOL EXECUTED:</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{uiState.notifications[0].message}</span>
          </div>
        )}
      </main>

      {/* Bottom Waveform Equalizer & Controls Footer */}
      <WaveformFooter
        state={uiState.assistantState}
        theme={uiState.theme}
        inputVolume={uiState.inputVolume}
        outputVolume={uiState.outputVolume}
        sessionDurationSec={uiState.sessionDurationSec}
        onDisconnect={handleDisconnect}
      />

      {/* Embedded Web Portal Modal */}
      <WebPortalModal
        portal={uiState.activePortal}
        onClose={() => stateManagerRef.current.setState({ activePortal: null })}
      />

      {/* Architecture Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Memory Storage Vault Modal */}
      <MemoryStorageModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      {/* Terminal execution preventative confirmation check */}
      {uiState.terminalApprovalRequest && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4" style={{background: 'rgba(5,5,8,0.92)'}}>
          <div className="w-full max-w-md p-6 rounded-3xl text-xs" style={{background: '#0A0A15', border: '1px solid rgba(255,71,71,0.4)', boxShadow: '0 0 60px rgba(123,47,190,0.3), 0 0 30px rgba(255,71,71,0.1)'}}>
            <div className="flex items-center gap-2 mb-4 pb-3" style={{borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{background: '#FF4444'}} />
              <h3 className="text-sm font-bold tracking-wider" style={{color: '#FF6B6B', fontFamily: "'Space Mono', monospace"}}>⚡ SECURITY ACCESS REQUIRED</h3>
            </div>
            
            <p className="mb-3" style={{color: 'rgba(200,180,255,0.8)', fontFamily: "'Outfit', sans-serif"}}>
              Suhani AI is requesting authorization to execute a terminal command:
            </p>

            <div className="p-3 rounded-xl break-all select-text mb-4" style={{background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,71,255,0.2)', color: '#00BFFF', fontFamily: "'Space Mono', monospace", fontSize: '11px'}}>
              <span className="mr-1.5 select-none" style={{color: 'rgba(255,215,0,0.6)'}}>$</span>
              {uiState.terminalApprovalRequest.command}
            </div>

            <div className="flex justify-between items-center mb-5" style={{fontSize: '10px', color: 'rgba(123,47,190,0.6)', fontFamily: "'Space Mono', monospace"}}>
              <span>SHELL: {uiState.terminalApprovalRequest.terminalType}</span>
              <span>PRIVILEGE: SECURE_SANDBOX</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => uiState.terminalApprovalRequest?.resolve(false)}
                className="flex-1 py-2.5 rounded-xl font-bold transition-all"
                style={{border: '1px solid rgba(123,47,190,0.4)', color: 'rgba(200,180,255,0.8)', fontFamily: "'Space Mono', monospace"}}
              >
                DENY & BLOCK
              </button>
              <button 
                onClick={() => uiState.terminalApprovalRequest?.resolve(true)}
                className="flex-1 py-2.5 rounded-xl text-white font-bold transition-all"
                style={{background: 'linear-gradient(135deg, #FF4444, #CC0000)', boxShadow: '0 4px 20px rgba(255,68,68,0.3)', fontFamily: "'Space Mono', monospace"}}
              >
                AUTHORIZE RUN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
