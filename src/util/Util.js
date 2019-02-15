const fs        = require('fs');
const yaml      = require('js-yaml');
const moment    = require('moment');
const { strip } = require('../util/colors');

const conf = yaml.safeLoad(fs.readFileSync('application.yml', { encoding: 'utf8' }));

module.exports = class WumpUtil {
  static print(lvl = 0, msg = '') {
    const log = `tmp/log/${moment(new Date).format('DD[-]MM[-]YYYY')}.log`;

    fs.mkdir('tmp', 777,      (err) => { if (err && err.code !== 'EEXIST') throw err; });
    fs.mkdir('tmp/log', 777, (err) => { if (err && err.code !== 'EEXIST') throw err; });

    switch (lvl) {
      case 1 && conf['debug'] && conf['debug'] >= 1:
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
        break;
      case 2 && conf['debug'] && conf['debug'] >= 2:
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
        break;
      case 3 && conf['debug'] && conf['debug'] >= 3:
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
        break;
      case 4 && conf['debug'] && conf['debug'] >= 4:
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
        break;
      default:
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
    }
  }

  static getPercentage(o, n) {
    return (( o - n ) / o) * 100;
  }

  static shorten(t = '', m = 2000) {
    return t.length > m ? `${t.substr( 0, m - 3 )}...` : t;
  }

  static escapeMarkdown(text, onlyCodeBlock = false, onlyInlineCode = false) {
    if (onlyCodeBlock) return text.replace(/```/g, '`\u200b``');
    if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1');
    return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
  }

};