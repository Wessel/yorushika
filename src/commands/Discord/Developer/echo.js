const { DiscordCommand } = require('../../../core');

module.exports = class Echo extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'echo',
      syntax     : 'echo <...message:str>',
      aliases    : [],
      argument   : [ '<...message:str>' ],
      description: 'Repeat your input',

      hidden     : false,
      enabled    : true,
      cooldown   : 0,
      category   : 'Developer',
      ownerOnly  : true,
      guildOnly  : false,
      permissions: [ ]
    });
  }

  async execute(msg, args) {
    if (args.length <= 0) return msg.channel.createMessage(this._localize(msg.author.locale.developer.echo)); 
    msg.channel.createMessage(args.join(' '));
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';

      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'echo'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};