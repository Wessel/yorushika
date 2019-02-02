module.exports = class WumpEvent {
  constructor(bot, opts = {}) {
      this.bot = bot;
      this.extData = Object.assign({ name: null }, opts);
  }

  emit(...args) {}

  localize(msg) {}
};