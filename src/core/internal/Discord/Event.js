module.exports = class WumpEvent {
  constructor(bot, opts = {}) {
      this.bot = bot;
      this.extData = Object.assign({ name: null }, opts);

      this.static = {};
      this.mutable = {};
  }

  emit(...args) {}

  _localize(msg) {}
};