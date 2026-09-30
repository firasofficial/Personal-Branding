/**
 * sound-fx.js
 * Synthesized futuristic UI sound effects using Web Audio API
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('ag_sound_muted') === 'true';
    this.initAudioContext();
  }

  initAudioContext() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
    const resumeAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };

    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('ag_sound_muted', muted ? 'true' : 'false');
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.05, gainValue = 0.05) {
    if (this.isMuted || !this.audioCtx || this.audioCtx.state === 'suspended') return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore silent failures if audio not unlocked
    }
  }

  playHover() {
    this.playTone(880, 'sine', 0.03, 0.02);
  }

  playClick() {
    this.playTone(440, 'triangle', 0.06, 0.04);
  }

  playPop() {
    this.playTone(660, 'sine', 0.04, 0.03);
  }

  playSuccess() {
    if (this.isMuted || !this.audioCtx) return;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.12, 0.035);
      }, idx * 55);
    });
  }

  playGlitch() {
    if (this.isMuted || !this.audioCtx) return;
    const freqs = [350, 720, 290, 880];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.03, 0.015);
      }, idx * 30);
    });
  }
}

window.soundEngine = new SoundEngine();
