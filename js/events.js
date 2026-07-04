(function (root) {
  'use strict';
  const utils = (typeof require !== 'undefined') ? require('./utils.js') : root.utils;
  const road = (typeof require !== 'undefined') ? require('./road.js') : root.road;
  const learning = (typeof require !== 'undefined') ? require('./learning.js') : root.learning;
  const audio = (typeof require !== 'undefined') ? require('./audio.js') : root.audio;
  const events = {};

  const GATE_FRACS = [0.12, 0.25, 0.4, 0.55, 0.72, 0.88];
  const STOP_FRACS = [0.33, 0.6, 0.8];

  events.plan = function (trackLength, progress, rng) {
    rng = rng || Math.random;
    const minDist = 20 * road.SEG_LEN;
    const stopTypes = utils.shuffle(['train', 'police', 'roadwork'], rng);
    const evs = [];
    const stops = [];
    for (let i = 0; i < STOP_FRACS.length; i++) {
      const ev = { type: stopTypes[i], z: Math.round(STOP_FRACS[i] * trackLength), task: null, done: false };
      stops.push(ev);
      evs.push(ev);
    }
    for (let i = 0; i < GATE_FRACS.length; i++) {
      let z = Math.round(GATE_FRACS[i] * trackLength);
      for (let j = 0; j < stops.length; j++) {
        if (Math.abs(z - stops[j].z) < minDist) z -= minDist;
      }
      evs.push({ type: 'gate', z: z, task: null, done: false });
    }
    evs.sort(function (a, b) { return a.z - b.z; });
    return evs;
  };

  events.gateChoice = function (laneXs, playerX) {
    let best = 0;
    for (let i = 1; i < laneXs.length; i++) {
      if (Math.abs(playerX - laneXs[i]) < Math.abs(playerX - laneXs[best])) best = i;
    }
    return best;
  };

  const PRAISES = ['Молодець, {name}!', 'Супер, {name}!', 'Чудово!', 'Так тримати!', 'Вау!'];
  const GENTLE = ['Ой, спробуй ще!', 'Майже!'];

  events.createController = function (r, progress, ui, rng) {
    rng = rng || Math.random;
    const ctrl = { events: events.plan(r.length, progress, rng), active: null };
    const name = (r.playerChar && r.playerChar.name) ? r.playerChar.name : 'Ромчик';

    function praise() {
      return utils.fmt(utils.pick(PRAISES, rng), { name: name });
    }

    function prepareGate(ev) {
      ev.task = learning.makeGateTask(progress, rng);
      ev.laneXs = ev.task.options.length === 2 ? [-0.45, 0.45] : [-0.55, 0, 0.55];
      const seg = road.findSegment(r.segments, ev.z);
      for (let i = 0; i < ev.task.options.length; i++) {
        seg.sprites.push({ key: String(ev.task.options[i].text), offset: ev.laneXs[i], scale: 1.5 });
      }
      audio.speak(ev.task.say);
    }

    function passGate(ev) {
      ev.done = true;
      const idx = events.gateChoice(ev.laneXs, r.playerX);
      const correct = ev.task.options[idx].correct;
      learning.applyAnswer(progress, ev.task.skill, correct);
      if (correct) {
        audio.sfx('ding');
        learning.awardStar(progress);
        ui.updateHUD({ stars: progress.stars });
        r.confetti();
        audio.speak(praise());
      } else {
        audio.sfx('wrong');
        const right = ev.task.options.filter(function (o) { return o.correct; })[0].text;
        const word = ev.task.kind === 'letter' ? 'буква' : 'цифра';
        audio.speak(utils.fmt('Це {word} {x}. Наступного разу вийде!', { word: word, x: right }));
      }
    }

    function startStop(ev) {
      ev.done = true;
      ctrl.active = ev;
      ev.task = learning.makeStopTask(progress, ev.type, rng);
      r.pause();
      r.stopScene = { type: ev.type, t: 0, count: ev.task.visual ? ev.task.visual.count : 0 };
      if (ev.type === 'train') audio.sfx('train');
    }

    function showStopTask(ev) {
      ev.taskShown = true;
      audio.speak(ev.task.say || ev.task.prompt);
      ui.showTask(ev.task, function (idx) { onStopAnswer(ev, idx); });
    }

    function onStopAnswer(ev, idx) {
      const correct = ev.task.options[idx].correct;
      learning.applyAnswer(progress, ev.task.skill, correct);
      if (correct) {
        audio.sfx('ding');
        learning.awardStar(progress);
        ui.updateHUD({ stars: progress.stars });
        ui.markCorrect(idx);
        audio.speak(praise());
        ui.hideTask();
        ctrl.active = null;
        r.stopScene = null;
        r.resume();
        if (ev.type === 'train') audio.sfx('whistle');
      } else {
        audio.sfx('wrong');
        ui.markWrong(idx);
        let ci = 0;
        for (let i = 0; i < ev.task.options.length; i++) {
          if (ev.task.options[i].correct) ci = i;
        }
        ui.markCorrect(ci);
        audio.speak(utils.pick(GENTLE, rng));
      }
    }

    r.onTick = function (rr, dt) {
      if (r.stopScene) {
        // t накопичує race.update (Task 7) — тут НЕ інкрементуємо, інакше анімація йтиме вдвічі швидше
        if (ctrl.active && !ctrl.active.taskShown && r.stopScene.t >= 1) showStopTask(ctrl.active);
        return;
      }
      const ahead = 40 * road.SEG_LEN;
      for (let i = 0; i < ctrl.events.length; i++) {
        const ev = ctrl.events[i];
        if (ev.done) continue;
        if (ev.type === 'gate') {
          if (!ev.task && r.playerZ >= ev.z - ahead && r.playerZ < ev.z) prepareGate(ev);
          else if (ev.task && r.playerZ >= ev.z) passGate(ev);
        } else if (r.playerZ >= ev.z) {
          startStop(ev);
          return;
        }
      }
    };

    return ctrl;
  };

  root.events = events;
  if (typeof module !== 'undefined' && module.exports) module.exports = events;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
