const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Duck extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'duck',
      syntax     : 'duck',
      aliases    : [ 'quack' ],
      argument   : [],
      description: 'Get a random duck',

      hidden     : false,
      enabled    : true,
      cooldown   : 5000,
      category   : 'Image',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg) {
    const message = await msg.channel.createMessage(this.localize(msg.author.locale['image']['fetching']));

    let img = await w('https://random-d.uk/api/v1/random', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['duck'],
        image      : { url: img.url ? img.url : '' },
        description: `*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.url ? img.url : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';
    
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'duck'));
  }
};