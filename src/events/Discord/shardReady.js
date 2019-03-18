const { DiscordEvent } = require('../../core');

const moment = require('moment');

module.exports = class ShardReady extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'shardReady' });
  }

  emit(shard) {
    this.bot.hook.send({ content: this.localize(this.bot.locales.get('en_us:LOGS').connection.shard.ready, shard) });
  }

  localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      if (extData) {
        msg = msg.replace(/{e\.shard\.id}/, extData);
      }

      return msg
      .replace(/{global\.version}/, `${this.bot.pkg.version} ${this.bot.conf.nightly ? 'NIGHTLY' : 'DISTRIBUTION'}`)
      .replace(/{process\.hash}/, process.hash)
      .replace(/{date@now}/, moment(Date.now()).format('HH[:]mm[:]ss'))
      .replace(/{emoji}/, this.bot.emote('logs', 'shard', 'disconnect'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};