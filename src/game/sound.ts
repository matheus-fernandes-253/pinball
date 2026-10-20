/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API Sound Synthesizer for Retro 90s Arcade Pinball
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // AudioContext will initialize on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.22;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled && this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    } else if (enabled && !this.musicInterval) {
      this.startMusicLoop();
    }
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  // Flipper Strike (Punchy mechanical solenoid thud)
  public playFlipperUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Flipper Release (Quiet mechanical click)
  public playFlipperDown() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Jet Bumper Pop (Bright synthesized FM chime with harmonics)
  public playBumperHit(pitchModifier: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    
    // Primary Tone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    const baseFreq = 587.33 * pitchModifier; // D5
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.04);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + 0.12);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    // Harmonic bell
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.0, t);
    gain2.gain.setValueAtTime(0.25, t);
    gain2.gain.exponentialRampToValueAtTime(0.005, t + 0.2);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.16);
    osc2.start(t);
    osc2.stop(t + 0.22);
  }

  // Slingshot Kick
  public playSlingshot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Drop Target Hit
  public playDropTarget() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.03);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Stage Clear Fanfare (Traditional Japanese Pentatonic Scale)
  public playStageClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [261.63, 311.13, 349.23, 392.0, 466.16, 523.25, 622.25, 783.99];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  // Target Bank Reset / Combo Fanfare
  public playBankReset() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Rollover Gate Chime
  public playRollover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Plunger Charge & Launch with stage-specific sound design
  public playPlungerLaunch(power: number, stageId: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (stageId === 2) {
      // Stage 2 J-HORROR: Ghostly spectral wail / spirit scream launch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(800 + power * 400, t + 0.28);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.32);
    } else if (stageId === 3) {
      // Stage 3 SAMURAI: Katana blade unsheathe & sharp steel slash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);

      // Taiko drum thud
      const drum = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();
      drum.type = 'triangle';
      drum.frequency.setValueAtTime(160, t);
      drum.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      drumGain.gain.setValueAtTime(0.6, t);
      drumGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      drum.connect(drumGain);
      drumGain.connect(this.sfxGain);
      drum.start(t);
      drum.stop(t + 0.24);
    } else if (stageId === 4) {
      // Stage 4 MECHA SHINOBI: Cyber laser warp / charging railgun
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1800 + power * 600, t + 0.16);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.24);
    } else if (stageId === 5) {
      // Stage 5 YOKAI ONI: Demonic magma eruption / dragon roar
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(260 + power * 150, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.34);
    } else {
      // Stage 1 BEACH: Sunny summer whistle + splash whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startFreq = 240 + power * 350;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.22);

      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  // Stage Mission Completed Fanfare!
  public playMissionComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  // Ramp Habitrail Swoosh
  public playRampWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.5);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // Ball Lock Success Sound
  public playBallLock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  // 3-BALL MULTIBALL SIREN & FRENZY FANFARE!
  public playMultiballSiren() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const baseT = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = baseT + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(1100, t + 0.09);
      osc.frequency.linearRampToValueAtTime(600, t + 0.17);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.05, t + 0.17);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.18);
    }
  }

  // Tilt Warning Buzz
  public playTiltWarning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Drain Sad Sound
  public playDrain() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  private currentStage: number = 1;

  public setStage(stageId: number) {
    this.currentStage = stageId;
    this.musicStep = 0;
    if (this.musicInterval) {
      this.stopMusicLoop();
      this.startMusicLoop();
    }
  }

  // Multi-Stage Procedural BGM Synthesizer
  public startMusicLoop() {
    if (this.musicInterval) return;
    
    // Stage 1 (Beach): Upbeat sunny 90s beach anime arcade
    const stage1Bass = [130.81, 130.81, 164.81, 196.00, 110.00, 110.00, 130.81, 164.81, 146.83, 146.83, 174.61, 220.00, 196.00, 196.00, 246.94, 293.66];
    const stage1Mel = [523.25, 0, 587.33, 659.25, 783.99, 0, 659.25, 587.33, 440.00, 0, 523.25, 659.25, 587.33, 523.25, 440.00, 0, 587.33, 0, 659.25, 783.99, 880.00, 0, 783.99, 659.25, 783.99, 880.00, 987.77, 1046.5, 987.77, 783.99, 880.00, 0];

    // Stage 2 (J-Horror): Haunted school eerie spectral minor drone
    const stage2Bass = [73.42, 0, 73.42, 69.30, 0, 65.41, 0, 73.42];
    const stage2Mel = [587.33, 0, 622.25, 0, 554.37, 493.88, 0, 440.00, 466.16, 0, 523.25, 0, 493.88, 0, 440.00, 415.30];

    // Stage 3 (Samurai): Traditional Japanese Insen Pentatonic Scale (D, Eb, G, A, C)
    const stage3Bass = [146.83, 0, 220.00, 146.83, 174.61, 0, 146.83, 0];
    const stage3Mel = [587.33, 622.25, 783.99, 880.00, 1046.5, 880.00, 783.99, 622.25, 587.33, 0, 783.99, 880.00, 1046.5, 1174.66, 880.00, 0];

    // Stage 4 (Mecha Shinobi): High-tech 16th-note cyberpunk synthwave
    const stage4Bass = [110.00, 110.00, 130.81, 146.83, 110.00, 164.81, 146.83, 130.81];
    const stage4Mel = [440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00, 659.25, 783.99, 880.00, 1046.5, 880.00, 783.99, 659.25, 523.25];

    // Stage 5 (Yokai Oni): Boss battle inferno heavy brass & frantic drive
    const stage5Bass = [82.41, 82.41, 98.00, 110.00, 82.41, 77.78, 73.42, 82.41];
    const stage5Mel = [329.63, 392.00, 493.88, 659.25, 622.25, 523.25, 493.88, 415.30, 659.25, 783.99, 880.00, 987.77, 880.00, 783.99, 659.25, 622.25];

    const stepDuration = this.currentStage === 4 ? 110 : this.currentStage === 2 ? 180 : this.currentStage === 3 ? 150 : this.currentStage === 5 ? 125 : 135;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.isMusicEnabled || !this.ctx || !this.musicGain) return;

      const t = this.ctx.currentTime;
      let bassFreq = 0;
      let melFreq = 0;
      let melWaveType: OscillatorType = 'square';
      let bassWaveType: OscillatorType = 'triangle';

      if (this.currentStage === 2) {
        bassFreq = stage2Bass[this.musicStep % stage2Bass.length];
        melFreq = stage2Mel[this.musicStep % stage2Mel.length];
        melWaveType = 'sine';
        bassWaveType = 'sine';
      } else if (this.currentStage === 3) {
        bassFreq = stage3Bass[this.musicStep % stage3Bass.length];
        melFreq = stage3Mel[this.musicStep % stage3Mel.length];
        melWaveType = 'triangle';
        bassWaveType = 'triangle';
      } else if (this.currentStage === 4) {
        bassFreq = stage4Bass[this.musicStep % stage4Bass.length];
        melFreq = stage4Mel[this.musicStep % stage4Mel.length];
        melWaveType = 'sawtooth';
        bassWaveType = 'sawtooth';
      } else if (this.currentStage === 5) {
        bassFreq = stage5Bass[this.musicStep % stage5Bass.length];
        melFreq = stage5Mel[this.musicStep % stage5Mel.length];
        melWaveType = 'sawtooth';
        bassWaveType = 'sawtooth';
      } else {
        bassFreq = stage1Bass[this.musicStep % stage1Bass.length];
        melFreq = stage1Mel[this.musicStep % stage1Mel.length];
        melWaveType = 'square';
        bassWaveType = 'triangle';
      }

      // Bass note
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = bassWaveType;
        bassOsc.frequency.setValueAtTime(bassFreq, t);
        bassGain.gain.setValueAtTime(0.18, t);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.18);
      }

      // Melody note
      if (melFreq > 0) {
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();
        melOsc.type = melWaveType;
        melOsc.frequency.setValueAtTime(melFreq, t);
        melGain.gain.setValueAtTime(this.currentStage === 2 ? 0.08 : 0.10, t);
        melGain.gain.exponentialRampToValueAtTime(0.008, t + 0.14);

        melOsc.connect(melGain);
        melGain.connect(this.musicGain);

        melOsc.start(t);
        melOsc.stop(t + 0.16);
      }

      this.musicStep++;
    }, stepDuration);
  }

  public stopMusicLoop() {
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
