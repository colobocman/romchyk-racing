(function (root) {
  'use strict';
  const screens = {};

  let ui = null;
  let cb = {};
  let current = null;
  let hud = null;
  let hudStars = null;
  let taskEl = null;
  let taskButtons = [];

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Кутова кнопка звуку — використовується на всіх екранах, щоб перемикач
  // 🔊/🔇 завжди був доступний (вимога специфікації).
  function buildMuteButton(className) {
    const mute = el('button', className || 'btn btn-corner btn-mute', root.audio.isMuted() ? '🔇' : '🔊');
    mute.addEventListener('click', function () {
      if (cb.onMuteToggle) cb.onMuteToggle();
      mute.textContent = root.audio.isMuted() ? '🔇' : '🔊';
    });
    return mute;
  }

  screens.init = function (callbacks) {
    cb = callbacks || {};
    ui = document.getElementById('ui');
  };

  screens.show = function (name, data) {
    screens.hide();
    let scr = null;
    if (name === 'menu') scr = buildMenu();
    else if (name === 'player') scr = buildPlayer();
    else if (name === 'car') scr = buildCar();
    else if (name === 'track') scr = buildTrack();
    else if (name === 'finish') scr = buildFinish(data || {});
    if (!scr) return;
    current = scr;
    ui.appendChild(scr);
  };

  screens.hide = function () {
    if (current && current.parentNode) current.parentNode.removeChild(current);
    current = null;
  };

  // --- HUD ---

  screens.showHUD = function () {
    if (hud) return;
    hud = el('div', 'hud');
    hudStars = el('div', 'hud-stars', '⭐ 0');
    const mute = buildMuteButton();
    const home = el('button', 'btn btn-corner btn-home', '🏠');
    home.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onHome) cb.onHome();
    });
    hud.appendChild(hudStars);
    hud.appendChild(mute);
    hud.appendChild(home);
    ui.appendChild(hud);
  };

  screens.updateHUD = function (data) {
    if (hudStars && data && typeof data.stars === 'number') {
      hudStars.textContent = '⭐ ' + data.stars;
    }
  };

  screens.hideHUD = function () {
    if (hud && hud.parentNode) hud.parentNode.removeChild(hud);
    hud = null;
    hudStars = null;
  };

  // --- Оверлей завдань (сюжетні зупинки) ---

  function emojiRow(emoji, count) {
    const row = el('span', 'task-emoji-row');
    for (let i = 0; i < count; i++) row.appendChild(el('span', 'task-emoji', emoji));
    return row;
  }

  function buildVisual(v) {
    const wrap = el('div', 'task-visual');
    wrap.appendChild(emojiRow(v.emoji, v.count));
    if (v.emoji2) {
      wrap.appendChild(el('span', 'task-plus', '+'));
      wrap.appendChild(emojiRow(v.emoji2, v.count2));
    }
    return wrap;
  }

  screens.showTask = function (task, onAnswer) {
    screens.hideTask();
    taskEl = el('div', 'task');
    const box = el('div', 'task-box');
    box.appendChild(el('div', 'task-prompt', task.prompt));
    if (task.visual) box.appendChild(buildVisual(task.visual));
    const row = el('div', 'task-options');
    taskButtons = [];
    task.options.forEach(function (opt, i) {
      const b = el('button', 'btn task-option', String(opt.text));
      b.addEventListener('click', function () { onAnswer(i); });
      taskButtons.push(b);
      row.appendChild(b);
    });
    box.appendChild(row);
    taskEl.appendChild(box);
    ui.appendChild(taskEl);
    if (task.say) root.audio.speak(task.say);
  };

  screens.markWrong = function (index) {
    const b = taskButtons[index];
    if (!b) return;
    b.classList.remove('shake');
    void b.offsetWidth;
    b.classList.add('shake');
  };

  screens.markCorrect = function (index) {
    const b = taskButtons[index];
    if (b) b.classList.add('pulse');
  };

  screens.hideTask = function () {
    if (taskEl && taskEl.parentNode) taskEl.parentNode.removeChild(taskEl);
    taskEl = null;
    taskButtons = [];
  };

  // --- Білдери екранів (кроки 5–7) ---

  function buildMenu() {
    const s = el('div', 'screen');
    s.appendChild(el('h1', 'title', 'Ромчик-Гонщик 🏎️'));
    const play = el('button', 'btn btn-big', 'ГРАТИ ▶');
    play.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onPlay) cb.onPlay();
    });
    s.appendChild(play);
    s.appendChild(buildMuteButton('btn btn-small'));
    root.audio.speak('Ромчик-Гонщик! Натисни грати!');
    return s;
  }

  function buildCardScreen(titleText, items, renderCard, speakFor, onDone) {
    const s = el('div', 'screen');
    s.appendChild(buildMuteButton());
    s.appendChild(el('h2', 'title', titleText));
    const grid = el('div', 'cards');
    const next = el('button', 'btn btn-next hidden', 'Далі ▶');
    let picked = null;
    items.forEach(function (item) {
      const card = el('button', 'card');
      renderCard(card, item);
      card.addEventListener('click', function () {
        picked = item;
        const all = grid.querySelectorAll('.card');
        for (let i = 0; i < all.length; i++) all[i].classList.remove('selected');
        card.classList.add('selected');
        root.audio.sfx('pop');
        root.audio.speak(speakFor(item));
        next.classList.remove('hidden');
      });
      grid.appendChild(card);
    });
    next.addEventListener('click', function () {
      root.audio.sfx('click');
      if (picked) onDone(picked);
    });
    s.appendChild(grid);
    s.appendChild(next);
    root.audio.speak(titleText);
    return s;
  }

  function buildPlayer() {
    return buildCardScreen('Хто сьогодні гонщик?', root.sprites.CHARACTERS,
      function (card, ch) {
        const cv = document.createElement('canvas');
        cv.width = 120; cv.height = 130;
        root.sprites.drawCharacter(cv.getContext('2d'), 60, 8, 96, ch);
        card.appendChild(cv);
        card.appendChild(el('div', 'card-label', ch.name));
      },
      function (ch) { return ch.name; },
      function (ch) { if (cb.onPlayerPicked) cb.onPlayerPicked(ch); });
  }

  function buildCar() {
    return buildCardScreen('Обери машинку!', root.sprites.CAR_TYPES,
      function (card, car) {
        const cv = document.createElement('canvas');
        cv.width = 120; cv.height = 110;
        root.sprites.drawCar(cv.getContext('2d'), 60, 100, 84, car, {});
        card.appendChild(cv);
        card.appendChild(el('div', 'card-label', car.label));
      },
      function (car) { return car.label; },
      function (car) { if (cb.onCarPicked) cb.onCarPicked(car); });
  }

  function buildTrack() {
    return buildCardScreen('Куди поїдемо?', root.tracks.TRACKS,
      function (card, tr) {
        card.classList.add('card-track');
        card.style.background = 'linear-gradient(' + tr.palette.skyTop + ',' + tr.palette.ground + ')';
        card.appendChild(el('div', 'card-emoji', tr.emoji));
        card.appendChild(el('div', 'card-label', tr.name));
      },
      function (tr) { return tr.name; },
      function (tr) { if (cb.onTrackPicked) cb.onTrackPicked(tr); });
  }

  function buildFinish(data) {
    const s = el('div', 'screen screen-finish');
    s.appendChild(buildMuteButton());
    const conf = el('div', 'confetti');
    const colors = ['#E53935', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#FF9800'];
    for (let i = 0; i < 40; i++) {
      const p = el('div', 'confetti-piece');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 2) + 's';
      p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      conf.appendChild(p);
    }
    s.appendChild(conf);
    s.appendChild(el('div', 'trophy', '🏆'));
    s.appendChild(el('h2', 'title', 'Перемога!'));
    s.appendChild(el('div', 'finish-stars', '⭐ ' + (data.stars || 0)));
    let sayText = 'Перемога, ' + (data.charName || '') + '! У тебе ' + (data.stars || 0) + ' зірочок!';
    if (data.sticker) {
      const st = el('div', 'sticker');
      st.appendChild(el('div', 'sticker-emoji', data.sticker.emoji));
      st.appendChild(el('div', 'sticker-label', 'Нова наліпка!'));
      st.appendChild(el('div', 'sticker-name', data.sticker.label));
      s.appendChild(st);
      sayText += ' Нова наліпка: ' + data.sticker.label + '!';
    }
    const row = el('div', 'btn-row');
    const again = el('button', 'btn', 'Ще раз!');
    again.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onAgain) cb.onAgain();
    });
    const other = el('button', 'btn', 'Інша траса');
    other.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onOtherTrack) cb.onOtherTrack();
    });
    row.appendChild(again);
    row.appendChild(other);
    s.appendChild(row);
    root.audio.speak(sayText);
    return s;
  }

  root.screens = screens;
  if (typeof module !== 'undefined' && module.exports) module.exports = screens;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
