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
  }

  async execute(msg, args) {
    let img       = l(args)['lucifer'] ? `https://wessel.meek.moe/lucifer/${Math.floor(Math.random() * 37)}.jpg` : 'https://aws.random.cat/meow'
    const message = await msg.channel.createMessage(this.localize(msg.author.locale['image']['fetching']));

    if (img === 'https://aws.random.cat/meow') {
      img = await w(img, { headers: { 'User-Agent': this.bot.ua } }).send();
      img = img.json();
    }
    let res = await w('https://catfact.ninja/fact?max_length=1500', { headers: { 'User-Agent': this.bot.ua } }).send();
        res = res.json();
    
    msg.channel.createMessage({
      embed: {
        color      : this.bot.col['image']['cat'],
        image      : { url: img.file ? img.file : img },
        description: `${this.bot.emote('image', 'cat', '1')} *Random Fact* **>** ${res.fact}\n\n*[\`${msg.author.locale['image']['failed_cache']}\`](${img && img.file ? img.file : img})*`
      }
    });
    message.delete();
  }

  localize(msg) {
    if (!msg) return '';

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('image', 'cat', '0'));
  }
};