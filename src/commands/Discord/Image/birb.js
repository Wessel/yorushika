const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Birb extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'birb',
      syntax     : 'birb',
      aliases    : [ 'bird' ],
      argument   : [],
      description: 'Get a random birb',

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

    let img = await w('https://some-random-api.ml/birbimg', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();

    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['birb'],
        image      : { url: img.link ? img.link : '' },
        description: `*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.link ? img.link : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'birb'));
  }
};