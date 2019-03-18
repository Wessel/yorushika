const { DiscordEvent } = require('../../core');

const moment          = require('moment');
const { green, cyan } = require('../../util/colors');

module.exports = class Ready extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'ready' });
  }

  emit() {
    this.bot.print(1, `${cyan( 'Discord' )} >> All websockets connected to ${green(`${this.bot.user.username}#${this.bot.user.discriminator}`)}`);

    if (this.bot.conf.discord.playing) {
      this.bot.editStatus({
        url    : this.bot.conf.discord.playing.url    || null,
        type   : this.bot.conf.discord.playing.type   || 3,
        name   : this.bot.conf.discord.playing.name   || 'Wump',
        status : this.bot.conf.discord.playing.status || 'online'
      });
    }

    this.bot.hook.send({ content: this.localize(this.bot.locales.get('en_us:LOGS').connection.ready) });

    // Cache flushing if entry isn't used within `flushTime` milliseconds
    const flushTime = (30 * 60) * 1000;
    setInterval(() => {
      const uCache = this.bot.cache.get('users')  || []; 
      const gCache = this.bot.cache.get('guilds') || [];
      const vCache = this.bot.cache.get('voters') || [];

      gCache.forEach((v, _) => {
        if (new Date(v.entryAge) <= new Date(new Date() - flushTime)) {
          gCache.splice(_, 1);
        }
      });

      uCache.forEach((v, _) => {
        if (new Date(v.entryAge) <= new Date(new Date() - flushTime)) {
          vCache.forEach((n, _) => n === v.userId ? vCache.splice(_, 1) : undefined);
          uCache.splice(_, 1);
        }
      });
    }, flushTime);
  }

  localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';

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