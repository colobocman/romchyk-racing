(function (root) {
  'use strict';
  const utils = {};

  utils.clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };

  utils.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  utils.easeInOut = function (t) {
    return -Math.cos(t * Math.PI) / 2 + 0.5;
  };

  utils.randInt = function (min, max, rng) {
    const r = rng || Math.random;
    return min + Math.floor(r() * (max - min + 1));
  };

  utils.pick = function (arr, rng) {
    return arr[utils.randInt(0, arr.length - 1, rng)];
  };

  utils.shuffle = function (arr, rng) {
    const r = rng || Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  };

  utils.fmt = function (template, map) {
    return template.replace(/\{(\w+)\}/g, function (m, key) {
      return key in map ? String(map[key]) : m;
    });
  };

  root.utils = utils;
  if (typeof module !== 'undefined' && module.exports) module.exports = utils;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
