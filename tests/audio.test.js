const { check, done } = require('./t.js');
const audio = require('../js/audio.js');

function noThrow(fn) {
  try { fn(); return true; } catch (e) { return false; }
}

// --- pickUkrainianVoice: чиста функція на фейкових голосах ---
const v1 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: 'uk-UA', name: 'Lesya' },
  { lang: 'pl-PL', name: 'Zosia' }
];
check('picks voice with lang uk-UA', audio.pickUkrainianVoice(v1) === v1[1]);

const v2 = [
  { lang: 'en-GB', name: 'Daniel' },
  { lang: 'uk', name: 'Ukrainian Voice' }
];
check('lang "uk" without region matches', audio.pickUkrainianVoice(v2) === v2[1]);

const v3 = [
  { lang: 'uk-UA', name: 'Voice A' },
  { lang: 'uk-UA', name: 'Voice B' }
];
check('first of several uk voices wins', audio.pickUkrainianVoice(v3) === v3[0]);

const v4 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: '', name: 'Google Ukrainian' }
];
check('falls back to /ukrain/i in name', audio.pickUkrainianVoice(v4) === v4[1]);

const v5 = [
  { lang: 'en-US', name: 'Samantha' },
  { lang: 'und', name: 'LESYA Enhanced' }
];
check('falls back to /lesya/i in name', audio.pickUkrainianVoice(v5) === v5[1]);

const v6 = [
  { lang: 'en-US', name: 'Ukrainian Accent' },
  { lang: 'uk-UA', name: 'Kyivska' }
];
check('lang match wins over name match', audio.pickUkrainianVoice(v6) === v6[1]);

check('null when nothing matches',
  audio.pickUkrainianVoice([{ lang: 'en-US', name: 'Samantha' }]) === null);
check('null for empty list', audio.pickUkrainianVoice([]) === null);

// --- muted-стан і безпечні no-op без браузерних API (у Node їх нема) ---
check('isMuted() false by default',
  noThrow(function () { audio.isMuted(); }) && audio.isMuted() === false);
check('setMuted(true) -> isMuted() true',
  noThrow(function () { audio.setMuted(true); }) && audio.isMuted() === true);
check('setMuted(false) -> isMuted() false',
  noThrow(function () { audio.setMuted(false); }) && audio.isMuted() === false);
check('init() safe without AudioContext/speechSynthesis',
  noThrow(function () { audio.init(); audio.init(); }));
check('every sfx name is a safe no-op in Node',
  noThrow(function () {
    ['honk', 'ding', 'wrong', 'train', 'whistle', 'win', 'pop', 'click', 'crash']
      .forEach(function (n) { audio.sfx(n); });
  }));
check('speak() safe no-op in Node',
  noThrow(function () { audio.speak('Привіт, Ромчику!'); }));
check('engine start/update/stop safe no-op in Node',
  noThrow(function () { audio.startEngine(); audio.engine(0.5); audio.stopEngine(); }));

done();
