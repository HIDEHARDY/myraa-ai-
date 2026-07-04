import React, { useEffect, useState } from "react";
import { ExternalLink, Globe, X, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, ArrowUpRight } from "lucide-react";

interface WebPortalModalProps {
  portal: { url: string; title: string } | null;
  onClose: () => void;
}

const isRestrictedUrl = (url: string) => {
  const normalized = url.toLowerCase();
  return (
    normalized.includes("whatsapp.com") ||
    normalized.includes("telegram.org") ||
    normalized.includes("mail.google.com") ||
    normalized.includes("google.com/mail") ||
    normalized.includes("discord.com") ||
    normalized.includes("slack.com")
  );
};

const getServiceDetails = (url: string) => {
  const normalized = url.toLowerCase();
  if (normalized.includes("whatsapp.com")) {
    return {
      name: "WhatsApp Web",
      color: "emerald",
      textColor: "text-emerald-400",
      themeColor: "emerald",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      btnBg: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/20",
      glowColor: "rgba(16,185,129,0.35)",
      icon: "💬",
      steps: [
        "Click the glowing 'Securely Launch WhatsApp' button below to open the official WhatsApp client in a new secure tab.",
        "Open WhatsApp on your phone, navigate to settings, and choose 'Linked Devices'.",
        "Scan the QR code displayed on the official WhatsApp Web page using your phone's camera.",
        "Your workspace will instantly synchronize your messages, media, and active contacts."
      ]
    };
  }
  if (normalized.includes("telegram.org")) {
    return {
      name: "Telegram Web",
      color: "sky",
      textColor: "text-sky-400",
      themeColor: "sky",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      btnBg: "bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white shadow-sky-500/20",
      glowColor: "rgba(14,165,233,0.35)",
      icon: "✈️",
      steps: [
        "Click 'Securely Launch Telegram' to initialize the official Telegram Web client in a secure session.",
        "Enter your phone number or scan the QR code using your active Telegram mobile app.",
        "Authenticate using the dynamic confirmation code sent directly to your other devices.",
        "Synchronize your chat channels, workspace groups, and secure messages side-by-side."
      ]
    };
  }
  if (normalized.includes("mail.google.com") || normalized.includes("google.com/mail")) {
    return {
      name: "Gmail Portal",
      color: "rose",
      textColor: "text-rose-400",
      themeColor: "rose",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      btnBg: "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-500/20",
      glowColor: "rgba(244,63,94,0.35)",
      icon: "✉️",
      steps: [
        "Click 'Securely Launch Gmail' to open your primary Google Mail inbox.",
        "Authenticate using your corporate or personal Google account securely.",
        "Receive real-time message summaries, drafts, and high-priority filters.",
        "Let Myraa AI synthesize summaries, construct replies, or organize your calendar in parallel."
      ]
    };
  }
  if (normalized.includes("discord.com")) {
    return {
      name: "Discord Gateway",
      color: "indigo",
      textColor: "text-indigo-400",
      themeColor: "indigo",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      btnBg: "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/20",
      glowColor: "rgba(99,102,241,0.35)",
      icon: "👾",
      steps: [
        "Click 'Securely Launch Discord' to open the server ecosystem in a secure new tab.",
        "Sign in using your account credentials or instantly scan the QR code via your mobile Discord app.",
        "Gain full access to text channels, server administration tools, and voice channels.",
        "Use Myraa's workspace widgets side-by-side to coordinate your developer operations."
      ]
    };
  }
  if (normalized.includes("slack.com")) {
    return {
      name: "Slack Portal",
      color: "violet",
      textColor: "text-violet-400",
      themeColor: "violet",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      btnBg: "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-violet-500/20",
      glowColor: "rgba(139,92,246,0.35)",
      icon: "💼",
      steps: [
        "Click 'Securely Launch Slack' to proceed to your team workspace directory.",
        "Sign in to your specific organization or corporate server securely.",
        "Access your threads, direct channels, and search active work logs.",
        "Stay fully synchronized with Myraa running in your central command hub."
      ]
    };
  }
  return {
    name: "External Secure Web Portal",
    color: "cyan",
    textColor: "text-cyan-400",
    themeColor: "cyan",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    btnBg: "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-500/20",
    glowColor: "rgba(6,182,212,0.35)",
    icon: "🌐",
    steps: [
      "Click 'Launch External Web App' to open in a secure browser window.",
      "Log in directly and safely on the host's authenticated server.",
      "Avoid phishing by validating the secure lock icon in your browser's address bar.",
      "Access full capabilities without sandbox limitations."
    ]
  };
};

export const WebPortalModal: React.FC<WebPortalModalProps> = ({ portal, onClose }) => {
  const restricted = portal ? isRestrictedUrl(portal.url) : false;
  const portalUrl = portal?.url;

  // Dual view states for bypassed scrapers
  const [viewMode, setViewMode] = useState<"iframe" | "scraper">("iframe");
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [scrapedTitle, setScrapedTitle] = useState<string | null>(null);
  const [loadingScraper, setLoadingScraper] = useState(false);
  const [scraperError, setScraperError] = useState<string | null>(null);

  const fetchScrapedContent = async (url: string) => {
    setLoadingScraper(true);
    setScraperError(null);
    try {
      const response = await fetch(`/api/browser/scrape?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.success) {
        setScrapedContent(data.content);
        setScrapedTitle(data.title);
      } else {
        setScraperError(data.content || "Failed to load scraped representation.");
      }
    } catch (err: any) {
      setScraperError("Connection to Myraa Web Proxy failed.");
    } finally {
      setLoadingScraper(false);
    }
  };

  // Auto-launch the secure tab for the user if it's WhatsApp or other restricted tools
  useEffect(() => {
    if (restricted && portalUrl) {
      try {
        window.open(portalUrl, "_blank");
      } catch (e) {
        console.warn("Auto-tab popup blocked. Relying on user button click instead.");
      }
    }
  }, [portalUrl, restricted]);

  // Handle auto-scraping trigger on view mode switch
  useEffect(() => {
    if (viewMode === "scraper" && portalUrl) {
      fetchScrapedContent(portalUrl);
    }
  }, [viewMode, portalUrl]);

  // Reset view mode on portal change
  useEffect(() => {
    setViewMode("iframe");
    setScrapedContent(null);
    setScrapedTitle(null);
    setScraperError(null);
  }, [portalUrl]);

  if (!portal) return null;

  const service = getServiceDetails(portal.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl bg-[#070714] border border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all shadow-[0_0_80px_rgba(99,102,241,0.15)]"
        style={{
          boxShadow: restricted ? `0 0 60px ${service.glowColor}` : undefined,
          borderColor: restricted ? `rgba(99,102,241,0.25)` : undefined
        }}
      >
        {/* Top Glow Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-sans text-lg bg-indigo-500/10 border border-indigo-500/20`}>
              {restricted ? service.icon : <Globe className="w-4 h-4 text-indigo-400 animate-pulse" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>{restricted ? `${service.name} Linkage` : portal.title}</span>
                {restricted && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase font-mono tracking-wider animate-pulse">
                    Active Bridge
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-indigo-300/40 font-mono truncate max-w-[200px] sm:max-w-md">{portal.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Open Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Inner Workspace Content */}
        {restricted ? (
          /* REDESIGNED: CUSTOM SECURE SYNC GATEWAY */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6 min-h-[350px] sm:min-h-[480px]">
            {/* Holographic Logo Container */}
            <div className="relative">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-bounce`}
                style={{ 
                  backgroundColor: `${service.color === "emerald" ? "rgba(16,185,129,0.12)" : "rgba(14,165,233,0.12)"}`,
                  boxShadow: `0 0 30px ${service.glowColor}`
                }}
              >
                {service.icon}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-950 border border-indigo-500/50 p-1.5 rounded-full shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Title / Description */}
            <div className="text-center max-w-md">
              <h4 className="text-white font-sans font-bold text-base">Direct Security Protocol Link</h4>
              <p className="text-xs text-indigo-200/60 mt-1 leading-relaxed">
                To prevent security risks such as <strong className="text-indigo-200">clickjacking</strong> and <strong className="text-indigo-200">session hijacking</strong>, {service.name} prohibits embedding its official application directly inside external frames.
              </p>
            </div>

            {/* Call To Action Buttons */}
            <div className="w-full max-w-sm flex flex-col gap-2.5">
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${service.btnBg}`}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                <Globe className="w-4 h-4" />
                <span>Securely Launch {service.name}</span>
                <ArrowUpRight className="w-4 h-4 animate-pulse" />
              </a>
              <p className="text-[9px] text-center text-indigo-300/40 font-mono">
                Clicking above opens the official web client encrypted directly by your browser.
              </p>
            </div>

            {/* Bullet Guide Steps */}
            <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 text-left space-y-3 font-sans">
              <div className="flex items-center gap-2 text-indigo-300/80 text-[11px] font-bold tracking-wider uppercase font-mono pb-2 border-b border-white/5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>How to link your {service.name} Account:</span>
              </div>
              <ul className="space-y-3 text-[11px] text-indigo-200/70 leading-relaxed">
                {service.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          /* STANDARD SECURE FRAME (For standard external URL previews) */
          <>
            {/* Sandbox Notice Banner with Mode Switcher */}
            <div className="px-6 py-2.5 bg-indigo-950/20 border-b border-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] text-indigo-200/60 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>If the frame remains blank (CORS blocked), switch to Myraa Scraper Proxy.</span>
              </div>
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5 font-mono text-[9px]">
                <button
                  onClick={() => setViewMode("iframe")}
                  className={`px-2.5 py-1 rounded transition-all ${viewMode === "iframe" ? "bg-indigo-600 text-white font-bold" : "text-indigo-200 hover:text-white"}`}
                >
                  🌐 EMBED FRAME
                </button>
                <button
                  onClick={() => setViewMode("scraper")}
                  className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${viewMode === "scraper" ? "bg-indigo-600 text-white font-bold" : "text-indigo-200/60 hover:text-white"}`}
                >
                  🤖 SCRAPER PROXY
                </button>
              </div>
            </div>

            {/* Embedded Portal iframe or Scraper */}
            <div className="flex-1 w-full bg-black/40 min-h-[300px] sm:min-h-[480px] relative flex flex-col">
              {viewMode === "iframe" ? (
                <iframe
                  src={portal.url}
                  title={portal.title}
                  className="w-full h-full border-none absolute inset-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              ) : (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#04040a] text-left select-text font-sans">
                  {loadingScraper ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 font-mono">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <p className="text-xs text-indigo-200 uppercase tracking-widest animate-pulse">Myraa scraping endpoint content...</p>
                      <span className="text-[9px] text-slate-500">Bypassing frame origin policy checks</span>
                    </div>
                  ) : scraperError ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">⚠️</div>
                      <div>
                        <h4 className="text-white font-bold font-sans text-sm">Proxy Retrieval Failed</h4>
                        <p className="text-xs text-indigo-200/50 mt-1 max-w-sm">{scraperError}</p>
                      </div>
                      <button
                        onClick={() => fetchScrapedContent(portal.url)}
                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono"
                      >
                        RETRY TUNNEL FETCH
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto w-full">
                      {/* Scraper Header Status */}
                      <div className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Scraper Tunnel Active</span>
                        </div>
                        <span className="text-[9px] text-indigo-300/40 font-mono font-bold">200 OK • HTTP PROXY BYPASS</span>
                      </div>

                      {/* Scraped Title */}
                      <h2 className="text-lg font-bold text-white font-sans tracking-tight border-b border-white/5 pb-2.5">
                        {scrapedTitle || portal.title}
                      </h2>

                      {/* Scraped Content Body */}
                      <div className="text-indigo-200/85 text-xs leading-relaxed space-y-4 font-mono whitespace-pre-wrap select-text p-4 bg-black/40 border border-white/5 rounded-2xl">
                        {scrapedContent || "Document body parser was empty. Let Myraa automate searching or navigate to subfolders."}
                      </div>

                      {/* Suggestion chip */}
                      <p className="text-[9px] text-indigo-300/30 text-center font-mono select-none pt-2">
                        Brought to you by Myraa's secure V8 holographic rendering model.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-mono shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
            <span>SECURE WEB BRIDGE ONLINE</span>
          </span>
          <span>SSL ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};
