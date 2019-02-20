const { DiscordCommand } = require('../../../core');

module.exports = class TagDel extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name        : 'tag-del',
      syntax      : 'tag-del <...tag:str>',
      aliases     : [ 'tagdel', 'deltag', 'tagdelete', 'deletetag', 'del-tag', 'tag-delete', 'delete-tag' ],
      argument    : [ '<...tag:str>' ],
      description : 'Delete a tag',

      hidden      : false,
      enabled     : true,
      cooldown    : 2500,
      category    : 'Tags',
      ownerOnly   : false,
      guildOnly   : true,
      permissions : []
    });
  }

  async execute(msg, args) {
    const tag = await this.bot.m.connection.collection('dTags').findOne({ name: args.join(' '), 'author.guild': msg.channel.guild.id });
    const perm = msg.channel.permissionsOf(msg.author.id);

    if (!tag || tag === null) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.delete.invalid));
    }

    if (!perm.has('manageMessages') && msg.author.id !== tag.author.id) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.delete.perms));
    }

    const mess = await msg.channel.createMessage(this._localize(msg.author.locale.tags.delete.confirm.join('\n'), { name: tag.name.replace(/`/g, '`\u200b') }));
    const res = await this.bot.collector.awaitMessage(msg.channel.id, msg.author.id, 30e3);

    if (res && res.content.toLowerCase() === 'y' || res.content.toLowerCase() === 'ye' || res.content.toLowerCase() === 'yes') {
      if (mess) mess.edit(this._localize(msg.author.locale.tags.delete.busy, { name: tag.name.replace(/`/g, '`\u200b') }));
      this.bot.m.connection.collection('dTags').deleteOne({ name: tag.name, 'author.guild': msg.channel.guild.id });
      if (mess) {
        mess.delete().catch(() => { return; });
      }
      
      msg.channel.createMessage(this._localize(msg.author.locale.tags.delete.done, { name: this.bot.util.escapeMarkdown(tag.name) }));
    } else {
      if (mess) {
        return mess.edit(this._localize(msg.author.locale.cancelled));
      }
    }
  }

  _localize(msg, extData) {
    if (extData) {
      msg = msg.replace(/\$\[tag:name]/g, extData.name);
    }

    return msg
      .replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'del', '0'))
      .replace(/\$\[emoji#1]/g, this.bot.emote('tags', 'del', '1'))
      .replace(/\$\[emoji#2]/g, this.bot.emote('tags', 'del', '2'))
      .replace(/\$\[emoji#3]/g, this.bot.emote('tags', 'del', '3'))
      .replace(/\$\[emoji#4]/g, this.bot.emote('tags', 'del', '4'))
      .replace(/\$\[emoji#5]/g, this.bot.emote('tags', 'del', '5'))
      .replace(/\$\[emoji#6]/g, this.bot.emote('tags', 'del', '6'));
  }
};