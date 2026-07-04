let n = 0;
function check(name, cond) {
  n++;
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; }
}
function done() {
  console.log((process.exitCode ? 'FAILED' : 'OK') + ': ' + n + ' checks');
}
module.exports = { check, done };
