const { DiscordCommand } = require('../../../core');

const w = require('wumpfetch');

module.exports = class Cat extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'cat',
      syntax     : 'cat',
      aliases    : [ 'kitten' ],
      argument   : [],
      description: 'Get a random cat',

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

    let img = await w('https://aws.random.cat/meow', { headers: { 'User-Agent': this.bot.ua } }).send();
    let res = await w('https://catfact.ninja/fact?max_length=1500', { headers: { 'User-Agent': this.bot.ua } }).send();
        img = img.json();
        res = res.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['cat'],
        image      : { url: img.file ? img.file : '' },
        description: `${this.bot.emote('image', 'cat', '1')} *Random Fact* **>** ${res.fact}\n\n*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.file ? img.file : 'https://www.google.com/'})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'cat', '0'));
  }
};