module.exports = class WumpEvent {
  constructor(bot, opts = {}) {
      this.bot = bot;
      this.extData = Object.assign({
        name: null // Event name ( required )
      }, opts);

      this.static = {};
      this.mutable = {};
  }

  emit(...args) {
    // ...
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      // ...
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};