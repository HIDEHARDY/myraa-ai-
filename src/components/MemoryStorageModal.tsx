import React, { useState, useEffect, useMemo, useRef } from "react";
import { MemoryCategory, MemoryImportance, MemoryItem } from "../types";
import { globalMemoryManager } from "../modules/MemoryManager";
import { 
  Database, HardDrive, Cpu, Search, Filter, ArrowUpDown, 
  Download, Upload, Trash2, CheckSquare, Square, Plus, X, 
  Sparkles, ShieldCheck, AlertCircle, Bookmark, Tag
} from "lucide-react";

interface MemoryStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<MemoryCategory, string> = {
  "Personal Information": "👤",
  "Preferences": "⚙️",
  "Projects": "🚀",
  "Conversations": "💬",
  "Tasks": "✅",
  "Notes": "📝",
  "Learned Facts": "💡"
};

const categoryColors: Record<MemoryCategory, string> = {
  "Personal Information": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Preferences": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Projects": "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  "Conversations": "text-pink-400 bg-pink-500/10 border-pink-500/30",
  "Tasks": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Notes": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "Learned Facts": "text-yellow-300 bg-yellow-500/10 border-yellow-500/30"
};

export const MemoryStorageModal: React.FC<MemoryStorageModalProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [stats, setStats] = useState(globalMemoryManager.getStorageStats());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "importance">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Quick Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryCategory>("Notes");
  const [newContent, setNewContent] = useState("");
  const [newImportance, setNewImportance] = useState<MemoryImportance>("medium");
  const [newTagsInput, setNewTagsInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = () => {
    setMemories(globalMemoryManager.getMemories());
    setStats(globalMemoryManager.getStorageStats());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const unsub = globalMemoryManager.subscribe(() => {
        refreshData();
      });
      const handleWinEvent = () => refreshData();
      window.addEventListener("myraa_memory_updated", handleWinEvent);

      return () => {
        unsub();
        window.removeEventListener("myraa_memory_updated", handleWinEvent);
      };
    }
  }, [isOpen]);

  // Filtered and Sorted Memories
  const displayedMemories = useMemo(() => {
    let list = memories;

    if (selectedCategory !== "All") {
      list = list.filter((m) => m.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((m) => {
        return m.content.toLowerCase().includes(q) || m.tags?.some((t) => t.toLowerCase().includes(q));
      });
    }

    return [...list].sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      if (sortBy === "importance") {
        const rank = { high: 3, medium: 2, low: 1 };
        return (rank[b.importance] || 2) - (rank[a.importance] || 2);
      }
      return 0;
    });
  }, [memories, selectedCategory, searchQuery, sortBy]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === displayedMemories.length && displayedMemories.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedMemories.map((m) => m.id)));
    }
  };

  const handleDeleteIndividual = (id: string) => {
    globalMemoryManager.deleteMemory(id);
    const nextSel = new Set(selectedIds);
    nextSel.delete(id);
    setSelectedIds(nextSel);
  };

  const handleClearSelected = () => {
    if (selectedIds.size === 0) return;
    globalMemoryManager.clearSelectedMemories(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const res = globalMemoryManager.importMemoriesJson(text);
        if (res.error) {
          setImportStatus(`Import Failed: ${res.error}`);
        } else {
          setImportStatus(`Successfully imported ${res.importedCount} neural memories!`);
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const tags = newTagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    globalMemoryManager.saveMemory({
      category: newCategory,
      content: newContent,
      importance: newImportance,
      tags
    });
    setNewContent("");
    setNewTagsInput("");
    setShowAddForm(false);
  };

  const allCategories: Array<MemoryCategory | "All"> = [
    "All",
    "Personal Information",
    "Preferences",
    "Projects",
    "Conversations",
    "Tasks",
    "Notes",
    "Learned Facts"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-3 sm:p-6 animate-fade-in select-none">
      <div className="relative w-full max-w-5xl bg-[#0B0B1D] border border-indigo-500/40 rounded-3xl flex flex-col max-h-[92vh] shadow-[0_0_80px_rgba(79,70,229,0.3)] overflow-hidden text-indigo-100 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-2xl">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Memory Storage</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                  ADDITIVE CORE
                </span>
              </div>
              <p className="text-xs text-indigo-300/60 font-mono tracking-wide">
                Long-Term Neural Knowledge & Session Context Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Storage Telemetry Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300/60 mb-1.5">
                <span>TOTAL CAPACITY</span>
                <HardDrive className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {(stats.totalCapacityKB / 1024).toFixed(1)} MB
              </div>
              <div className="text-[10px] text-indigo-300/50 mt-1 font-mono">Expanded Neural Allocation</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-pink-500/30 transition-all">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300/60 mb-1.5">
                <span>USED STORAGE</span>
                <Database className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-pink-400 font-mono tracking-tight">
                {stats.usedKB} KB
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(1, (stats.usedKB / stats.totalCapacityKB) * 100))}%` }} 
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300/60 mb-1.5">
                <span>AVAILABLE STORAGE</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tracking-tight">
                {(stats.availableKB > 1024 ? (stats.availableKB / 1024).toFixed(1) + " MB" : stats.availableKB + " KB")}
              </div>
              <div className="text-[10px] text-emerald-400/60 mt-1 font-mono">Compressed & Deduplicated</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300/60 mb-1.5">
                <span>SAVED MEMORIES</span>
                <Bookmark className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono tracking-tight">
                {stats.totalMemories}
              </div>
              <div className="text-[10px] text-indigo-300/50 mt-1 font-mono">Across {Object.keys(stats.categoryBreakdown).length} Categories</div>
            </div>
          </div>

          {/* Import Notification Banner */}
          {importStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-100 flex items-center gap-2.5 text-xs animate-fade-in font-mono">
              <Sparkles className="w-4 h-4 text-pink-400 animate-spin shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Actions & Controls Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/[0.03] p-3 rounded-2xl border border-white/5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories by keyword or tags..."
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-indigo-300/40 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white">✕</button>
              )}
            </div>

            {/* Action Buttons Group */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Memory</span>
              </button>

              <button
                onClick={() => globalMemoryManager.exportMemoriesJson()}
                title="Export all memories to JSON file"
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import memories from JSON file"
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-pink-400" />
                <span>Import JSON</span>
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleClearSelected}
                  className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all animate-fade-in"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear Selected ({selectedIds.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleCreateMemory} className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 font-mono">✨ CREATE MANUAL LONG-TERM MEMORY</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-indigo-300/70 block mb-1">CATEGORY</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {allCategories.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0B0B1D]">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-indigo-300/70 block mb-1">IMPORTANCE</label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value as MemoryImportance)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high" className="bg-[#0B0B1D]">🔴 High Priority</option>
                    <option value="medium" className="bg-[#0B0B1D]">🟡 Medium Priority</option>
                    <option value="low" className="bg-[#0B0B1D]">🔵 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-indigo-300/70 block mb-1">TAGS (comma separated)</label>
                  <input
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder="e.g. project, goal, voice"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-indigo-300/70 block mb-1">MEMORY CONTENT</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type important context, user preference, task detail, or learned fact..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save Neural Memory
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Tabs & Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2 border-t border-white/5">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1.5 sm:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0 mr-1 hidden sm:block" />
              {allCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === "All" ? memories.length : stats.categoryBreakdown[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-500/25 border border-indigo-500/60 text-white shadow-sm"
                        : "bg-white/5 hover:bg-white/10 border border-transparent text-indigo-300/70 hover:text-white"
                    }`}
                  >
                    {cat !== "All" && <span>{categoryIcons[cat]}</span>}
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-indigo-300/60"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-300/60" />
              <span className="text-[10px] font-mono uppercase text-indigo-300/60">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="newest" className="bg-[#0B0B1D]">⏳ Newest First</option>
                <option value="oldest" className="bg-[#0B0B1D]">⌛ Oldest First</option>
                <option value="importance" className="bg-[#0B0B1D]">🔥 By Importance</option>
              </select>
            </div>
          </div>

          {/* Select All Row */}
          <div className="flex items-center justify-between px-2 text-xs font-mono text-indigo-300/60">
            <button onClick={handleSelectAll} className="flex items-center gap-2 hover:text-white transition-colors">
              {selectedIds.size === displayedMemories.length && displayedMemories.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-white/30" />
              )}
              <span>Select All Displayed ({displayedMemories.length})</span>
            </button>
            <span>Showing {displayedMemories.length} of {memories.length} memories</span>
          </div>

          {/* Memories Cards List */}
          <div className="space-y-3">
            {displayedMemories.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-indigo-300/50">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No saved memories match your criteria.</p>
                <p className="text-xs text-indigo-300/30 mt-1">Try broadening your search or adding a new long-term memory.</p>
              </div>
            ) : (
              displayedMemories.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const colClass = categoryColors[item.category] || "text-indigo-300 bg-white/5 border-white/10";
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group ${
                      isSelected
                        ? "bg-indigo-950/50 border-indigo-500/80 shadow-md"
                        : "bg-white/[0.04] hover:bg-white/[0.07] border-white/10"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="mt-1 text-white/40 hover:text-white transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Main Card Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Category Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${colClass}`}>
                          <span>{categoryIcons[item.category]}</span>
                          <span>{item.category}</span>
                        </span>

                        {/* Importance Badge */}
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider ${
                          item.importance === "high"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : item.importance === "medium"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        }`}>
                          {item.importance} Priority
                        </span>

                        <span className="text-[10px] font-mono text-indigo-300/40 ml-auto">
                          {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Content Text */}
                      <p className="text-xs sm:text-sm text-indigo-100 font-normal leading-relaxed break-words">
                        {item.content}
                      </p>

                      {/* Tags Row */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                          <Tag className="w-3 h-3 text-indigo-400/60 shrink-0" />
                          {item.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-indigo-300/80 border border-white/5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Individual Memory Button */}
                    <button
                      onClick={() => handleDeleteIndividual(item.id)}
                      title="Delete this individual memory"
                      className="p-2 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Modal Footer Safety Note */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-indigo-300/60 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400/90">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NEVER DELETES AUTOMATICALLY • 100% PERSISTENT SAFE VAULT</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all text-xs"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};
