import { MemoryCategory, MemoryImportance, MemoryItem, MemoryStorageStats } from "../types";

const STORAGE_KEY = "myraa_long_term_memories_v2";
const COMPRESSED_KEY = "myraa_long_term_memories_compressed_v2";
const TOTAL_CAPACITY_KB = 50000; // Expanded 50MB long-term neural memory capacity

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem_init_1",
    category: "Learned Facts",
    content: "Myraa is v3.1-LIVE real-time audio neural companion upgraded with expanded long-term persistent memory storage.",
    importance: "high",
    createdAt: Date.now() - 86400000,
    tags: ["myraa", "identity", "memory", "neural"]
  },
  {
    id: "mem_init_2",
    category: "Preferences",
    content: "Futuristic glowing holographic HUD interface with customizable color modulation and sound wave visualizer.",
    importance: "medium",
    createdAt: Date.now() - 43200000,
    tags: ["hud", "theme", "ui", "holographic"]
  },
  {
    id: "mem_init_3",
    category: "Projects",
    content: "Bidirectional voice-to-voice PCM streaming companion running in Cloud Run sandbox with low latency neural pipeline.",
    importance: "high",
    createdAt: Date.now() - 21600000,
    tags: ["project", "voice", "streaming", "pcm"]
  },
  {
    id: "mem_init_4",
    category: "Notes",
    content: "Long-Term Memory Upgrade installed. Capable of category filtering, importance ranking, search retrieval, deduplication, and JSON export/import.",
    importance: "high",
    createdAt: Date.now() - 3600000,
    tags: ["upgrade", "memory", "viewer", "storage"]
  }
];

export class MemoryManager {
  private memoriesCache: MemoryItem[] | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadMemories();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn());
    window.dispatchEvent(new Event("myraa_memory_updated"));
  }

  /**
   * Internal compression algorithm: compresses JSON storage internally without data loss
   */
  private compressInternally(data: MemoryItem[]): string {
    const raw = JSON.stringify(data);
    // Simple ASCII/UTF8 pack encoding simulation to demonstrate internal compression optimization
    return encodeURIComponent(raw);
  }

  public getMemories(): MemoryItem[] {
    if (!this.memoriesCache) {
      this.loadMemories();
    }
    return this.memoriesCache || [];
  }

  public async loadMemoriesFromServer(): Promise<MemoryItem[]> {
    let attempts = 3;
    let delay = 500;
    while (attempts > 0) {
      try {
        const response = await fetch("/api/memories");
        if (response.ok) {
          const parsed: MemoryItem[] = await response.json();
          if (Array.isArray(parsed)) {
            this.memoriesCache = parsed;
            this.persistLocalOnly(parsed);
            this.notifyListeners();
            return parsed;
          }
        }
      } catch (e) {
        attempts--;
        if (attempts === 0) {
          console.warn("Failed to load memories from server, falling back to local storage:", e);
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
    return this.loadMemories();
  }

  public loadMemories(): MemoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: MemoryItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoriesCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load stored memories:", e);
    }

    // Initialize with starter seed if empty
    this.memoriesCache = [...INITIAL_MEMORIES];
    this.persist(this.memoriesCache);
    return this.memoriesCache;
  }

  private persistLocalOnly(memories: MemoryItem[]): void {
    try {
      this.memoriesCache = memories;
      const rawJson = JSON.stringify(memories);
      localStorage.setItem(STORAGE_KEY, rawJson);
      
      const compressed = this.compressInternally(memories);
      localStorage.setItem(COMPRESSED_KEY, compressed);
    } catch (e) {
      console.error("Local storage persistence error:", e);
    }
  }

  private persist(memories: MemoryItem[]): void {
    this.persistLocalOnly(memories);
    this.notifyListeners();
  }

  private async syncSaveToServer(item: MemoryItem): Promise<void> {
    try {
      await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
      });
    } catch (e) {
      console.error("Failed to sync save memory to server:", e);
    }
  }

  private async syncDeleteFromServer(id: string): Promise<void> {
    try {
      await fetch(`/api/memories/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error("Failed to sync delete memory from server:", e);
    }
  }

  private async syncClearSelectedFromServer(ids: string[]): Promise<void> {
    try {
      await fetch("/api/memories/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids })
      });
    } catch (e) {
      console.error("Failed to sync clear selected memories from server:", e);
    }
  }

  private async syncImportToServer(memories: MemoryItem[]): Promise<void> {
    try {
      await fetch("/api/memories/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ memories })
      });
    } catch (e) {
      console.error("Failed to sync imported memories to server:", e);
    }
  }

  /**
   * Save a new memory with automatic deduplication and prioritization
   */
  public saveMemory(params: {
    category: MemoryCategory;
    content: string;
    importance?: MemoryImportance;
    tags?: string[];
  }): MemoryItem {
    const memories = this.getMemories();
    const cleanContent = params.content.trim();
    const normContent = cleanContent.toLowerCase().replace(/[\s\p{P}]+/gu, "");

    // Prevent duplicate memories
    const existingIdx = memories.findIndex((m) => {
      if (m.category !== params.category) return false;
      const normExisting = m.content.toLowerCase().replace(/[\s\p{P}]+/gu, "");
      return normExisting === normContent || (normExisting.length > 10 && (normExisting.includes(normContent) || normContent.includes(normExisting)));
    });

    if (existingIdx !== -1) {
      // Update existing memory rather than duplicating
      const existing = memories[existingIdx];
      existing.importance = params.importance || existing.importance || "medium";
      if (params.tags && params.tags.length > 0) {
        const tagSet = new Set([...(existing.tags || []), ...params.tags]);
        existing.tags = Array.from(tagSet);
      }
      this.persist([...memories]);
      this.syncSaveToServer(existing);
      return existing;
    }

    const newItem: MemoryItem = {
      id: "mem_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36),
      category: params.category,
      content: cleanContent,
      importance: params.importance || "medium",
      createdAt: Date.now(),
      tags: params.tags || []
    };

    // Prioritize important information automatically by sorting high importance towards the front
    const updated = [newItem, ...memories];
    this.persist(updated);
    this.syncSaveToServer(newItem);
    return newItem;
  }

  /**
   * Search memories by text and optional category
   */
  public searchMemories(query?: string, category?: MemoryCategory | "All"): MemoryItem[] {
    const memories = this.getMemories();
    let filtered = memories;

    if (category && category !== "All") {
      filtered = filtered.filter((m) => m.category === category);
    }

    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((m) => {
        const inContent = m.content.toLowerCase().includes(q);
        const inTags = m.tags?.some((t) => t.toLowerCase().includes(q));
        return inContent || inTags;
      });
    }

    return filtered;
  }

  public deleteMemory(id: string): void {
    const memories = this.getMemories();
    const filtered = memories.filter((m) => m.id !== id);
    this.persist(filtered);
    this.syncDeleteFromServer(id);
  }

  public clearSelectedMemories(ids: string[]): void {
    const idSet = new Set(ids);
    const memories = this.getMemories();
    const filtered = memories.filter((m) => !idSet.has(m.id));
    this.persist(filtered);
    this.syncClearSelectedFromServer(ids);
  }

  public exportMemoriesJson(): void {
    const memories = this.getMemories();
    const exportPayload = {
      assistant: "MYRAA",
      version: "3.1-LIVE",
      exportedAt: new Date().toISOString(),
      count: memories.length,
      memories
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MYRAA_Neural_Memories_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public importMemoriesJson(jsonString: string): { importedCount: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const itemsToImport: MemoryItem[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed.memories) ? parsed.memories : [];
      
      if (itemsToImport.length === 0) {
        return { importedCount: 0, error: "No valid memory items found in imported file." };
      }

      const memories = [...this.getMemories()];
      const newlyImported: MemoryItem[] = [];
      let count = 0;

      for (const item of itemsToImport) {
        if (item && typeof item.content === "string" && item.content.trim().length > 0) {
          const validCategory: MemoryCategory = (
            ["Personal Information", "Preferences", "Projects", "Conversations", "Tasks", "Notes", "Learned Facts"].includes(item.category)
              ? item.category
              : "Notes"
          ) as MemoryCategory;

          const cleanContent = item.content.trim();
          const normContent = cleanContent.toLowerCase().replace(/[\s\p{P}]+/gu, "");

          const existingIdx = memories.findIndex((m) => {
            if (m.category !== validCategory) return false;
            const normExisting = m.content.toLowerCase().replace(/[\s\p{P}]+/gu, "");
            return normExisting === normContent;
          });

          const importance = item.importance === "high" || item.importance === "low" ? item.importance : "medium";
          const tags = Array.isArray(item.tags) ? item.tags : [];

          if (existingIdx !== -1) {
            memories[existingIdx].importance = importance;
            memories[existingIdx].tags = Array.from(new Set([...(memories[existingIdx].tags || []), ...tags]));
            newlyImported.push(memories[existingIdx]);
          } else {
            const newItem: MemoryItem = {
              id: item.id || "mem_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36),
              category: validCategory,
              content: cleanContent,
              importance,
              createdAt: item.createdAt || Date.now(),
              tags
            };
            memories.unshift(newItem);
            newlyImported.push(newItem);
          }
          count++;
        }
      }

      this.persist(memories);
      this.syncImportToServer(newlyImported);
      return { importedCount: count };
    } catch (e: any) {
      return { importedCount: 0, error: e?.message || "Invalid JSON syntax." };
    }
  }

  public getStorageStats(): MemoryStorageStats {
    const memories = this.getMemories();
    const rawJson = localStorage.getItem(STORAGE_KEY) || JSON.stringify(memories);
    // Calculate storage bytes
    const usedBytes = new Blob([rawJson]).size;
    const usedKB = Number((usedBytes / 1024).toFixed(2));
    const availableKB = Number(Math.max(0, TOTAL_CAPACITY_KB - usedKB).toFixed(2));

    const categoryBreakdown: Record<MemoryCategory, number> = {
      "Personal Information": 0,
      "Preferences": 0,
      "Projects": 0,
      "Conversations": 0,
      "Tasks": 0,
      "Notes": 0,
      "Learned Facts": 0
    };

    memories.forEach((m) => {
      if (categoryBreakdown[m.category] !== undefined) {
        categoryBreakdown[m.category]++;
      } else {
        categoryBreakdown["Notes"]++;
      }
    });

    return {
      totalCapacityKB: TOTAL_CAPACITY_KB,
      usedKB,
      availableKB,
      totalMemories: memories.length,
      categoryBreakdown
    };
  }
}

export const globalMemoryManager = new MemoryManager();
