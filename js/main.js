(function (root) {
  'use strict';
  const main = {};

  const utils = root.utils;
  const learning = root.learning;
  const audio = root.audio;
  const sprites = root.sprites;
  const race = root.race;
  const events = root.events;
  const screens = root.screens;

  const PROGRESS_KEY = 'rg_progress';
  const MUTED_KEY = 'rg_muted';

  let canvas = null;
  let progress = null;
  const chosen = { charDef: null, carDef: null, trackDef: null };
  let r = null;
  let pointerDown = false;
  const keys = { left: false, right: false };
  let lastTime = 0;
  let finishTimer = null;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* приватний режим — граємо без збереження */ }
  }

  function saveProgress() {
    storageSet(PROGRESS_KEY, learning.serialize(progress));
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function drawBackdrop() {
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#4FC3F7');
    g.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const ui = {
    showTask: function (task, onAnswer) {
      screens.showTask(task, function (index) {
        onAnswer(index);
        saveProgress();
      });
    },
    markWrong: function (index) { screens.markWrong(index); },
    markCorrect: function (index) { screens.markCorrect(index); },
    hideTask: function () { screens.hideTask(); },
    updateHUD: function (data) {
      screens.updateHUD(data);
      saveProgress();
    }
  };

  function isTestMode() {
    return /[?&]test=1/.test(location.search);
  }

  function pickOpponents() {
    const opponents = [];
    const otherChars = sprites.CHARACTERS.filter(function (c) {
      return c.id !== chosen.charDef.id;
    });
    const otherCars = sprites.CAR_TYPES.filter(function (c) {
      return c.id !== chosen.carDef.id;
    });
    for (let i = 0; i < 3; i++) {
      opponents.push({ charDef: otherChars[i], carDef: otherCars[i % otherCars.length] });
    }
    return opponents;
  }

  function startRace() {
    screens.hide();
    r = race.create({
      canvas: canvas,
      trackDef: chosen.trackDef,
      playerChar: chosen.charDef,
      carDef: chosen.carDef,
      opponents: pickOpponents(),
      shortTrack: isTestMode()
    });
    events.createController(r, progress, ui, Math.random);
    r.onFinish = onRaceFinish;
    screens.showHUD();
    screens.updateHUD({ stars: progress.stars });
    audio.startEngine();
  }

  function stopRace() {
    audio.stopEngine();
    screens.hideTask();
    screens.hideHUD();
    r = null;
    if (finishTimer !== null) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
  }

  function onRaceFinish() {
    audio.stopEngine();
    audio.sfx('win');
    audio.speak('Фініш! Перемога!');
    r.confetti();
    finishTimer = setTimeout(function () {
      finishTimer = null;
      const sticker = learning.awardSticker(progress);
      saveProgress();
      screens.hideHUD();
      screens.show('finish', {
        stars: progress.stars,
        sticker: sticker,
        charName: chosen.charDef.name
      });
    }, 2000);
  }

  function initScreens() {
    screens.init({
      onPlay: function () {
        audio.init();
        screens.show('player');
      },
      onPlayerPicked: function (charDef) {
        chosen.charDef = charDef;
        screens.show('car');
      },
      onCarPicked: function (carDef) {
        chosen.carDef = carDef;
        screens.show('track');
      },
      onTrackPicked: function (trackDef) {
        chosen.trackDef = trackDef;
        startRace();
      },
      onAgain: function () {
        startRace();
      },
      onOtherTrack: function () {
        stopRace();
        screens.show('track');
      },
      onHome: function () {
        stopRace();
        screens.show('menu');
      },
      onMuteToggle: function () {
        const muted = !audio.isMuted();
        audio.setMuted(muted);
        storageSet(MUTED_KEY, muted ? '1' : '0');
      }
    });
  }

  function pointerRatio(e) {
    return utils.clamp(e.clientX / window.innerWidth, 0, 1);
  }

  function initInput() {
    canvas.addEventListener('pointerdown', function (e) {
      pointerDown = true;
      if (r) r.setPointerX(pointerRatio(e));
    });
    window.addEventListener('pointermove', function (e) {
      if (pointerDown && r) r.setPointerX(pointerRatio(e));
    });
    window.addEventListener('pointerup', function () {
      pointerDown = false;
      if (r) r.setPointerX(null);
    });
    window.addEventListener('pointercancel', function () {
      pointerDown = false;
      if (r) r.setPointerX(null);
    });
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('keydown', function (e) { setKey(e, true); });
    window.addEventListener('keyup', function (e) { setKey(e, false); });
  }

  function setKey(e, down) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = down;
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = down;
    else return;
    if (r) r.setKeys(keys.left, keys.right);
  }

  function registerServiceWorker() {
    if (!location.protocol.startsWith('http')) return;
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        /* sw.js з'явиться в наступній задачі — помилка реєстрації не критична */
      });
    });
  }

  function frame(ts) {
    const dt = utils.clamp((ts - lastTime) / 1000, 0, 0.05);
    lastTime = ts;
    if (r) {
      r.update(dt);
      r.draw();
      audio.engine(r.speed / race.MAX_SPEED);
    } else {
      drawBackdrop();
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    canvas = document.getElementById('game');
    resize();
    window.addEventListener('resize', resize);
    progress = learning.deserialize(storageGet(PROGRESS_KEY));
    audio.setMuted(storageGet(MUTED_KEY) === '1');
    initScreens();
    initInput();
    screens.show('menu');
    registerServiceWorker();
    requestAnimationFrame(frame);
  }

  if (typeof document !== 'undefined') boot();

  root.main = main;
  if (typeof module !== 'undefined' && module.exports) module.exports = main;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
