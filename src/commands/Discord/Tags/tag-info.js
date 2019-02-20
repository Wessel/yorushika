const { DiscordCommand } = require('../../../core');

const moment = require('moment');

module.exports = class TagInfo extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'tag-info',
      syntax      : 'tag-info <...tag:str>',
      aliases     : [],
      argument    : [ '<...tag:str>' ],
      description : 'Info about a tag',

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

    msg.channel.createMessage({
      embed: {
        description: this._localize(msg.author.locale.tags.info.join('\n'), { tag: tag })
      }
    });
  }

  _localize(msg, extData = {}) {
    try {
      if (extData) {
        if (extData.tag) {
          msg = msg
            .replace(/\$\[tag:name]/g, this.bot.util.escapeMarkdown(extData.tag.name))
            .replace(/\$\[tag:uses]/g, extData.tag.uses)
            .replace(/\$\[tag:history]/g, extData.tag.history.splice(0, 10).join('\n'))
            .replace(/\$\[tag:creation]/g, moment(new Date(extData.tag.creation)).format('DD[-]MM[-]YYYY HH[:]mm[:]ss'))
            .replace(/\$\[tag:creator#tag]/g, this.bot.util.escapeMarkdown(`${extData.tag.author.name}#${extData.tag.author.discrim}`));
        }
      }

      return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'info', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('tags', 'info', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('tags', 'info', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('tags', 'info', '3'))
      .replace(/\$\[emoji#4]/g, this.bot.emote('tags', 'info', '4'))
      .replace(/\$\[emoji#5]/g, this.bot.emote('tags', 'info', '5'));
    } catch(ex) {}
  }
};