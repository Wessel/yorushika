const { DiscordCommand } = require('../../../core');

module.exports = class Ping extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'ping',
      syntax     : 'ping',
      aliases    : [ 'pong' ],
      argument   : [],
      description: 'Lists latencies',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Utility',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg) {
    const now = Date.now();
    let health = msg.author.locale.util.ping.health[0];
    const latency = msg.channel.guild ? msg.channel.guild.shard.latency : undefined;
    
    if (isNaN(latency)) health = msg.author.locale.util.ping.health[0];
    else if (latency < 200) health = `${msg.author.locale.util.ping.health[1]} (**${this.bot.util.getPercentage(200, latency).toFixed()}%** \`[${'='.repeat(10 - Math.round(10* latency / 200))}${'-'.repeat(Math.round(10* latency / 200))}]\`)`;
    else if (latency < 400) health = `${msg.author.locale.util.ping.health[2]} (**${this.bot.util.getPercentage(400, latency).toFixed()}%** \`[${'='.repeat(10 - Math.round(10* latency / 400))}${'-'.repeat(Math.round(10* latency / 400))}]\`)`;
    else if (latency > 400) health = `${msg.author.locale.util.ping.health[3]} (**0%** \`[----------]\`)`;
    
    const message = await msg.channel.createMessage({
      embed: {
        color: this.bot.col.util.ping[0],
        description: this._localize(msg.author.locale.util.ping.busy)
      }
    });

    message.edit({
      embed: {
        color:  latency < 200 ? this.bot.col.util.ping[1] : latency > 200 && latency < 400 ? this.bot.col.util.ping[2] : this.bot.col.util.ping[3],
        description: this._localize(msg.author.locale.util.ping.result.join('\n'), { latency: latency, now: now, health: health })
      }
    });
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        if (extData.now) msg = msg.replace(/\$\[roundtrip]/g, Date.now() - extData.now);
        if (extData.health) msg = msg.replace(/\$\[health]/g, extData.health);
        if (extData.latency) msg = msg.replace(/\$\[latency]/g, extData.latency);
      }

      return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('util', 'ping', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('util', 'ping', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('util', 'ping', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('util', 'ping', '3'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`; 
    }
  }
};