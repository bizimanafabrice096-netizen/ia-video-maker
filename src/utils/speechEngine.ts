/**
 * Speech & Lip-Sync Synthesizer for Barnaby (Golden Retriever) & Clarabelle (Dairy Cow)
 * Uses Web Speech API with tuned character voices and real-time mouth movement signals.
 */

export interface DialogueLine {
  speaker: 'barnaby' | 'clarabelle';
  text: string;
  emotion: string;
  bodyAction?: string;
  durationSec?: number;
}

type SpeechCallback = (state: {
  isSpeaking: boolean;
  speaker: 'barnaby' | 'clarabelle' | null;
  mouthOpen: number; // 0 to 1
  lineIndex: number;
  currentLine: DialogueLine | null;
}) => void;

class SpeechEngine {
  private listeners: SpeechCallback[] = [];
  private isSpeaking: boolean = false;
  private currentSpeaker: 'barnaby' | 'clarabelle' | null = null;
  private mouthAnimationTimer: any = null;
  private currentMouthOpen: number = 0;
  private scriptQueue: DialogueLine[] = [];
  private currentLineIndex: number = -1;
  private isScriptRunning: boolean = false;

  constructor() {
    // warm up speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // trigger voice load
      };
    }
  }

  public subscribe(cb: SpeechCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) =>
      cb({
        isSpeaking: this.isSpeaking,
        speaker: this.currentSpeaker,
        mouthOpen: this.currentMouthOpen,
        lineIndex: this.currentLineIndex,
        currentLine: this.scriptQueue[this.currentLineIndex] || null,
      })
    );
  }

  private startMouthFlap() {
    clearInterval(this.mouthAnimationTimer);
    let phase = 0;
    this.mouthAnimationTimer = setInterval(() => {
      if (!this.isSpeaking) {
        this.currentMouthOpen = 0;
        clearInterval(this.mouthAnimationTimer);
        this.notify();
        return;
      }
      phase += 0.45;
      // organic speech cadence
      this.currentMouthOpen = Math.max(0, Math.sin(phase) * 0.7 + Math.random() * 0.3);
      this.notify();
    }, 75);
  }

  private stopMouthFlap() {
    clearInterval(this.mouthAnimationTimer);
    this.currentMouthOpen = 0;
    this.notify();
  }

  public speakLine(line: DialogueLine, onDone?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback timer if speech synthesis is not supported
      this.isSpeaking = true;
      this.currentSpeaker = line.speaker;
      this.startMouthFlap();
      this.notify();
      setTimeout(() => {
        this.isSpeaking = false;
        this.currentSpeaker = null;
        this.stopMouthFlap();
        if (onDone) onDone();
      }, (line.durationSec || 4) * 1000);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(line.text);
    const voices = window.speechSynthesis.getVoices();

    if (line.speaker === 'barnaby') {
      // Upbeat, higher pitch, animated dog voice
      utterance.pitch = 1.3;
      utterance.rate = 1.08;
      // Try finding pleasant English voice
      const dogVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex')));
      if (dogVoice) utterance.voice = dogVoice;
    } else {
      // Clarabelle: Calm, warm, soothing maternal dairy cow voice
      utterance.pitch = 0.88;
      utterance.rate = 0.94;
      const cowVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google US English')));
      if (cowVoice) utterance.voice = cowVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentSpeaker = line.speaker;
      this.startMouthFlap();
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentSpeaker = null;
      this.stopMouthFlap();
      if (onDone) onDone();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentSpeaker = null;
      this.stopMouthFlap();
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  }

  public playScript(lines: DialogueLine[], onComplete?: () => void) {
    this.stop();
    this.scriptQueue = lines;
    this.currentLineIndex = -1;
    this.isScriptRunning = true;

    const next = () => {
      if (!this.isScriptRunning) return;
      this.currentLineIndex++;
      if (this.currentLineIndex < this.scriptQueue.length) {
        const line = this.scriptQueue[this.currentLineIndex];
        this.notify();
        this.speakLine(line, () => {
          setTimeout(next, 500); // brief conversational pause
        });
      } else {
        this.isScriptRunning = false;
        this.currentSpeaker = null;
        this.isSpeaking = false;
        this.notify();
        if (onComplete) onComplete();
      }
    };

    next();
  }

  public stop() {
    this.isScriptRunning = false;
    this.isSpeaking = false;
    this.currentSpeaker = null;
    this.stopMouthFlap();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify();
  }

  public isRunning(): boolean {
    return this.isScriptRunning || this.isSpeaking;
  }
}

export const speechEngine = new SpeechEngine();
