const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');
module.exports = class Stats extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'commits',
      syntax     : 'commits',
      aliases    : [],
      argument   : [],
      description: '10 most recent commits',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Information',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

  }

  async execute( msg, args ) {
    let res = await w('https://api.github.com/repos/PassTheWessel/wump/commits', { headers: { 'User-Agent': this.bot.ua } }).send();
        res = res.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['info']['commits'],
        description: this.localize(msg.author.locale['info']['commits'].join('\n'), { total: res.length, commits: res.map((v) => `**•** [\`${v.sha.slice(0, 7)}\`](${v.html_url}) **⤏** ${this.bot.util.shorten(v.commit.message, 80)}`).slice(0, 10).join('\n') })
      }
    });
  }

  localize(msg, extData) {
    if (!msg) return '';
    return msg
    .replace(/\$\[emoji#0]/g, this.bot.emote('info', 'commits', '0'))
    .replace(/\$\[emoji#1]/g, this.bot.emote('info', 'commits', '1'))
    .replace(/\$\[commits:list]/g, `\n${extData.commits}`)
    .replace(/\$\[commits:total]/g, `\n${extData.total}`);
  }
};