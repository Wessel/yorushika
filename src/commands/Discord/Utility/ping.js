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
  }

  async execute(msg) {
    const now     = Date.now();
    const latency = msg.channel.guild ? msg.channel.guild.shard.latency : undefined;
    
    let health;
    if (isNaN(latency))     health = msg.author.locale['util']['ping']['health'][0];
    else if (latency < 200) health = `${msg.author.locale['util']['ping']['health'][1]} (**${this.bot.util.getPercentage(200, latency).toFixed()}%** \`[${'='.repeat(10 - Math.round(10* latency / 200))}${'-'.repeat(Math.round(10* latency / 200))}]\`)`;
    else if (latency < 400) health = `${msg.author.locale['util']['ping']['health'][2]} (**${this.bot.util.getPercentage(400, latency).toFixed()}%** \`[${'='.repeat(10 - Math.round(10* latency / 400))}${'-'.repeat(Math.round(10* latency / 400))}]\`)`;
    else if (latency > 400) health = `${msg.author.locale['util']['ping']['health'][3]} Bad (**0%** \`[----------]\`)`;
    
    const message = await msg.channel.createMessage({
      embed: {
        color      : this.bot.col['util']['ping']['0'],
        description: this.localize(msg.author.locale['util']['ping']['busy'])
      }
    });

    message.edit({
      embed: {
        color      :  latency < 200 ? this.bot.col['util']['ping']['1'] : latency > 200 && latency < 400 ? this.bot.col['util']['ping']['2'] : this.bot.col['util']['ping']['3'],
        description: this.localize(msg.author.locale['util']['ping']['result'].join('\n'), { latency: latency, now: now, health: health })
      }
    });
  }

  localize(msg, extData = {}) {
    if (!msg) return '';
    
    if (extData && extData.now)     msg = msg.replace(/\$\[roundtrip]/g, Date.now() - extData.now);
    if (extData && extData.health)  msg = msg.replace(/\$\[health]/g, extData.health);
    if (extData && extData.latency) msg = msg.replace(/\$\[latency]/g, extData.latency);
    
    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('util', 'ping', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('util', 'ping', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('util', 'ping', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('util', 'ping', '3'));
  }
};