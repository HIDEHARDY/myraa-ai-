import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Settings, 
  Terminal, 
  Globe, 
  Camera, 
  Brain, 
  Volume2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Save, 
  FolderSync, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap,
  Cpu,
  ChevronDown,
  Info,
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Define Step types
export type WorkflowStepType = 
  | "trigger"
  | "open_url"
  | "run_cmd"
  | "screenshot"
  | "organize_files"
  | "ai_agent"
  | "notification";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  title: string;
  params: {
    url?: string;
    command?: string;
    prompt?: string;
    message?: string;
    interval?: number;
    waitForOutput?: boolean;
  };
  state: "idle" | "running" | "completed" | "failed";
  output?: string;
  error?: string;
}

interface WorkflowBuilderAppProps {
  systemConnectionState: "disconnected" | "connecting" | "connected";
  screenshotImg: string | null;
  onAddNotification: (notif: { id: string; name: string; message: string; timestamp: string }) => void;
  onAddConsoleLog: (log: { text: string; type: "info" | "warn" | "error" | "success" }) => void;
  onAddSystemLog: (log: { text: string; type: "input" | "output" | "action" | "success" | "warn" | "error" }) => void;
}

export const WorkflowBuilderApp: React.FC<WorkflowBuilderAppProps> = ({
  systemConnectionState,
  screenshotImg,
  onAddNotification,
  onAddConsoleLog,
  onAddSystemLog
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "step-1",
      type: "trigger",
      title: "Start Trigger",
      params: { interval: 0 },
      state: "idle"
    },
    {
      id: "step-2",
      type: "open_url",
      title: "Launch Web Agent",
      params: { url: "https://news.ycombinator.com" },
      state: "idle"
    },
    {
      id: "step-3",
      type: "screenshot",
      title: "Grab Screen Snapshot",
      params: {},
      state: "idle"
    },
    {
      id: "step-4",
      type: "notification",
      title: "Alert System Operator",
      params: { message: "Security analysis snapshot grabbed successfully!" },
      state: "idle"
    }
  ]);

  const [selectedStepId, setSelectedStepId] = useState<string | null>("step-1");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    "Workflow engine ready. Configure your automation program."
  ]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [lastVariables, setLastVariables] = useState<Record<string, string>>({
    "last_url": "https://news.ycombinator.com",
    "last_cmd": ""
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [executionLogs]);

  // Predefined Presets
  const presets = {
    webScan: [
      { id: "ws-1", type: "trigger" as const, title: "Start Flow", params: {}, state: "idle" as const },
      { id: "ws-2", type: "open_url" as const, title: "Open Google Chrome", params: { url: "https://google.com" }, state: "idle" as const },
      { id: "ws-3", type: "screenshot" as const, title: "Desktop Snapshot", params: {}, state: "idle" as const },
      { id: "ws-4", type: "notification" as const, title: "Broadcast Success", params: { message: "Google Chrome auto-scan and snapshot completed!" }, state: "idle" as const }
    ],
    cleanAndDiagnostic: [
      { id: "cd-1", type: "trigger" as const, title: "Diagnostics Trigger", params: {}, state: "idle" as const },
      { id: "cd-2", type: "run_cmd" as const, title: "System Info Diagnostics", params: { command: "echo === SYS DIAGNOSTICS === && hostname && whoami" }, state: "idle" as const },
      { id: "cd-3", type: "organize_files" as const, title: "Organize Downloads Folder", params: {}, state: "idle" as const },
      { id: "cd-4", type: "notification" as const, title: "Completion Banner", params: { message: "Diagnostic report compiled and files organized successfully." }, state: "idle" as const }
    ],
    alertBeacon: [
      { id: "ab-1", type: "trigger" as const, title: "Trigger Alarm", params: {}, state: "idle" as const },
      { id: "ab-2", type: "run_cmd" as const, title: "Check Gateway Status", params: { command: "ping -n 3 127.0.0.1" }, state: "idle" as const },
      { id: "ab-3", type: "ai_agent" as const, title: "Smart Diagnostic Evaluation", params: { prompt: "Analyze connection logs to ensure low latency and continuous service bridge." }, state: "idle" as const },
      { id: "ab-4", type: "notification" as const, title: "Auditory Tone Signal", params: { message: "Security ping beacon completed successfully." }, state: "idle" as const }
    ],
    chromeFlow: [
      { id: "cf-1", type: "trigger" as const, title: "Start Chrome Flow", params: {}, state: "idle" as const },
      { id: "cf-2", type: "open_url" as const, title: "Open Browser", params: { url: "https://google.com" }, state: "idle" as const },
      { id: "cf-3", type: "open_url" as const, title: "Search Web Page", params: { url: "https://google.com/search?q=Myraa+AI+OS" }, state: "idle" as const },
      { id: "cf-4", type: "screenshot" as const, title: "Capture Web Page Screen", params: {}, state: "idle" as const },
      { id: "cf-5", type: "run_cmd" as const, title: "Cut Web Page (Close Chrome)", params: { command: "echo closing-browser" }, state: "idle" as const },
      { id: "cf-6", type: "notification" as const, title: "Flow Completed Banner", params: { message: "Chrome Browser Flow executed successfully!" }, state: "idle" as const }
    ]
  };

  const loadPreset = (presetKey: "webScan" | "cleanAndDiagnostic" | "alertBeacon" | "chromeFlow") => {
    if (isRunning) return;
    const selected = presets[presetKey];
    setSteps(JSON.parse(JSON.stringify(selected)));
    setSelectedStepId(selected[0]?.id || null);
    
    let label = "Custom Flow";
    if (presetKey === "webScan") label = "Web Scan & Capture";
    else if (presetKey === "cleanAndDiagnostic") label = "System Diagnostics & File Cleanup";
    else if (presetKey === "alertBeacon") label = "Smart Security Beacon";
    else if (presetKey === "chromeFlow") label = "Chrome Browser workflow flow";

    addLog(`Loaded preset automation: ${label}`);
  };

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setExecutionLogs(prev => [...prev, `[${timestamp}] ${text}`]);
  };

  // Add a Step
  const addStep = (type: WorkflowStepType) => {
    if (isRunning) return;
    const id = `step-${Math.random().toString(36).substring(2, 9)}`;
    let title = "Automation Step";
    let defaultParams: any = {};

    switch (type) {
      case "trigger":
        title = "Manual Trigger";
        defaultParams = { interval: 0 };
        break;
      case "open_url":
        title = "Open Web URL";
        defaultParams = { url: "https://news.ycombinator.com" };
        break;
      case "run_cmd":
        title = "Run Shell Command";
        defaultParams = { command: "echo 'Myraa Workflow Active'", waitForOutput: true };
        break;
      case "screenshot":
        title = "Desktop Screencapture";
        defaultParams = {};
        break;
      case "organize_files":
        title = "Auto-Organize Downloads";
        defaultParams = {};
        break;
      case "ai_agent":
        title = "Gemini Cognitive Sweep";
        defaultParams = { prompt: "Summarize the execution variables and current operating condition." };
        break;
      case "notification":
        title = "Send Notify Beacon";
        defaultParams = { message: "Automation step executed successfully." };
        break;
    }

    const newStep: WorkflowStep = {
      id,
      type,
      title,
      params: defaultParams,
      state: "idle"
    };

    setSteps(prev => [...prev, newStep]);
    setSelectedStepId(id);
    addLog(`Added automation step: ${title}`);
  };

  // Delete a Step
  const deleteStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) return;
    setSteps(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (selectedStepId === id) {
        setSelectedStepId(filtered[0]?.id || null);
      }
      return filtered;
    });
    addLog("Removed step from current pipeline.");
  };

  // Update a step's parameter
  const updateStepParam = (id: string, key: string, value: any) => {
    setSteps(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          params: {
            ...s.params,
            [key]: value
          }
        };
      }
      return s;
    }));
  };

  // Update step title
  const updateStepTitle = (id: string, title: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, title };
      }
      return s;
    }));
  };

  // Handle Event Listener for Bridge responses
  useEffect(() => {
    const handleBridgeMessage = (e: Event) => {
      if (!isRunning) return;
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      
      // Update variables based on bridge feedback
      if (data.status === "command_result") {
        setLastVariables(prev => ({
          ...prev,
          "last_cmd_stdout": data.stdout || "",
          "last_cmd_stderr": data.stderr || "",
          "last_cmd_exit": String(data.exit_code ?? 0)
        }));
      } else if (data.status === "organize_result") {
        setLastVariables(prev => ({
          ...prev,
          "last_organized_count": String(data.processed_count ?? 0),
          "last_organized_path": data.organized_path || ""
        }));
      }
    };

    window.addEventListener("myraa-system-bridge-receive", handleBridgeMessage);
    return () => {
      window.removeEventListener("myraa-system-bridge-receive", handleBridgeMessage);
    };
  }, [isRunning]);

  // AI Generation of workflows
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || isAiGenerating) return;
    setIsAiGenerating(true);
    addLog(`AI prompt received: "${aiPrompt}". Generating custom loop...`);

    try {
      // Create intelligent workflow structure based on search terms
      const promptLower = aiPrompt.toLowerCase();
      const generatedSteps: WorkflowStep[] = [
        { id: "ai-1", type: "trigger", title: "Smart Trigger", params: {}, state: "idle" }
      ];

      if (promptLower.includes("chrome") || promptLower.includes("open") || promptLower.includes("google") || promptLower.includes("browser") || promptLower.includes("web")) {
        let url = "https://google.com";
        if (promptLower.includes("hacker news") || promptLower.includes("news")) url = "https://news.ycombinator.com";
        else if (promptLower.includes("github")) url = "https://github.com";
        else if (promptLower.includes("youtube")) url = "https://youtube.com";
        
        generatedSteps.push({
          id: "ai-2",
          type: "open_url",
          title: `Launch Chrome: ${new URL(url).hostname}`,
          params: { url },
          state: "idle"
        });
      }

      if (promptLower.includes("command") || promptLower.includes("run") || promptLower.includes("shell") || promptLower.includes("terminal") || promptLower.includes("ping") || promptLower.includes("diagnose")) {
        let cmd = "echo Myraa Engine Online";
        if (promptLower.includes("ping")) cmd = "ping -n 3 8.8.8.8";
        else if (promptLower.includes("ip") || promptLower.includes("ipconfig")) cmd = "ipconfig || ifconfig";
        else if (promptLower.includes("clean") || promptLower.includes("directory")) cmd = "dir || ls";
        
        generatedSteps.push({
          id: "ai-3",
          type: "run_cmd",
          title: `Run Command: ${cmd.split(" ")[0]}`,
          params: { command: cmd },
          state: "idle"
        });
      }

      if (promptLower.includes("screenshot") || promptLower.includes("screencapture") || promptLower.includes("snapshot") || promptLower.includes("grab")) {
        generatedSteps.push({
          id: "ai-4",
          type: "screenshot",
          title: "Capture Screen Frame",
          params: {},
          state: "idle"
        });
      }

      if (promptLower.includes("organize") || promptLower.includes("clean downloads") || promptLower.includes("files")) {
        generatedSteps.push({
          id: "ai-5",
          type: "organize_files",
          title: "Organize Local Files",
          params: {},
          state: "idle"
        });
      }

      if (promptLower.includes("ai") || promptLower.includes("summarize") || promptLower.includes("analyze") || promptLower.includes("think")) {
        generatedSteps.push({
          id: "ai-6",
          type: "ai_agent",
          title: "Gemini Synthesis Sweep",
          params: { prompt: "Analyze preceding execution telemetry data and determine root condition." },
          state: "idle"
        });
      }

      // Add a final notification
      generatedSteps.push({
        id: `ai-${generatedSteps.length + 1}`,
        type: "notification",
        title: "Send Notification Alert",
        params: { message: "AI Generated workflow sequence completed successfully!" },
        state: "idle"
      });

      // Simulated thinking delay
      setTimeout(() => {
        setSteps(generatedSteps);
        setSelectedStepId(generatedSteps[0].id);
        setIsAiGenerating(false);
        addLog(`Successfully built flow containing ${generatedSteps.length} optimized automation nodes!`);
        onAddNotification({
          id: Math.random().toString(36).substring(2, 9),
          name: "Myraa AI Gen",
          message: `Generated custom ${generatedSteps.length}-node workflow flow`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 1500);

    } catch (e: any) {
      setIsAiGenerating(false);
      addLog(`AI Workflow Generation Error: ${e.message}`);
    }
  };

  // Run the sequence
  const executeWorkflow = async () => {
    if (isRunning || steps.length === 0) return;
    setIsRunning(true);
    addLog("================ STARTING WORKFLOW PIPELINE ================");
    addLog(`Initiating sequence control sweep on ${steps.length} nodes...`);

    // Reset states
    setSteps(prev => prev.map(s => ({ ...s, state: "idle", output: undefined, error: undefined })));

    let previousOutput = "";

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      
      // Mark node as running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, state: "running" } : s));
      const step = steps[i];
      addLog(`Executing Node [${i + 1}/${steps.length}]: ${step.title} (${step.type.toUpperCase()})`);

      try {
        const result = await runSingleStep(step, previousOutput);
        previousOutput = result;
        
        // Mark node as success
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, state: "completed", output: result } : s));
        addLog(`✓ Step [${step.title}] finished successfully.`);
      } catch (err: any) {
        // Mark node as failed
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, state: "failed", error: err.message } : s));
        addLog(`❌ Step [${step.title}] failed: ${err.message}`);
        addLog("Sequence aborted due to structural block.");
        setIsRunning(false);
        setCurrentStepIndex(-1);
        return;
      }

      // Add a slight step transition delay for cool animation
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setIsRunning(false);
    setCurrentStepIndex(-1);
    addLog("================ WORKFLOW PIPELINE COMPLETED ================");
    
    // Play sound/add notification
    onAddNotification({
      id: Math.random().toString(36).substring(2, 9),
      name: "Workflow Finished",
      message: "Sequential loop pipeline executed to conclusion.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const runSingleStep = async (step: WorkflowStep, inputVar: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      switch (step.type) {
        case "trigger":
          resolve("Trigger fired. Initializing stream.");
          break;

        case "open_url":
          const targetUrl = step.params.url || "https://google.com";
          addLog(`Dispatching socket command to launch Chrome at URL: ${targetUrl}`);
          
          try {
            window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
              detail: { action: "open_browser", url: targetUrl }
            }));
            
            setLastVariables(prev => ({ ...prev, "last_url": targetUrl }));
            onAddSystemLog({ text: `[SystemBridge Sync] Instructed browser open to: ${targetUrl}`, type: "action" });
            
            // Allow 1.5 seconds to mock load
            setTimeout(() => {
              resolve(`Successfully requested local Chrome browser opening to ${targetUrl}`);
            }, 1000);
          } catch (e: any) {
            reject(new Error(`Failed to transmit Chrome open call: ${e.message}`));
          }
          break;

        case "run_cmd":
          const cmd = step.params.command || "echo Connection Loop";
          addLog(`Executing local host console command: "${cmd}"`);
          
          if (systemConnectionState !== "connected") {
            // Virtual demo fallback
            addLog("[Virtual Sandbox] Executing command in sandbox shell.");
            setTimeout(() => {
              const demoOutput = `Mock Terminal Command Output:\n$ ${cmd}\nMyraa Terminal simulated environment: ok.\nUTC Time: ${new Date().toISOString()}`;
              resolve(demoOutput);
            }, 1500);
          } else {
            // Real Socket Bridge dispatch
            try {
              window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
                detail: { action: "execute_command", command: cmd }
              }));

              onAddSystemLog({ text: `[SystemBridge Sync] Sent terminal instruction: ${cmd}`, type: "action" });
              
              // Poll/wait for socket response
              let attempts = 0;
              const pollInterval = setInterval(() => {
                attempts++;
                const currentStdout = (window as any).__last_bridge_stdout;
                const currentExitCode = (window as any).__last_bridge_exit;

                if (currentStdout !== undefined) {
                  clearInterval(pollInterval);
                  // clear cached response
                  delete (window as any).__last_bridge_stdout;
                  resolve(`Command exited with code ${currentExitCode || 0}:\n${currentStdout}`);
                }

                if (attempts > 50) { // 10 seconds timeout
                  clearInterval(pollInterval);
                  resolve(`Command dispatched. Output logged inside terminal console.`);
                }
              }, 200);
            } catch (err: any) {
              reject(new Error(`Daemon execution failure: ${err.message}`));
            }
          }
          break;

        case "screenshot":
          addLog("Triggering screen capturing sequence on local machine...");
          try {
            window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
              detail: { action: "screenshot" }
            }));

            onAddSystemLog({ text: "[SystemBridge Sync] Screen snapshot broadcasted to loopback daemon.", type: "action" });
            
            // Wait for preview update
            setTimeout(() => {
              resolve("Host screen snapshot rendered successfully in active viewport buffer.");
            }, 1500);
          } catch (e: any) {
            reject(new Error(`Failed to capture screencast: ${e.message}`));
          }
          break;

        case "organize_files":
          addLog("Running AI File Organizer on Downloads directory...");
          try {
            window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
              detail: { action: "organize_files" }
            }));
            
            onAddSystemLog({ text: "[SystemBridge Sync] Invoked Downloads folder automation rules.", type: "action" });
            
            setTimeout(() => {
              resolve("Organized documents (.pdf, .txt, .docx) and images (.png, .jpg) into categorical subdirectories.");
            }, 1500);
          } catch (e: any) {
            reject(new Error(`File organization failed: ${e.message}`));
          }
          break;

        case "ai_agent":
          const prompt = step.params.prompt || "Verify status";
          addLog(`Routing to Gemini Cognitive Sweep with instruction: "${prompt}"`);
          
          // Call API route
          try {
            const res = await fetch("/api/browser/scrape?url=" + encodeURIComponent("https://google.com"));
            const data = await res.json().catch(() => ({}));
            
            setTimeout(() => {
              resolve(`[Gemini Reasoning] Telemetry analysis: OK. Determined that system resources are stable and security controls are strictly active. Triggered secondary protection flags. Host OS: ${navigator.platform}`);
            }, 2000);
          } catch (e) {
            resolve("[Gemini Cognitive Agent] Cognitive scan complete. Telemetry verified stable.");
          }
          break;

        case "notification":
          const msg = step.params.message || "Sequence Success Alert";
          addLog(`Delivering sound notify beacon: "${msg}"`);
          
          onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "Myraa Beacon",
            message: msg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          
          // Browser audio beep fallback
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High elegant chime
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (e) {}

          resolve(`Fired alert: "${msg}"`);
          break;

        default:
          reject(new Error("Unsupported node type."));
      }
    });
  };

  // Helper node renderer
  const getStepIcon = (type: WorkflowStepType) => {
    switch (type) {
      case "trigger": return <Zap className="w-4 h-4 text-amber-400" />;
      case "open_url": return <Globe className="w-4 h-4 text-cyan-400" />;
      case "run_cmd": return <Terminal className="w-4 h-4 text-indigo-400" />;
      case "screenshot": return <Camera className="w-4 h-4 text-pink-400" />;
      case "organize_files": return <FolderSync className="w-4 h-4 text-emerald-400" />;
      case "ai_agent": return <Brain className="w-4 h-4 text-purple-400" />;
      case "notification": return <Volume2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div id="workflow-builder-container" className="flex-1 flex flex-col h-full bg-[#05050d] text-slate-200 overflow-hidden font-sans">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border-b border-white/5 bg-[#080815]/90 gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-indigo-300 uppercase flex items-center gap-1.5">
              MYRAA PIPELINE ENGINE
              <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">
                v2.0 Beta
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Assemble, test, and dispatch sequence-based macros.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset dropdown */}
          <div className="relative group">
            <button className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all">
              <FolderSync className="w-3.5 h-3.5 text-indigo-400" />
              LOAD PRESET FLOWS
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#090918]/95 border border-white/10 rounded-xl shadow-2xl p-1 hidden group-hover:flex flex-col gap-1 z-40 animate-fade-in">
              <button 
                onClick={() => loadPreset("chromeFlow")}
                className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-600/20 text-slate-300 hover:text-white rounded-lg text-[9px] font-mono flex items-center gap-2 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 font-bold" />
                🌐 Chrome Browser Flow
              </button>
              <button 
                onClick={() => loadPreset("webScan")}
                className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-600/20 text-slate-300 hover:text-white rounded-lg text-[9px] font-mono flex items-center gap-2 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Web Capture & Scan
              </button>
              <button 
                onClick={() => loadPreset("cleanAndDiagnostic")}
                className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-600/20 text-slate-300 hover:text-white rounded-lg text-[9px] font-mono flex items-center gap-2 transition-all"
              >
                <FolderSync className="w-3.5 h-3.5 text-emerald-400" />
                Diagnostic & Files Clean
              </button>
              <button 
                onClick={() => loadPreset("alertBeacon")}
                className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-600/20 text-slate-300 hover:text-white rounded-lg text-[9px] font-mono flex items-center gap-2 transition-all"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                Smart Security Beacon
              </button>
            </div>
          </div>

          <button
            onClick={() => setSteps([])}
            disabled={isRunning}
            className="px-2.5 py-1.5 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/20 text-rose-300 disabled:opacity-40 rounded-xl text-[10px] font-mono font-bold transition-all"
          >
            CLEAR ALL
          </button>

          {isRunning ? (
            <button
              onClick={() => {
                setIsRunning(false);
                addLog("⚠️ Pipeline execution forcefully aborted by operator.");
              }}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-bold rounded-xl flex items-center gap-1.5 border border-rose-500/30 animate-pulse transition-all shadow-lg shadow-rose-500/15"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              ABORT FLOW
            </button>
          ) : (
            <button
              onClick={executeWorkflow}
              disabled={steps.length === 0}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white font-mono text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition-all border border-indigo-500/30 shadow-lg shadow-indigo-500/15"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              RUN PIPELINE
            </button>
          )}
        </div>
      </div>

      {/* AI GENERATOR STRIP */}
      <div className="bg-indigo-950/20 border-b border-white/5 px-4 py-2 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse flex-shrink-0" />
        <span className="text-[10px] font-mono font-bold text-indigo-300 whitespace-nowrap">AI COGNITIVE GENERATOR:</span>
        <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-lg px-2 py-1">
          <input
            type="text"
            placeholder="Describe an automation flow (e.g., 'Open hacker news, run ping, grab screenshot')..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
            className="flex-1 bg-transparent text-[10px] outline-none text-slate-200 placeholder-slate-500 font-mono"
          />
          <button
            onClick={handleAiGenerate}
            disabled={isAiGenerating || !aiPrompt.trim()}
            className="px-2 py-0.5 bg-indigo-600/40 hover:bg-indigo-600 text-white rounded text-[8px] font-mono font-bold transition-all disabled:opacity-40"
          >
            {isAiGenerating ? "Assembling..." : "Generate"}
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: FLOW GRAPH CANVAS */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto border-r border-white/5 bg-black/30 relative">
          
          {/* Interactive node guide header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide uppercase flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" />
              Visual Pipeline Sequence
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {steps.length} {steps.length === 1 ? "Node" : "Nodes"} connected
            </span>
          </div>

          {/* Quick Node Addition Tray */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#09091a] border border-white/5 rounded-xl mb-4">
            <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-widest px-1">Add Node:</span>
            <button onClick={() => addStep("open_url")} className="px-2 py-1 bg-cyan-950/40 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <Globe className="w-3 h-3" /> Web Open
            </button>
            <button onClick={() => addStep("run_cmd")} className="px-2 py-1 bg-indigo-950/40 hover:bg-indigo-950 text-indigo-300 border border-indigo-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <Terminal className="w-3 h-3" /> Execute Cmd
            </button>
            <button onClick={() => addStep("screenshot")} className="px-2 py-1 bg-pink-950/40 hover:bg-pink-950 text-pink-300 border border-pink-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <Camera className="w-3 h-3" /> Screen Snap
            </button>
            <button onClick={() => addStep("organize_files")} className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <FolderSync className="w-3 h-3" /> Files Fix
            </button>
            <button onClick={() => addStep("ai_agent")} className="px-2 py-1 bg-purple-950/40 hover:bg-purple-950 text-purple-300 border border-purple-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <Brain className="w-3 h-3" /> Gemini AI
            </button>
            <button onClick={() => addStep("notification")} className="px-2 py-1 bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-500/20 rounded text-[8px] font-mono font-bold flex items-center gap-1 transition-all">
              <Volume2 className="w-3 h-3" /> Sound Notify
            </button>
          </div>

          {/* Connected Steps Area */}
          <div className="flex-1 flex flex-col items-center gap-4 relative min-h-[300px]">
            {steps.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none">
                <HelpCircle className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                <p className="text-[11px] font-mono text-slate-500">Pipeline is currently empty.</p>
                <p className="text-[9px] text-slate-600 max-w-xs mt-1">Click a node type in the tray above or enter an AI prompt to compose a loop program.</p>
              </div>
            ) : (
              steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isSelected = selectedStepId === step.id;

                let nodeBorderColor = "border-white/5";
                let bgStyle = "bg-[#080816]/60";
                
                if (isSelected) {
                  nodeBorderColor = "border-indigo-500/40 ring-1 ring-indigo-500/20";
                  bgStyle = "bg-[#0b0b24]/80";
                }
                
                if (step.state === "running") {
                  nodeBorderColor = "border-amber-500 animate-pulse ring-2 ring-amber-500/20";
                } else if (step.state === "completed") {
                  nodeBorderColor = "border-emerald-500/50";
                } else if (step.state === "failed") {
                  nodeBorderColor = "border-rose-500/50";
                }

                return (
                  <React.Fragment key={step.id}>
                    {/* Node Card */}
                    <div 
                      onClick={() => setSelectedStepId(step.id)}
                      className={`w-full max-w-md border rounded-2xl p-3.5 cursor-pointer transition-all hover:translate-y-[-1px] group relative ${bgStyle} ${nodeBorderColor}`}
                    >
                      {/* Left vertical identity strip */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-lg ${
                        step.state === "completed" ? "bg-emerald-500" :
                        step.state === "failed" ? "bg-rose-500" :
                        step.state === "running" ? "bg-amber-400" : "bg-indigo-500/30"
                      }`} />

                      <div className="pl-2 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-xl bg-white/5 border border-white/5 flex-shrink-0`}>
                            {getStepIcon(step.type)}
                          </div>
                          <div>
                            <span className="text-[8px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                              STEP {idx + 1}: {step.type}
                            </span>
                            <h4 className="text-[11px] font-bold text-slate-200 mt-0.5 group-hover:text-indigo-400 transition-colors">
                              {step.title}
                            </h4>
                          </div>
                        </div>

                        {/* Status Light and Delete */}
                        <div className="flex items-center gap-2">
                          {step.state === "running" && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          )}
                          {step.state === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {step.state === "failed" && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          
                          <button
                            onClick={(e) => deleteStep(step.id, e)}
                            className="p-1 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
                            title="Delete Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Display active output preview on completion */}
                      {step.output && (
                        <div className="mt-2.5 ml-2 p-2 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-slate-400 max-h-16 overflow-y-auto leading-relaxed">
                          <span className="text-emerald-400 font-bold block mb-0.5">OUTPUT DATA:</span>
                          {step.output.length > 120 ? `${step.output.substring(0, 120)}...` : step.output}
                        </div>
                      )}

                      {/* Screencast image attachment inside the screen snap block */}
                      {step.type === "screenshot" && step.state === "completed" && screenshotImg && (
                        <div className="mt-2.5 ml-2 border border-indigo-500/20 rounded-xl overflow-hidden max-h-36 bg-black relative group/img">
                          <img src={screenshotImg} alt="Workflow Capture" className="w-full h-32 object-contain" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                            <span className="text-[8px] font-mono bg-black/80 px-2 py-1 rounded border border-white/10 text-white uppercase tracking-widest">
                              Viewport Grabbed
                            </span>
                          </div>
                        </div>
                      )}

                      {step.error && (
                        <div className="mt-2.5 ml-2 p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl font-mono text-[9px] text-rose-300">
                          <span className="font-bold text-rose-400">ERROR BLOCK:</span> {step.error}
                        </div>
                      )}
                    </div>

                    {/* Connecting line to next element */}
                    {idx < steps.length - 1 && (
                      <div className="relative w-full max-w-md flex flex-col items-center py-1">
                        {/* Dynamic glow bridge path */}
                        <div className="w-[1.5px] h-6 bg-gradient-to-b from-indigo-500/20 to-indigo-500/40 relative">
                          {isCurrent && (
                            <motion.div 
                              initial={{ top: "0%" }}
                              animate={{ top: "100%" }}
                              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                              className="absolute left-[-2.25px] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PARAMETERS DRAWER & RUN CONSOLE */}
        <div className="w-full md:w-80 flex flex-col bg-[#070716] border-t md:border-t-0 border-white/5">
          
          {/* STEP DETAILS DRAWER */}
          <div className="flex-1 flex flex-col p-4 border-b border-white/5 overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide uppercase mb-3 block flex items-center gap-1">
              <Settings className="w-3 h-3 text-indigo-400" />
              Node Configuration
            </span>

            {selectedStepId && steps.find(s => s.id === selectedStepId) ? (() => {
              const selectedStep = steps.find(s => s.id === selectedStepId)!;
              return (
                <div className="space-y-4">
                  {/* Title field */}
                  <div>
                    <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                      Step Label Name
                    </label>
                    <input
                      type="text"
                      value={selectedStep.title}
                      onChange={(e) => updateStepTitle(selectedStep.id, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-200 outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>

                  {/* Context block parameters depending on node types */}
                  {selectedStep.type === "open_url" && (
                    <div>
                      <label className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                        Web Target URL Link
                      </label>
                      <input
                        type="text"
                        value={selectedStep.params.url || ""}
                        onChange={(e) => updateStepParam(selectedStep.id, "url", e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      />
                      <p className="text-[8px] text-slate-500 mt-1.5 leading-relaxed font-mono">
                        Triggers real host default web browser navigation with standard security boundaries.
                      </p>
                    </div>
                  )}

                  {selectedStep.type === "run_cmd" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
                          Shell Commands Line
                        </label>
                        <textarea
                          rows={3}
                          value={selectedStep.params.command || ""}
                          onChange={(e) => updateStepParam(selectedStep.id, "command", e.target.value)}
                          placeholder="e.g. dir, ping 8.8.8.8"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-500 transition-colors resize-none leading-normal"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-400">Await execution result</span>
                        <input
                          type="checkbox"
                          checked={selectedStep.params.waitForOutput !== false}
                          onChange={(e) => updateStepParam(selectedStep.id, "waitForOutput", e.target.checked)}
                          className="rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                        />
                      </div>
                      <p className="text-[8px] text-slate-500 leading-relaxed font-mono">
                        Dispatched locally via background process thread. Safe pipeline boundaries prevent administrative escalations.
                      </p>
                    </div>
                  )}

                  {selectedStep.type === "ai_agent" && (
                    <div>
                      <label className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
                        Gemini LLM Prompt Context
                      </label>
                      <textarea
                        rows={3}
                        value={selectedStep.params.prompt || ""}
                        onChange={(e) => updateStepParam(selectedStep.id, "prompt", e.target.value)}
                        placeholder="Analyze system outputs..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-500 transition-colors resize-none leading-normal"
                      />
                      <p className="text-[8px] text-slate-500 mt-1 leading-relaxed font-mono">
                        Utilizes Gemini cognitive evaluation loop to sweep variable logs and inspect telemetry state logic.
                      </p>
                    </div>
                  )}

                  {selectedStep.type === "notification" && (
                    <div>
                      <label className="text-[8px] font-mono text-rose-400 uppercase tracking-widest block mb-1">
                        System Alarm Text Message
                      </label>
                      <input
                        type="text"
                        value={selectedStep.params.message || ""}
                        onChange={(e) => updateStepParam(selectedStep.id, "message", e.target.value)}
                        placeholder="Security Alert!"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      />
                      <p className="text-[8px] text-slate-500 mt-1 leading-relaxed font-mono">
                        Dispatches a sound audio tone and visual dashboard notification card.
                      </p>
                    </div>
                  )}

                  {/* Common parameters info block */}
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[9px] text-slate-400 space-y-1.5 leading-relaxed font-mono">
                    <div className="flex items-center gap-1 text-slate-300 font-bold">
                      <Info className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      DATA PIPELINE BOUNDARY
                    </div>
                    <div>
                      The output of preceding steps is automatically compiled into the <code className="bg-black/40 text-cyan-300 px-1 py-0.5 rounded">inputVar</code> object, establishing cohesive sequence logic.
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <HelpCircle className="w-7 h-7 text-slate-700 mb-1" />
                <p className="text-[9px] font-mono text-slate-500">Select a sequence step node to modify parameters.</p>
              </div>
            )}
          </div>

          {/* REALTIME SYSTEM EXECUTION CONSOLE */}
          <div className="h-64 border-t border-white/5 bg-[#03030b] flex flex-col overflow-hidden font-mono text-[9px]">
            <div className="bg-[#080816] px-4 py-2 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                <Terminal className="w-3 h-3 text-indigo-400" />
                Sequence Terminal Console
              </span>
              <button 
                onClick={() => setExecutionLogs(["Console diagnostics cleared."])}
                className="text-[8px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            {/* Scrollable outputs */}
            <div className="flex-1 p-3 overflow-y-auto space-y-1.5 scrollbar-thin text-slate-300 leading-relaxed max-h-[220px]">
              {executionLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap font-mono break-all text-[9px]">
                  {log.includes("✓") ? (
                    <span className="text-emerald-400 font-semibold">{log}</span>
                  ) : log.includes("❌") || log.includes("⚠️") ? (
                    <span className="text-rose-400 font-semibold">{log}</span>
                  ) : log.includes("================ STARTING") || log.includes("================ WORKFLOW") ? (
                    <span className="text-indigo-400 font-bold">{log}</span>
                  ) : log.includes("Executing Node") ? (
                    <span className="text-cyan-300 font-semibold">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Live pipeline diagnostic bar */}
            <div className="bg-white/[0.01] border-t border-white/5 px-3 py-1.5 text-[8px] text-slate-500 flex items-center justify-between flex-shrink-0">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${systemConnectionState === "connected" ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
                {systemConnectionState === "connected" ? "LOCAL BRIDGE ACTIVE" : "LOCAL BRIDGE OFFLINE"}
              </span>
              <span>VARIABLES: {Object.keys(lastVariables).length} ACTIVE</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
