const { DiscordCommand } = require('../../../core');

module.exports = class TagSource extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'tag-source',
      syntax     : 'tag-source <...tag:str>',
      aliases    : [ 'tagsource', 'tagsrc', 'tag-src' ],
      argument   : [ '<...tag:str>' ],
      description: 'Source of a tag',

      hidden     : false,
      enabled    : true,
      cooldown   : 2500,
      category   : 'Tags',
      ownerOnly  : false,
      guildOnly  : true,
      permissions: []
    });

    Object.freeze(this);
    Object.freeze(this.static);
  }

  async execute(msg, args) {
    const tag = await this.bot.m.connection.collection('dTags').findOne({ name: args.join(' '), 'author.guild': msg.channel.guild.id });
    if (!tag || tag === null) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.exec));
    }

    msg.channel.createMessage(this.bot.util.shorten(this._localize(msg.author.locale.tags.source, tag), 2000));
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        msg = msg.replace(/\$\[tag:name]/g, extData.name.replace(/`/g, '`\u200b')).replace(/\$\[tag:content]/g, extData.content.replace(/`/g, '`\u200b'));
      }
      
      return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'source', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('tags', 'source', '1'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex}`;
    }
  }
};