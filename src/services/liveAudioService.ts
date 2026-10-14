// Client-side real-time audio service for Gemini Live API and TTS playback

export interface AudioVisualizerLevels {
  micLevel: number; // 0 to 1
  aiLevel: number; // 0 to 1
}

// Convert Float32Array to 16-bit PCM Base64
export function pcmFloat32ToBase64(channelData: Float32Array): string {
  const l = channelData.length;
  const buffer = new ArrayBuffer(l * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < l; i++) {
    // Clamp to -1..1
    const s = Math.max(-1, Math.min(1, channelData[i]));
    // Convert to 16-bit signed integer
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decode raw base64 PCM (24kHz, 16-bit mono LE) into AudioBuffer
export function decodePcmToAudioBuffer(
  audioCtx: AudioContext,
  base64Data: string,
  sampleRate: number = 24000
): AudioBuffer {
  const binary = atob(base64Data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const int16 = new Int16Array(bytes.buffer);
  const audioBuffer = audioCtx.createBuffer(1, int16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768.0;
  }

  return audioBuffer;
}

export class LiveVoiceSession {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private aiAnalyser: AnalyserNode | null = null;

  private isRecording = false;
  private isAiSpeaking = false;
  private audioPlaybackQueue: AudioBuffer[] = [];
  private isPlayingQueue = false;
  private currentSourceNode: AudioBufferSourceNode | null = null;

  public onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error') => void;
  public onTranscriptChunk?: (text: string, isModel: boolean) => void;
  public onError?: (error: string) => void;
  public onVisualizerUpdate?: (levels: AudioVisualizerLevels) => void;

  private visualizerInterval: any = null;

  public async start(config: {
    language: string;
    assistantName: string;
    persona: string;
  }): Promise<boolean> {
    try {
      this.onStatusChange?.('connecting');

      // Request microphone access with echo cancellation for mobile devices
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize Web Audio contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });

      // Build Mic Analyzer for live visualizer
      this.micAnalyser = this.inputAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 64;

      this.aiAnalyser = this.outputAudioCtx.createAnalyser();
      this.aiAnalyser.fftSize = 64;

      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.micProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(this.micAnalyser);
      this.micAnalyser.connect(this.micProcessor);
      this.micProcessor.connect(this.inputAudioCtx.destination);

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.ws?.send(
          JSON.stringify({
            type: 'start',
            language: config.language,
            assistantName: config.assistantName,
            persona: config.persona,
          })
        );
        this.onStatusChange?.('connected');
        this.startVisualizerLoop();
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'session_ready') {
            this.isRecording = true;
            this.onStatusChange?.('listening');
          } else if (msg.type === 'audio_chunk') {
            if (this.outputAudioCtx && msg.data) {
              const buffer = decodePcmToAudioBuffer(this.outputAudioCtx, msg.data, 24000);
              this.enqueueAudio(buffer);
            }
          } else if (msg.type === 'text_chunk') {
            this.onTranscriptChunk?.(msg.text, true);
          } else if (msg.type === 'interrupted') {
            this.stopPlayback();
          } else if (msg.type === 'turn_complete') {
            this.onStatusChange?.('listening');
          }
        } catch (e) {
          console.warn('WS message error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
        this.onStatusChange?.('error');
        this.onError?.('Live streaming connection encountered an issue.');
      };

      this.ws.onclose = () => {
        this.onStatusChange?.('disconnected');
      };

      // Process input microphone audio frames
      this.micProcessor.onaudioprocess = (e) => {
        if (!this.isRecording || this.ws?.readyState !== WebSocket.OPEN) return;

        const inputChannel = e.inputBuffer.getChannelData(0);
        const base64Pcm = pcmFloat32ToBase64(inputChannel);

        this.ws.send(
          JSON.stringify({
            type: 'audio_input',
            audio: base64Pcm,
          })
        );
      };

      return true;
    } catch (err: any) {
      console.error('Failed to start Live Voice session:', err);
      let errorText = err.message || 'Microphone access denied.';
      if (err.name === 'NotAllowedError') {
        errorText = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorText = 'No microphone device detected on your mobile device.';
      }
      this.onError?.(errorText);
      this.onStatusChange?.('error');
      this.stop();
      return false;
    }
  }

  private enqueueAudio(buffer: AudioBuffer) {
    this.audioPlaybackQueue.push(buffer);
    if (!this.isPlayingQueue) {
      this.playNextChunk();
    }
  }

  private playNextChunk() {
    if (!this.outputAudioCtx || this.audioPlaybackQueue.length === 0) {
      this.isPlayingQueue = false;
      this.isAiSpeaking = false;
      this.onStatusChange?.('listening');
      return;
    }

    this.isPlayingQueue = true;
    this.isAiSpeaking = true;
    this.onStatusChange?.('speaking');

    const buffer = this.audioPlaybackQueue.shift()!;
    this.currentSourceNode = this.outputAudioCtx.createBufferSource();
    this.currentSourceNode.buffer = buffer;

    if (this.aiAnalyser) {
      this.currentSourceNode.connect(this.aiAnalyser);
      this.aiAnalyser.connect(this.outputAudioCtx.destination);
    } else {
      this.currentSourceNode.connect(this.outputAudioCtx.destination);
    }

    this.currentSourceNode.onended = () => {
      this.playNextChunk();
    };

    this.currentSourceNode.start();
  }

  public stopPlayback() {
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
      } catch (e) {}
      this.currentSourceNode = null;
    }
    this.audioPlaybackQueue = [];
    this.isPlayingQueue = false;
    this.isAiSpeaking = false;
  }

  // Play standalone audio from TTS (e.g. Gemini 3.8 Flash-Lite TTS or browser synthesis)
  public async playAudioWav(base64Wav: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.stopPlayback();
        const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
        this.onStatusChange?.('speaking');
        audio.onended = () => {
          this.onStatusChange?.('listening');
          resolve();
        };
        audio.onerror = () => {
          this.onStatusChange?.('listening');
          resolve();
        };
        audio.play().catch(() => resolve());
      } catch (e) {
        resolve();
      }
    });
  }

  private startVisualizerLoop() {
    if (this.visualizerInterval) clearInterval(this.visualizerInterval);

    this.visualizerInterval = setInterval(() => {
      let micLevel = 0;
      let aiLevel = 0;

      if (this.micAnalyser && this.isRecording) {
        const data = new Uint8Array(this.micAnalyser.frequencyBinCount);
        this.micAnalyser.getByteFrequencyData(data);
        const sum = data.reduce((a, b) => a + b, 0);
        micLevel = Math.min(1, sum / (data.length * 128));
      }

      if (this.aiAnalyser && this.isAiSpeaking) {
        const data = new Uint8Array(this.aiAnalyser.frequencyBinCount);
        this.aiAnalyser.getByteFrequencyData(data);
        const sum = data.reduce((a, b) => a + b, 0);
        aiLevel = Math.min(1, sum / (data.length * 128));
      }

      this.onVisualizerUpdate?.({ micLevel, aiLevel });
    }, 60);
  }

  public stop() {
    this.isRecording = false;
    this.stopPlayback();

    if (this.visualizerInterval) {
      clearInterval(this.visualizerInterval);
      this.visualizerInterval = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.micProcessor) {
      try {
        this.micProcessor.disconnect();
      } catch (e) {}
      this.micProcessor = null;
    }

    if (this.inputAudioCtx) {
      try {
        this.inputAudioCtx.close();
      } catch (e) {}
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch (e) {}
      this.outputAudioCtx = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.onStatusChange?.('disconnected');
  }
}

export const liveVoiceSession = new LiveVoiceSession();
