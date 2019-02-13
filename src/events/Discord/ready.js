const { DiscordEvent } = require('../../core');

const moment           = require('moment');
const { safeLoad }     = require('js-yaml');
const { green, cyan }  = require('../../util/colors');
const { join: pJoin }  = require('path');
const { readFileSync } = require('fs');

module.exports = class Ready extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'ready' });

    this.strings = safeLoad(readFileSync(pJoin(__dirname, '..', '..', 'assets', 'i18n', bot.conf['discord']['locale'], 'logs_simple.yml'), { encoding: 'utf8' }));
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

    this.bot.hook.send({ content: this.localize(this.strings['connection']['ready']) });

    // Cache flushing if entry isn't used within `flushTime` minutes
    const flushTime = 1800000;
    setInterval(() => {
      const uCache = this.bot.cache.get('users')  || []; 
      const gCache = this.bot.cache.get('guilds') || [];
      const vCache = this.bot.cache.get('voters') || [];

      gCache.forEach((v, _) => (new Date(v.entryAge) <= new Date(new Date() - flushTime)) ? gCache.splice(_, 1) : undefined);
      uCache.forEach((v, _) => {
        if (new Date(v.entryAge) <= new Date(new Date() - flushTime)) {
          vCache.forEach((n, _) => n === v.userId ? vCache.splice(_, 1) : undefined);
          uCache.splice(_, 1);
        }
      });
    }, flushTime);
  }

  localize(msg) {
    if (!msg) return '';
    return msg
      .replace(/\$\[wump:version]/g, `${this.bot.pkg.version} ${this.bot.conf['nightly'] ? 'NIGHTLY' : 'DISTRIBUTIONs'}`)
      .replace(/\$\[process:hash]/g, process.hash)
      .replace(/\$\[date:now]/g, moment(Date.now()).format('HH[:]mm[:]ss'))
      .replace(/\$\[emoji#0]/g, this.bot.emote('logs', 'ready'));
  }
};
// YYYY[y] M[M] DD[d] H[h] m[m] ${startTime > 1000 ? 's[.]SS[s]' : 's[s] SS[ms]'}