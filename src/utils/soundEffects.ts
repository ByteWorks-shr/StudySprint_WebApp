// Web Audio API ambient sound generator and chime notifications
class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play peaceful completion bell chime
  playCompletionChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // 528 Hz Love/Focus frequency
      osc1.frequency.exponentialRampToValueAtTime(792, now + 0.3);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1056, now);
      osc2.frequency.exponentialRampToValueAtTime(1584, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Play short soft tick or start ping
  playStartPing() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio ping error:', e);
    }
  }

  // Start background focus noise (brown noise / gentle stream)
  startFocusAmbience(type: 'brown' | 'pink' | 'white' = 'brown', volume = 0.15) {
    this.stopFocusAmbience();
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          // Brown noise (deep, soothing rumble like soft rain or airplane cabin)
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else if (type === 'pink') {
          // Pink noise
          data[i] = (lastOut * 0.9 + white * 0.1);
          lastOut = data[i];
        } else {
          data[i] = white * 0.15;
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);

      noise.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.currentSource = noise;
      this.gainNode = gain;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)), this.ctx.currentTime);
    }
  }

  stopFocusAmbience() {
    if (this.currentSource) {
      try {
        (this.currentSource as AudioBufferSourceNode).stop();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  get active(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundManager();
