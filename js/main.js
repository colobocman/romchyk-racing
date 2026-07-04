(function (root) {
  'use strict';
  const main = {};

  root.main = main;
  if (typeof module !== 'undefined' && module.exports) module.exports = main;
  if (typeof window === 'undefined') return;

  const utils = root.utils;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#4FC3F7');
    sky.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const title = 'Ромчик-Гонщик 🏎️';
    const fontSize = Math.round(utils.clamp(width * 0.08, 24, 64));
    ctx.font = 'bold ' + fontSize + 'px "Chalkboard SE", "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#01579B';
    ctx.strokeText(title, width / 2, height / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(title, width / 2, height / 2);
  }

  let lastTime = 0;

  function frame(time) {
    const dt = utils.clamp((time - lastTime) / 1000, 0, 0.05);
    lastTime = time;
    void dt; // ігрова логіка з'явиться в наступних задачах
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
