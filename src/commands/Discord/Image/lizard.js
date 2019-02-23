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
    
    this.static = {
      BASE_URL: 'https://nekos.life',
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

    let img = await w(`${this.static.BASE_URL}/api/v2/img/lizard`, this.static.REQ_DATA).send();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color: this.bot.col.image.Lizard,
        image: {
          url: img.url || ''
        },
        description: `*[\`${msg.author.locale.image.failed_cache}\`](${img && img.url ? img.url : 'https://www.google.com/'})*`
      }
    });

    message.delete();
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'lizard'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};