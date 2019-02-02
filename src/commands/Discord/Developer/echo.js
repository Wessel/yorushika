const { DiscordCommand } = require('../../../core');

module.exports = class Eval extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'echo',
      syntax      : 'echo <...message:str>',
      aliases     : [],
      argument    : [ '<...message:str>' ],
      description : 'Evaluate a snippet',

      hidden      : false,
      enabled     : true,
      cooldown    : 0,
      category    : 'Developer',
      ownerOnly   : true,
      guildOnly   : false,
      permissions : [ 'embedLinks' ]
    });
  }

  async execute(msg, args) {
    if (args.length <= 0) return msg.channel.createMessage(this.localize(msg.author.locale['developer']['echo'])); 
    msg.channel.createMessage(args.join(' '));
  }

  localize(msg) {
    if (!msg) return '';

    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('developer', 'echo'));
  }
};