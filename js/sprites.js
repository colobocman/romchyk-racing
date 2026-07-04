(function (root) {
  'use strict';
  const sprites = {};

  sprites.CHARACTERS = [
    { id: 'romchyk',  name: 'Ромчик',   hair: '#8B5A2B', shirt: '#E53935', skin: '#FFD8B5' },
    { id: 'matviyko', name: 'Матвійко', hair: '#3E2723', shirt: '#1E88E5', skin: '#FFD8B5' },
    { id: 'andriyko', name: 'Андрійко', hair: '#FBC02D', shirt: '#43A047', skin: '#FFE0BD' },
    { id: 'miya',     name: 'Мія',      hair: '#5D4037', shirt: '#8E24AA', skin: '#FFD8B5', bow: '#F06292' }
  ];

  sprites.CAR_TYPES = [
    { id: 'race',   label: 'Червона гоночна',     color: '#E53935', accent: '#FFCDD2', shape: 'race' },
    { id: 'jeep',   label: 'Синій джип',           color: '#1E88E5', accent: '#BBDEFB', shape: 'jeep' },
    { id: 'buggy',  label: 'Зелений баггі',        color: '#43A047', accent: '#C8E6C9', shape: 'buggy' },
    { id: 'pickup', label: 'Жовтий пікап',         color: '#FDD835', accent: '#FFF9C4', shape: 'pickup' },
    { id: 'cabrio', label: 'Фіолетовий кабріолет', color: '#8E24AA', accent: '#E1BEE7', shape: 'cabrio' },
    { id: 'bolid',  label: 'Райдужний болід',      color: '#E53935', accent: '#FFF', shape: 'race', rainbow: true }
  ];

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function bodyFill(ctx, carDef, top, h) {
    if (!carDef.rainbow) return carDef.color;
    const g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, '#E53935');
    g.addColorStop(0.25, '#FDD835');
    g.addColorStop(0.5, '#43A047');
    g.addColorStop(0.75, '#1E88E5');
    g.addColorStop(1, '#8E24AA');
    return g;
  }

  sprites.drawCar = function (ctx, cx, bottomY, w, carDef, opts) {
    opts = opts || {};
    const steer = clamp(opts.steer || 0, -1, 1);
    const shape = carDef.shape;
    const big = shape === 'buggy' || shape === 'jeep';
    const wheelR = (big ? 0.17 : 0.13) * w;
    const bodyW = 0.9 * w;
    const bodyH = 0.32 * w;
    const bodyBottom = -0.4 * wheelR;
    const bodyTop = bodyBottom - bodyH;
    const cabW = 0.56 * w;
    const cabH = 0.24 * w;
    const cabTop = bodyTop - cabH;

    ctx.save();
    ctx.translate(cx, bottomY);
    ctx.rotate(steer * 0.08);

    function wheel(x) {
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(x, -wheelR, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.arc(x, -wheelR, wheelR * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    wheel(-0.38 * w);
    wheel(0.38 * w);

    ctx.fillStyle = bodyFill(ctx, carDef, bodyTop, bodyH);
    roundedRect(ctx, -bodyW / 2, bodyTop, bodyW, bodyH, 0.08 * w);
    ctx.fill();

    if (shape === 'race') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -cabW / 2, cabTop + 0.06 * w, cabW, cabH - 0.06 * w, 0.05 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      roundedRect(ctx, -cabW / 2 + 0.06 * w, cabTop + 0.1 * w, cabW - 0.12 * w, cabH - 0.13 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      ctx.fillRect(-0.4 * w, cabTop - 0.02 * w, 0.05 * w, 0.09 * w);
      ctx.fillRect(0.35 * w, cabTop - 0.02 * w, 0.05 * w, 0.09 * w);
      ctx.fillStyle = carDef.accent;
      roundedRect(ctx, -0.45 * w, cabTop - 0.09 * w, 0.9 * w, 0.07 * w, 0.03 * w);
      ctx.fill();
    } else if (shape === 'jeep') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -cabW / 2 - 0.04 * w, cabTop - 0.04 * w, cabW + 0.08 * w, cabH + 0.04 * w, 0.04 * w);
      ctx.fill();
      ctx.fillStyle = '#37474F';
      roundedRect(ctx, -cabW / 2, cabTop, cabW, cabH - 0.1 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(0, bodyTop + bodyH * 0.55, 0.1 * w, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = carDef.accent;
      ctx.beginPath();
      ctx.arc(0, bodyTop + bodyH * 0.55, 0.045 * w, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'buggy') {
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 0.04 * w;
      ctx.beginPath();
      ctx.moveTo(-cabW / 2, bodyTop);
      ctx.lineTo(-cabW / 2 + 0.07 * w, cabTop);
      ctx.lineTo(cabW / 2 - 0.07 * w, cabTop);
      ctx.lineTo(cabW / 2, bodyTop);
      ctx.stroke();
    } else if (shape === 'pickup') {
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -bodyW / 2, bodyTop - 0.09 * w, bodyW, 0.11 * w, 0.03 * w);
      ctx.fill();
      ctx.fillStyle = carDef.accent;
      roundedRect(ctx, -bodyW / 2 + 0.05 * w, bodyTop - 0.06 * w, bodyW - 0.1 * w, 0.05 * w, 0.02 * w);
      ctx.fill();
      ctx.fillStyle = carDef.color;
      roundedRect(ctx, -0.28 * w, cabTop + 0.04 * w, 0.56 * w, 0.12 * w, 0.04 * w);
      ctx.fill();
    } else if (shape === 'cabrio') {
      ctx.fillStyle = '#4E342E';
      roundedRect(ctx, -cabW / 2, bodyTop - 0.06 * w, cabW, 0.08 * w, 0.03 * w);
      ctx.fill();
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 0.025 * w;
      ctx.strokeRect(-0.26 * w, cabTop + 0.08 * w, 0.52 * w, 0.06 * w);
    }

    ctx.fillStyle = opts.brake ? '#FF5252' : '#B71C1C';
    roundedRect(ctx, -bodyW / 2 + 0.04 * w, bodyBottom - 0.11 * w, 0.13 * w, 0.07 * w, 0.02 * w);
    ctx.fill();
    roundedRect(ctx, bodyW / 2 - 0.17 * w, bodyBottom - 0.11 * w, 0.13 * w, 0.07 * w, 0.02 * w);
    ctx.fill();
    ctx.fillStyle = carDef.accent;
    roundedRect(ctx, -0.1 * w, bodyBottom - 0.1 * w, 0.2 * w, 0.06 * w, 0.01 * w);
    ctx.fill();

    if (opts.driver) {
      const d = opts.driver;
      const headR = 0.1 * w;
      const open = shape === 'cabrio' || shape === 'buggy';
      const headY = open ? bodyTop - 0.1 * w : cabTop;
      ctx.fillStyle = d.shirt;
      roundedRect(ctx, -0.14 * w, headY + headR * 0.5, 0.28 * w, 0.12 * w, 0.04 * w);
      ctx.fill();
      ctx.fillStyle = d.skin;
      ctx.beginPath();
      ctx.arc(0, headY, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = d.hair;
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.15, headR, Math.PI, Math.PI * 2);
      ctx.fill();
      if (d.bow) {
        ctx.fillStyle = d.bow;
        ctx.beginPath();
        ctx.arc(headR * 0.75, headY - headR * 0.7, headR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  sprites.drawCharacter = function (ctx, cx, topY, size, charDef) {
    const headR = 0.28 * size;
    const headY = topY + headR + 0.04 * size;
    ctx.save();
    ctx.fillStyle = charDef.shirt;
    roundedRect(ctx, cx - 0.32 * size, topY + 0.56 * size, 0.64 * size, 0.44 * size, 0.12 * size);
    ctx.fill();
    ctx.fillStyle = charDef.skin;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = charDef.hair;
    ctx.beginPath();
    ctx.arc(cx, headY - 0.06 * size, headR, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(cx - 0.1 * size, headY + 0.02 * size, 0.035 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 0.1 * size, headY + 0.02 * size, 0.035 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 0.025 * size;
    ctx.beginPath();
    ctx.arc(cx, headY + 0.08 * size, 0.12 * size, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    if (charDef.bow) {
      ctx.fillStyle = charDef.bow;
      ctx.beginPath();
      ctx.arc(cx + headR * 0.7, headY - headR * 0.75, 0.07 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + headR * 0.95, headY - headR * 0.5, 0.07 * size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const emojiCache = new Map();

  sprites.emoji = function (char, sizePx) {
    const key = char + '@' + sizePx;
    const cached = emojiCache.get(key);
    if (cached) return cached;
    const c = document.createElement('canvas');
    c.width = sizePx;
    c.height = sizePx;
    const ectx = c.getContext('2d');
    ectx.font = Math.floor(sizePx * 0.92) + 'px sans-serif';
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.fillText(char, sizePx / 2, sizePx / 2 + sizePx * 0.04);
    emojiCache.set(key, c);
    return c;
  };

  sprites.drawSprite = function (ctx, spriteCanvas, cx, bottomY, w) {
    const h = w * spriteCanvas.height / spriteCanvas.width;
    ctx.drawImage(spriteCanvas, cx - w / 2, bottomY - h, w, h);
  };

  root.sprites = sprites;
  if (typeof module !== 'undefined' && module.exports) module.exports = sprites;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
