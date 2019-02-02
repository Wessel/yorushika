const { DiscordEvent } = require('../../core');

const { green, cyan }  = require('../../util/colors');

module.exports = class Ready extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'ready' });
  }

  emit() {
    this.bot.print(1, `${cyan( 'Discord' )} >> All websockets connected to ${green(`${this.bot.user.username}#${this.bot.user.discriminator}`)}`);

    if (this.bot.conf['discord']['playing']) {
      this.bot.editStatus({
        url    : this.bot.conf['discord']['playing']['url']    || null,
        type   : this.bot.conf['discord']['playing']['type']   || 3,
        name   : this.bot.conf['discord']['playing']['name']   || 'Wump',
        status : this.bot.conf['discord']['playing']['status'] || 'online'
      });
    }

    // Cache flushing if entry isn't used within `flushTime` minutes
    const flushTime = 1800000;
    setInterval(() => {
      const uCache = this.bot.cache.get('users')  || []; 
      const gCache = this.bot.cache.get('guilds') || [];

      uCache.forEach((v, _) => (new Date(v.entryAge) <= new Date(new Date() - flushTime)) ? uCache.splice(_, 1) : undefined);
      gCache.forEach((v, _) => (new Date(v.entryAge) <= new Date(new Date() - flushTime)) ? gCache.splice(_, 1) : undefined);
    }, flushTime);
  }
};