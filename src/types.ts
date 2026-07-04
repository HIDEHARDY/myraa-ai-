export type AssistantState = "disconnected" | "connecting" | "listening" | "speaking";

export type GlowTheme = "cyan" | "emerald" | "magenta" | "amber" | "violet" | "crimson";

export interface HolographicCardData {
  id: string;
  title: string;
  content: string;
  category: "weather" | "fact" | "joke" | "info" | "search";
  timestamp: string;
}

export interface ToolCallItem {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolExecutionNotification {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface SessionStats {
  latencyMs: number;
  inputVolume: number; // 0 to 1
  outputVolume: number; // 0 to 1
  sessionDurationSec: number;
}

export type MemoryCategory =
  | "Personal Information"
  | "Preferences"
  | "Projects"
  | "Conversations"
  | "Tasks"
  | "Notes"
  | "Learned Facts";

export type MemoryImportance = "high" | "medium" | "low";

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  importance: MemoryImportance;
  createdAt: number;
  tags?: string[];
}

export interface MemoryStorageStats {
  totalCapacityKB: number;
  usedKB: number;
  availableKB: number;
  totalMemories: number;
  categoryBreakdown: Record<MemoryCategory, number>;
}

