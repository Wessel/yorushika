const { readFileSync } = require('fs');

const MODELS = [ 'BCM2708', 'BCM2709', 'BCM2710', 'BCM2835', 'BCM2837B0' ];
const isPi   = ( model ) => { return MODELS.indexOf(model) > -1; };

module.exports = () => {
  let cpuInfo;

  try { cpuInfo = readFileSync('/proc/cpuinfo', { encoding: 'utf8' }); }
  catch (ex) { return false; }

  const model = cpuInfo
    .split('\n')
    .map((v) => v.replace(/\t/g, ''))
    .filter((v) => v.length > 0)
    .map((v) => v.split( ':' ) )
    .map((v) => v.map((e) => e.trim()))
    .filter((v) => v[0] === 'Hardware');

  if (!model || model.length <= 0) return false;
  return isPi(model[0][1]);
};