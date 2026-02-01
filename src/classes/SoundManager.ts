export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      // Initialize AudioContext on first user interaction if needed, 
      // but we can set it up here and resume later.
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.audioContext.destination);
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // Ensure AudioContext is running (browsers block autoplay)
  public resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public playDrop() {
    if (!this.audioContext || !this.masterGain) return;
    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  public playClear(lines: number) {
    if (!this.audioContext || !this.masterGain) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const duration = 0.3 + (lines * 0.1);
    
    // Base frequencies for a major chord
    const baseFreq = 440; // A4
    const ratios = [1, 1.25, 1.5, 2]; // Major chord ratios: Root, Major 3rd, Perfect 5th, Octave

    // Determine how many notes to play based on lines
    // 1 line: Root
    // 2 lines: Root + 3rd
    // 3 lines: Root + 3rd + 5th
    // 4 lines: Root + 3rd + 5th + Octave (Tetris!)
    const notesToPlay = Math.min(lines, 4);

    for (let i = 0; i < notesToPlay; i++) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = i === 3 ? 'square' : 'sine'; // Make the 4th line (Tetris) sound distinct
        
        // Pitch goes up slightly with level/lines if desired, but here we stack chord
        const freq = baseFreq * ratios[i];
        osc.frequency.setValueAtTime(freq, now);
        
        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 / notesToPlay, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + (i * 0.05)); // Stagger slightly for arpeggio effect
        osc.stop(now + duration + 0.1);
    }
  }

  public playGameOver() {
    if (!this.audioContext || !this.masterGain) return;
    this.resume();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 1);
  }
}
