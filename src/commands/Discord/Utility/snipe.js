const { DiscordCommand } = require('../../../core/');

module.exports = class Snipe extends DiscordCommand {
  constructor(bot) {
    super(bot, {
      path       : undefined,
      name       : 'snipe',
      syntax     : 'snipe',
      bearer     : 'yorushika',
      aliases    : [],
      argument   : [],
      description: 'Re-post a deleted message',

      hidden: false,
      enabled: true,
      cooldown: 1000,
      category: 'Utility',
      ownerOnly: false,
      guildOnly: true,
      permissions: ['embedLinks']
    });

    this.static = {
      EMBED_FIELD_LIMIT: 1024
    };

    Object.freeze(this);
    Object.freeze(this.static);
  }

  execute(msg) {
    const message = this.bot.cache.get(`${msg.channel.id}:SNIPE`);
    if (!message) return msg.channel.createMessage(this._localize(msg.author.locale.util.snipe.fail));

    let structure = {
      author: {
        name: `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
        icon_url: message.author.avatar ? message.author.avatarURL : message.author.defaultAvatarURL
      },
      color: this.bot.col['util']['snipe'],
      fields: [],
      footer: {
        text: this._localize(msg.author.locale.util.snipe.footer, msg),
        icon_url: msg.author.avatar ? msg.author.avatarURL : msg.author.defaultAvatarURL
      },
      timestamp: new Date(message.timestamp).toISOString()
    };

    if (message.embeds.length > 0) {
      if ('url' in message.embeds[0]) structure.url = message.embeds[0].url;
      if ('type' in message.embeds[0]) structure.type = message.embeds[0].type;
      if ('title' in message.embeds[0]) structure.title = message.embeds[0].title;
      if ('image' in message.embeds[0]) structure.image = message.embeds[0].image;
      if ('video' in message.embeds[0]) structure.video = message.embeds[0].video;
      if ('fields' in message.embeds[0]) structure.fields = message.embeds[0].fields;
      if ('provider' in message.embeds[0]) structure.provider = message.embeds[0].provider;
      if ('thumbnail' in message.embeds[0]) structure.thumbnail = message.embeds[0].thumbnail;
      if ('description' in message.embeds[0]) {
        if (!message.content) structure.description = message.embeds[0].description;
        else {
          if (message.embeds[0].description.length <= this.mutable.EMBED_FIELD_LIMIT) {
            structure.description = message.content;
            structure.fields.push({
              name: 'Embed body',
              value: message.embeds[0].description
            });
          } else {
            {
              structure.description = message.content;
              structure.fields.push({
                name: msg.author.locale.util.snipe.embed,
                value: message.embeds[0].description.substring(0, this.mutable.EMBED_FIELD_LIMIT)
              }, {
                  name: '.',
                  value: message.embeds[0].description.substring(this.mutable.EMBED_FIELD_LIMIT, this.mutable.EMBED_FIELD_LIMIT * 2)
                });
            }
          }
        }
      }
    }
    if (message.content.length >= 1) {
      structure.description = message.content;
    }

    if (!('image' in structure) && message.attachments.length > 0) {
      structure.image = {
        url: message.attachments[0].url,
        width: message.attachments[0].width,
        height: message.attachments[0].height,
        proxy_url: message.attachments[0].proxy_url
      };
    }

    msg.channel.createMessage({ embed: structure });
    this.bot.cache.delete(`${msg.channel.id}:SNIPE`);
  }

  _localize(msg, extData = {}) {
    try {
      if (!msg) throw 'INVALID_STRING';

      if (extData) {
        msg = msg
          .replace(/\$\[author:id]/g, extData.author.id)
          .replace(/\$\[author:tag]/g, `${extData.author.username}#${extData.author.discriminator}`);
      }

      return msg.replace(/\$\[emoji#0]/g, this.bot.emote('util', 'snipe'));
    } catch (ex) {
      return `LOCALIZE_ERROR:${ex.code}`;
    }
  }
};