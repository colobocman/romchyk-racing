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

  // Спільний декор екранів: сонце, хмаринки та смуга дороги з машинками унизу.
  // Все декоративне — pointer-events:none, щоб не перехоплювати кліки по кнопках.
  function decorScreen(s) {
    const sky = el('div', 'scene-sky');
    sky.appendChild(el('div', 'scene-sun', '☀️'));
    sky.appendChild(el('div', 'scene-cloud scene-cloud-1', '☁️'));
    sky.appendChild(el('div', 'scene-cloud scene-cloud-2', '☁️'));
    sky.appendChild(el('div', 'scene-cloud scene-cloud-3', '☁️'));
    s.appendChild(sky);

    const road = el('div', 'scene-road');
    const dash = el('div', 'scene-dash');
    road.appendChild(dash);
    const cars = el('div', 'scene-cars');
    ['🏎️', '🚙', '🚗', '🚕', '🚓'].forEach(function (c, i) {
      const car = el('div', 'scene-car scene-car-' + i, c);
      cars.appendChild(car);
    });
    road.appendChild(cars);
    s.appendChild(road);
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
    if (task.say || task.prompt) root.audio.speak(task.say || task.prompt);
  };

  // --- Банер підказки воріт (питання поверх гонки) ---
  let promptEl = null;

  screens.showPrompt = function (text) {
    screens.hidePrompt();
    promptEl = el('div', 'hud-prompt', text);
    ui.appendChild(promptEl);
  };

  screens.hidePrompt = function () {
    if (promptEl && promptEl.parentNode) promptEl.parentNode.removeChild(promptEl);
    promptEl = null;
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
    const s = el('div', 'screen screen-menu');
    decorScreen(s);
    s.appendChild(buildMuteButton());
    const hero = el('div', 'menu-hero');
    hero.appendChild(el('h1', 'title title-bounce', 'Ромчик-Гонщик 🏎️'));
    const play = el('button', 'btn btn-big', 'ГРАТИ ▶');
    play.addEventListener('click', function () {
      root.audio.sfx('click');
      if (cb.onPlay) cb.onPlay();
    });
    hero.appendChild(play);
    s.appendChild(hero);
    root.audio.speak('Ромчик-Гонщик! Натисни грати!');
    return s;
  }

  function buildCardScreen(titleText, items, renderCard, speakFor, onDone) {
    const s = el('div', 'screen');
    decorScreen(s);
    s.appendChild(buildMuteButton());
    const hero = el('div', 'menu-hero');
    hero.appendChild(el('h2', 'title', titleText));
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
    hero.appendChild(grid);
    hero.appendChild(next);
    s.appendChild(hero);
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

  // Міні-прев'ю траси: небо, узбіччя і дорога, що збігається до горизонту, у палітрі траси.
  function drawTrackPreview(ctx, w, h, tr) {
    const p = tr.palette;
    const hor = h * 0.46;
    const sky = ctx.createLinearGradient(0, 0, 0, hor);
    sky.addColorStop(0, p.skyTop);
    sky.addColorStop(1, p.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, hor);
    ctx.fillStyle = p.ground;
    ctx.fillRect(0, hor, w, h - hor);
    ctx.fillStyle = p.road;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - w * 0.06, hor);
    ctx.lineTo(w * 0.5 + w * 0.06, hor);
    ctx.lineTo(w * 0.9, h);
    ctx.lineTo(w * 0.1, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = p.lane;
    ctx.lineWidth = Math.max(2, w * 0.02);
    ctx.setLineDash([w * 0.05, w * 0.05]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, hor);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = Math.round(h * 0.3) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tr.emoji, w * 0.5, hor * 0.5);
  }

  function buildTrack() {
    return buildCardScreen('Куди поїдемо?', root.tracks.TRACKS,
      function (card, tr) {
        card.classList.add('card-track');
        const cv = document.createElement('canvas');
        cv.width = 150; cv.height = 110;
        drawTrackPreview(cv.getContext('2d'), 150, 110, tr);
        card.appendChild(cv);
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
