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
      cooldown   : 5000,
      category   : 'Image',
      ownerOnly  : false,
      guildOnly  : false,
      permissions: [ 'embedLinks' ]
    });
  }

  async execute(msg) {
    const message = await msg.channel.createMessage(this.localize(msg.author.locale['image']['fetching']));

    let img = await w('https://dog.ceo/api/breeds/image/random', { headers: { 'User-Agent': this.bot.ua } }).send();
    let res = await w('https://some-random-api.ml/dogfact', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
        res = res.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['dog'],
        image      : { url: img.message ? img.message : '' },
        description: `${this.bot.emote('image', 'dog', '1')} *Random Fact* **>** ${res.fact.slice(0, 1990)}\n\n*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.message ? img.message : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';
    
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'dog', '0'));
  }
};