// Web Audio API ambient sounds & timer chimes without external assets

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

export function playTimerAlert(type: 'complete' | 'break' | 'start') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'complete') {
      // Pleasant multi-chord completion chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.85);
      });
    } else if (type === 'break') {
      // Gentle break reminder chime
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.95);
      });
    } else {
      // Session start soft bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn('Web Audio playback error:', e);
  }
}

// Ambient sound generator for focus sessions
let ambientNodes: { source: AudioNode; gain: GainNode } | null = null;

export function startAmbientSound(mode: 'rain' | 'binaural' | 'white_noise', volume: number = 0.15) {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (mode === 'binaural') {
      // 40Hz Gamma wave binaural tone (200Hz left, 240Hz right)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(200, ctx.currentTime);
      osc2.frequency.setValueAtTime(240, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      osc1.connect(merger, 0, 0);
      osc2.connect(merger, 0, 1);
      merger.connect(gainNode);

      osc1.start();
      osc2.start();
      ambientNodes = {
        source: merger,
        gain: gainNode,
      };
    } else {
      // Pink / Brown noise synthesized for rain or white noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
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
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain softness
      const filter = ctx.createBiquadFilter();
      filter.type = mode === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(mode === 'rain' ? 800 : 1200, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      ambientNodes = {
        source: whiteNoise,
        gain: gainNode,
      };
    }
  } catch (e) {
    console.warn('Ambient sound synthesis error:', e);
  }
}

export function stopAmbientSound() {
  if (ambientNodes) {
    try {
      if ('stop' in ambientNodes.source) {
        (ambientNodes.source as any).stop();
      }
      ambientNodes.gain.disconnect();
    } catch (e) {
      // ignore
    }
    ambientNodes = null;
  }
}
