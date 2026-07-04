import { AssistantState, GlowTheme, HolographicCardData, ToolExecutionNotification } from "../types";

/**
 * StateManager module
 * Manages core reactive UI states and statistics for Myraa.
 */

export interface AppState {
  assistantState: AssistantState;
  theme: GlowTheme;
  activeCard: HolographicCardData | null;
  activePortal: { url: string; title: string } | null;
  notifications: ToolExecutionNotification[];
  inputVolume: number; // 0 to 1
  outputVolume: number; // 0 to 1
  sessionStartTime: number | null;
  sessionDurationSec: number;
  latencyMs: number;
  errorMessage: string | null;
  isMuted: boolean;
  // OS & Desktop Automation State
  runningApps: Array<{ name: string; state: 'running' | 'minimized' | 'maximized' | 'closed'; isFocused: boolean }>;
  terminalLogs: Array<{ text: string; type: 'command' | 'output' | 'error' }>;
  activePath: string;
  explorerFiles: Array<{ name: string; isDirectory: boolean; size: number }>;
  activeBrowser: { url: string; title: string; tabs: string[]; activeTabIdx: number; content: string; isOpen: boolean };
  activeSocial: { platform: string; activeChatName: string; messages: Array<{ sender: string; text: string; time: string }>; notificationAlerts: number };
  terminalApprovalRequest: { command: string; terminalType: string; resolve: (approved: boolean) => void } | null;
}

export type StateListener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  private timerInterval: any = null;

  constructor() {
    this.state = {
      assistantState: "disconnected",
      theme: "cyan",
      activeCard: null,
      activePortal: null,
      notifications: [],
      inputVolume: 0,
      outputVolume: 0,
      sessionStartTime: null,
      sessionDurationSec: 0,
      latencyMs: 14,
      errorMessage: null,
      isMuted: false,
      runningApps: [
        { name: "VS Code", state: "closed", isFocused: false },
        { name: "Google Chrome", state: "closed", isFocused: false },
        { name: "Spotify", state: "closed", isFocused: false },
        { name: "Notepad", state: "closed", isFocused: false },
        { name: "Terminal", state: "closed", isFocused: false },
        { name: "Slack", state: "closed", isFocused: false },
        { name: "Discord", state: "closed", isFocused: false },
        { name: "Photoshop", state: "closed", isFocused: false },
        { name: "Workflow Builder", state: "closed", isFocused: false }
      ],
      terminalLogs: [
        { text: "Windows PowerShell v7.4.2", type: "output" },
        { text: "Initializing Myraa Secure Execution Layer...", type: "output" },
        { text: "Systems online. Ready for user authorized instructions.", type: "output" }
      ],
      activePath: "",
      explorerFiles: [
        { name: "welcome.md", isDirectory: false, size: 520 },
        { name: "notes.txt", isDirectory: false, size: 240 },
        { name: "package.json", isDirectory: false, size: 310 },
        { name: "src", isDirectory: true, size: 0 }
      ],
      activeBrowser: {
        url: "about:blank",
        title: "New Tab",
        tabs: ["New Tab"],
        activeTabIdx: 0,
        content: "Browser initialized. Type a query or ask Myraa to automate your web navigation.",
        isOpen: false
      },
      activeSocial: {
        platform: "Slack",
        activeChatName: "#general",
        messages: [
          { sender: "System", text: "Social hub sync established.", time: "09:00 AM" },
          { sender: "Sarah", text: "Hey! Let me know when the project is ready.", time: "09:12 AM" }
        ],
        notificationAlerts: 3
      },
      terminalApprovalRequest: null
    };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state));
  }

  public setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public getState(): AppState {
    return this.state;
  }

  public setAssistantState(s: AssistantState): void {
    if (s === "listening" && this.state.sessionStartTime === null) {
      this.startSessionTimer();
    } else if (s === "disconnected") {
      this.stopSessionTimer();
    }
    this.setState({ assistantState: s });
  }

  public addNotification(notif: ToolExecutionNotification): void {
    const updated = [notif, ...this.state.notifications].slice(0, 10);
    this.setState({ notifications: updated });
  }

  private startSessionTimer(): void {
    this.stopSessionTimer();
    this.setState({ sessionStartTime: Date.now(), sessionDurationSec: 0 });
    this.timerInterval = setInterval(() => {
      if (this.state.sessionStartTime) {
        const diff = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
        this.setState({ sessionDurationSec: diff });
      }
    }, 1000);
  }

  private stopSessionTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.setState({ sessionStartTime: null, sessionDurationSec: 0 });
  }
}
