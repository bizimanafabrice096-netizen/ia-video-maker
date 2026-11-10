/**
 * Procedural Web Audio Soundstage for Sunlit Woods
 * Generates realistic pine forest wind, birdsong, soft footsteps on moss,
 * and warm cinematic acoustic strings without requiring external audio files.
 */

class ForestAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private birdsGain: GainNode | null = null;
  private footstepsGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private windInterval: any = null;
  private birdInterval: any = null;
  private footstepInterval: any = null;
  private chordInterval: any = null;
  private activeMusicNodes: AudioNode[] = [];

  public layers = {
    wind: true,
    birds: true,
    footsteps: true,
    music: true,
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(this.layers.wind ? 0.35 : 0, this.ctx.currentTime);
      this.windGain.connect(this.masterGain);

      this.birdsGain = this.ctx.createGain();
      this.birdsGain.gain.setValueAtTime(this.layers.birds ? 0.25 : 0, this.ctx.currentTime);
      this.birdsGain.connect(this.masterGain);

      this.footstepsGain = this.ctx.createGain();
      this.footstepsGain.gain.setValueAtTime(this.layers.footsteps ? 0.2 : 0, this.ctx.currentTime);
      this.footstepsGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.layers.music ? 0.3 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async start() {
    this.initContext();
    if (!this.ctx) return;
    this.isPlaying = true;

    this.startWind();
    this.startBirdsong();
    this.startFootsteps();
    this.startAtmosphericScore();
  }

  public stop() {
    this.isPlaying = false;
    clearInterval(this.birdInterval);
    clearInterval(this.footstepInterval);
    clearInterval(this.chordInterval);
    if (this.windInterval) {
      clearInterval(this.windInterval);
    }
    this.activeMusicNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeMusicNodes = [];
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public setVolume(vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  }

  public setLayer(layer: 'wind' | 'birds' | 'footsteps' | 'music', enabled: boolean) {
    this.layers[layer] = enabled;
    if (!this.ctx) return;
    const targetGain = enabled ? (layer === 'wind' ? 0.35 : layer === 'birds' ? 0.25 : layer === 'footsteps' ? 0.2 : 0.3) : 0;
    const gainNode =
      layer === 'wind'
        ? this.windGain
        : layer === 'birds'
        ? this.birdsGain
        : layer === 'footsteps'
        ? this.footstepsGain
        : this.musicGain;
    gainNode?.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  private startWind() {
    if (!this.ctx || !this.windGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.windGain);

    whiteNoise.start();
    lfo.start();
    this.activeMusicNodes.push(whiteNoise, lfo);
  }

  private startBirdsong() {
    const triggerChirp = () => {
      if (!this.isPlaying || !this.ctx || !this.birdsGain || !this.layers.birds) return;
      const baseFreq = 2200 + Math.random() * 1400;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.birdsGain);

      osc.start(now);
      osc.stop(now + 0.25);
    };

    this.birdInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerChirp();
        setTimeout(triggerChirp, 140);
        if (Math.random() > 0.5) {
          setTimeout(triggerChirp, 300);
        }
      }
    }, 2800);
  }

  private startFootsteps() {
    const triggerStep = () => {
      if (!this.isPlaying || !this.ctx || !this.footstepsGain || !this.layers.footsteps) return;
      const now = this.ctx.currentTime;

      // Soft crunch of moss & dry pine needles
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.footstepsGain);

      osc.start(now);
      osc.stop(now + 0.18);
    };

    // Rhythmic steps: dog's light trot and cow's measured stride
    this.footstepInterval = setInterval(() => {
      triggerStep();
      setTimeout(triggerStep, 350);
    }, 1400);
  }

  private startAtmosphericScore() {
    if (!this.ctx || !this.musicGain) return;

    // Peaceful chords in D Major (D, G, Bm, A)
    const chords = [
      [146.83, 220.0, 277.18, 369.99], // D maj (D3, A3, C#4, F#4)
      [196.0, 246.94, 293.66, 392.0],  // G maj (G3, B3, D4, G4)
      [123.47, 185.0, 246.94, 293.66], // B min (B2, F#3, B3, D4)
      [110.0, 164.81, 220.0, 277.18],  // A maj (A2, E3, A3, C#4)
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.musicGain || !this.layers.music) return;
      const notes = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      const now = this.ctx.currentTime;
      const chordDuration = 7.0;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 100, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 2.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + chordDuration + 0.5);
      });
    };

    playChord();
    this.chordInterval = setInterval(playChord, 7000);
  }

  public getActive(): boolean {
    return this.isPlaying;
  }
}

export const forestAudio = new ForestAudioEngine();
