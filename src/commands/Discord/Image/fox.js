const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Fox extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'fox',
      syntax     : 'fox',
      aliases    : [ 'fox' ],
      argument   : [],
      description: 'Get a random fox',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Image',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg) {
    const message = await msg.channel.createMessage(this.localize(msg.author.locale['image']['fetching']));

    let img = await w('https://randomfox.ca/floof/', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['fox'],
        image      : { url: img.image ? img.image : '' },
        description: `*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.image ? img.image : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'fox'));
  }
};