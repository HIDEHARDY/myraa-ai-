import confetti from "canvas-confetti";
import { GlowTheme, HolographicCardData, ToolExecutionNotification } from "../types";
import { globalMemoryManager } from "./MemoryManager";

export interface ToolManagerCallbacks {
  onSetTheme: (theme: GlowTheme) => void;
  onShowCard: (card: HolographicCardData) => void;
  onOpenWeb: (url: string, title: string) => void;
  onAddNotification: (notif: ToolExecutionNotification) => void;
  onUpdateOsState: (partialState: any) => void;
  onRequestApproval: (command: string, terminalType: string) => Promise<boolean>;
  getOsState: () => any;
}

export class ToolManager {
  private callbacks: ToolManagerCallbacks;

  constructor(callbacks: ToolManagerCallbacks) {
    this.callbacks = callbacks;
  }

  public async executeToolCalls(calls: Array<{ id: string; name: string; args: any }>): Promise<Array<{ id: string; name: string; response: any }>> {
    const responses: Array<{ id: string; name: string; response: any }> = [];

    for (const call of calls) {
      const { id, name, args } = call;
      let result: any = { status: "success" };

      try {
        if (name === "openWebsite") {
          const url = args.url || "https://google.com";
          const title = args.title || "External Portal";
          
          this.callbacks.onOpenWeb(url, title);
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "Portal Launched",
            message: `Opening ${title} (${url})`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          try {
            window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
              detail: { action: "open_browser", url }
            }));
          } catch (e) {
            console.warn("Could not dispatch open_browser event:", e);
          }

          try {
            window.open(url, "_blank", "noopener,noreferrer");
          } catch (e) {
            // Popup blocker fallback
          }
          result = { opened: true, url, title, note: "Displayed holographic portal link to user and casted to local system bridge." };

        } else if (name === "changeUiColor") {
          const theme: GlowTheme = args.theme || "magenta";
          this.callbacks.onSetTheme(theme);
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "HUD Modulated",
            message: `Theme shifted to ${theme.toUpperCase()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          result = { activeTheme: theme, message: `HUD color theme updated to ${theme}` };

        } else if (name === "showHolographicCard") {
          const cardData: HolographicCardData = {
            id: Math.random().toString(36).substring(2, 9),
            title: args.title || "Information",
            content: args.content || "",
            category: args.category || "info",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          this.callbacks.onShowCard(cardData);
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "HoloCard Rendered",
            message: `${args.title}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          result = { displayed: true, cardId: cardData.id };

        } else if (name === "triggerSpecialEffect") {
          const effect = args.effect || "confetti";
          if (effect === "confetti" || effect === "sparkle") {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#3B82F6"]
            });
          }
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "FX Triggered",
            message: `Celebration ${effect}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          result = { effectExecuted: effect };

        } else if (name === "saveLongTermMemory") {
          const category = args.category || "Notes";
          const content = args.content || "";
          const importance = args.importance || "medium";

          const savedItem = globalMemoryManager.saveMemory({
            category,
            content,
            importance
          });

          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "Neural Memory Saved",
            message: `[${category}] ${content.substring(0, 36)}${content.length > 36 ? "..." : ""}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          result = { success: true, memoryId: savedItem.id, message: "Stored permanently in long-term neural memory vault." };

        } else if (name === "searchLongTermMemory") {
          const query = args.query || "";
          const matches = globalMemoryManager.searchMemories(query);

          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "Memory Retrieved",
            message: `Found ${matches.length} matches for "${query}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          result = { query, matchesCount: matches.length, results: matches.map(m => ({ category: m.category, content: m.content, importance: m.importance })) };

        } else if (name === "desktopListApps") {
          const currentOsState = this.callbacks.getOsState();
          const appsList = currentOsState.runningApps || [];
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "App Discovery",
            message: `Scanned and discovered ${appsList.length} applications.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          result = {
            discovered: true,
            applications: appsList.map((app: any) => ({
              name: app.name,
              status: app.state,
              focused: app.isFocused,
              path: app.name === "VS Code" ? "C:\\Users\\Myraa\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe" :
                    app.name === "Google Chrome" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" :
                    app.name === "Spotify" ? "C:\\Users\\Myraa\\AppData\\Roaming\\Spotify\\Spotify.exe" :
                    "C:\\Windows\\System32\\" + app.name.toLowerCase() + ".exe"
            }))
          };

        } else if (name === "desktopControlApp") {
          const appName = args.appName || "";
          const action = args.action || "launch";
          
          if (action === "capture_screenshot" || action === "screenshot" || appName.toLowerCase() === "desktop") {
            try {
              window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
                detail: { action: "screenshot" }
              }));
              this.callbacks.onAddNotification({
                id: Math.random().toString(36).substring(2, 9),
                name: "OS Desktop Capture",
                message: "Requested real host screen snapshot capture.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              });
              result = { success: true, message: "Host desktop capture signal broadcasted successfully across system socket." };
            } catch (err: any) {
              result = { success: false, error: err.message };
            }
          } else {
            const isChrome = appName.toLowerCase().includes("chrome") || appName.toLowerCase().includes("browser");
            if (action === "launch" && isChrome) {
              try {
                window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
                  detail: { action: "open_browser", url: "https://google.com" }
                }));
              } catch (e) {
                console.warn("Could not dispatch open_browser event:", e);
              }
            }

            const currentOsState = this.callbacks.getOsState();
            
            if (action === "close" && isChrome) {
              const activeBrowser = { ...(currentOsState.activeBrowser || { tabs: [], activeTabIdx: 0 }) };
              activeBrowser.isOpen = false;
              this.callbacks.onUpdateOsState({ activeBrowser });
            } else if ((action === "launch" || action === "switch_to" || action === "maximize") && isChrome) {
              const activeBrowser = { ...(currentOsState.activeBrowser || { tabs: [], activeTabIdx: 0 }) };
              activeBrowser.isOpen = true;
              this.callbacks.onUpdateOsState({ activeBrowser });
            }

            const runningApps = (currentOsState.runningApps || []).map((app: any) => {
              if (app.name.toLowerCase() === appName.toLowerCase() || 
                  (isChrome && app.name === "Google Chrome")) {
                let nextState = app.state;
                if (action === "launch") nextState = "running";
                else if (action === "minimize") nextState = "minimized";
                else if (action === "maximize") nextState = "maximized";
                else if (action === "close") nextState = "closed";
                
                return {
                  ...app,
                  state: nextState,
                  isFocused: action === "launch" || action === "maximize" || action === "switch_to"
                };
              } else {
                return {
                  ...app,
                  isFocused: action === "switch_to" ? false : app.isFocused
                };
              }
            });

            this.callbacks.onUpdateOsState({ runningApps });
            this.callbacks.onAddNotification({
              id: Math.random().toString(36).substring(2, 9),
              name: "OS Automation",
              message: `${appName} state altered: ${action}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            result = { success: true, appName, state: action === "launch" ? "running" : action };
          }

        } else if (name === "fileSystemOp") {
          const operation = args.operation;
          const path = args.path;
          const destinationPath = args.destinationPath;
          const content = args.content;

          const apiResponse = await fetch("/api/filesystem/op", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operation, path, destinationPath, content })
          });
          
          if (!apiResponse.ok) {
            const errData = await apiResponse.json();
            throw new Error(errData?.error || "File system operation failed.");
          }

          const apiResult = await apiResponse.json();

          // Refresh files
          const listResponse = await fetch(`/api/filesystem/list?dir=${encodeURIComponent(operation === "list_dir" ? path : "")}`);
          if (listResponse.ok) {
            const listData = await listResponse.json();
            this.callbacks.onUpdateOsState({
              activePath: operation === "list_dir" ? path : "",
              explorerFiles: listData.items
            });
          }

          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "File Access SEC",
            message: `${operation.toUpperCase()} on ${path}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          result = apiResult;

        } else if (name === "terminalExecuteCommand") {
          const command = args.command || "";
          const terminalType = args.terminalType || "PowerShell";

          const approved = await this.callbacks.onRequestApproval(command, terminalType);
          if (!approved) {
            this.callbacks.onAddNotification({
              id: Math.random().toString(36).substring(2, 9),
              name: "Access Denied",
              message: `Execution blocked for: ${command}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
            result = {
              success: false,
              status: "denied",
              message: "Execution rejected by user in HUD workspace."
            };
          } else {
            const currentOsState = this.callbacks.getOsState();
            const logs = [...(currentOsState.terminalLogs || [])];
            logs.push({ text: `PS C:\\Users\\Myraa\\myraa_workspace> ${command}`, type: "command" });
            this.callbacks.onUpdateOsState({ terminalLogs: logs });

            this.callbacks.onAddNotification({
              id: Math.random().toString(36).substring(2, 9),
              name: "CMD Approved",
              message: `Executing: ${command.substring(0, 20)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            const apiResponse = await fetch("/api/terminal/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command })
            });

            if (!apiResponse.ok) {
              const errData = await apiResponse.json();
              throw new Error(errData?.error || "Terminal command execution failed.");
            }

            const cmdResult = await apiResponse.json();
            const outputLogs = [...logs];
            if (cmdResult.stdout) {
              const lines = cmdResult.stdout.split("\n");
              for (const line of lines) {
                if (line.trim()) outputLogs.push({ text: line, type: "output" });
              }
            }
            if (cmdResult.stderr) {
              const lines = cmdResult.stderr.split("\n");
              for (const line of lines) {
                if (line.trim()) outputLogs.push({ text: line, type: "error" });
              }
            }
            if (!cmdResult.success && cmdResult.error) {
              outputLogs.push({ text: `Execution failed with exit code ${cmdResult.exitCode}: ${cmdResult.error}`, type: "error" });
            }

            this.callbacks.onUpdateOsState({
              terminalLogs: outputLogs.slice(-60)
            });

            result = cmdResult;
          }

        } else if (name === "browserAutomationOp") {
          const operation = args.operation;
          const url = args.url || "https://google.com";
          const query = args.query || "";

          if (operation === "close" || operation === "close_tab") {
            const currentOsState = this.callbacks.getOsState();
            const activeBrowser = { ...(currentOsState.activeBrowser || { tabs: [], activeTabIdx: 0 }) };
            
            activeBrowser.isOpen = false;
            activeBrowser.url = "about:blank";
            activeBrowser.title = "New Tab";
            activeBrowser.content = "Browser closed.";
            
            const runningApps = (currentOsState.runningApps || []).map((app: any) => {
              if (app.name === "Google Chrome") {
                return { ...app, state: "closed", isFocused: false };
              }
              return app;
            });

            this.callbacks.onUpdateOsState({ activeBrowser, runningApps });
            this.callbacks.onAddNotification({
              id: Math.random().toString(36).substring(2, 9),
              name: "Chrome Autopilot",
              message: "Chrome browser closed successfully.",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            result = {
              success: true,
              message: "Chrome browser closed successfully."
            };
          } else {
            let targetUrl = url;
            if (operation === "search" && query) {
              targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }

            if (operation === "launch" || operation === "open_url" || operation === "search" || operation === "new_tab") {
              try {
                window.dispatchEvent(new CustomEvent("myraa-system-bridge-send", {
                  detail: { action: "open_browser", url: targetUrl }
                }));
              } catch (e) {
                console.warn("Could not dispatch open_browser event:", e);
              }
            }

            const apiResponse = await fetch(`/api/browser/scrape?url=${encodeURIComponent(targetUrl)}`);
            const scrapeResult = apiResponse.ok ? await apiResponse.json() : { title: "Web Navigation", url: targetUrl, content: "Navigation completed." };

            const currentOsState = this.callbacks.getOsState();
            const activeBrowser = { ...(currentOsState.activeBrowser || { tabs: [], activeTabIdx: 0 }) };
            
            activeBrowser.isOpen = true;
            activeBrowser.url = scrapeResult.url;
            activeBrowser.title = scrapeResult.title;
            activeBrowser.content = scrapeResult.content;

            if (operation === "new_tab") {
              activeBrowser.tabs = [...activeBrowser.tabs, scrapeResult.title];
              activeBrowser.activeTabIdx = activeBrowser.tabs.length - 1;
            } else {
              activeBrowser.tabs[activeBrowser.activeTabIdx] = scrapeResult.title;
            }

            const runningApps = (currentOsState.runningApps || []).map((app: any) => {
              if (app.name === "Google Chrome") {
                return { ...app, state: "running", isFocused: true };
              }
              return { ...app, isFocused: false };
            });

            this.callbacks.onUpdateOsState({ activeBrowser, runningApps });
            this.callbacks.onAddNotification({
              id: Math.random().toString(36).substring(2, 9),
              name: "Chrome Autopilot",
              message: `${operation.toUpperCase()} on ${scrapeResult.title}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

            result = {
              success: true,
              title: scrapeResult.title,
              url: scrapeResult.url,
              visibleText: scrapeResult.content
            };
          }

        } else if (name === "communicationPlatformOp") {
          const platform = args.platform || "WhatsApp";
          const action = args.action || "read_chats";
          const recipient = args.recipient || "";
          const message = args.message || "";

          const currentOsState = this.callbacks.getOsState();
          const activeSocial = { ...(currentOsState.activeSocial || { platform: "WhatsApp", activeChatName: "", messages: [] }) };
          
          activeSocial.platform = platform;
          
          // Static matching dictionary of conversations
          const defaultDb: Record<string, Record<string, Array<{ sender: string; text: string; time: string }>>> = {
            WhatsApp: {
              "Rahul (Co-founder)": [
                { sender: "Rahul", text: "Hey! Can you send me the latest API logs? I need to check if the WebSocket connects.", time: "09:12 AM" },
                { sender: "Rahul", text: "Also, are we launching next week?", time: "09:13 AM" }
              ],
              "Mom": [
                { sender: "Mom", text: "Are you eating on time? Call me when you get free.", time: "08:30 AM" }
              ],
              "Myraa Support": [
                { sender: "Support", text: "Welcome to Myraa! I am your operating system companion. You can ask me to run scripts, browse the web, or draft emails.", time: "Yesterday" }
              ],
              "Project Group": [
                { sender: "Sam", text: "Meeting at 3:00 PM today. Please be on time.", time: "10:00 AM" },
                { sender: "Tina", text: "I'll join remote.", time: "10:02 AM" }
              ]
            },
            Telegram: {
              "Alice": [
                { sender: "Alice", text: "Hey! Did you see the new voice-to-voice stream? It's mind-blowing!", time: "09:15 AM" }
              ],
              "Crypto Group": [
                { sender: "Admin", text: "BNB is pumping. Keep an eye on the charts.", time: "09:02 AM" }
              ],
              "BotFather": [
                { sender: "BotFather", text: "Welcome to BotFather. Use /newbot to create a new bot.", time: "Yesterday" }
              ],
              "Durov": [
                { sender: "Durov", text: "Privacy is not for sale.", time: "2 days ago" }
              ]
            },
            Slack: {
              "#general": [
                { sender: "Sarah", text: "Hey team, did we deploy the new Gemini Live server scripts?", time: "09:00 AM" },
                { sender: "Rahul", text: "Yes, I think we are fully up and running. Testing the voice stream.", time: "09:12 AM" },
                { sender: "Boss", text: "Please verify that latency is low (<20ms).", time: "09:15 AM" }
              ],
              "#dev-updates": [
                { sender: "DevBot", text: "Git push success: branch main. Commits: 1. Author: Myraa.", time: "08:15 AM" },
                { sender: "Alice", text: "I verified that the filesystem tool operates perfectly on our Workspace container.", time: "08:18 AM" }
              ],
              "#marketing": [
                { sender: "Dan", text: "The landing page draft is ready. We should highlight Myraa's autonomous capabilities.", time: "Yesterday" }
              ]
            },
            Discord: {
              "#general-chat": [
                { sender: "Hyperion", text: "Has anyone tried running local python automation using Myraa?", time: "09:10 AM" },
                { sender: "CyberPunk", text: "Yeah, it executes terminal scripts beautifully!", time: "09:12 AM" }
              ],
              "#gaming-lounge": [
                { sender: "GamerX", text: "Who is up for a quick session tonight?", time: "Yesterday" }
              ],
              "#announcements": [
                { sender: "Mod", text: "Please adhere to security protocols in terminal execution.", time: "2 days ago" }
              ]
            },
            Gmail: {
              "GitHub Alerts": [
                { sender: "GitHub Alerts <noreply@github.com>", text: "Hello! We detected that package 'minimist' contains a prototype pollution vulnerability. Please execute 'npm update minimist' inside the terminal deck to fix this security threat.", time: "09:30 AM" }
              ],
              "Boss": [
                { sender: "Boss <boss@company.com>", text: "Hi, please send me a detailed breakdown of the latency statistics, long-term memory capacity, and files created in the workspace. Let's make sure the client-facing presentation is ready.", time: "Yesterday" }
              ],
              "Sarah Connor": [
                { sender: "Sarah Connor <sarah@dev.com>", text: "Hey! I worked on the custom color themes. The emerald, magenta, and amber look phenomenal with the wave sound waves. Let's ask Myraa to cycle through them: 'Change theme to crimson'.", time: "2 days ago" }
              ]
            }
          };

          // Determine active chat name
          let activeChat = recipient;
          if (!activeChat) {
            const chats = Object.keys(defaultDb[platform] || {});
            activeChat = chats[0] || "";
          }
          activeSocial.activeChatName = activeChat;

          // Retrieve chat messages
          const platformChats = defaultDb[platform] || {};
          let currentChatMsgs = platformChats[activeChat] || [];

          let logMsg = "";
          if (action === "draft_reply") {
            logMsg = `Drafted message to ${activeChat} on ${platform}`;
            currentChatMsgs = [
              ...currentChatMsgs,
              { sender: "Draft (Myraa)", text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ];
          } else if (action === "send_message") {
            logMsg = `Sent message to ${activeChat} on ${platform}`;
            currentChatMsgs = [
              ...currentChatMsgs,
              { sender: "Myraa", text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ];
          } else if (action === "read_chats") {
            logMsg = `Read chats with ${activeChat} on ${platform}`;
          } else {
            logMsg = `Synchronized channels on ${platform}`;
          }

          activeSocial.messages = currentChatMsgs;

          this.callbacks.onUpdateOsState({ activeSocial });
          this.callbacks.onAddNotification({
            id: Math.random().toString(36).substring(2, 9),
            name: "Comm Hub Sync",
            message: logMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          result = {
            success: true,
            platform,
            activeChat,
            action,
            messagesCount: currentChatMsgs.length,
            recentMessages: currentChatMsgs.slice(-5),
            note: "Synchronized with communication service database securely."
          };

        } else {
          result = { status: "unknown_tool", name };
        }
      } catch (err: any) {
        console.error(`Error executing tool ${name}:`, err);
        result = { status: "error", error: err?.message || "Execution error" };
      }

      responses.push({
        id,
        name,
        response: result
      });
    }

    return responses;
  }
}
