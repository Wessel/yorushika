const fs        = require('fs');
const yaml      = require('js-yaml');
const moment    = require('moment');
const { strip } = require('../util/colors');

const conf = yaml.safeLoad(fs.readFileSync('application.yml', { encoding: 'utf8' }));

module.exports = class WumpUtil {
  /**
   * Print `msg` to the console with debug `lvl`
   * 
   * @param {Number} lvl - The logging level 
   * @param {String} msg - The message to log
   * @returns {Boolean} If the message logged or not
   */
  static print(lvl = 0, msg = '') {
    try {
      const log = `tmp/log/${moment(new Date).format('DD[-]MM[-]YYYY')}.log`;

      fs.mkdir('tmp', 777,      (err) => { if (err && err.code !== 'EEXIST') throw err; });
      fs.mkdir('tmp/log', 777, (err) => { if (err && err.code !== 'EEXIST') throw err; });

      if (lvl === 1 && conf.debug && conf.debug >= 1) {
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
      } else if (lvl === 2 && conf.debug && conf.debug >= 2) {
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
      } else if (lvl === 3 && conf.debug && conf.debug >= 3) {
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
      } else if (lvl === 4 && conf.debug && conf.debug >= 4) {
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
      } else if (lvl === 0) {
        console.log(`[${moment(new Date).format( 'HH[:]mm[:]ss' )} / ${process.hash}] ${msg}`);
        fs.appendFileSync(log, `[${moment(new Date).format('HH[:]mm[:]ss')} / ${process.hash}] ${strip(msg)}\r\n`);
      }

      return true;
    } catch (ex) {
      return false;
    }
  }

  /**
   * Get the percentage diffrence between `a` and `b`
   * 
   * @param {Number} a - The number to get the percentage of
   * @param {Number} b - The number to get the precentage from `a` of
   * @returns {Number} - The percentage diffrence
   */
  static getPercentage(a, b) {
    return ((( a - b ) / a) * 100);
  }

  /**
   * Shorten `text` to `max` characters
   * 
   * @param {String} text - The string to shorten 
   * @param {Number} max - The max length of the string
   */
  static shorten(text = '', max = 2000) {
    return text.length > max ? `${text.substr( 0, max - 3 )}...` : text;
  }

  /**
   * Escape all markdown from a string
   * 
   * @param {String} text - The string to escape
   * @param {Boolean} onlyCodeBlock - Only escape codeblocks
   * @param {Boolean} onlyInlineCode - Only escape inlince code
   * @returns {String} - The modified string
   */
  static escapeMarkdown(text, onlyCodeBlock = false, onlyInlineCode = false) {
    if (onlyCodeBlock) return text.replace(/```/g, '`\u200b``');
    if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1');
    return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
  }

  
  /**
   * Remove all markdown from a string
   * 
   * @param {String} text - The string to escape
   * @param {Boolean} onlyCodeBlock - Only remove codeblocks
   * @param {Boolean} onlyInlineCode - Only remove inlince code
   * @returns {String} - The modified string
   */
  static removeMarkdown(text, onlyCodeBlock = false, onlyInlineCode = false) {
    if (onlyCodeBlock) return text.replace(/```/g, '');
    if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '').replace(/(`|\\)/g, '');
    return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '');
  }

  /**
   * Check if `array` includes `needle`
   * 
   * @param {Array} array - The array to check 
   * @param {*} needle - The item to find in `array`
   * @param {*} exact - Exact result or not
   */
  contains(array, needle, exact = false) {
    for (let _ in array) {
      if (exact) {
        if (array[_] === needle) return array[_];
      } else {
        if (array[_].includes(needle)) return array[_];
      }
    }
  }
};