const fs = require('fs');
const path = require('path');
const { check, done } = require('./t.js');

const root = path.join(__dirname, '..');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
check('manifest name', manifest.name === 'Ромчик-Гонщик');
check('manifest short_name', manifest.short_name === 'Ромчик');
check('manifest start_url', manifest.start_url === '.');
check('manifest display', manifest.display === 'standalone');
check('manifest background_color', manifest.background_color === '#4FC3F7');
check('manifest theme_color', manifest.theme_color === '#4FC3F7');
check('manifest icons is array of 3', Array.isArray(manifest.icons) && manifest.icons.length === 3);
manifest.icons.forEach(function (icon) {
  check('icon file exists: ' + icon.src, fs.existsSync(path.join(root, icon.src)));
});

const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
check('sw cache name rg-vN', /const CACHE = 'rg-v\d+';/.test(sw));
const m = sw.match(/const FILES = \[([\s\S]*?)\];/);
check('sw FILES array present', !!m);
const files = m ? m[1].match(/'([^']+)'/g).map(function (s) { return s.slice(1, -1); }) : [];
check('sw FILES has 18 entries', files.length === 18);
files.forEach(function (f) {
  const rel = f === './' ? 'index.html' : f;
  check('cached file exists: ' + f, fs.existsSync(path.join(root, rel)));
});

done();
