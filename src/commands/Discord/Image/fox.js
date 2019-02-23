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
    
    this.static = {
      BASE_URL: 'https://randomfox.ca',
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

    let img = await w(`${this.static.BASE_URL}/floof`, this.static.REQ_DATA).send();
        img = img.json();

    
    msg.channel.createMessage({
      embed: {
        color: this.bot.col.image.fox,
        image: {
          url: img.image || ''
        },
        description: `*[\`${msg.author.locale.image.failed_cache}\`](${img && img.image ? img.image : 'https://www.google.com/'})*`
      }
    });

    message.delete();
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'fox'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};