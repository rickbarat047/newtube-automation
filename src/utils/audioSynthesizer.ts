// Procedural audio engine for AutoTube:
// Generates gentle, sweet background music moods and sound effects using Web Audio API
// Synchronizes narration with speech synthesis

class StoryAudioEngine {
  private ctx: AudioContext | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentMood: string = 'gentle_mystery';
  private timer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play procedural storybook background melody matching scene mood
  public playMusic(mood: string = 'gentle_mystery') {
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    if (this.isMusicPlaying && this.currentMood === mood) return;
    this.stopMusic();

    this.currentMood = mood;
    this.isMusicPlaying = true;

    // Mood chord progressions (frequencies in Hz)
    const moodScales: Record<string, number[][]> = {
      gentle_mystery: [
        [220, 261.63, 329.63, 392.0], // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196, 246.94, 293.66, 349.23], // G7
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
      ],
      playful_wonder: [
        [261.63, 329.63, 392.0, 523.25], // C
        [220, 261.63, 329.63, 440.0], // Am
        [174.61, 220, 261.63, 349.23], // F
        [196, 246.94, 293.66, 392.0], // G
      ],
      sparkling_adventure: [
        [293.66, 369.99, 440.0, 587.33], // D
        [196, 246.94, 293.66, 392.0], // G
        [220, 277.18, 329.63, 440.0], // A
        [246.94, 293.66, 369.99, 493.88], // Bm
      ],
      warm_lullaby: [
        [261.63, 329.63, 392.0], // C
        [174.61, 220, 261.63], // F
        [220, 261.63, 329.63], // Am
        [196, 246.94, 293.66], // G
      ],
      triumphant_joy: [
        [261.63, 329.63, 392.0, 523.25],
        [174.61, 220, 261.63, 440.0],
        [196, 246.94, 293.66, 493.88],
        [329.63, 392.0, 493.88, 587.33],
      ],
    };

    const chords = moodScales[mood] || moodScales.gentle_mystery;
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Warm sine / triangle storybook tone
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.05 / (i + 1), this.ctx.currentTime + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 3.3);
      });

      this.timer = window.setTimeout(playChordStep, 2600);
    };

    playChordStep();
  }

  // Duck music volume when narration / dialogue starts
  public duckMusic(isDucked: boolean) {
    if (!this.ctx || !this.musicGain) return;
    const target = isDucked ? 0.05 : 0.18;
    this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // Procedural Sound Effects
  public playSoundEffect(cueName: string) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    if (cueName.includes('ping') || cueName.includes('chime') || cueName.includes('star') || cueName.includes('magic')) {
      // Sparkling chime arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        g.gain.setValueAtTime(0.001, now + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.85);
      });
    } else if (cueName.includes('footstep') || cueName.includes('step') || cueName.includes('tap') || cueName.includes('jump')) {
      // Soft paw footsteps
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (cueName.includes('splash') || cueName.includes('water')) {
      // Gentle bubbling water splash
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3.0, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    } else {
      // Soft gentle pop/bell
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  }

  // Voice narration speech synthesis with ducking
  public speakNarration(
    text: string,
    options: { pitch?: number; rate?: number; onStart?: () => void; onEnd?: () => void } = {}
  ): SpeechSynthesisUtterance | null {
    if (!('speechSynthesis' in window)) return null;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options.pitch ?? 1.1;
    utterance.rate = options.rate ?? 0.95;

    // Pick warm child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(
      (v) =>
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Daniel')
    );
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    utterance.onstart = () => {
      this.duckMusic(true);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.duckMusic(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.duckMusic(false);
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  public cancelSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.duckMusic(false);
  }
}

export const audioEngine = new StoryAudioEngine();
