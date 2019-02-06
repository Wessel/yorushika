const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Lizard extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'lizard',
      syntax     : 'lizard',
      aliases    : [],
      argument   : [],
      description: 'Get a random lizard',

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

    let img = await w('https://nekos.life/api/v2/img/lizard', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['lizard'],
        image      : { url: img.url ? img.url : '' },
        description: `*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.url ? img.url : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'lizard'));
  }
};