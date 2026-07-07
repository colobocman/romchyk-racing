(function (root) {
  'use strict';
  const tracks = {};

  // Кожен елемент layout розгортається у road.buildTrack (Task 5):
  //   ['straight', n]        -> 3n сегментів прямої
  //   ['curve', n, c]        -> 3n сегментів повороту сили c
  //   ['hill', n, h]         -> 3n сегментів зі зміною висоти h * SEG_LEN
  //   ['curvyhill', n, c, h] -> поворот і пагорб одночасно
  // Сумарна висота кожної траси зведена до нуля (фініш на рівні старту).
  tracks.TRACKS = [
    {
      id: 'mountains',
      name: 'Гори',
      emoji: '🏔️',
      palette: {
        skyTop: '#4FC3F7', skyBottom: '#B3E5FC',
        hillFar: '#B0BEC5', hillNear: '#81C784',
        ground: '#66BB6A', groundAlt: '#5DAF61',
        road: '#6B6B6B', roadAlt: '#646464',
        rumbleA: '#FFFFFF', rumbleB: '#E53935',
        lane: '#FFFFFF'
      },
      scenery: ['🌲', '🌲', '🌲', '🌳', '🌲', '🪨', '⛰️', '🌲', '🌼'],
      bgTrain: true,   // потяг на віадуку в паралаксі
      bgBoats: false,
      // Серпантин: часті повороти ±4..6, пагорби ±40..80. Разом 501 сегмент.
      layout: [
        ['straight', 12],
        ['curve', 9, 4],
        ['hill', 10, 60],
        ['curve', 9, -5],
        ['curvyhill', 10, 5, 40],
        ['curve', 8, -6],
        ['hill', 10, -80],
        ['curve', 9, 6],
        ['straight', 8],
        ['curvyhill', 10, -4, 70],
        ['curve', 9, 5],
        ['hill', 10, -50],
        ['curve', 9, -6],
        ['curvyhill', 10, 6, -80],
        ['curve', 8, -4],
        ['hill', 8, 40],
        ['curve', 8, 5],
        ['straight', 10]
      ]
    },
    {
      id: 'sea',
      name: 'Море',
      emoji: '🌊',
      palette: {
        skyTop: '#29B6F6', skyBottom: '#B3E5FC',
        hillFar: '#0277BD', hillNear: '#4FC3F7',
        ground: '#FFE082', groundAlt: '#F7D670',
        road: '#8D8D8D', roadAlt: '#858585',
        rumbleA: '#FFFFFF', rumbleB: '#039BE5',
        lane: '#FFFFFF'
      },
      scenery: ['🌴', '🌴', '🌴', '⛱️', '🌴', '🐚', '🌺', '🌴'],
      bgTrain: false,
      bgBoats: true,   // кораблики гойдаються в паралаксі
      // Узбережжя: довгі плавні повороти ±2..3, два ледь помітні пагорби ±20.
      // Разом 498 сегментів.
      layout: [
        ['straight', 15],
        ['curve', 15, 2],
        ['straight', 8],
        ['curve', 15, -3],
        ['straight', 10],
        ['curve', 18, 2],
        ['hill', 8, 20],
        ['curve', 15, -2],
        ['straight', 12],
        ['curve', 16, 3],
        ['hill', 8, -20],
        ['curve', 14, -2],
        ['straight', 12]
      ]
    },
    {
      id: 'city',
      name: 'Місто',
      emoji: '🏙️',
      palette: {
        skyTop: '#64B5F6', skyBottom: '#E1F5FE',
        hillFar: '#9FA8DA', hillNear: '#7986CB',
        ground: '#A5A5A5', groundAlt: '#9B9B9B',
        road: '#5F5F5F', roadAlt: '#585858',
        rumbleA: '#FFFFFF', rumbleB: '#FDD835',
        lane: '#FFEE58'
      },
      scenery: ['🏢', '🏠', '🏢', '🚦', '🌳', '🏪', '🏢', '🏫', '🌳'],
      bgTrain: true,   // потяг біля вокзалу в паралаксі
      bgBoats: false,
      // Місто: довгі прямі та короткі "прямокутні" повороти ±5..6, рівнина.
      // Разом 462 сегменти.
      layout: [
        ['straight', 18],
        ['curve', 6, 6],
        ['straight', 14],
        ['curve', 6, -6],
        ['straight', 12],
        ['curve', 6, -5],
        ['straight', 16],
        ['curve', 6, 6],
        ['straight', 10],
        ['curve', 6, 5],
        ['straight', 14],
        ['curve', 6, -6],
        ['straight', 12],
        ['curve', 6, 5],
        ['straight', 16]
      ]
    }
  ];

  root.tracks = tracks;
  if (typeof module !== 'undefined' && module.exports) module.exports = tracks;
})(typeof window !== 'undefined' ? (window.RG = window.RG || {}) : {});
