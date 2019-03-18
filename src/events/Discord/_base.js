const { DiscordEvent } = require('../../core');

module.exports = class name extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'name' });

    Object.freeze(this);
    Object.freeze(this.static);  
  }

  emit(...args) {
    // ...
  }

  localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      // ...
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};
