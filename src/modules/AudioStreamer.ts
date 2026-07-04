/**
 * AudioStreamer module
 * Handles capturing microphone input at 16kHz PCM16, volume monitoring, and Base64 streaming.
 */

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isStreaming = false;

  private onAudioDataCallback: ((base64: string) => void) | null = null;
  private onVolumeChangeCallback: ((volume: number) => void) | null = null;

  constructor() {}

  public async start(onAudioData: (base64: string) => void, onVolumeChange: (vol: number) => void): Promise<void> {
    if (this.isStreaming) return;

    this.onAudioDataCallback = onAudioData;
    this.onVolumeChangeCallback = onVolumeChange;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is restricted in this browser iframe. Please click 'Open in new tab' to interact with voice.");
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Initialize AudioContext at 16kHz
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 16000 });

      // If browser resumed state
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isStreaming) return;

        const inputBuffer = e.inputBuffer.getChannelData(0);
        
        // Calculate RMS Volume (0 to 1)
        let sum = 0;
        for (let i = 0; i < inputBuffer.length; i += 4) {
          sum += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sum / (inputBuffer.length / 4));
        if (this.onVolumeChangeCallback) {
          this.onVolumeChangeCallback(Math.min(1, rms * 4));
        }

        // Convert Float32 (-1.0 to 1.0) to PCM16 Little-Endian
        const pcm16 = new Int16Array(inputBuffer.length);
        for (let i = 0; i < inputBuffer.length; i++) {
          const s = Math.max(-1, Math.min(1, inputBuffer[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert PCM16 bytes to Base64
        const uint8 = new Uint8Array(pcm16.buffer);
        let binary = "";
        const len = uint8.length;
        for (let i = 0; i < len; i += 1024) {
          const chunk = uint8.subarray(i, Math.min(i + 1024, len));
          binary += String.fromCharCode.apply(null, chunk as any);
        }
        const base64 = btoa(binary);

        if (this.onAudioDataCallback) {
          this.onAudioDataCallback(base64);
        }
      };

      this.isStreaming = true;
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  public stop(): void {
    this.isStreaming = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }

    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(0);
    }
  }

  public getIsStreaming(): boolean {
    return this.isStreaming;
  }
}
