const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');
const l = require('larg');

module.exports = class Cat extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'cat',
      syntax     : 'cat [--lucifer]',
      aliases    : [ 'kitten' ],
      argument   : [ '[--lucifer]' ],
      description: 'Get a random cat',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Image',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });

    this.static = {
      IMAGES: 37,
      BASE_URL: [
        'https://wessel.meek.moe/lucifer',
        'https://aws.random.cat/meow',
        'https://catfact.ninja'
      ],
      REQ_DATA: {
        headers: {
          'User-Agent': this.bot.ua
        }
      }
    };
  }

  async execute(msg, args) {
    let img = l(args)['lucifer'] ? `${this.static.BASE_URL[0]}/${Math.floor(Math.random() * this.static.IMAGES)}.jpg` : this.static.BASE_URL[1];
    const message = await msg.channel.createMessage(this._localize(msg.author.locale.image.fetching));

    if (img === this.static.BASE_URL[1]) {
      img = await w(img, this.static.REQ_DATA).send();
      img = img.json();
    }

    let res = await w(`${this.static.BASE_URL[2]}/fact?max_length=1500`, this.static.REQ_DATA).send();
        res = res.json();
    
    msg.channel.createMessage({
      embed: {
        color: this.bot.col.image.cat,
        image: {
          url: img.file || img
        },
        description: `${this.bot.emote('image', 'cat', '1')} *Random Fact* **>** ${res.fact}\n\n*[\`${msg.author.locale.image.failed_cache}\`](${img && img.file ? img.file : img})*`
      }
    });

    message.delete();
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';
      
      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'cat', '0'));
    } catch(ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};