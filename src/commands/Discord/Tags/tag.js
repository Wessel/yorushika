const { DiscordCommand } = require('../../../core');

module.exports = class Tag extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path       : undefined,
      name       : 'tag',
      syntax     : 'tag <...tag:str>',
      bearer     : 'yorushika',
      aliases    : [ 'show-tag', 'disp-tag' ],
      argument   : [ '<...tag:str>' ],
      description: 'Display a tag',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Tags',
      ownerOnly  : false,
      guildOnly  : true,
      permissions: []
    });

    this.static = {
      MAX_INT32: 2147483647
    };
  }

  async execute(msg, args) {
    const tag = await this.bot.m.connection.collection('dTags').findOne({ name: args.join(' '), 'author.guild': msg.channel.guild.id });
    if (!tag || tag === null) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.exec));
    }

    msg.channel.createMessage(tag.content);
    this.bot.m.connection.collection('dTags').findOneAndUpdate({ name: tag.name, 'author.guild': msg.channel.guild.id }, { $set: { uses: tag.uses < this.static.MAX_INT32 ? tag.uses + 1 : this.static.MAX_INT32 } });
  }

  _localize(msg) {
    try {
      if (!msg) throw 'INVALID_STRING';

      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'exec'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex}`;
    }
  }
};