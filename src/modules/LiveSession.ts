/**
 * LiveSession module
 * Manages WebSocket communication with backend Gemini Live proxy.
 */

export interface LiveSessionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onAudioOutput: (base64PCM: string) => void;
  onInterrupted: () => void;
  onToolCalls: (calls: Array<{ id: string; name: string; args: any }>) => void;
  onError: (errorMsg: string) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private callbacks: LiveSessionCallbacks;
  private isConnected = false;
  private heartbeatInterval: any = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 15000); // Ping every 15 seconds to prevent network idle timeout
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:3000";
    const wsUrl = `${protocol}//${host}/api/live`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected to Myraa Live Backend.");
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "connected":
            this.isConnected = true;
            this.callbacks.onConnect();
            break;
          case "disconnected":
            this.isConnected = false;
            this.stopHeartbeat();
            this.callbacks.onDisconnect();
            break;
          case "pong":
            // Heartbeat acknowledged, do nothing
            break;
          case "audio":
            if (msg.audio) {
              this.callbacks.onAudioOutput(msg.audio);
            }
            break;
          case "interrupted":
            this.callbacks.onInterrupted();
            break;
          case "tool_calls":
            if (msg.calls) {
              this.callbacks.onToolCalls(msg.calls);
            }
            break;
          case "error":
            this.callbacks.onError(msg.error || "Unknown session error");
            break;
        }
      } catch (err) {
        console.warn("Error parsing websocket incoming message:", err);
      }
    };

    this.ws.onerror = (e) => {
      console.warn("WebSocket transport error:", e);
      this.stopHeartbeat();
      this.callbacks.onError("WebSocket connection failed. Ensure server is running.");
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.callbacks.onDisconnect();
    };
  }

  public sendAudioInput(base64PCM: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: "audio_input",
        audio: base64PCM
      }));
    }
  }

  public sendToolResponses(responses: Array<{ id: string; name: string; response: any }>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: "tool_response",
        responses
      }));
    }
  }

  public disconnect(): void {
    this.isConnected = false;
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}
