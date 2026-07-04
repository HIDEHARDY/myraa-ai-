/**
 * AudioPlayer module
 * Handles Web Audio API gapless scheduling of 24kHz PCM16 model responses.
 */

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();
  private onVolumeChangeCallback: ((vol: number) => void) | null = null;
  private isMuted = false;

  constructor() {}

  public initialize(onVolumeChange: (vol: number) => void): void {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 24000 });
    this.nextStartTime = this.audioContext.currentTime;
    this.onVolumeChangeCallback = onVolumeChange;
  }

  public async playChunk(base64PCM: string): Promise<void> {
    if (!this.audioContext || this.audioContext.state === "closed") {
      return;
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    // Decode Base64 to binary
    const binary = atob(base64PCM);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert Int16 PCM little-endian to Float32 (-1.0 to 1.0)
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    let sum = 0;
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7FFF);
      if (i % 5 === 0) {
        sum += float32[i] * float32[i];
      }
    }

    // Calculate RMS volume for waveform animation
    const rms = Math.sqrt(sum / (int16.length / 5));
    if (this.onVolumeChangeCallback && !this.isMuted) {
      this.onVolumeChangeCallback(Math.min(1, rms * 4.5));
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    if (!this.isMuted) {
      source.connect(this.audioContext.destination);
    }

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;

    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0 && this.onVolumeChangeCallback) {
        this.onVolumeChangeCallback(0);
      }
    };
  }

  public interrupt(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.activeSources.clear();

    if (this.audioContext) {
      this.nextStartTime = this.audioContext.currentTime;
    }

    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(0);
    }
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
    if (mute) {
      this.interrupt();
    }
  }

  public getIsPlaying(): boolean {
    return this.activeSources.size > 0;
  }

  public close(): void {
    this.interrupt();
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
    }
    this.audioContext = null;
  }
}
