const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Dog extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'dog',
      syntax     : 'dog',
      aliases    : [ 'doggo' ],
      argument   : [],
      description: 'Get a random dog',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Image',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      BASE_URL: [
        'https://dog.ceo',
        'https://some-random-api.ml'
      ],
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
    
    let res = await w(`${this.static.BASE_URL[1]}/dogfact`, this.static.REQ_DATA).send();
    let img = await w(`${this.static.BASE_URL[0]}/api/breeds/image/random`, this.static.REQ_DATA).send();
        res = res.json();
        img = img.json();
    
    msg.channel.createMessage({
      embed: {
        color: this.bot.col.image.dog,
        image: {
          url: img.message || ''
        },
        description: `${this.bot.emote('image', 'dog', '1')} *Random Fact* **>** ${res.fact.slice(0, 1950)}\n\n*[\`${msg.author.locale.image.failed_cache}\`](${img && img.message ? img.message : 'https://www.google.com/'})*`
      }
    });

    message.delete();
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'dog', '0'));
    } catch(ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};