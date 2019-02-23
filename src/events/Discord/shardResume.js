const { DiscordEvent } = require('../../core');

const moment           = require('moment');
const { safeLoad }     = require('js-yaml');
const { join: pJoin }  = require('path');
const { readFileSync } = require('fs');

module.exports = class ShardResume extends DiscordEvent {
  constructor(bot) {
    super(bot, { name: 'shardResume' });

    this.strings = safeLoad(readFileSync(pJoin(__dirname, '..', '..', 'assets', 'i18n', bot.conf['discord']['locale'], 'logs_simple.yml'), { encoding: 'utf8' }));
  }

  emit(id) {
    this.bot.hook.send({ content: this.localize(this.strings['connection']['shard']['resume'],  { shard: id }) });
  }

  localize(msg, extData = {}) {
    if (!msg) return '';
    return msg
      .replace(/\$\[shard:id]/g, extData.shard)
      .replace(/\$\[wump:version]/g, `${this.bot.pkg.version} ${this.bot.conf['nightly'] ? 'NIGHTLY' : 'DISTRIBUTION'}`)
      .replace(/\$\[process:hash]/g, process.hash)
      .replace(/\$\[date:now]/g, moment(Date.now()).format('HH[:]mm[:]ss'))
      .replace(/\$\[emoji#0]/g, this.bot.emote('logs', 'shard', 'resume'));
  }
};