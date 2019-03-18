const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Birb extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path       : undefined,
      name       : 'birb',
      syntax     : 'birb',
      bearer      : 'yorushika',
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

    this.static = {
      BASE_URL: 'https://some-random-api.ml',
      REQ_DATA: {
        headers: {
          'User-Agent': this.bot.ua
        }
      }
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg) {
    const message = await msg.channel.createMessage(this._localize(msg.author.locale.image.fetching));

    let img = await w(`${this.static.BASE_URL}/birbimg`, this.static.REQ_DATA).send();
        img = img.json();

    msg.channel.createMessage({
      embed: {
        color: this.bot.col.image.birb,
        image: {
          url: img.link || ''
        },
        description: `*[\`${msg.author.locale.image.failed_cache}\`](${img && img.link ? img.link : 'https://www.google.com/'})*`
      }
    });

    message.delete();
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'birb'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};