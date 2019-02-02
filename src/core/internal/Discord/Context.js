module.exports = class WumpContext {
  constructor(bot, msg) {
    Object.assign(this, msg);
    this.bot    = bot;
    this.orig   = msg;
    this.locale = null;
    this.prefix = null;
  }

  get guild() { return this.channel.guild; }

  getPrefix() { return this.prefix; }
  getLocale() { return this.locale; }
  getMember() { return this.member; }

  setPrefix(prefix) { this.prefix = prefix; }
  setLocale(locale) { this.locale = locale; }
};