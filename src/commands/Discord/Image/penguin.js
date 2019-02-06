const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Penguin extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'penguin',
      syntax     : 'penguin',
      aliases    : [ 'pengu', 'waddle' ],
      argument   : [],
      description: 'Get a random pengu',

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

    let img = await w('https://animals.anidiots.guide/penguin', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['penguin'],
        image      : { url: img.link ? img.link : '' },
        description: `*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.link ? img.link : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';
    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('image', 'penguin'));
  }
};