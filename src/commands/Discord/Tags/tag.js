const { DiscordCommand } = require('../../../core');

module.exports = class Tag extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'tag',
      syntax      : 'tag <...tag:str>',
      aliases     : [ 'show-tag', 'disp-tag' ],
      argument    : [ '<...tag:str>' ],
      description : 'Display a tag',

      hidden      : false,
      enabled     : true,
      cooldown    : 2500,
      category    : 'Tags',
      ownerOnly   : false,
      guildOnly   : true,
      permissions : []
    });

    this.mutable = {
      MAX_INT32: 2147483647
    };
  }

  async execute(msg, args) {
    const tag = await this.bot.m.connection.collection('dTags').findOne({ name: args.join(' '), 'author.guild': msg.channel.guild.id });
    if (!tag || tag === null) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.exec));
    }

    msg.channel.createMessage(tag.content);
    this.bot.m.connection.collection('dTags').findOneAndUpdate({ name: tag.name, 'author.guild': msg.channel.guild.id }, { $set: { uses: tag.uses < this.mutable.MAX_INT32 ? +1 : this.mutable.MAX_INT32 } });
  }

  _localize(msg) {
    return msg.replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'exec'));
  }
};