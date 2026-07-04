(function (root) {
  'use strict';
  const audio = {};

  let ctx = null;
  let muted = false;
  let speechUnlocked = false;
  let voicesHooked = false;
  let ukVoice = null;
  let engineOsc = null;
  let engineFilter = null;
  let engineGain = null;

  audio.pickUkrainianVoice = function (voices) {
    if (!voices) return null;
    for (let i = 0; i < voices.length; i++) {
      const lang = (voices[i].lang || '').toLowerCase();
      if (lang.indexOf('uk') === 0) return voices[i];
    }
    for (let i = 0; i < voices.length; i++) {
      if (/ukrain|lesya/i.test(voices[i].name || '')) return voices[i];
    }
    return null;
  };

  function audioCtxClass() {
    if (typeof window === 'undefined') return null;
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function speechApi() {
    if (typeof window === 'undefined') return null;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return null;
    return window.speechSynthesis;
  }

  function refreshVoice() {
    const synth = speechApi();
    if (!synth || typeof synth.getVoices !== 'function') return;
    ukVoice = audio.pickUkrainianVoice(synth.getVoices());
  }

  audio.init = function () {
    if (!ctx) {
      const AC = audioCtxClass();
      if (AC) {
        try { ctx = new AC(); } catch (e) { ctx = null; }
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const synth = speechApi();
    if (synth && !speechUnlocked) {
      speechUnlocked = true;
      try { synth.speak(new window.SpeechSynthesisUtterance('')); } catch (e) {}
    }
    if (synth && !voicesHooked) {
      voicesHooked = true;
      refreshVoice();
      if (typeof synth.addEventListener === 'function') {
        synth.addEventListener('voiceschanged', refreshVoice);
      } else {
        synth.onvoiceschanged = refreshVoice;
      }
    }
  };

  audio.setMuted = function (on) {
    muted = !!on;
    const synth = speechApi();
    if (muted && synth) synth.cancel();
    if (engineGain && ctx) {
      engineGain.gain.setTargetAtTime(muted ? 0 : 0.05, ctx.currentTime, 0.05);
    }
  };

  audio.isMuted = function () {
    return muted;
  };

  function tone(opts) {
    const t0 = ctx.currentTime + (opts.at || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.from, t0);
    if (opts.to && opts.to !== opts.from) {
      osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(opts.vol || 0.15, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  function noiseBurst(dur, vol) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime);
  }

  audio.sfx = function (name) {
    if (muted || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (name === 'honk') {
      tone({ from: 370, dur: 0.12, type: 'square', vol: 0.12 });
      tone({ from: 370, dur: 0.18, type: 'square', vol: 0.12, at: 0.16 });
    } else if (name === 'ding') {
      tone({ from: 880, to: 1320, dur: 0.15, vol: 0.2 });
      tone({ from: 1760, dur: 0.3, vol: 0.12, at: 0.1 });
    } else if (name === 'wrong') {
      tone({ from: 330, to: 240, dur: 0.35, vol: 0.1 });
    } else if (name === 'train') {
      tone({ from: 311, dur: 0.5, type: 'sawtooth', vol: 0.08 });
      tone({ from: 370, dur: 0.5, type: 'sawtooth', vol: 0.08 });
    } else if (name === 'whistle') {
      tone({ from: 1200, to: 1600, dur: 0.15, vol: 0.12 });
      tone({ from: 1600, to: 1200, dur: 0.2, vol: 0.12, at: 0.18 });
    } else if (name === 'win') {
      tone({ from: 523, dur: 0.2, type: 'triangle', vol: 0.18 });
      tone({ from: 659, dur: 0.2, type: 'triangle', vol: 0.18, at: 0.2 });
      tone({ from: 784, dur: 0.2, type: 'triangle', vol: 0.18, at: 0.4 });
      tone({ from: 1047, dur: 0.8, type: 'triangle', vol: 0.2, at: 0.6 });
      tone({ from: 784, dur: 0.25, type: 'triangle', vol: 0.12, at: 1.45 });
      tone({ from: 1047, dur: 0.5, type: 'triangle', vol: 0.16, at: 1.55 });
    } else if (name === 'pop') {
      tone({ from: 400, to: 900, dur: 0.08, vol: 0.15 });
    } else if (name === 'click') {
      tone({ from: 600, dur: 0.05, type: 'square', vol: 0.08 });
    } else if (name === 'crash') {
      noiseBurst(0.25, 0.15);
      tone({ from: 180, to: 90, dur: 0.25, type: 'sawtooth', vol: 0.1 });
    }
  };

  audio.startEngine = function () {
    if (!ctx || engineOsc) return;
    engineOsc = ctx.createOscillator();
    engineFilter = ctx.createBiquadFilter();
    engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 50;
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 300;
    engineGain.gain.value = muted ? 0 : 0.05;
    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
  };

  audio.engine = function (speedRatio) {
    if (!ctx || !engineOsc) return;
    let r = speedRatio || 0;
    if (r < 0) r = 0;
    if (r > 1) r = 1;
    engineOsc.frequency.setTargetAtTime(50 + 70 * r, ctx.currentTime, 0.1);
    engineFilter.frequency.setTargetAtTime(300 + 500 * r, ctx.currentTime, 0.1);
  };

  audio.stopEngine = function () {
    if (!engineOsc) return;
    try {
      engineOsc.stop();
      engineOsc.disconnect();
      engineFilter.disconnect();
      engineGain.disconnect();
    } catch (e) {}
    engineOsc = null;
    engineFilter = null;
    engineGain = null;
  };

  audio.speak = function (text) {
    if (muted) return;
    const synth = speechApi();
    if (!synth) return;
    try {
      synth.cancel();
      const u = new window.SpeechSynthesisUtterance(text);
      u.lang = 'uk-UA';
      u.rate = 0.95;
      u.pitch = 1.05;
      if (ukVoice) u.voice = ukVoice;
      synth.speak(u);
    } catch (e) {}
  };

  root.audio = audio;
  if (typeof module !== 'undefined' && module.exports) module.exports = audio;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
