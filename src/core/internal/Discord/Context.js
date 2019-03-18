module.exports = class WumpContext {
  constructor(bot, msg) {
    Object.assign(this, msg);

    this.bot    = bot;
    this.orig   = msg;
    this.locale = null;
    this.prefix = null;
  }

  get guild() {
    return this.channel.guild;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }
  
  setLocale(locale) {
    this.locale = locale;
  }
};