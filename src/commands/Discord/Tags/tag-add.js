// @TODO: refractor
const { DiscordCommand } = require('../../../core');

module.exports = class TagAdd extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      name       : 'tag-add',
      syntax     : 'tag-add <...name:str> | <..content:string>',
      aliases    : [ 'tagadd', 'addtag', 'createtag', 'tagcreate', 'maketag', 'make-tag', 'tag-create' ],
      argument   : [ '<...name:str>', '<..content:string>' ],
      description: 'Create a tag',

      hidden     : false,
      enabled    : true,
      cooldown   : 1000,
      category   : 'Tags',
      ownerOnly  : false,
      guildOnly  : true,
      permissions: []
    });
  }

  async execute(msg, args) {
    let components = args.join(' ').split(/\|/g).filter((v) => { return v.length >= 1 });
    let mess;
    let tag = {
      name    : undefined,
      uses    : 0,
      content : undefined,
      creation: new Date(),

      history: [
        `TAG_CREATE:${msg.author.id}@${Date.now()}`
      ],
      author   : {
        id     : msg.author.id,
        name   : msg.author.username,
        guild  : msg.channel.guild.id,
        discrim: msg.author.discriminator
      }
    };


    if (!components[0]) {
            mess = await msg.channel.createMessage(this._localize(msg.author.locale.tags.add.name.join('\n')));
      const name = await this.bot.collector.awaitMessage(msg.channel.id, msg.author.id, 30e3);

      if (!name || name.content.toLowerCase() === '--cancel') {
        return mess.edit(this._localize(msg.author.locale.cancelled));
      }

      tag.name = name.content.slice(0, 50).replace(/\n/g, '').toLowerCase().trim();
    } else tag.name = components[0].slice(0, 50).replace(/\n/g, '').toLowerCase().trim();

    if (!components[1]) {
            mess = mess ? await mess.edit(this._localize(msg.author.locale.tags.add.content.join('\n'))) : await msg.channel.createMessage(this._localize(msg.author.locale.tags.add.content.join('\n')));
      const content = await this.bot.collector.awaitMessage(msg.channel.id, msg.author.id, 30e3);

      if (!content || content.content.toLowerCase() === '--cancel') {
        return mess.edit(this._localize(msg.author.locale.cancelled));
      }

      tag.content = content.content.slice(0, 1950).trim();
    } else {
      components.shift();
      tag.content = components.join('|').slice(0, 1950).trim();
    }

    if (tag.content && tag.name && mess) {
      mess.delete().catch(() => { return; });
    }
    let entry = await this.bot.m.connection.collection('dTags').findOne({ name: tag.name, 'author.guild': msg.channel.guild.id });
    if (entry !== null || this.bot.cmds.filter((v) => v.extData.name === tag.name || v.extData.aliases.includes(tag.name)).length > 0) {
      return msg.channel.createMessage(this._localize(msg.author.locale.tags.add.invalid));
    }

    entry = new this.bot.schema.tag(tag);
    await entry.save();
    msg.channel.createMessage(this._localize(msg.author.locale.tags.add.success, this.bot.util.escapeMarkdown(tag.name)));
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        msg = msg.replace(/\$\[tag:name]/g, extData);
      }
      
      return msg
        .replace(/\$\[emoji#0]/g, this.bot.emote('tags', 'add', '0'))
        .replace(/\$\[emoji#1]/g, this.bot.emote('tags', 'add', '1'))
        .replace(/\$\[emoji#2]/g, this.bot.emote('tags', 'add', '2'))
        .replace(/\$\[emoji#3]/g, this.bot.emote('tags', 'add', '3'))
        .replace(/\$\[emoji#4]/g, this.bot.emote('tags', 'add', '4'))
        .replace(/\$\[emoji#5]/g, this.bot.emote('tags', 'add', '5'))
        .replace(/\$\[emoji#6]/g, this.bot.emote('tags', 'add', '6'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex}`;
    }
  }
};