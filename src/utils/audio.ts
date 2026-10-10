// Web Audio API Synthesizer for focus timer alerts and ambient white noise/rain

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle completion chime (3 ascending harmonious sine notes)
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  } catch (err) {
    console.warn('Audio playback not supported or user has not interacted yet', err);
  }
}

// Timer completion bell / alarm
export function playTimerFinishSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(0.25, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.3);
    });
  } catch (err) {
    console.warn('Audio context error:', err);
  }
}

// Quick click/pop feedback
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore silent failures
  }
}

// Ambient Noise Generator (Rain, White Noise, 40Hz Focus Tone, Stream)
class AmbientSoundManager {
  private activeSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: string = 'none';

  public start(type: 'rain' | 'whitenoise' | 'binaural40' | 'none', volume: number = 0.15) {
    this.stop();
    if (type === 'none') return;

    try {
      const ctx = getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.gainNode = masterGain;

      if (type === 'binaural40') {
        // 40Hz Gamma Focus Tone (200Hz left, 240Hz right or carrier)
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(240, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.5;
        osc.connect(oscGain);
        subOsc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        subOsc.start();
        this.activeSource = osc;
        this.currentType = type;
      } else {
        // Pink / filtered noise buffer for rain & white noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Brown/Pink filtered noise resembling rainfall
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else {
            // Soft white noise
            data[i] = white * 0.3;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Filter to soften the sound
        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 1200;

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        this.activeSource = noise;
        this.currentType = type;
      }
    } catch (e) {
      console.warn('Could not start ambient sound', e);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && audioCtx) {
      this.gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
  }

  public stop() {
    try {
      if (this.activeSource) {
        (this.activeSource as any).stop?.();
        this.activeSource.disconnect();
        this.activeSource = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.currentType = 'none';
    } catch {
      // Ignore
    }
  }

  public getType() {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundManager();
