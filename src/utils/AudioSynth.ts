// Retro Web Audio Synthesizer and Sequencer for 8-bit audio effects and music

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private currentStep: number = 0;
  private isPlayingMusic: boolean = false;

  // Simple 8-bit music loop (Melody + Bass)
  // Notes represented by frequencies (Hz) and duration in steps
  // 0 means rest
  private melody = [
    261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, // C4 D4 E4 F4 G4 F4 E4 D4
    329.63, 349.23, 392.00, 440.00, 493.88, 440.00, 392.00, 349.23, // E4 F4 G4 A4 B4 A4 G4 F4
    392.00, 440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00, // G4 A4 B4 C5 D5 C5 B4 A4
    493.88, 0,      523.25, 0,      587.33, 0,      659.25, 0        // B4, C5, D5, E5 (staccato climb)
  ];

  private bassLine = [
    130.81, 130.81, 196.00, 196.00, 146.83, 146.83, 220.00, 220.00, // C3 C3 G3 G3 D3 D3 A3 A3
    164.81, 164.81, 220.00, 220.00, 196.00, 196.00, 146.83, 146.83, // E3 E3 A3 A3 G3 G3 D3 D3
    196.00, 196.00, 246.94, 246.94, 261.63, 261.63, 196.00, 196.00, // G3 G3 B3 B3 C4 C4 G3 G3
    146.83, 196.00, 220.00, 246.94, 261.63, 261.63, 196.00, 0        // D3 G3 A3 B3 C4 C4 G3
  ];

  // Suspenseful 8-bit minor key loop for Count Eggplant boss room
  private tenseMelody = [
    329.63, 349.23, 311.13, 329.63, 349.23, 370.00, 329.63, 311.13, // E4 F4 D#4 E4 F4 F#4 E4 D#4
    329.63, 311.13, 293.66, 311.13, 329.63, 349.23, 370.00, 392.00, // E4 D#4 D4 D#4 E4 F4 F#4 G4
    392.00, 370.00, 349.23, 370.00, 392.00, 415.30, 392.00, 370.00, // G4 F#4 F4 F#4 G4 G#4 G4 F#4
    392.00, 0,      415.30, 0,      440.00, 0,      466.16, 0        // G4, G#4, A4, A#4 (fast tense climb)
  ];

  private tenseBassLine = [
    164.81, 164.81, 164.81, 164.81, 155.56, 155.56, 155.56, 155.56, // E3 E3 E3 E3 D#3 D#3 D#3 D#3
    164.81, 164.81, 164.81, 164.81, 174.61, 174.61, 174.61, 174.61, // E3 E3 E3 E3 F3 F3 F3 F3
    196.00, 196.00, 196.00, 196.00, 185.00, 185.00, 185.00, 185.00, // G3 G3 G3 G3 F#3 F#3 F#3 F#3
    196.00, 196.00, 207.65, 207.65, 220.00, 220.00, 233.08, 0        // G3 G3 G#3 G#3 A3 A3 A#3
  ];

  private activeSong: 'normal' | 'tense' = 'normal';

  constructor() {
    // Audio Context is initialized on first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.15, this.ctx.currentTime); // Low baseline volume
      this.masterVolume.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser", e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(mute ? 0 : 0.15, this.ctx.currentTime);
    }
    if (!mute && this.isPlayingMusic && !this.musicInterval) {
      this.startMusic(this.activeSong);
    } else if (mute) {
      this.stopMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Retro Sound Effects ---

  // Jump: Short, upward frequency sweep with square wave
  public playJump() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Retro, soft jump sound
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Coin: Two short chimes (high pitch B5, then E6)
  public playCoin() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square'; // Classic retro chime
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.setValueAtTime(0.15, t + 0.08);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Stomp: Low crunch sound (descending pitch + short white noise burst)
  public playStomp() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    
    // Tone part
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(30, t + 0.15);
    oscGain.gain.setValueAtTime(0.2, t);
    oscGain.gain.linearRampToValueAtTime(0.001, t + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.masterVolume!);
    osc.start(t);
    osc.stop(t + 0.15);

    // Noise part (crunch)
    try {
      const bufferSize = this.ctx.sampleRate * 0.1; // 0.1 sec
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, t);
      noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.1);
      
      noise.connect(noiseGain);
      noiseGain.connect(this.masterVolume!);
      noise.start(t);
      noise.stop(t + 0.1);
    } catch (e) {
      // Fallback if buffer creation fails
    }
  }

  // Checkpoint: Happy little arpeggio
  public playCheckpoint() {
    this.resume();
    const ctx = this.ctx;
    const masterVol = this.masterVolume;
    if (!ctx || !masterVol || this.isMuted) return;

    const t = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.15, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, t + idx * 0.08 + 0.15);
      
      osc.connect(gain);
      gain.connect(masterVol);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.15);
    });
  }

  // Defeat / Hurt: Sad descending slide
  public playHurt() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.3);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Switch activated: Simple high click
  public playSwitch() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(900, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Victory / Ending Fanfare
  public playVictoryFanfare() {
    this.resume();
    const ctx = this.ctx;
    const masterVol = this.masterVolume;
    if (!ctx || !masterVol || this.isMuted) return;

    this.stopMusic();

    const t = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.24 }, // C6
      { f: 987.77, d: 0.12 }, // B5
      { f: 1046.50, d: 0.6 } // C6 (sustained)
    ];

    let delay = 0;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t + delay);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.15, t + delay);
      gain.gain.linearRampToValueAtTime(0.001, t + delay + note.d);
      
      osc.connect(gain);
      gain.connect(masterVol);
      osc.start(t + delay);
      osc.stop(t + delay + note.d);
      
      delay += note.d;
    });

    // Automatically resume normal music loop after fanfare finishes (approx 1.5s)
    setTimeout(() => {
      if (this.isPlayingMusic) {
        this.startMusic();
      }
    }, 1500);
  }

  // --- Music Sequencer ---

  public startMusic(songType: 'normal' | 'tense' = 'normal') {
    this.resume();
    this.isPlayingMusic = true;
    this.activeSong = songType;
    if (this.isMuted) return;
    
    // Stop any existing loop
    this.stopMusic();

    this.currentStep = 0;
    const stepDuration = songType === 'tense' ? 180 : 220; 

    const activeMelody = songType === 'tense' ? this.tenseMelody : this.melody;
    const activeBass = songType === 'tense' ? this.tenseBassLine : this.bassLine;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;

      const t = this.ctx.currentTime;
      const step = this.currentStep % activeMelody.length;

      // Play melody note
      const mFreq = activeMelody[step];
      if (mFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = songType === 'tense' ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(mFreq, t);

        gain.gain.setValueAtTime(songType === 'tense' ? 0.04 : 0.05, t);
        gain.gain.linearRampToValueAtTime(0.001, t + (songType === 'tense' ? 0.14 : 0.18));

        osc.connect(gain);
        gain.connect(this.masterVolume!);
        osc.start(t);
        osc.stop(t + (songType === 'tense' ? 0.16 : 0.2));
      }

      // Play bass note
      const bFreq = activeBass[step];
      if (bFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bFreq, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterVolume!);
        osc.start(t);
        osc.stop(t + 0.22);
      }

      this.currentStep++;
    }, stepDuration);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public pauseMusic() {
    this.stopMusic();
  }
}

export const AudioSynth = new AudioSynthManager();
export default AudioSynth;
